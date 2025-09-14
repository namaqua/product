import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariantTemplate } from './entities/variant-template.entity';
import {
  CreateVariantTemplateDto,
  UpdateVariantTemplateDto,
  VariantTemplateResponseDto,
} from './dto/variant-template.dto';
import { ActionResponseDto, CollectionResponse } from '../../common/dto';

@Injectable()
export class VariantTemplateService {
  constructor(
    @InjectRepository(VariantTemplate)
    private readonly templateRepository: Repository<VariantTemplate>,
  ) {}

  async create(
    dto: CreateVariantTemplateDto,
    userId: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    const template = this.templateRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.templateRepository.save(template);
    
    return new ActionResponseDto(
      this.toResponseDto(saved),
      'Variant template created successfully',
    );
  }

  async findAll(
    userId?: string,
    isGlobal?: boolean,
  ): Promise<CollectionResponse<VariantTemplateResponseDto>> {
    const query = this.templateRepository.createQueryBuilder('template')
      .leftJoinAndSelect('template.creator', 'creator')
      .where('template.isActive = :isActive', { isActive: true });

    if (isGlobal !== undefined) {
      query.andWhere('template.isGlobal = :isGlobal', { isGlobal });
    } else if (userId) {
      // Get both user's templates and global templates
      query.andWhere('(template.createdBy = :userId OR template.isGlobal = true)', { userId });
    } else {
      // Only global templates for unauthenticated users
      query.andWhere('template.isGlobal = true');
    }

    query.orderBy('template.usageCount', 'DESC')
      .addOrderBy('template.name', 'ASC');

    const [items, totalItems] = await query.getManyAndCount();

    return {
      items: items.map(item => this.toResponseDto(item)),
      meta: {
        totalItems,
        itemCount: items.length,
        page: 1,
        itemsPerPage: totalItems,
        totalPages: 1,
      },
    };
  }

  async findUserTemplates(userId: string): Promise<CollectionResponse<VariantTemplateResponseDto>> {
    const templates = await this.templateRepository.find({
      where: {
        createdBy: userId,
        isActive: true,
      },
      relations: ['creator'],
      order: {
        name: 'ASC',
      },
    });

    return {
      items: templates.map(t => this.toResponseDto(t)),
      meta: {
        totalItems: templates.length,
        itemCount: templates.length,
        page: 1,
        itemsPerPage: templates.length,
        totalPages: 1,
      },
    };
  }

  async findOne(id: string): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!template) {
      throw new NotFoundException('Variant template not found');
    }

    // Increment usage count
    await this.templateRepository.increment({ id }, 'usageCount', 1);

    return new ActionResponseDto(
      this.toResponseDto(template),
      'Template retrieved successfully',
    );
  }

  async update(
    id: string,
    dto: UpdateVariantTemplateDto,
    userId: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!template) {
      throw new NotFoundException('Variant template not found');
    }

    // Only creator or admin can update
    if (template.createdBy !== userId && !template.isGlobal) {
      throw new ForbiddenException('You can only update your own templates');
    }

    Object.assign(template, {
      ...dto,
      updatedBy: userId,
    });

    const saved = await this.templateRepository.save(template);

    return new ActionResponseDto(
      this.toResponseDto(saved),
      'Template updated successfully',
    );
  }

  async remove(id: string, userId: string): Promise<ActionResponseDto<void>> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Variant template not found');
    }

    // Only creator or admin can delete
    if (template.createdBy !== userId && !template.isGlobal) {
      throw new ForbiddenException('You can only delete your own templates');
    }

    await this.templateRepository.remove(template);

    return new ActionResponseDto(
      undefined,
      'Template deleted successfully',
    );
  }

  async duplicate(
    id: string,
    userId: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    const original = await this.templateRepository.findOne({
      where: { id },
    });

    if (!original) {
      throw new NotFoundException('Variant template not found');
    }

    const duplicate = this.templateRepository.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      axisName: original.axisName,
      values: [...original.values],
      metadata: original.metadata ? { ...original.metadata } : undefined,
      isGlobal: false, // Duplicates are always personal
      isActive: true,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.templateRepository.save(duplicate);

    return new ActionResponseDto(
      this.toResponseDto(saved),
      'Template duplicated successfully',
    );
  }

  async seedDefaultTemplates(): Promise<void> {
    const defaultTemplates: Array<{
      name: string;
      axisName: string;
      values: string[];
      metadata: {
        category: string;
        icon: string;
        color: string;
        suggestedPricing?: {
          strategy: 'fixed' | 'percentage' | 'tiered';
          adjustments: Record<string, number>;
        };
      };
    }> = [
      {
        name: 'Clothing Sizes',
        axisName: 'Size',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        metadata: { category: 'apparel', icon: 'size', color: 'blue' },
      },
      {
        name: 'Standard Colors',
        axisName: 'Color',
        values: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow'],
        metadata: { category: 'general', icon: 'palette', color: 'purple' },
      },
      {
        name: 'Storage Capacity',
        axisName: 'Storage',
        values: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
        metadata: { 
          category: 'electronics', 
          icon: 'storage', 
          color: 'green',
          suggestedPricing: {
            strategy: 'percentage' as const,
            adjustments: { '512GB': 25, '1TB': 50, '2TB': 100 }
          }
        },
      },
      {
        name: 'Memory (RAM)',
        axisName: 'Memory',
        values: ['4GB', '8GB', '16GB', '32GB', '64GB'],
        metadata: { 
          category: 'electronics', 
          icon: 'memory', 
          color: 'orange',
          suggestedPricing: {
            strategy: 'percentage' as const,
            adjustments: { '16GB': 15, '32GB': 30, '64GB': 60 }
          }
        },
      },
      {
        name: 'Materials',
        axisName: 'Material',
        values: ['Cotton', 'Polyester', 'Wool', 'Leather', 'Silk', 'Linen', 'Synthetic'],
        metadata: { category: 'apparel', icon: 'fabric', color: 'brown' },
      },
      {
        name: 'Shoe Sizes (US)',
        axisName: 'Shoe Size',
        values: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
        metadata: { category: 'footwear', icon: 'shoe', color: 'gray' },
      },
      {
        name: 'Screen Sizes',
        axisName: 'Screen Size',
        values: ['13"', '14"', '15"', '16"', '17"', '24"', '27"', '32"'],
        metadata: { 
          category: 'electronics', 
          icon: 'monitor', 
          color: 'cyan',
          suggestedPricing: {
            strategy: 'fixed' as const,
            adjustments: { '27"': 200, '32"': 400 }
          }
        },
      },
    ];

    for (const templateData of defaultTemplates) {
      const existing = await this.templateRepository.findOne({
        where: { 
          name: templateData.name,
          isGlobal: true,
        },
      });

      if (!existing) {
        const template = this.templateRepository.create({
          ...templateData,
          description: `Default template for ${templateData.axisName}`,
          isGlobal: true,
          isActive: true,
        });
        
        await this.templateRepository.save(template);
      }
    }
  }

  private toResponseDto(template: VariantTemplate): VariantTemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      axisName: template.axisName,
      values: template.values,
      metadata: template.metadata,
      isGlobal: template.isGlobal,
      isActive: template.isActive,
      usageCount: template.usageCount,
      createdBy: template.createdBy,
      creator: template.creator ? {
        id: template.creator.id,
        name: template.creator.fullName, // Use fullName getter
        email: template.creator.email,
      } : undefined,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
