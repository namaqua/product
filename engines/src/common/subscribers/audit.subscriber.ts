import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  LoadEvent,
  RecoverEvent,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { Injectable } from '@nestjs/common';

/**
 * Subscriber to automatically handle audit fields
 * This will be enhanced later to get the actual user from the request context
 */
@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<BaseEntity> {
  /**
   * Indicates that this subscriber only listens to BaseEntity events
   */
  listenTo() {
    return BaseEntity;
  }

  /**
   * Called before entity insertion
   */
  beforeInsert(event: InsertEvent<BaseEntity>) {
    if (event.entity) {
      // TODO: Get actual user ID from request context
      // For now, we'll leave it null or use a system user ID
      // event.entity.createdBy = this.getCurrentUserId();
      // event.entity.updatedBy = this.getCurrentUserId();
      
      // Ensure isActive is set
      if (event.entity.isActive === undefined) {
        event.entity.isActive = true;
      }
    }
  }

  /**
   * Called before entity update
   */
  beforeUpdate(event: UpdateEvent<BaseEntity>) {
    if (event.entity) {
      // TODO: Get actual user ID from request context
      // event.entity.updatedBy = this.getCurrentUserId();
      
      // Update the updatedAt timestamp (TypeORM handles this automatically with @UpdateDateColumn)
    }
  }

  /**
   * Called after entity is loaded
   * Can be used to transform data after loading from database
   */
  afterLoad(entity: BaseEntity, event?: LoadEvent<BaseEntity>) {
    // Can be used for data transformation if needed
  }

  /**
   * Called after entity recovery (undelete)
   */
  afterRecover(event: RecoverEvent<BaseEntity>) {
    if (event.entity) {
      // Reset soft delete fields
      event.entity.isActive = true;
    }
  }

  /**
   * Helper method to get current user ID
   * This will be implemented later with proper auth context
   */
  private getCurrentUserId(): string | null {
    // TODO: Implement this to get user from request context
    // For now, return null
    return null;
  }
}
