import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entities';
import { AttributeGroup } from './attribute-group.entity';
import { AttributeOption } from './attribute-option.entity';
import { AttributeValue } from './attribute-value.entity';

/**
 * Attribute types supported by the system
 */
export enum AttributeType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DECIMAL = 'decimal',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  COLOR = 'color',
  URL = 'url',
  EMAIL = 'email',
  JSON = 'json',
}

/**
 * Validation rule types
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'minLength' | 'maxLength' | 'custom';
  value?: any;
  message?: string;
}

/**
 * Attribute entity - defines dynamic attributes for products
 * Uses EAV (Entity-Attribute-Value) pattern for flexibility
 */
@Entity('attributes')
@Index(['code'], { unique: true })
@Index(['groupId'])
@Index(['type'])
@Index(['isRequired'])
@Index(['isSearchable'])
export class Attribute extends SoftDeleteEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: 'Unique attribute code',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Display name',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Attribute description',
  })
  description: string | null;

  @Column({
    type: 'enum',
    enum: AttributeType,
    default: AttributeType.TEXT,
    comment: 'Attribute data type',
  })
  type: AttributeType;

  // Group relationship
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Attribute group ID',
  })
  groupId: string | null;

  @ManyToOne(() => AttributeGroup, (group) => group.attributes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'groupId' })
  group: AttributeGroup | null;

  // Options for select/multiselect types
  @OneToMany(() => AttributeOption, (option) => option.attribute, {
    cascade: true,
  })
  options: AttributeOption[];

  // Values associated with this attribute
  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values: AttributeValue[];

  // Validation settings
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether attribute is required',
  })
  isRequired: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether attribute should be unique per product',
  })
  isUnique: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Validation rules',
  })
  validationRules: ValidationRule[] | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Default value',
  })
  defaultValue: string | null;

  // Display settings
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Show in product listing',
  })
  isVisibleInListing: boolean;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Show in product detail',
  })
  isVisibleInDetail: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Use for product comparison',
  })
  isComparable: boolean;

  // Search settings
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Include in search index',
  })
  isSearchable: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Use as filter in listing',
  })
  isFilterable: boolean;

  // Localization
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether values can be localized',
  })
  isLocalizable: boolean;

  // UI settings
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Help text for attribute',
  })
  helpText: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Placeholder text for input',
  })
  placeholder: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Unit of measurement (e.g., kg, cm)',
  })
  unit: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional UI configuration',
  })
  uiConfig: Record<string, any> | null;

  /**
   * Generate code from name if not provided
   */
  @BeforeInsert()
  @BeforeUpdate()
  generateCode() {
    if (!this.code && this.name) {
      this.code = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }
  }

  /**
   * Validate attribute value based on type and rules
   */
  validateValue(value: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required
    if (this.isRequired && (value === null || value === undefined || value === '')) {
      errors.push(`${this.name} is required`);
    }

    // Type-specific validation
    switch (this.type) {
      case AttributeType.NUMBER:
      case AttributeType.DECIMAL:
        if (value !== null && isNaN(Number(value))) {
          errors.push(`${this.name} must be a number`);
        }
        break;

      case AttributeType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.push(`${this.name} must be a valid email`);
        }
        break;

      case AttributeType.URL:
        try {
          if (value) new URL(value);
        } catch {
          errors.push(`${this.name} must be a valid URL`);
        }
        break;

      case AttributeType.SELECT:
      case AttributeType.MULTISELECT:
        // Validate against available options
        if (value && this.options) {
          const optionValues = this.options.map((o) => o.value);
          const values = Array.isArray(value) ? value : [value];
          const invalidValues = values.filter((v) => !optionValues.includes(v));
          if (invalidValues.length > 0) {
            errors.push(`Invalid option(s) for ${this.name}: ${invalidValues.join(', ')}`);
          }
        }
        break;
    }

    // Apply custom validation rules
    if (this.validationRules) {
      for (const rule of this.validationRules) {
        switch (rule.type) {
          case 'min':
            if (Number(value) < rule.value) {
              errors.push(rule.message || `${this.name} must be at least ${rule.value}`);
            }
            break;

          case 'max':
            if (Number(value) > rule.value) {
              errors.push(rule.message || `${this.name} must be at most ${rule.value}`);
            }
            break;

          case 'minLength':
            if (value && value.toString().length < rule.value) {
              errors.push(
                rule.message || `${this.name} must be at least ${rule.value} characters`,
              );
            }
            break;

          case 'maxLength':
            if (value && value.toString().length > rule.value) {
              errors.push(
                rule.message || `${this.name} must be at most ${rule.value} characters`,
              );
            }
            break;

          case 'pattern':
            const regex = new RegExp(rule.value);
            if (value && !regex.test(value.toString())) {
              errors.push(rule.message || `${this.name} format is invalid`);
            }
            break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format value for display based on type
   */
  formatValue(value: any): string {
    if (value === null || value === undefined) return '';

    switch (this.type) {
      case AttributeType.BOOLEAN:
        return value ? 'Yes' : 'No';

      case AttributeType.DATE:
        return new Date(value).toLocaleDateString();

      case AttributeType.DATETIME:
        return new Date(value).toLocaleString();

      case AttributeType.DECIMAL:
        return Number(value).toFixed(2);

      case AttributeType.JSON:
        return JSON.stringify(value, null, 2);

      default:
        return value.toString();
    }
  }
}
