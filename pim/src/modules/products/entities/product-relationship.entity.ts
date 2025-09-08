import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

export enum RelationshipType {
  CROSS_SELL = 'cross_sell',
  UP_SELL = 'up_sell',
  RELATED = 'related',
  ACCESSORY = 'accessory',
}

@Entity('product_relationships')
@Unique(['sourceProductId', 'targetProductId', 'relationshipType'])
@Index(['sourceProductId'])
@Index(['targetProductId'])
@Index(['relationshipType'])
export class ProductRelationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sourceProductId: string;

  @ManyToOne(() => Product, (product) => product.relatedProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sourceProductId' })
  sourceProduct: Product;

  @Column({ type: 'uuid' })
  targetProductId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetProductId' })
  targetProduct: Product;

  @Column({
    type: 'enum',
    enum: RelationshipType,
  })
  relationshipType: RelationshipType;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
