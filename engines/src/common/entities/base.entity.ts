import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  VersionColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

/**
 * Base entity class with common audit fields
 * All entities should extend this class
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ 
    type: 'timestamp with time zone',
    comment: 'Record creation timestamp' 
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    type: 'timestamp with time zone',
    comment: 'Record last update timestamp' 
  })
  updatedAt: Date;

  @Column({ 
    type: 'uuid', 
    nullable: true,
    comment: 'User ID who created this record' 
  })
  createdBy: string | null;

  @Column({ 
    type: 'uuid', 
    nullable: true,
    comment: 'User ID who last updated this record' 
  })
  updatedBy: string | null;

  @VersionColumn({ 
    comment: 'Version number for optimistic locking' 
  })
  version: number;

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Flag to indicate if record is active' 
  })
  isActive: boolean;
}

/**
 * Base entity with soft delete capability
 * Use this for entities that should never be physically deleted
 */
export abstract class SoftDeleteEntity extends BaseEntity {
  @Column({ 
    type: 'timestamp with time zone', 
    nullable: true,
    comment: 'Soft delete timestamp' 
  })
  deletedAt: Date | null;

  @Column({ 
    type: 'uuid', 
    nullable: true,
    comment: 'User ID who soft deleted this record' 
  })
  deletedBy: string | null;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Flag to indicate if record is soft deleted' 
  })
  isDeleted: boolean;

  /**
   * Soft delete this entity
   * @param userId - ID of the user performing the deletion
   */
  softDelete(userId?: string): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.isActive = false;
    if (userId) {
      this.deletedBy = userId;
    }
  }

  /**
   * Restore a soft deleted entity
   */
  restore(): void {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.isActive = true;
  }
}
