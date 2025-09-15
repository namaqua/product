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

export enum ImportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ImportType {
  PRODUCTS = 'products',
  VARIANTS = 'variants',
  CATEGORIES = 'categories',
  ATTRIBUTES = 'attributes',
}

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ImportType;

  @Column({
    type: 'varchar',
    length: 50,
    default: ImportJobStatus.PENDING,
  })
  status: ImportJobStatus;

  @Column()
  filename: string;

  @Column()
  originalFilename: string;

  @Column({ nullable: true })
  filepath: string;

  @Column({ type: 'jsonb', nullable: true })
  mapping: Record<string, string>; // Source field -> Target field mapping

  @Column({ type: 'jsonb', nullable: true })
  options: {
    skipHeader?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
    delimiter?: string;
    encoding?: string;
  };

  @Column({ default: 0 })
  totalRows: number;

  @Column({ default: 0 })
  processedRows: number;

  @Column({ default: 0 })
  successCount: number;

  @Column({ default: 0 })
  errorCount: number;

  @Column({ default: 0 })
  skipCount: number;

  @Column({ type: 'jsonb', nullable: true })
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  summary: {
    created?: number;
    updated?: number;
    skipped?: number;
    failed?: number;
    duration?: number;
  };

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for progress percentage
  get progress(): number {
    if (this.totalRows === 0) return 0;
    return Math.round((this.processedRows / this.totalRows) * 100);
  }

  // Virtual property for elapsed time
  get elapsedTime(): number {
    if (!this.startedAt) return 0;
    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  // Virtual property for success rate
  get successRate(): number {
    if (this.processedRows === 0) return 0;
    return Math.round((this.successCount / this.processedRows) * 100);
  }
}
