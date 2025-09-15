import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { Attribute } from '../../attributes/entities/attribute.entity';
import { ImportType } from '../entities/import-job.entity';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ImportValidator {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
  ) {}

  async validateRow(
    row: any,
    mapping: Record<string, string>,
    type: ImportType,
    rowNumber: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (type) {
      case ImportType.PRODUCTS:
        return this.validateProductRow(row, mapping, rowNumber);
      case ImportType.VARIANTS:
        return this.validateVariantRow(row, mapping, rowNumber);
      case ImportType.CATEGORIES:
        return this.validateCategoryRow(row, mapping, rowNumber);
      case ImportType.ATTRIBUTES:
        return this.validateAttributeRow(row, mapping, rowNumber);
      default:
        errors.push(`Unknown import type: ${type}`);
        return { valid: false, errors, warnings };
    }
  }

  private async validateProductRow(
    row: any,
    mapping: Record<string, string>,
    rowNumber: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get mapped values
    const mappedData: any = {};
    Object.entries(mapping).forEach(([source, target]) => {
      mappedData[target] = row[source];
    });

    // Validate required fields
    if (!mappedData.name) {
      errors.push(`Row ${rowNumber}: Product name is required`);
    }

    if (!mappedData.sku) {
      errors.push(`Row ${rowNumber}: SKU is required`);
    } else {
      // Validate SKU format
      if (!/^[A-Za-z0-9-_]+$/.test(mappedData.sku)) {
        errors.push(`Row ${rowNumber}: SKU must contain only letters, numbers, hyphens, and underscores`);
      }

      // Check for duplicate SKU
      const existing = await this.productRepository.findOne({
        where: { sku: mappedData.sku },
      });
      if (existing) {
        warnings.push(`Row ${rowNumber}: Product with SKU '${mappedData.sku}' already exists`);
      }
    }

    // Validate numeric fields
    if (mappedData.price !== undefined) {
      const price = parseFloat(mappedData.price);
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${rowNumber}: Price must be a positive number`);
      }
    }

    if (mappedData.compareAtPrice !== undefined) {
      const compareAtPrice = parseFloat(mappedData.compareAtPrice);
      if (isNaN(compareAtPrice) || compareAtPrice < 0) {
        errors.push(`Row ${rowNumber}: Compare at price must be a positive number`);
      }
    }

    if (mappedData.quantity !== undefined) {
      const quantity = parseInt(mappedData.quantity);
      if (isNaN(quantity) || quantity < 0) {
        errors.push(`Row ${rowNumber}: Quantity must be a non-negative integer`);
      }
    }

    // Validate status
    if (mappedData.status) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(mappedData.status.toLowerCase())) {
        errors.push(`Row ${rowNumber}: Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate category if provided
    if (mappedData.category) {
      const category = await this.categoryRepository.findOne({
        where: [
          { name: mappedData.category },
          { slug: mappedData.category },
        ],
      });
      if (!category) {
        warnings.push(`Row ${rowNumber}: Category '${mappedData.category}' not found`);
      }
    }

    // Validate URL key format if provided
    if (mappedData.urlKey) {
      if (!/^[a-z0-9-]+$/.test(mappedData.urlKey)) {
        errors.push(`Row ${rowNumber}: URL key must contain only lowercase letters, numbers, and hyphens`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async validateVariantRow(
    row: any,
    mapping: Record<string, string>,
    rowNumber: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get mapped values
    const mappedData: any = {};
    Object.entries(mapping).forEach(([source, target]) => {
      mappedData[target] = row[source];
    });

    // Validate required fields
    if (!mappedData.sku) {
      errors.push(`Row ${rowNumber}: Variant SKU is required`);
    } else {
      // Validate SKU format
      if (!/^[A-Za-z0-9-_]+$/.test(mappedData.sku)) {
        errors.push(`Row ${rowNumber}: SKU must contain only letters, numbers, hyphens, and underscores`);
      }
    }

    // Validate parent product reference
    if (!mappedData.productSku && !mappedData.productId) {
      errors.push(`Row ${rowNumber}: Parent product reference (SKU or ID) is required`);
    }

    if (mappedData.productSku) {
      const product = await this.productRepository.findOne({
        where: { sku: mappedData.productSku },
      });
      if (!product) {
        errors.push(`Row ${rowNumber}: Parent product with SKU '${mappedData.productSku}' not found`);
      }
    }

    // Validate numeric fields
    if (mappedData.price !== undefined) {
      const price = parseFloat(mappedData.price);
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${rowNumber}: Price must be a positive number`);
      }
    }

    if (mappedData.quantity !== undefined) {
      const quantity = parseInt(mappedData.quantity);
      if (isNaN(quantity) || quantity < 0) {
        errors.push(`Row ${rowNumber}: Quantity must be a non-negative integer`);
      }
    }

    if (mappedData.weight !== undefined) {
      const weight = parseFloat(mappedData.weight);
      if (isNaN(weight) || weight < 0) {
        errors.push(`Row ${rowNumber}: Weight must be a positive number`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async validateCategoryRow(
    row: any,
    mapping: Record<string, string>,
    rowNumber: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get mapped values
    const mappedData: any = {};
    Object.entries(mapping).forEach(([source, target]) => {
      mappedData[target] = row[source];
    });

    // Validate required fields
    if (!mappedData.name) {
      errors.push(`Row ${rowNumber}: Category name is required`);
    }

    // Validate slug format if provided
    if (mappedData.slug) {
      if (!/^[a-z0-9-]+$/.test(mappedData.slug)) {
        errors.push(`Row ${rowNumber}: Slug must contain only lowercase letters, numbers, and hyphens`);
      }

      // Check for duplicate slug
      const existing = await this.categoryRepository.findOne({
        where: { slug: mappedData.slug },
      });
      if (existing) {
        warnings.push(`Row ${rowNumber}: Category with slug '${mappedData.slug}' already exists`);
      }
    }

    // Validate parent category if provided
    if (mappedData.parent) {
      const parent = await this.categoryRepository.findOne({
        where: [
          { name: mappedData.parent },
          { slug: mappedData.parent },
        ],
      });
      if (!parent) {
        warnings.push(`Row ${rowNumber}: Parent category '${mappedData.parent}' not found`);
      }
    }

    // Validate position if provided
    if (mappedData.position !== undefined) {
      const position = parseInt(mappedData.position);
      if (isNaN(position) || position < 0) {
        errors.push(`Row ${rowNumber}: Position must be a non-negative integer`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async validateAttributeRow(
    row: any,
    mapping: Record<string, string>,
    rowNumber: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get mapped values
    const mappedData: any = {};
    Object.entries(mapping).forEach(([source, target]) => {
      mappedData[target] = row[source];
    });

    // Validate required fields
    if (!mappedData.name) {
      errors.push(`Row ${rowNumber}: Attribute name is required`);
    }

    if (!mappedData.code) {
      errors.push(`Row ${rowNumber}: Attribute code is required`);
    } else {
      // Validate code format
      if (!/^[a-z0-9_]+$/.test(mappedData.code)) {
        errors.push(`Row ${rowNumber}: Code must contain only lowercase letters, numbers, and underscores`);
      }

      // Check for duplicate code
      const existing = await this.attributeRepository.findOne({
        where: { code: mappedData.code },
      });
      if (existing) {
        warnings.push(`Row ${rowNumber}: Attribute with code '${mappedData.code}' already exists`);
      }
    }

    // Validate type
    if (mappedData.type) {
      const validTypes = [
        'text',
        'textarea',
        'number',
        'decimal',
        'select',
        'multiselect',
        'boolean',
        'date',
        'datetime',
        'color',
        'file',
        'image',
        'url',
      ];
      if (!validTypes.includes(mappedData.type)) {
        errors.push(`Row ${rowNumber}: Type must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Validate boolean fields
    const booleanFields = ['isRequired', 'isFilterable', 'isSearchable', 'isVisible'];
    booleanFields.forEach(field => {
      if (mappedData[field] !== undefined) {
        const value = String(mappedData[field]).toLowerCase();
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value)) {
          errors.push(`Row ${rowNumber}: ${field} must be a boolean value`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateBatch(
    rows: any[],
    mapping: Record<string, string>,
    type: ImportType,
    startRow = 1,
  ): Promise<{
    valid: boolean;
    totalErrors: number;
    totalWarnings: number;
    results: ValidationResult[];
  }> {
    const results: ValidationResult[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    for (let i = 0; i < rows.length; i++) {
      const result = await this.validateRow(rows[i], mapping, type, startRow + i);
      results.push(result);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    return {
      valid: totalErrors === 0,
      totalErrors,
      totalWarnings,
      results,
    };
  }
}
