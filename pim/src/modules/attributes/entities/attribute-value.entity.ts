import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Attribute } from './attribute.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * AttributeValue entity - stores actual attribute values for products
 * Implements EAV (Entity-Attribute-Value) pattern
 */
@Entity('attribute_values')
@Unique(['productId', 'attributeId', 'locale'])
@Index(['productId'])
@Index(['attributeId'])
@Index(['locale'])
export class AttributeValue extends BaseEntity {
  @Column({
    type: 'uuid',
    comment: 'Product ID',
  })
  productId: string;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'uuid',
    comment: 'Attribute ID',
  })
  attributeId: string;

  @ManyToOne(() => Attribute, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  // Polymorphic value storage - use appropriate column based on attribute type
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Text value for text-based attributes',
  })
  textValue: string | null;

  @Column({
    type: 'numeric',
    precision: 20,
    scale: 6,
    nullable: true,
    comment: 'Numeric value for number/decimal attributes',
  })
  numberValue: number | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date value for date/datetime attributes',
  })
  dateValue: Date | null;

  @Column({
    type: 'boolean',
    nullable: true,
    comment: 'Boolean value for boolean attributes',
  })
  booleanValue: boolean | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'JSON value for complex data or multiselect',
  })
  jsonValue: any | null;

  // Localization
  @Column({
    type: 'varchar',
    length: 10,
    default: 'en',
    comment: 'Locale code for localized values',
  })
  locale: string;

  /**
   * Get the actual value based on attribute type
   */
  getValue(): any {
    const attributeType = this.attribute?.type;
    if (!attributeType) return null;

    switch (attributeType) {
      case 'text':
      case 'textarea':
      case 'select':
      case 'color':
      case 'url':
      case 'email':
        return this.textValue;

      case 'number':
      case 'decimal':
        return this.numberValue;

      case 'date':
      case 'datetime':
        return this.dateValue;

      case 'boolean':
        return this.booleanValue;

      case 'multiselect':
      case 'json':
        return this.jsonValue;

      default:
        return this.textValue;
    }
  }

  /**
   * Set the value based on attribute type
   */
  setValue(value: any, attributeType?: string): void {
    // Reset all values
    this.textValue = null;
    this.numberValue = null;
    this.dateValue = null;
    this.booleanValue = null;
    this.jsonValue = null;

    if (value === null || value === undefined) return;

    const type = attributeType || this.attribute?.type;
    if (!type) return;

    switch (type) {
      case 'text':
      case 'textarea':
      case 'select':
      case 'color':
      case 'url':
      case 'email':
        this.textValue = String(value);
        break;

      case 'number':
      case 'decimal':
        this.numberValue = Number(value);
        break;

      case 'date':
      case 'datetime':
        this.dateValue = value instanceof Date ? value : new Date(value);
        break;

      case 'boolean':
        this.booleanValue = Boolean(value);
        break;

      case 'multiselect':
        this.jsonValue = Array.isArray(value) ? value : [value];
        break;

      case 'json':
        this.jsonValue = value;
        break;

      default:
        this.textValue = String(value);
    }
  }

  /**
   * Get display value formatted according to attribute settings
   */
  getDisplayValue(): string {
    const value = this.getValue();
    if (value === null || value === undefined) return '';

    if (this.attribute) {
      return this.attribute.formatValue(value);
    }

    return String(value);
  }
}
