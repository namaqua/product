import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { ImportJob, ImportJobStatus } from '../entities/import-job.entity';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductsService } from '../../products/products.service';
import { CategoriesService } from '../../categories/categories.service';

@Processor('import-queue')
@Injectable()
export class ProductImportProcessor {
  private readonly logger = new Logger(ProductImportProcessor.name);

  constructor(
    @InjectRepository(ImportJob)
    private importJobRepository: Repository<ImportJob>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
  ) {}

  @Process('process-import')
  async handleImport(job: Job<{ jobId: string; startRow?: number; batchSize?: number }>) {
    const { jobId, startRow = 0, batchSize = 100 } = job.data;

    const importJob = await this.importJobRepository.findOne({
      where: { id: jobId },
    });

    if (!importJob) {
      throw new Error(`Import job ${jobId} not found`);
    }

    if (importJob.type !== 'products') {
      return; // This processor only handles products
    }

    try {
      // Update job status
      importJob.status = ImportJobStatus.PROCESSING;
      importJob.startedAt = new Date();
      await this.importJobRepository.save(importJob);

      // Parse file
      const data = await this.parseFile(importJob.filepath);
      
      // Process in batches
      const totalRows = data.length;
      let processedRows = 0;
      let successCount = 0;
      let errorCount = 0;
      let errors: any[] = [];

      for (let i = startRow; i < totalRows; i += batchSize) {
        const batch = data.slice(i, Math.min(i + batchSize, totalRows));
        
        for (const [index, row] of batch.entries()) {
          const rowNumber = i + index + 2; // +2 for 1-based index and header
          
          try {
            const mappedData = this.mapRowToProduct(row, importJob.mapping);
            
            if (importJob.options?.updateExisting) {
              // Check if product exists by SKU
              const existing = await this.productRepository.findOne({
                where: { sku: mappedData.sku },
              });
              
              if (existing) {
                // Update existing product
                Object.assign(existing, mappedData);
                await this.productRepository.save(existing);
              } else {
                // Create new product
                await this.createProduct(mappedData);
              }
            } else {
              // Create new product
              await this.createProduct(mappedData);
            }
            
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              row: rowNumber,
              message: error.message,
              data: row,
            });
            this.logger.error(`Error processing row ${rowNumber}: ${error.message}`);
          }
          
          processedRows++;
          
          // Update progress periodically
          if (processedRows % 10 === 0) {
            await job.progress(Math.round((processedRows / totalRows) * 100));
            
            importJob.processedRows = processedRows;
            importJob.successCount = successCount;
            importJob.errorCount = errorCount;
            importJob.errors = errors.slice(0, 100); // Keep only first 100 errors
            await this.importJobRepository.save(importJob);
          }
        }
      }

      // Complete job
      importJob.status = ImportJobStatus.COMPLETED;
      importJob.completedAt = new Date();
      importJob.processedRows = processedRows;
      importJob.successCount = successCount;
      importJob.errorCount = errorCount;
      importJob.errors = errors.slice(0, 100);
      importJob.summary = {
        created: successCount,
        failed: errorCount,
        duration: Date.now() - importJob.startedAt.getTime(),
      };
      
      await this.importJobRepository.save(importJob);
      
      this.logger.log(`Import job ${jobId} completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      // Handle job failure
      importJob.status = ImportJobStatus.FAILED;
      importJob.completedAt = new Date();
      importJob.errors = [{
        row: 0,
        message: `Job failed: ${error.message}`,
      }];
      
      await this.importJobRepository.save(importJob);
      
      this.logger.error(`Import job ${jobId} failed: ${error.message}`);
      throw error;
    }
  }

  private async parseFile(filepath: string): Promise<any[]> {
    const fileContent = await fs.promises.readFile(filepath, 'utf-8');
    
    if (filepath.endsWith('.csv')) {
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      return parsed.data;
    } else if (filepath.match(/\.(xlsx|xls)$/)) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filepath);
      const worksheet = workbook.worksheets[0];
      
      const headers: string[] = [];
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers.push(cell.value?.toString() || `Column ${colNumber}`);
      });

      const data: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row.getCell(index + 1).value;
        });
        data.push(rowData);
      });
      
      return data;
    }
    
    throw new Error('Unsupported file format');
  }

  private mapRowToProduct(row: any, mapping: Record<string, string>): any {
    const product: any = {};
    
    // Map fields according to mapping configuration
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      let value = row[sourceField];
      
      // Apply transformations based on field type
      if (targetField === 'price' || targetField === 'compareAtPrice') {
        value = parseFloat(value) || 0;
      } else if (targetField === 'quantity') {
        value = parseInt(value) || 0;
      } else if (targetField === 'isFeatured') {
        value = ['true', '1', 'yes'].includes(String(value).toLowerCase());
      } else if (targetField === 'status') {
        value = value || 'draft';
      }
      
      product[targetField] = value;
    });
    
    // Set defaults for required fields
    if (!product.status) {
      product.status = 'draft';
    }
    if (product.isFeatured === undefined) {
      product.isFeatured = false;
    }
    if (!product.quantity) {
      product.quantity = 0;
    }
    
    return product;
  }

  private async createProduct(productData: any): Promise<Product> {
    // Handle category association
    // TODO: Implement category association once findByNameOrSlug method is available
    if (productData.category) {
      // const category = await this.categoriesService.findByNameOrSlug(productData.category);
      // if (category) {
      //   productData.categories = [category];
      // }
      delete productData.category;
    }
    
    // Create product
    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);
    // TypeORM save returns the entity when saving a single entity
    return Array.isArray(savedProduct) ? savedProduct[0] : savedProduct;
  }
}
