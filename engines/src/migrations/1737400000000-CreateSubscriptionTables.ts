import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSubscriptionTables1737400000000 implements MigrationInterface {
  name = 'CreateSubscriptionTables1737400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUMs first
    await queryRunner.query(`
      CREATE TYPE "subscription_status_enum" AS ENUM (
        'pending', 'active', 'paused', 'cancelled', 'expired'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "billing_cycle_enum" AS ENUM (
        'monthly', 'quarterly', 'annual', 'custom'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "cancellation_reason_enum" AS ENUM (
        'customer_request', 'non_payment', 'fraud', 'other'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM (
        'draft', 'pending', 'paid', 'failed', 'cancelled', 'refunded'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "dunning_status_enum" AS ENUM (
        'not_required', 'in_progress', 'grace_period', 'suspended', 'resolved', 'failed'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "subscription_event_type_enum" AS ENUM (
        'created', 'activated', 'paused', 'resumed', 'cancelled', 'expired',
        'invoice_generated', 'payment_succeeded', 'payment_failed', 'payment_retry',
        'upgraded', 'downgraded', 'product_added', 'product_removed',
        'parent_assigned', 'child_added', 'child_removed'
      )
    `);

    // Create Subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          // Base columns from SoftDeleteEntity
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'deletedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'deletedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
          },
          // Subscription specific columns
          {
            name: 'accountId',
            type: 'uuid',
            comment: 'Account that owns this subscription',
          },
          {
            name: 'parentSubscriptionId',
            type: 'uuid',
            isNullable: true,
            comment: 'Parent subscription ID for bundled/master subscriptions',
          },
          {
            name: 'status',
            type: 'subscription_status_enum',
            default: `'pending'`,
            comment: 'Current subscription status',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            comment: 'Subscription name/description',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Detailed subscription description',
          },
          {
            name: 'billingCycle',
            type: 'billing_cycle_enum',
            default: `'monthly'`,
            comment: 'Billing frequency',
          },
          {
            name: 'customBillingDays',
            type: 'int',
            isNullable: true,
            comment: 'Custom billing cycle days (when billingCycle is CUSTOM)',
          },
          {
            name: 'billingDayOfMonth',
            type: 'int',
            default: 1,
            comment: 'Day of month for billing (1-28)',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: `'USD'`,
            comment: 'Currency code (ISO 4217)',
          },
          {
            name: 'baseAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: 'Base subscription amount before discounts/taxes',
          },
          {
            name: 'discountAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Discount amount applied',
          },
          {
            name: 'discountPercentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Discount percentage',
          },
          {
            name: 'taxAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Tax amount',
          },
          {
            name: 'taxPercentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Tax percentage',
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: 'Total amount to be charged (base - discount + tax)',
          },
          {
            name: 'startDate',
            type: 'timestamp with time zone',
            comment: 'Subscription start date',
          },
          {
            name: 'endDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Subscription end date (null for ongoing)',
          },
          {
            name: 'nextBillingDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Next billing date',
          },
          {
            name: 'lastBillingDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Last successful billing date',
          },
          {
            name: 'hasTrial',
            type: 'boolean',
            default: false,
            comment: 'Whether subscription has a trial period',
          },
          {
            name: 'trialDays',
            type: 'int',
            isNullable: true,
            comment: 'Trial period in days',
          },
          {
            name: 'trialEndDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Trial end date',
          },
          {
            name: 'pausedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when subscription was paused',
          },
          {
            name: 'resumedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when subscription was resumed',
          },
          {
            name: 'totalPausedDays',
            type: 'int',
            default: 0,
            comment: 'Total number of days paused',
          },
          {
            name: 'cancellationDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when cancellation was requested',
          },
          {
            name: 'cancellationEffectiveDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when cancellation becomes effective',
          },
          {
            name: 'cancellationReason',
            type: 'cancellation_reason_enum',
            isNullable: true,
            comment: 'Reason for cancellation',
          },
          {
            name: 'cancellationNotes',
            type: 'text',
            isNullable: true,
            comment: 'Additional cancellation notes',
          },
          {
            name: 'noticePeriodDays',
            type: 'int',
            default: 30,
            comment: 'Notice period in days for cancellation',
          },
          {
            name: 'payerToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Payment service provider token',
          },
          {
            name: 'paymentMethodId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Payment method identifier',
          },
          {
            name: 'paymentProvider',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Payment provider name (stripe, paypal, mock)',
          },
          {
            name: 'paymentMethodLast4',
            type: 'varchar',
            length: '4',
            isNullable: true,
            comment: 'Last 4 digits of payment method',
          },
          {
            name: 'paymentMethodType',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Payment method type (card, bank, etc)',
          },
          {
            name: 'autoRenew',
            type: 'boolean',
            default: true,
            comment: 'Whether subscription auto-renews',
          },
          {
            name: 'maxRetryAttempts',
            type: 'int',
            default: 3,
            comment: 'Maximum payment retry attempts',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional subscription metadata',
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
            comment: 'Custom subscription settings',
          },
          {
            name: 'usageLimits',
            type: 'jsonb',
            isNullable: true,
            comment: 'Usage limits and quotas',
          },
          {
            name: 'currentUsage',
            type: 'jsonb',
            isNullable: true,
            comment: 'Current usage statistics',
          },
        ],
      }),
      true,
    );

    // Create indexes for Subscriptions
    await queryRunner.createIndex('subscriptions', new TableIndex({
      name: 'IDX_subscription_accountId',
      columnNames: ['accountId'],
    }));
    await queryRunner.createIndex('subscriptions', new TableIndex({
      name: 'IDX_subscription_parentSubscriptionId',
      columnNames: ['parentSubscriptionId'],
    }));
    await queryRunner.createIndex('subscriptions', new TableIndex({
      name: 'IDX_subscription_status',
      columnNames: ['status'],
    }));
    await queryRunner.createIndex('subscriptions', new TableIndex({
      name: 'IDX_subscription_nextBillingDate',
      columnNames: ['nextBillingDate'],
    }));
    await queryRunner.createIndex('subscriptions', new TableIndex({
      name: 'IDX_subscription_cancellationEffectiveDate',
      columnNames: ['cancellationEffectiveDate'],
    }));
    await queryRunner.createIndex('subscriptions', new TableIndex({
      name: 'IDX_subscription_payerToken',
      columnNames: ['payerToken'],
    }));

    // Create SubscriptionProducts table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_products',
        columns: [
          // Base columns from BaseEntity
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          // SubscriptionProduct specific columns
          {
            name: 'subscriptionId',
            type: 'uuid',
            comment: 'Subscription ID',
          },
          {
            name: 'productId',
            type: 'uuid',
            comment: 'Product ID',
          },
          {
            name: 'productName',
            type: 'varchar',
            length: '255',
            comment: 'Product name at time of subscription',
          },
          {
            name: 'productSku',
            type: 'varchar',
            length: '100',
            comment: 'Product SKU at time of subscription',
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
            comment: 'Quantity of product in subscription',
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: 'Unit price per product',
          },
          {
            name: 'discountAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Discount amount per unit',
          },
          {
            name: 'discountPercentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Discount percentage',
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: 'Total price (quantity * (unitPrice - discount))',
          },
          {
            name: 'isRecurring',
            type: 'boolean',
            default: true,
            comment: 'Whether this product is recurring',
          },
          {
            name: 'isSetupFee',
            type: 'boolean',
            default: false,
            comment: 'Whether this is a one-time setup fee',
          },
          {
            name: 'billingFrequencyDays',
            type: 'int',
            isNullable: true,
            comment: 'Billing frequency override (in days)',
          },
          {
            name: 'addedDate',
            type: 'timestamp with time zone',
            comment: 'Date when product was added to subscription',
          },
          {
            name: 'removalDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when product will be removed from subscription',
          },
          {
            name: 'lastBilledDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Last billing date for this product',
          },
          {
            name: 'nextBillingDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Next billing date for this product',
          },
          {
            name: 'isUsageBased',
            type: 'boolean',
            default: false,
            comment: 'Whether this product uses usage-based billing',
          },
          {
            name: 'usageConfig',
            type: 'jsonb',
            isNullable: true,
            comment: 'Usage tracking configuration',
          },
          {
            name: 'currentUsage',
            type: 'jsonb',
            isNullable: true,
            comment: 'Current usage data',
          },
          {
            name: 'usageLimit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Usage limit for this product',
          },
          {
            name: 'hasTrial',
            type: 'boolean',
            default: false,
            comment: 'Whether this product has a trial period',
          },
          {
            name: 'trialDays',
            type: 'int',
            isNullable: true,
            comment: 'Trial period in days',
          },
          {
            name: 'trialEndDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Trial end date for this product',
          },
          {
            name: 'configuration',
            type: 'jsonb',
            isNullable: true,
            comment: 'Product-specific configuration',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Product metadata at time of subscription',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Notes about this product in the subscription',
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
            comment: 'Sort order for display',
          },
        ],
      }),
      true,
    );

    // Create indexes for SubscriptionProducts
    await queryRunner.createIndex('subscription_products', new TableIndex({
      name: 'IDX_subscription_product_subscriptionId',
      columnNames: ['subscriptionId'],
    }));
    await queryRunner.createIndex('subscription_products', new TableIndex({
      name: 'IDX_subscription_product_productId',
      columnNames: ['productId'],
    }));
    await queryRunner.createIndex('subscription_products', new TableIndex({
      name: 'IDX_subscription_product_isActive',
      columnNames: ['isActive'],
    }));
    await queryRunner.createIndex('subscription_products', new TableIndex({
      name: 'UQ_subscription_product',
      columnNames: ['subscriptionId', 'productId'],
      isUnique: true,
    }));

    // Create SubscriptionInvoices table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_invoices',
        columns: [
          // Base columns
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          // Invoice specific columns
          {
            name: 'subscriptionId',
            type: 'uuid',
            comment: 'Subscription this invoice belongs to',
          },
          {
            name: 'invoiceNumber',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Unique invoice number',
          },
          {
            name: 'externalInvoiceId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'External invoice reference from payment provider',
          },
          {
            name: 'status',
            type: 'invoice_status_enum',
            default: `'draft'`,
            comment: 'Current invoice status',
          },
          {
            name: 'dunningStatus',
            type: 'dunning_status_enum',
            default: `'not_required'`,
            comment: 'Dunning process status',
          },
          {
            name: 'periodStartDate',
            type: 'timestamp with time zone',
            comment: 'Start of billing period',
          },
          {
            name: 'periodEndDate',
            type: 'timestamp with time zone',
            comment: 'End of billing period',
          },
          {
            name: 'subtotalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: 'Subtotal amount before discounts and taxes',
          },
          {
            name: 'discountAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Total discount amount',
          },
          {
            name: 'taxAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Tax amount',
          },
          {
            name: 'taxRate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Tax rate percentage',
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: 'Total amount due',
          },
          {
            name: 'paidAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Amount already paid',
          },
          {
            name: 'balanceAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: 'Remaining balance',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: `'USD'`,
            comment: 'Currency code (ISO 4217)',
          },
          {
            name: 'invoiceDate',
            type: 'timestamp with time zone',
            comment: 'Invoice generation date',
          },
          {
            name: 'dueDate',
            type: 'timestamp with time zone',
            comment: 'Payment due date',
          },
          {
            name: 'paidDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when invoice was paid',
          },
          {
            name: 'cancelledDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when invoice was cancelled',
          },
          {
            name: 'refundedDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when refund was issued',
          },
          {
            name: 'paymentAttempts',
            type: 'int',
            default: 0,
            comment: 'Number of payment attempts',
          },
          {
            name: 'lastPaymentAttemptDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Last payment attempt date',
          },
          {
            name: 'nextRetryDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Next scheduled payment retry date',
          },
          {
            name: 'paymentTransactionId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Payment transaction ID',
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Payment method used',
          },
          {
            name: 'lastPaymentError',
            type: 'text',
            isNullable: true,
            comment: 'Last payment error message',
          },
          {
            name: 'lastPaymentErrorCode',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Payment error code',
          },
          {
            name: 'lineItems',
            type: 'jsonb',
            comment: 'Detailed line items for the invoice',
          },
          {
            name: 'hasProration',
            type: 'boolean',
            default: false,
            comment: 'Whether this invoice includes proration',
          },
          {
            name: 'prorationDetails',
            type: 'jsonb',
            isNullable: true,
            comment: 'Proration details',
          },
          {
            name: 'customerDetails',
            type: 'jsonb',
            comment: 'Customer details at time of invoice',
          },
          {
            name: 'billingAddress',
            type: 'jsonb',
            isNullable: true,
            comment: 'Billing address for the invoice',
          },
          {
            name: 'internalNotes',
            type: 'text',
            isNullable: true,
            comment: 'Internal notes about the invoice',
          },
          {
            name: 'customerNotes',
            type: 'text',
            isNullable: true,
            comment: 'Customer-facing notes on the invoice',
          },
          {
            name: 'termsAndConditions',
            type: 'text',
            isNullable: true,
            comment: 'Terms and conditions',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional invoice metadata',
          },
          {
            name: 'dunningLevel',
            type: 'int',
            default: 0,
            comment: 'Current dunning level (0-4)',
          },
          {
            name: 'dunningStartedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When dunning process started',
          },
          {
            name: 'suspensionDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When to suspend if payment not received',
          },
          {
            name: 'isManuallyPaid',
            type: 'boolean',
            default: false,
            comment: 'Whether invoice was manually marked as paid',
          },
          {
            name: 'isDisputed',
            type: 'boolean',
            default: false,
            comment: 'Whether invoice is disputed',
          },
          {
            name: 'isSent',
            type: 'boolean',
            default: false,
            comment: 'Whether invoice has been sent to customer',
          },
          {
            name: 'sentDate',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Date when invoice was sent',
          },
        ],
      }),
      true,
    );

    // Create indexes for SubscriptionInvoices
    await queryRunner.createIndex('subscription_invoices', new TableIndex({
      name: 'IDX_subscription_invoice_subscriptionId',
      columnNames: ['subscriptionId'],
    }));
    await queryRunner.createIndex('subscription_invoices', new TableIndex({
      name: 'IDX_subscription_invoice_invoiceNumber',
      columnNames: ['invoiceNumber'],
      isUnique: true,
    }));
    await queryRunner.createIndex('subscription_invoices', new TableIndex({
      name: 'IDX_subscription_invoice_status',
      columnNames: ['status'],
    }));
    await queryRunner.createIndex('subscription_invoices', new TableIndex({
      name: 'IDX_subscription_invoice_dueDate',
      columnNames: ['dueDate'],
    }));
    await queryRunner.createIndex('subscription_invoices', new TableIndex({
      name: 'IDX_subscription_invoice_paidDate',
      columnNames: ['paidDate'],
    }));

    // Create SubscriptionEvents table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_events',
        columns: [
          // Base columns
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          // Event specific columns
          {
            name: 'subscriptionId',
            type: 'uuid',
            comment: 'Subscription this event belongs to',
          },
          {
            name: 'eventType',
            type: 'subscription_event_type_enum',
            comment: 'Type of event',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            comment: 'Human-readable event description',
          },
          {
            name: 'details',
            type: 'text',
            isNullable: true,
            comment: 'Detailed event message',
          },
          {
            name: 'previousStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Previous subscription status',
          },
          {
            name: 'newStatus',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'New subscription status',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Amount associated with this event',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            isNullable: true,
            comment: 'Currency for the amount',
          },
          {
            name: 'invoiceNumber',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Invoice number if event is billing-related',
          },
          {
            name: 'transactionId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Payment transaction ID if applicable',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
            comment: 'User who triggered this event',
          },
          {
            name: 'userName',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Name of user who triggered event',
          },
          {
            name: 'eventSource',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Source of the event (admin, system, customer, webhook)',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'IP address of the request',
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
            comment: 'User agent string if from web request',
          },
          {
            name: 'relatedProductId',
            type: 'uuid',
            isNullable: true,
            comment: 'Related product ID if applicable',
          },
          {
            name: 'relatedProductName',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Related product name',
          },
          {
            name: 'relatedSubscriptionId',
            type: 'uuid',
            isNullable: true,
            comment: 'Parent subscription ID for hierarchy events',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional event metadata',
          },
          {
            name: 'previousState',
            type: 'jsonb',
            isNullable: true,
            comment: 'Snapshot of subscription state before event',
          },
          {
            name: 'newState',
            type: 'jsonb',
            isNullable: true,
            comment: 'Snapshot of subscription state after event',
          },
          {
            name: 'changes',
            type: 'jsonb',
            isNullable: true,
            comment: 'Changed fields and their values',
          },
          {
            name: 'isError',
            type: 'boolean',
            default: false,
            comment: 'Whether this event represents an error',
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
            comment: 'Error message if applicable',
          },
          {
            name: 'errorCode',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Error code if applicable',
          },
          {
            name: 'stackTrace',
            type: 'text',
            isNullable: true,
            comment: 'Stack trace for debugging',
          },
          {
            name: 'customerNotified',
            type: 'boolean',
            default: false,
            comment: 'Whether customer was notified of this event',
          },
          {
            name: 'notificationSentAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When customer was notified',
          },
          {
            name: 'notificationMethod',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Notification method (email, sms, in-app)',
          },
          {
            name: 'webhookSent',
            type: 'boolean',
            default: false,
            comment: 'Whether this event triggered a webhook',
          },
          {
            name: 'webhookSentAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When webhook was sent',
          },
          {
            name: 'webhookResponseCode',
            type: 'int',
            isNullable: true,
            comment: 'HTTP status code of webhook response',
          },
          {
            name: 'webhookResponse',
            type: 'text',
            isNullable: true,
            comment: 'Webhook response body',
          },
          {
            name: 'isProcessed',
            type: 'boolean',
            default: true,
            comment: 'Whether this event has been processed',
          },
          {
            name: 'processedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When event was processed',
          },
          {
            name: 'requiresReview',
            type: 'boolean',
            default: false,
            comment: 'Whether this event requires manual review',
          },
          {
            name: 'reviewedAt',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When event was reviewed',
          },
          {
            name: 'reviewedBy',
            type: 'uuid',
            isNullable: true,
            comment: 'User who reviewed the event',
          },
          {
            name: 'reviewNotes',
            type: 'text',
            isNullable: true,
            comment: 'Review notes',
          },
        ],
      }),
      true,
    );

    // Create indexes for SubscriptionEvents
    await queryRunner.createIndex('subscription_events', new TableIndex({
      name: 'IDX_subscription_event_subscriptionId',
      columnNames: ['subscriptionId'],
    }));
    await queryRunner.createIndex('subscription_events', new TableIndex({
      name: 'IDX_subscription_event_eventType',
      columnNames: ['eventType'],
    }));
    await queryRunner.createIndex('subscription_events', new TableIndex({
      name: 'IDX_subscription_event_createdAt',
      columnNames: ['createdAt'],
    }));
    await queryRunner.createIndex('subscription_events', new TableIndex({
      name: 'IDX_subscription_event_userId',
      columnNames: ['userId'],
    }));

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "subscriptions" 
      ADD CONSTRAINT "FK_subscription_account" 
      FOREIGN KEY ("accountId") 
      REFERENCES "accounts"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "subscriptions" 
      ADD CONSTRAINT "FK_subscription_parent" 
      FOREIGN KEY ("parentSubscriptionId") 
      REFERENCES "subscriptions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "subscription_products" 
      ADD CONSTRAINT "FK_subscription_product_subscription" 
      FOREIGN KEY ("subscriptionId") 
      REFERENCES "subscriptions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "subscription_products" 
      ADD CONSTRAINT "FK_subscription_product_product" 
      FOREIGN KEY ("productId") 
      REFERENCES "products"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "subscription_invoices" 
      ADD CONSTRAINT "FK_subscription_invoice_subscription" 
      FOREIGN KEY ("subscriptionId") 
      REFERENCES "subscriptions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "subscription_events" 
      ADD CONSTRAINT "FK_subscription_event_subscription" 
      FOREIGN KEY ("subscriptionId") 
      REFERENCES "subscriptions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "subscription_events" DROP CONSTRAINT "FK_subscription_event_subscription"`);
    await queryRunner.query(`ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_subscription_invoice_subscription"`);
    await queryRunner.query(`ALTER TABLE "subscription_products" DROP CONSTRAINT "FK_subscription_product_product"`);
    await queryRunner.query(`ALTER TABLE "subscription_products" DROP CONSTRAINT "FK_subscription_product_subscription"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscription_parent"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscription_account"`);

    // Drop tables
    await queryRunner.dropTable('subscription_events');
    await queryRunner.dropTable('subscription_invoices');
    await queryRunner.dropTable('subscription_products');
    await queryRunner.dropTable('subscriptions');

    // Drop ENUMs
    await queryRunner.query(`DROP TYPE "subscription_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "dunning_status_enum"`);
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE "cancellation_reason_enum"`);
    await queryRunner.query(`DROP TYPE "billing_cycle_enum"`);
    await queryRunner.query(`DROP TYPE "subscription_status_enum"`);
  }
}
