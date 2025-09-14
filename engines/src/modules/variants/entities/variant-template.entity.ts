import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('variant_templates')
@Index(['createdBy', 'isGlobal'])
@Index(['name'])
export class VariantTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  axisName: string;

  @Column({ type: 'json' })
  values: string[];

  @Column({ type: 'json', nullable: true })
  metadata: {
    category?: string;
    icon?: string;
    color?: string;
    suggestedPricing?: {
      strategy?: 'fixed' | 'percentage' | 'tiered';
      adjustments?: Record<string, number>;
    };
  };

  @Column({ type: 'boolean', default: false })
  isGlobal: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
