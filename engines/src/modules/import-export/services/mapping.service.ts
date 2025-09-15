import { Injectable } from '@nestjs/common';
import { ImportType } from '../entities/import-job.entity';

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
}

interface MappingSuggestion {
  confidence: number;
  mapping: Record<string, string>;
  unmappedSource: string[];
  unmappedTarget: string[];
}

@Injectable()
export class MappingService {
  private readonly fieldVariations: Record<string, Record<string, string[]>> = {
    products: {
      name: ['name', 'title', 'productname', 'product_name', 'item_name'],
      sku: ['sku', 'code', 'productcode', 'product_code', 'item_code', 'partno', 'part_number'],
      description: ['description', 'desc', 'details', 'product_description', 'long_description'],
      price: ['price', 'cost', 'amount', 'selling_price', 'retail_price', 'unit_price'],
      compareAtPrice: ['compareatprice', 'compare_at_price', 'msrp', 'list_price', 'original_price'],
      quantity: ['quantity', 'qty', 'stock', 'inventory', 'stock_quantity', 'available'],
      category: ['category', 'categories', 'product_category', 'cat', 'department'],
      brand: ['brand', 'manufacturer', 'vendor', 'make', 'brand_name'],
      urlKey: ['url', 'slug', 'urlkey', 'url_key', 'permalink', 'seo_url'],
      metaTitle: ['metatitle', 'meta_title', 'seotitle', 'seo_title', 'page_title'],
      metaDescription: ['metadescription', 'meta_description', 'seodescription', 'seo_description'],
      status: ['status', 'state', 'published', 'active', 'visibility'],
      isFeatured: ['featured', 'isfeatured', 'is_featured', 'highlight', 'promoted'],
      weight: ['weight', 'product_weight', 'shipping_weight', 'wt'],
      dimensions: ['dimensions', 'size', 'measurements', 'product_dimensions'],
      tags: ['tags', 'keywords', 'labels', 'product_tags'],
    },
    variants: {
      productSku: ['productsku', 'product_sku', 'parent_sku', 'parentsku', 'master_sku'],
      variantSku: ['variantsku', 'variant_sku', 'sku', 'code', 'child_sku'],
      name: ['name', 'variantname', 'variant_name', 'title', 'option_name'],
      price: ['price', 'variantprice', 'variant_price', 'selling_price'],
      quantity: ['quantity', 'qty', 'stock', 'inventory', 'variant_stock'],
      color: ['color', 'colour', 'color_name', 'product_color'],
      size: ['size', 'product_size', 'dimensions', 'variant_size'],
      material: ['material', 'fabric', 'composition', 'product_material'],
      weight: ['weight', 'variant_weight', 'shipping_weight'],
      barcode: ['barcode', 'upc', 'ean', 'gtin', 'isbn'],
      isDefault: ['default', 'isdefault', 'is_default', 'primary', 'main'],
    },
    categories: {
      name: ['name', 'categoryname', 'category_name', 'title', 'cat_name'],
      slug: ['slug', 'url', 'urlkey', 'url_key', 'permalink'],
      description: ['description', 'desc', 'category_description', 'details'],
      parent: ['parent', 'parentcategory', 'parent_category', 'parent_name'],
      position: ['position', 'order', 'sort_order', 'display_order', 'sequence'],
      isActive: ['active', 'isactive', 'is_active', 'enabled', 'status'],
      metaTitle: ['metatitle', 'meta_title', 'seotitle', 'seo_title'],
      metaDescription: ['metadescription', 'meta_description', 'seodescription'],
    },
    attributes: {
      name: ['name', 'attributename', 'attribute_name', 'label', 'display_name'],
      code: ['code', 'attributecode', 'attribute_code', 'key', 'identifier'],
      type: ['type', 'datatype', 'data_type', 'field_type', 'input_type'],
      groupName: ['group', 'groupname', 'group_name', 'category', 'section'],
      isRequired: ['required', 'isrequired', 'is_required', 'mandatory'],
      isFilterable: ['filterable', 'isfilterable', 'is_filterable', 'searchable'],
      isSearchable: ['searchable', 'issearchable', 'is_searchable'],
      isVisible: ['visible', 'isvisible', 'is_visible', 'display', 'show'],
      position: ['position', 'order', 'sort_order', 'sequence'],
      options: ['options', 'values', 'choices', 'select_options'],
    },
  };

