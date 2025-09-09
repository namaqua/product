import { Entity, Column, Index, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entities';
import { Attribute } from './attribute.entity';

/**
 * AttributeGroup entity - organizes attributes into logical groups
 */
@Entity('attribute_groups')
@Index(['code'], { unique: true })
@Index(['sortOrder'])
export class AttributeGroup extends SoftDeleteEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: 'Unique group code',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Group display name',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Group description',
  })
  description: string | null;

  @OneToMany(() => Attribute, (attribute) => attribute.group)
  attributes: Attribute[];

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether group is collapsible in UI',
  })
  isCollapsible: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether group is collapsed by default',
  })
  isCollapsedByDefault: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Icon name for UI display',
  })
  icon: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional configuration',
  })
  config: Record<string, any> | null;
}
