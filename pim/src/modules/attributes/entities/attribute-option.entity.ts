import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Attribute } from './attribute.entity';

/**
 * AttributeOption entity - defines options for select/multiselect attributes
 */
@Entity('attribute_options')
@Index(['attributeId', 'value'], { unique: true })
@Index(['attributeId', 'sortOrder'])
export class AttributeOption extends BaseEntity {
  @Column({
    type: 'uuid',
    comment: 'Parent attribute ID',
  })
  attributeId: string;

  @ManyToOne(() => Attribute, (attribute) => attribute.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Option value (stored in database)',
  })
  value: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Option display label',
  })
  label: string;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: 'Color code for visual representation',
  })
  color: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Icon name for UI display',
  })
  icon: string | null;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this is the default option',
  })
  isDefault: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata',
  })
  metadata: Record<string, any> | null;
}
