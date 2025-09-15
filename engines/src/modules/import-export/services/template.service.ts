import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { ImportType } from '../entities/import-job.entity';
import { ExportType, ExportFormat } from '../entities/export-job.entity';

@Injectable()
export class TemplateService {
  private readonly templatesDir = path.join(process.cwd(), 'uploads', 'templates');

  constructor() {
    // Ensure templates directory exists
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  async generateTemplate(
    type: ImportType | ExportType,
    format: ExportFormat,
    includeSampleData = false,
    sampleRows = 5,
  ): Promise<string> {
    const filename = `${type}-template-${Date.now()}.${format}`;
    const filepath = path.join(this.templatesDir, filename);

    const { headers, sampleData } = this.getTemplateData(type, sampleRows);

    if (format === ExportFormat.CSV) {
      await this.generateCsvTemplate(filepath, headers, includeSampleData ? sampleData : []);
    } else if (format === ExportFormat.EXCEL) {
      await this.generateExcelTemplate(filepath, headers, includeSampleData ? sampleData : [], type);
    } else if (format === ExportFormat.JSON) {
      await this.generateJsonTemplate(filepath, headers, includeSampleData ? sampleData : []);
    }

    return filepath;
  }

  private getTemplateData(
    type: ImportType | ExportType,
    sampleRows: number,
  ): { headers: string[]; sampleData: any[] } {
    switch (type) {
      case 'products':
        return this.getProductTemplateData(sampleRows);
      case 'variants':
        return this.getVariantTemplateData(sampleRows);
      case 'categories':
        return this.getCategoryTemplateData(sampleRows);
      case 'attributes':
        return this.getAttributeTemplateData(sampleRows);
      case 'inventory':
        return this.getInventoryTemplateData(sampleRows);
      default:
        return { headers: [], sampleData: [] };
    }
  }

  private getProductTemplateData(sampleRows: number) {
    const headers = [
      'name',
      'sku',
      'description',
      'price',
      'compareAtPrice',
      'quantity',
      'category',
      'brand',
      'urlKey',
      'metaTitle',
      'metaDescription',
      'status',
      'isFeatured',
      'weight',
      'dimensions',
      'tags',
    ];

    const sampleData = Array(sampleRows)
      .fill(0)
      .map((_, i) => ({
        name: `Sample Product ${i + 1}`,
        sku: `SKU-${1000 + i}`,
        description: `This is a detailed description for sample product ${i + 1}. It includes all the important features and benefits.`,
        price: (Math.random() * 100 + 10).toFixed(2),
        compareAtPrice: (Math.random() * 150 + 20).toFixed(2),
        quantity: Math.floor(Math.random() * 100),
        category: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'][i % 5],
        brand: ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'][i % 5],
        urlKey: `sample-product-${i + 1}`,
        metaTitle: `Sample Product ${i + 1} - Best Deals Online`,
        metaDescription: `Shop Sample Product ${i + 1} at the best prices. High quality products with fast shipping.`,
        status: ['published', 'draft', 'published', 'published', 'archived'][i % 5],
        isFeatured: i < 2 ? 'true' : 'false',
        weight: (Math.random() * 5 + 0.5).toFixed(2),
        dimensions: '10x10x10',
        tags: 'new,trending,bestseller',
      }));

    return { headers, sampleData };
  }

  private getVariantTemplateData(sampleRows: number) {
    const headers = [
      'productSku',
      'variantSku',
      'name',
      'price',
      'compareAtPrice',
      'quantity',
      'color',
      'size',
      'material',
      'weight',
      'barcode',
      'isDefault',
    ];

    const colors = ['Red', 'Blue', 'Green', 'Black', 'White'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const materials = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather'];

    const sampleData = Array(sampleRows)
      .fill(0)
      .map((_, i) => ({
        productSku: 'PARENT-SKU-001',
        variantSku: `VAR-SKU-${1000 + i}`,
        name: `${colors[i % 5]} ${sizes[i % 6]} Variant`,
        price: (Math.random() * 100 + 10).toFixed(2),
        compareAtPrice: (Math.random() * 150 + 20).toFixed(2),
        quantity: Math.floor(Math.random() * 50),
        color: colors[i % 5],
        size: sizes[i % 6],
        material: materials[i % 5],
        weight: (Math.random() * 2 + 0.2).toFixed(2),
        barcode: `BAR${100000000 + i}`,
        isDefault: i === 0 ? 'true' : 'false',
      }));

    return { headers, sampleData };
  }

  private getCategoryTemplateData(sampleRows: number) {
    const headers = [
      'name',
      'slug',
      'description',
      'parent',
      'position',
      'isActive',
      'metaTitle',
      'metaDescription',
    ];

    const sampleData = Array(sampleRows)
      .fill(0)
      .map((_, i) => ({
        name: `Category ${i + 1}`,
        slug: `category-${i + 1}`,
        description: `Description for category ${i + 1}`,
        parent: i > 0 ? 'Category 1' : '',
        position: i,
        isActive: 'true',
        metaTitle: `Category ${i + 1} - Shop Online`,
        metaDescription: `Browse our selection of products in Category ${i + 1}`,
      }));

    return { headers, sampleData };
  }

  private getAttributeTemplateData(sampleRows: number) {
    const headers = [
      'name',
      'code',
      'type',
      'groupName',
      'isRequired',
      'isFilterable',
      'isSearchable',
      'isVisible',
      'position',
      'options',
    ];

    const types = ['text', 'select', 'multiselect', 'number', 'boolean', 'date', 'color'];
    const groups = ['General', 'Technical', 'Physical', 'Display', 'Custom'];

    const sampleData = Array(sampleRows)
      .fill(0)
      .map((_, i) => ({
        name: `Attribute ${i + 1}`,
        code: `attr_${i + 1}`,
        type: types[i % types.length],
        groupName: groups[i % groups.length],
        isRequired: i < 2 ? 'true' : 'false',
        isFilterable: 'true',
        isSearchable: 'true',
        isVisible: 'true',
        position: i,
        options: types[i % types.length] === 'select' ? 'Option 1|Option 2|Option 3' : '',
      }));

    return { headers, sampleData };
  }

  private getInventoryTemplateData(sampleRows: number) {
    const headers = [
      'sku',
      'quantity',
      'reservedQuantity',
      'availableQuantity',
      'location',
      'warehouse',
      'reorderPoint',
      'reorderQuantity',
    ];

    const sampleData = Array(sampleRows)
      .fill(0)
      .map((_, i) => ({
        sku: `SKU-${1000 + i}`,
        quantity: Math.floor(Math.random() * 1000),
        reservedQuantity: Math.floor(Math.random() * 50),
        availableQuantity: Math.floor(Math.random() * 950),
        location: `A${i + 1}-B${i + 1}`,
        warehouse: ['Main', 'Secondary', 'Distribution'][i % 3],
        reorderPoint: Math.floor(Math.random() * 100) + 10,
        reorderQuantity: Math.floor(Math.random() * 500) + 100,
      }));

    return { headers, sampleData };
  }

  private async generateCsvTemplate(
    filepath: string,
    headers: string[],
    sampleData: any[],
  ): Promise<void> {
    const csv = Papa.unparse({
      fields: headers,
      data: sampleData,
    });
    await fs.promises.writeFile(filepath, csv);
  }

  private async generateExcelTemplate(
    filepath: string,
    headers: string[],
    sampleData: any[],
    type: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    const instructionsSheet = workbook.addWorksheet('Instructions');

    // Add headers
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add sample data
    sampleData.forEach(row => {
      const values = headers.map(header => row[header] || '');
      worksheet.addRow(values);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index].length;
      worksheet.getColumn(index + 1).eachCell({ includeEmpty: false }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Add borders
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Add instructions
    this.addInstructionsSheet(instructionsSheet, type);

    await workbook.xlsx.writeFile(filepath);
  }

  private async generateJsonTemplate(
    filepath: string,
    headers: string[],
    sampleData: any[],
  ): Promise<void> {
    const template = {
      _instructions: {
        format: 'JSON Import Template',
        headers: headers,
        notes: [
          'Each object in the data array represents one row',
          'Use the exact field names as shown in headers',
          'Remove this _instructions object before importing',
        ],
      },
      data: sampleData.length > 0 ? sampleData : [
        headers.reduce((obj, header) => {
          obj[header] = '';
          return obj;
        }, {}),
      ],
    };

    await fs.promises.writeFile(filepath, JSON.stringify(template, null, 2));
  }

  private addInstructionsSheet(worksheet: ExcelJS.Worksheet, type: string): void {
    // Title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${type.toUpperCase()} Import Template Instructions`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Instructions
    const instructions = this.getInstructions(type);
    let row = 3;

    instructions.forEach(instruction => {
      worksheet.mergeCells(`A${row}:D${row}`);
      const cell = worksheet.getCell(`A${row}`);
      cell.value = instruction;
      cell.alignment = { wrapText: true };
      row++;
    });

    // Set column widths
    worksheet.getColumn(1).width = 100;
  }

  private getInstructions(type: string): string[] {
    const common = [
      '1. Fill in the data starting from row 2 (row 1 contains headers)',
      '2. Do not modify the header row',
      '3. Required fields must not be empty',
      '4. Save the file as .xlsx or .csv before importing',
      '5. For boolean fields, use: true/false, 1/0, or yes/no',
      '6. Dates should be in format: YYYY-MM-DD',
      '',
    ];

    const specific: Record<string, string[]> = {
      products: [
        'PRODUCT SPECIFIC INSTRUCTIONS:',
        '- SKU must be unique for each product',
        '- Status values: draft, published, archived',
        '- Price and quantity must be positive numbers',
        '- Category should match existing category name or slug',
        '- Multiple tags can be separated by commas',
        '- URL key should contain only lowercase letters, numbers, and hyphens',
      ],
      variants: [
        'VARIANT SPECIFIC INSTRUCTIONS:',
        '- productSku must match an existing product SKU',
        '- variantSku must be unique',
        '- At least one variant attribute (color, size, etc.) should be specified',
        '- isDefault: only one variant per product should be default',
        '- Price overrides the parent product price if specified',
      ],
      categories: [
        'CATEGORY SPECIFIC INSTRUCTIONS:',
        '- Name must be unique within the same parent',
        '- Slug must be unique across all categories',
        '- Parent field should contain the name or slug of parent category',
        '- Position determines the order within the same level',
        '- Leave parent empty for root categories',
      ],
      attributes: [
        'ATTRIBUTE SPECIFIC INSTRUCTIONS:',
        '- Code must be unique and contain only lowercase letters, numbers, and underscores',
        '- Type values: text, textarea, number, decimal, select, multiselect, boolean, date, datetime, color, file, image, url',
        '- For select/multiselect types, provide options separated by pipe (|)',
        '- Group name helps organize attributes',
      ],
      inventory: [
        'INVENTORY SPECIFIC INSTRUCTIONS:',
        '- SKU must match existing product or variant SKU',
        '- Available quantity = quantity - reserved quantity',
        '- Reorder point triggers low stock alerts',
        '- Location format is flexible (e.g., A1-B2, Shelf 5, etc.)',
      ],
    };

    return [...common, ...(specific[type] || [])];
  }
}
