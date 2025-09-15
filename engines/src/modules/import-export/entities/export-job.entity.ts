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

export enum ExportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ExportType {
  PRODUCTS = 'products',
  VARIANTS = 'variants',
  CATEGORIES = 'categories',
  ATTRIBUTES = 'attributes',
  INVENTORY = 'inventory',
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
}

@Entity('export_jobs')
export class ExportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ExportType;

  @Column({
    type: 'varchar',
    length: 50,
    default: ExportFormat.CSV,
  })
  format: ExportFormat;

  @Column({
    type: 'varchar',
    length: 50,
    default: ExportJobStatus.PENDING,
  })
  status: ExportJobStatus;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  filepath: string;

  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: {
    status?: string[];
    categories?: string[];
    brands?: string[];
    priceRange?: { min: number; max: number };
    stockRange?: { min: number; max: number };
    dateRange?: { from: Date; to: Date };
    search?: string;
  };

  @Column({ 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: string[] | null) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => value ? JSON.parse(value) : null,
    }
  })
  fields: string[];

  @Column({ type: 'jsonb', nullable: true })
  options: {
    includeVariants?: boolean;
    includeImages?: boolean;
    includeCategories?: boolean;
    includeAttributes?: boolean;
    delimiter?: string;
    encoding?: string;
  };

  @Column({ default: 0 })
  totalRecords: number;

  @Column({ default: 0 })
  processedRecords: number;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

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
    if (this.totalRecords === 0) return 0;
    return Math.round((this.processedRecords / this.totalRecords) * 100);
  }

  // Virtual property for elapsed time
  get elapsedTime(): number {
    if (!this.startedAt) return 0;
    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  // Virtual property to check if export is expired
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
}
