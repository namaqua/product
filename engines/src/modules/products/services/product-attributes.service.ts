import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { AttributesService } from '../../attributes/attributes.service';
import {
  AttributeAssignmentDto,
  AssignProductAttributesDto,
  BulkAssignProductAttributesDto,
  RemoveProductAttributeDto,
  AssignProductAttributeGroupDto,
  ProductAttributesResponseDto,
  ValidateProductAttributesDto,
  ProductAttributeValidationResultDto,
} from '../dto/attributes';
import {
  SetAttributeValueDto,
  BulkSetAttributeValuesDto,
  AttributeValueResponseDto,
} from '../../attributes/dto';
import {
  ActionResponseDto,
  CollectionResponseDto,
  ResponseHelpers,
} from '../../../common/dto';

@Injectable()
export class ProductAttributesService {
  private readonly logger = new Logger(ProductAttributesService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(forwardRef(() => AttributesService))
    private readonly attributesService: AttributesService,
  ) {}

  /**
   * Assign attributes to a product
   */
  async assignAttributes(
    productId: string,
    dto: AssignProductAttributesDto,
    userId: string,
  ): Promise<ActionResponseDto<{ assigned: number; failed: number }>> {
    this.logger.log(`Assigning ${dto.attributes.length} attributes to product ${productId}`);

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    let assigned = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each attribute assignment
    for (const assignment of dto.attributes) {
      try {
        const setValueDto: SetAttributeValueDto = {
          attributeId: assignment.attributeId,
          value: assignment.value,
          locale: assignment.locale || 'en',
        };

        await this.attributesService.setAttributeValue(
          productId,
          setValueDto,
          userId,
        );
        assigned++;
      } catch (error) {
        failed++;
        errors.push(`Failed to assign attribute ${assignment.attributeId}: ${error.message}`);
        this.logger.error(`Failed to assign attribute: ${error.message}`);
      }
    }

    const message = failed > 0
      ? `Assigned ${assigned} attributes, ${failed} failed. Errors: ${errors.join('; ')}`
      : `Successfully assigned ${assigned} attributes`;

    return new ActionResponseDto({ assigned, failed }, message);
  }

  /**
   * Bulk assign attributes to multiple products
   */
  async bulkAssignAttributes(
    dto: BulkAssignProductAttributesDto,
    userId: string,
  ): Promise<ActionResponseDto<{ 
    totalAssignments: number; 
    successful: number; 
    failed: number; 
    details: Record<string, { assigned: number; failed: number }> 
  }>> {
    this.logger.log(`Bulk assigning attributes to ${dto.productIds.length} products`);

    // Verify all products exist
    const products = await this.productRepository.find({
      where: { id: In(dto.productIds), isDeleted: false },
    });

    if (products.length !== dto.productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = dto.productIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
    }

    const details: Record<string, { assigned: number; failed: number }> = {};
    let totalSuccessful = 0;
    let totalFailed = 0;

    // Process each product
    for (const productId of dto.productIds) {
      const assignDto: AssignProductAttributesDto = {
        attributes: dto.attributes,
      };

      const result = await this.assignAttributes(productId, assignDto, userId);
      const data = result.item;
      
      details[productId] = data;
      totalSuccessful += data.assigned;
      totalFailed += data.failed;
    }

    const totalAssignments = dto.productIds.length * dto.attributes.length;

    return new ActionResponseDto({
      totalAssignments,
      successful: totalSuccessful,
      failed: totalFailed,
      details,
    }, `Bulk assignment completed: ${totalSuccessful} successful, ${totalFailed} failed`);
  }

  /**
   * Remove an attribute from a product
   */
  async removeAttribute(
    productId: string,
    dto: RemoveProductAttributeDto,
  ): Promise<ActionResponseDto<AttributeValueResponseDto>> {
    this.logger.log(`Removing attribute ${dto.attributeId} from product ${productId}`);

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.attributesService.deleteAttributeValue(
      productId,
      dto.attributeId,
      dto.locale || 'en',
    );
  }

