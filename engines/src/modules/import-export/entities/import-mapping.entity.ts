import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ImportType } from './import-job.entity';

@Entity('import_mappings')
export class ImportMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ImportType;

  @Column({ type: 'jsonb' })
  mapping: Record<string, string>; // Source field -> Target field mapping

  @Column({ type: 'jsonb', nullable: true })
  transformations: Record<string, any>; // Field transformations

  @Column({ type: 'jsonb', nullable: true })
  defaults: Record<string, any>; // Default values for fields

  @Column({ type: 'jsonb', nullable: true })
  validation: Record<string, any>; // Validation rules

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
