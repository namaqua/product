import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { ExportJob, ExportJobStatus, ExportFormat } from '../entities/export-job.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/products.service';

@Processor('export-queue')
@Injectable()
export class ProductExportProcessor {
  private readonly logger = new Logger(ProductExportProcessor.name);

  constructor(
    @InjectRepository(ExportJob)
    private exportJobRepository: Repository<ExportJob>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
  ) {}

  @Process('process-export')
  async handleExport(job: Job<{ jobId: string }>) {
    const { jobId } = job.data;

    const exportJob = await this.exportJobRepository.findOne({
      where: { id: jobId },
    });

    if (!exportJob) {
      throw new Error(`Export job ${jobId} not found`);
    }

    if (exportJob.type !== 'products') {
      return; // This processor only handles products
    }

    try {
      // Update job status
      exportJob.status = ExportJobStatus.PROCESSING;
      exportJob.startedAt = new Date();
      await this.exportJobRepository.save(exportJob);

      // Build query
      const qb = this.productRepository.createQueryBuilder('product');
      
      // Apply filters
      if (exportJob.filters) {
        if (exportJob.filters.status?.length) {
          qb.andWhere('product.status IN (:...status)', { status: exportJob.filters.status });
        }
        
        if (exportJob.filters.search) {
          qb.andWhere(
            '(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
            { search: `%${exportJob.filters.search}%` },
          );
        }
        
        if (exportJob.filters.priceRange) {
          qb.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
            minPrice: exportJob.filters.priceRange.min,
            maxPrice: exportJob.filters.priceRange.max,
          });
        }
        
        if (exportJob.filters.stockRange) {
          qb.andWhere('product.quantity BETWEEN :minStock AND :maxStock', {
            minStock: exportJob.filters.stockRange.min,
            maxStock: exportJob.filters.stockRange.max,
          });
        }
      }
      
      // Include relations if requested
      if (exportJob.options?.includeCategories) {
        qb.leftJoinAndSelect('product.categories', 'category');
      }
      
      if (exportJob.options?.includeAttributes) {
        qb.leftJoinAndSelect('product.attributeValues', 'attributeValue');
        qb.leftJoinAndSelect('attributeValue.attribute', 'attribute');
      }
      
      if (exportJob.options?.includeVariants) {
        qb.leftJoinAndSelect('product.variants', 'variant');
      }
      
      if (exportJob.options?.includeImages) {
        qb.leftJoinAndSelect('product.media', 'media');
      }
      
      // Get products
      const products = await qb.getMany();
      exportJob.totalRecords = products.length;
      
      // Prepare data for export
      const exportData = products.map((product, index) => {
        // Update progress
        if (index % 10 === 0) {
          job.progress(Math.round((index / products.length) * 100));
        }
        
        return this.formatProductForExport(product, exportJob.fields);
      });
      
      // Generate export file
      const filename = `products-export-${Date.now()}.${exportJob.format}`;
      const filepath = path.join(process.cwd(), 'uploads', 'exports', filename);
      
      if (exportJob.format === ExportFormat.CSV) {
        await this.exportToCsv(exportData, filepath, exportJob.options?.delimiter);
      } else if (exportJob.format === ExportFormat.EXCEL) {
        await this.exportToExcel(exportData, filepath);
      } else if (exportJob.format === ExportFormat.JSON) {
        await this.exportToJson(exportData, filepath);
      }
      
      // Get file size
      const stats = await fs.promises.stat(filepath);
      
      // Complete job
      exportJob.status = ExportJobStatus.COMPLETED;
      exportJob.completedAt = new Date();
      exportJob.processedRecords = products.length;
      exportJob.filename = filename;
      exportJob.filepath = filepath;
      exportJob.fileSize = stats.size;
      exportJob.downloadUrl = `/api/import-export/export/download/${exportJob.id}`;
      
      await this.exportJobRepository.save(exportJob);
      
      this.logger.log(`Export job ${jobId} completed: ${products.length} products exported`);
    } catch (error) {
      // Handle job failure
      exportJob.status = ExportJobStatus.FAILED;
      exportJob.completedAt = new Date();
      
      await this.exportJobRepository.save(exportJob);
      
      this.logger.error(`Export job ${jobId} failed: ${error.message}`);
      throw error;
    }
  }

  private formatProductForExport(product: Product, fields?: string[]): any {
    const data: any = {};
    
    // Default fields if not specified
    const exportFields = fields || [
      'id',
      'name',
      'sku',
      'description',
      'price',
      'compareAtPrice',
      'quantity',
      'status',
      'isFeatured',
      'urlKey',
      'metaTitle',
      'metaDescription',
      'brand',
      'weight',
      'dimensions',
      'createdAt',
      'updatedAt',
    ];
    
    // Map fields
    exportFields.forEach(field => {
      if (field === 'categories' && product.categories) {
        data[field] = product.categories.map(c => c.name).join(', ');
      } else if (field === 'attributes' && product.attributeValues) {
        product.attributeValues.forEach(av => {
          data[`attr_${av.attribute?.code || av.attributeId}`] = av.getValue ? av.getValue() : av.textValue;
        });
      } else if (field === 'variants' && product.variants) {
        data['variantCount'] = product.variants.length;
        data['variantSkus'] = product.variants.map(v => v.sku).join(', ');
      } else if (field === 'images' && product.media) {
        data['imageCount'] = product.media.length;
        data['primaryImage'] = product.media.find(m => m.isPrimary)?.url || '';
      } else if (product[field] !== undefined) {
        data[field] = product[field];
      }
    });
    
    return data;
  }

  private async exportToCsv(data: any[], filepath: string, delimiter = ','): Promise<void> {
    const csv = Papa.unparse(data, {
      delimiter,
      header: true,
    });
    
    await fs.promises.writeFile(filepath, csv);
  }

  private async exportToExcel(data: any[], filepath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    
    if (data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      
      // Add data
      data.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
      });
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    }
    
    await workbook.xlsx.writeFile(filepath);
  }

  private async exportToJson(data: any[], filepath: string): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(filepath, json);
  }
}
