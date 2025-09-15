import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { ImportJob, ImportJobStatus } from '../entities/import-job.entity';
import { Product, ProductType } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/products.service';

@Processor('import-queue')
@Injectable()
export class VariantImportProcessor {
  private readonly logger = new Logger(VariantImportProcessor.name);

  constructor(
    @InjectRepository(ImportJob)
    private importJobRepository: Repository<ImportJob>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
  ) {}

  @Process('process-variant-import')
  async handleVariantImport(job: Job<{ jobId: string; startRow?: number; batchSize?: number }>) {
    const { jobId, startRow = 0, batchSize = 50 } = job.data;

    const importJob = await this.importJobRepository.findOne({
      where: { id: jobId },
    });

    if (!importJob) {
      throw new Error(`Import job ${jobId} not found`);
    }

    if (importJob.type !== 'variants') {
      return; // This processor only handles variants
    }

    try {
      // Update job status
      importJob.status = ImportJobStatus.PROCESSING;
      importJob.startedAt = new Date();
      await this.importJobRepository.save(importJob);

      // Parse file
      const data = await this.parseFile(importJob.filepath);
      
      // Get parent product if specified
      let parentProduct: Product | null = null;
      if (importJob.options && 'productIdentifier' in importJob.options) {
        const identifier = importJob.options.productIdentifier as string;
        const useSku = Boolean((importJob.options as any).useSku) || false;
        
        if (useSku) {
          parentProduct = await this.productRepository.findOne({
            where: { sku: identifier },
          });
        } else {
          parentProduct = await this.productRepository.findOne({
            where: { id: identifier },
          });
        }
        
        if (!parentProduct) {
          throw new Error(`Parent product not found: ${identifier}`);
        }
      }
      
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
            const mappedData = this.mapRowToVariant(row, importJob.mapping);
            
            // Find parent product if not already specified
            if (!parentProduct && mappedData.parentSku) {
              parentProduct = await this.productRepository.findOne({
                where: { sku: mappedData.parentSku },
              });
              
              if (!parentProduct) {
                throw new Error(`Parent product not found: ${mappedData.parentSku}`);
              }
            }
            
            if (!parentProduct) {
              throw new Error('Parent product identifier is required');
            }
            
            // Set parent relationship
            mappedData.parentId = parentProduct.id;
            delete mappedData.parentSku;
            
            if (importJob.options?.updateExisting) {
              // Check if variant exists by SKU
              const existing = await this.productRepository.findOne({
                where: { sku: mappedData.sku },
              });
              
              if (existing) {
                // Update existing variant
                Object.assign(existing, mappedData);
                await this.productRepository.save(existing);
              } else {
                // Create new variant
                await this.createVariant(mappedData, parentProduct);
              }
            } else {
              // Create new variant
              await this.createVariant(mappedData, parentProduct);
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
      
      this.logger.log(`Variant import job ${jobId} completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      // Handle job failure
      importJob.status = ImportJobStatus.FAILED;
      importJob.completedAt = new Date();
      importJob.errors = [{
        row: 0,
        message: `Job failed: ${error.message}`,
      }];
      
      await this.importJobRepository.save(importJob);
      
      this.logger.error(`Variant import job ${jobId} failed: ${error.message}`);
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

  private mapRowToVariant(row: any, mapping: Record<string, string>): any {
    const variant: any = {};
    
    // Map fields according to mapping configuration
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      let value = row[sourceField];
      
      // Apply transformations based on field type
      if (targetField === 'price' || targetField === 'compareAtPrice' || targetField === 'weight') {
        value = parseFloat(value) || 0;
      } else if (targetField === 'quantity') {
        value = parseInt(value) || 0;
      } else if (targetField === 'inStock' || targetField === 'isVisible' || targetField === 'isFeatured') {
        value = ['true', '1', 'yes'].includes(String(value).toLowerCase());
      }
      
      variant[targetField] = value;
    });
    
    // Build variantAxes from individual attribute fields
    const variantAxes: Record<string, string> = {};
    const axisFields = ['color', 'size', 'material', 'style'];
    
    axisFields.forEach(field => {
      if (variant[field]) {
        variantAxes[field] = variant[field];
        delete variant[field]; // Remove from variant object
      }
    });
    
    if (Object.keys(variantAxes).length > 0) {
      variant.variantAxes = variantAxes;
    }
    
    // Set defaults for variant
    if (!variant.type) {
      variant.type = ProductType.SIMPLE;
    }
    if (!variant.status) {
      variant.status = 'published';
    }
    if (variant.inStock === undefined) {
      variant.inStock = variant.quantity > 0;
    }
    if (!variant.quantity) {
      variant.quantity = 0;
    }
    
    return variant;
  }

  private async createVariant(variantData: any, parentProduct: Product): Promise<Product> {
    // Variants are Products with a parentId
    const variant = this.productRepository.create({
      ...variantData,
      parentId: parentProduct.id,
      type: ProductType.SIMPLE,
      // Inherit some properties from parent if not specified
      brand: variantData.brand || parentProduct.brand,
      manufacturer: variantData.manufacturer || parentProduct.manufacturer,
      metaTitle: variantData.metaTitle || parentProduct.metaTitle,
      metaDescription: variantData.metaDescription || parentProduct.metaDescription,
      // Mark as variant-specific fields
      inheritedAttributes: true,
      variantGroupId: parentProduct.variantGroupId || parentProduct.id,
    });
    
    const savedVariant = await this.productRepository.save(variant);
    // TypeORM save returns the entity when saving a single entity
    return Array.isArray(savedVariant) ? savedVariant[0] : savedVariant;
  }
}