  /**
   * Assign all attributes from a group to a product
   */
  async assignAttributeGroup(
    productId: string,
    dto: AssignProductAttributeGroupDto,
    userId: string,
  ): Promise<ActionResponseDto<{ assigned: number; failed: number }>> {
    this.logger.log(`Assigning attribute group ${dto.groupId} to product ${productId}`);

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get all attributes in the group
    const attributesResponse = await this.attributesService.getAttributesByGroup(dto.groupId);
    const attributes = attributesResponse.items;

    if (attributes.length === 0) {
      throw new BadRequestException(`No attributes found in group ${dto.groupId}`);
    }

    let assigned = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each attribute in the group
    for (const attribute of attributes) {
      const value = dto.values[attribute.code];
      
      // Skip if no value provided for this attribute
      if (value === undefined || value === null) {
        if (attribute.isRequired) {
          failed++;
          errors.push(`Required attribute ${attribute.name} has no value`);
        }
        continue;
      }

      try {
        const setValueDto: SetAttributeValueDto = {
          attributeId: attribute.id,
          value,
          locale: dto.locale || 'en',
        };

        await this.attributesService.setAttributeValue(
          productId,
          setValueDto,
          userId,
        );
        assigned++;
      } catch (error) {
        failed++;
        errors.push(`Failed to assign ${attribute.name}: ${error.message}`);
      }
    }

    const message = failed > 0
      ? `Assigned ${assigned} attributes from group, ${failed} failed. Errors: ${errors.join('; ')}`
      : `Successfully assigned ${assigned} attributes from group`;

    return new ActionResponseDto({ assigned, failed }, message);
  }

