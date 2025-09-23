import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  Subscription,
  SubscriptionProduct,
  SubscriptionInvoice,
  SubscriptionEvent,
} from './entities';

// External entities needed by the service
import { Product } from '../modules/products/entities/product.entity';
import { Account } from '../modules/accounts/entities/account.entity';

// Controllers
import { SubscriptionController } from './controllers';

// Services
import { SubscriptionService } from './services';
// import { BillingService } from './services/billing.service';
// import { ProrationService } from './services/proration.service';
// import { DunningService } from './services/dunning.service';

/**
 * Subscription Module
 * Manages subscription lifecycle, billing, and payment processing
 * 
 * Features:
 * - Hierarchical subscriptions (parent/child relationships)
 * - Lifecycle management (start, pause, resume, cancel)
 * - Billing cycles and proration
 * - Dunning process for failed payments
 * - Payment service provider integration (mocked initially)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core subscription entities
      Subscription,
      SubscriptionProduct,
      SubscriptionInvoice,
      SubscriptionEvent,
      // External entities needed for relationships
      Product,
      Account,
    ]),
    // Add other module dependencies here as needed
  ],
  controllers: [
    SubscriptionController,
  ],
  providers: [
    SubscriptionService,
    // BillingService,
    // ProrationService,
    // DunningService,
  ],
  exports: [
    SubscriptionService,
    // Export services that other modules might need
  ],
})
export class SubscriptionModule {}