  suggestMapping(headers: string[], type: ImportType): MappingSuggestion {
    const mapping: Record<string, string> = {};
    const unmappedSource: string[] = [];
    const unmappedTarget: string[] = [];
    let matchedFields = 0;

    const fieldMappings = this.fieldVariations[type] || {};
    const targetFields = Object.keys(fieldMappings);

    // Normalize headers for comparison
    const normalizedHeaders = headers.map(h => ({
      original: h,
      normalized: this.normalizeFieldName(h),
    }));

    // Try to match each header to a target field
    normalizedHeaders.forEach(({ original, normalized }) => {
      let matched = false;

      for (const [targetField, variations] of Object.entries(fieldMappings)) {
        if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
          mapping[original] = targetField;
          matched = true;
          matchedFields++;
          break;
        }
      }

      if (!matched) {
        // Try fuzzy matching
        const bestMatch = this.findBestMatch(normalized, fieldMappings);
        if (bestMatch && bestMatch.confidence > 0.7) {
          mapping[original] = bestMatch.field;
          matched = true;
          matchedFields++;
        }
      }

      if (!matched) {
        unmappedSource.push(original);
      }
    });

    // Find unmapped target fields
    targetFields.forEach(field => {
      if (!Object.values(mapping).includes(field)) {
        // Check if it's a required field
        if (this.isRequiredField(field, type)) {
          unmappedTarget.push(field);
        }
      }
    });

    const confidence = headers.length > 0 
      ? matchedFields / headers.length 
      : 0;

    return {
      confidence,
      mapping,
      unmappedSource,
      unmappedTarget,
    };
  }

  private normalizeFieldName(field: string): string {
    return field
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  private findBestMatch(
    field: string,
    fieldMappings: Record<string, string[]>,
  ): { field: string; confidence: number } | null {
    let bestMatch: { field: string; confidence: number } | null = null;
    let highestScore = 0;

    for (const [targetField, variations] of Object.entries(fieldMappings)) {
      for (const variation of variations) {
        const score = this.calculateSimilarity(field, variation);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = { field: targetField, confidence: score };
        }
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private isRequiredField(field: string, type: ImportType): boolean {
    const requiredFields: Record<string, string[]> = {
      products: ['name', 'sku'],
      variants: ['variantSku'],
      categories: ['name'],
      attributes: ['name', 'code', 'type'],
    };

    return requiredFields[type]?.includes(field) || false;
  }

  applyTransformations(
    value: any,
    transformations: string[],
  ): any {
    let result = value;

    for (const transformation of transformations) {
      result = this.applyTransformation(result, transformation);
    }

    return result;
  }

  private applyTransformation(value: any, transformation: string): any {
    switch (transformation) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      case 'number':
        return parseFloat(value) || 0;
      case 'integer':
        return parseInt(value) || 0;
      case 'boolean':
        return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
      case 'date':
        return new Date(value);
      case 'slug':
        return String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      case 'remove_html':
        return String(value).replace(/<[^>]*>/g, '');
      case 'remove_special_chars':
        return String(value).replace(/[^a-zA-Z0-9\s]/g, '');
      default:
        return value;
    }
  }

  validateMapping(
    mapping: Record<string, string>,
    type: ImportType,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = this.getRequiredFields(type);
    const validFields = this.getValidFields(type);

    // Check for required fields
    requiredFields.forEach(field => {
      if (!Object.values(mapping).includes(field)) {
        errors.push(`Required field '${field}' is not mapped`);
      }
    });

    // Check for invalid target fields
    Object.values(mapping).forEach(targetField => {
      if (!validFields.includes(targetField)) {
        errors.push(`Invalid target field '${targetField}'`);
      }
    });

    // Check for duplicate mappings
    const targetCounts: Record<string, number> = {};
    Object.values(mapping).forEach(target => {
      targetCounts[target] = (targetCounts[target] || 0) + 1;
    });

    Object.entries(targetCounts).forEach(([field, count]) => {
      if (count > 1) {
        errors.push(`Field '${field}' is mapped ${count} times`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private getRequiredFields(type: ImportType): string[] {
    const requiredFields: Record<string, string[]> = {
      products: ['name', 'sku'],
      variants: ['variantSku'],
      categories: ['name'],
      attributes: ['name', 'code', 'type'],
    };

    return requiredFields[type] || [];
  }

  private getValidFields(type: ImportType): string[] {
    return Object.keys(this.fieldVariations[type] || {});
  }

  generateReverseMapping(
    mapping: Record<string, string>,
  ): Record<string, string> {
    const reverseMapping: Record<string, string> = {};

    Object.entries(mapping).forEach(([source, target]) => {
      reverseMapping[target] = source;
    });

    return reverseMapping;
  }

  mergeWithDefaults(
    data: any,
    defaults: Record<string, any>,
  ): any {
    const merged = { ...data };

    Object.entries(defaults).forEach(([field, defaultValue]) => {
      if (merged[field] === undefined || merged[field] === null || merged[field] === '') {
        merged[field] = defaultValue;
      }
    });

    return merged;
  }
}