  /**
   * Get all attributes for a product
   */
  async getProductAttributes(
    productId: string,
    locale?: string,
  ): Promise<ProductAttributesResponseDto> {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get all attribute values for the product
    const valuesResponse = await this.attributesService.getProductAttributeValues(
      productId,
      locale,
    );
    const attributeValues = valuesResponse.items;

    // Group attributes by their group
    const groupedAttributes: Record<string, any> = {};
    const ungroupedAttributes: any[] = [];

    for (const value of attributeValues) {
      // Get full attribute details
      const attribute = await this.attributesService.findOne(value.attributeId);
      
      const attributeData = {
        id: value.attributeId,
        code: attribute.code,
        name: attribute.name,
        value: value.value,
        displayValue: value.displayValue,
        type: attribute.type,
        unit: attribute.unit,
      };

      if (attribute.groupId && attribute.groupName) {
        if (!groupedAttributes[attribute.groupId]) {
          groupedAttributes[attribute.groupId] = {
            groupName: attribute.groupName,
            attributes: [],
          };
        }
        groupedAttributes[attribute.groupId].attributes.push(attributeData);
      } else {
        ungroupedAttributes.push(attributeData);
      }
    }

    // Sort attributes within groups by sortOrder
    for (const groupId in groupedAttributes) {
      groupedAttributes[groupId].attributes.sort((a: any, b: any) => {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
    }

    return ProductAttributesResponseDto.fromProductAndAttributes(
      product,
      groupedAttributes,
      ungroupedAttributes,
      attributeValues.length,
    );
  }

  /**
   * Validate attributes before assignment
   */
  async validateAttributes(
    productId: string,
    dto: ValidateProductAttributesDto,
  ): Promise<ProductAttributeValidationResultDto> {
    this.logger.log(`Validating ${dto.attributes.length} attributes for product ${productId}`);

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const errors: Record<string, string[]> = {};
    const validAttributes: string[] = [];
    const invalidAttributes: string[] = [];

    // Validate each attribute
    for (const assignment of dto.attributes) {
      try {
        // Try to set the attribute value with validation
        // This will throw an error if validation fails
        const setValueDto: SetAttributeValueDto = {
          attributeId: assignment.attributeId,
          value: assignment.value,
          locale: assignment.locale || 'en',
        };

        // Get attribute details first to check if it exists
        const attribute = await this.attributesService.findOne(assignment.attributeId);
        
        // Check basic type validation
        let validationErrors: string[] = [];
        
        // Type-specific validation
        switch (attribute.type) {
          case 'number':
          case 'decimal':
            if (assignment.value !== null && assignment.value !== undefined && isNaN(Number(assignment.value))) {
              validationErrors.push(`${attribute.name} must be a number`);
            }
            break;
            
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (assignment.value && !emailRegex.test(assignment.value)) {
              validationErrors.push(`${attribute.name} must be a valid email`);
            }
            break;
            
          case 'url':
            try {
              if (assignment.value) new URL(assignment.value);
            } catch {
              validationErrors.push(`${attribute.name} must be a valid URL`);
            }
            break;
            
          case 'boolean':
            if (assignment.value !== null && assignment.value !== undefined && 
                typeof assignment.value !== 'boolean' && 
                assignment.value !== 'true' && assignment.value !== 'false') {
              validationErrors.push(`${attribute.name} must be a boolean`);
            }
            break;
        }
        
        // Check required validation
        if (attribute.isRequired && (assignment.value === null || assignment.value === undefined || assignment.value === '')) {
          validationErrors.push(`${attribute.name} is required`);
        }
        
        // Apply validation rules if any
        if (attribute.validationRules && Array.isArray(attribute.validationRules)) {
          for (const rule of attribute.validationRules) {
            switch (rule.type) {
              case 'min':
                if (Number(assignment.value) < rule.value) {
                  validationErrors.push(rule.message || `${attribute.name} must be at least ${rule.value}`);
                }
                break;
                
              case 'max':
                if (Number(assignment.value) > rule.value) {
                  validationErrors.push(rule.message || `${attribute.name} must be at most ${rule.value}`);
                }
                break;
                
              case 'minLength':
                if (assignment.value && assignment.value.toString().length < rule.value) {
                  validationErrors.push(rule.message || `${attribute.name} must be at least ${rule.value} characters`);
                }
                break;
                
              case 'maxLength':
                if (assignment.value && assignment.value.toString().length > rule.value) {
                  validationErrors.push(rule.message || `${attribute.name} must be at most ${rule.value} characters`);
                }
                break;
                
              case 'pattern':
                const regex = new RegExp(rule.value);
                if (assignment.value && !regex.test(assignment.value.toString())) {
                  validationErrors.push(rule.message || `${attribute.name} format is invalid`);
                }
                break;
            }
          }
        }
        
        if (validationErrors.length > 0) {
          errors[assignment.attributeId] = validationErrors;
          invalidAttributes.push(assignment.attributeId);
        } else {
          validAttributes.push(assignment.attributeId);
        }
      } catch (error) {
        errors[assignment.attributeId] = [`Attribute not found or error: ${error.message}`];
        invalidAttributes.push(assignment.attributeId);
      }
    }

    return ProductAttributeValidationResultDto.create(
      validAttributes,
      invalidAttributes,
      errors,
    );
  }

  /**
   * Copy attributes from one product to another
   */
  async copyAttributes(
    sourceProductId: string,
    targetProductId: string,
    userId: string,
  ): Promise<ActionResponseDto<{ copied: number }>> {
    this.logger.log(`Copying attributes from ${sourceProductId} to ${targetProductId}`);

    // Verify both products exist
    const [sourceProduct, targetProduct] = await Promise.all([
      this.productRepository.findOne({
        where: { id: sourceProductId, isDeleted: false },
      }),
      this.productRepository.findOne({
        where: { id: targetProductId, isDeleted: false },
      }),
    ]);

    if (!sourceProduct) {
      throw new NotFoundException(`Source product ${sourceProductId} not found`);
    }

    if (!targetProduct) {
      throw new NotFoundException(`Target product ${targetProductId} not found`);
    }

    // Get source product attributes
    const sourceAttributesResponse = await this.attributesService.getProductAttributeValues(
      sourceProductId,
    );
    const sourceAttributes = sourceAttributesResponse.items;

    if (sourceAttributes.length === 0) {
      return new ActionResponseDto({ copied: 0 }, 'No attributes to copy');
    }

    // Copy each attribute
    let copied = 0;
    for (const sourceAttr of sourceAttributes) {
      try {
        const setValueDto: SetAttributeValueDto = {
          attributeId: sourceAttr.attributeId,
          value: sourceAttr.value,
          locale: sourceAttr.locale,
        };

        await this.attributesService.setAttributeValue(
          targetProductId,
          setValueDto,
          userId,
        );
        copied++;
      } catch (error) {
        this.logger.error(`Failed to copy attribute ${sourceAttr.attributeId}: ${error.message}`);
      }
    }

    return new ActionResponseDto(
      { copied },
      `Successfully copied ${copied} attributes`,
    );
  }

  /**
   * Clear all attributes from a product
   */
  async clearAttributes(
    productId: string,
  ): Promise<ActionResponseDto<{ removed: number }>> {
    this.logger.log(`Clearing all attributes from product ${productId}`);

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get all attribute values
    const valuesResponse = await this.attributesService.getProductAttributeValues(productId);
    const values = valuesResponse.items;

    let removed = 0;
    for (const value of values) {
      try {
        await this.attributesService.deleteAttributeValue(
          productId,
          value.attributeId,
          value.locale,
        );
        removed++;
      } catch (error) {
        this.logger.error(`Failed to remove attribute ${value.attributeId}: ${error.message}`);
      }
    }

    return new ActionResponseDto(
      { removed },
      `Successfully removed ${removed} attributes`,
    );
  }
}
