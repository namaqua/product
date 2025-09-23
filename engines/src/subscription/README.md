# Subscription Module

## Overview
The Subscription Module manages the complete lifecycle of subscriptions in the PIM system, including billing, payment processing, and hierarchical subscription relationships.

## Directory Structure
```
/subscription/
├── subscription.module.ts      # Module configuration
├── controllers/                 # REST API endpoints
│   └── subscription.controller.ts
├── services/                    # Business logic
│   ├── subscription.service.ts
│   ├── billing.service.ts
│   ├── proration.service.ts
│   └── dunning.service.ts
├── entities/                    # TypeORM entities
│   ├── subscription.entity.ts
│   ├── subscription-product.entity.ts
│   ├── subscription-invoice.entity.ts
│   └── subscription-event.entity.ts
├── dto/                         # Data Transfer Objects
│   ├── create-subscription.dto.ts
│   ├── update-subscription.dto.ts
│   └── subscription-response.dto.ts
├── interfaces/                  # TypeScript interfaces
│   └── payment-provider.interface.ts
└── enums/                       # Enumerated types
    └── index.ts
```

## Features

### Core Functionality
- **Hierarchical Subscriptions**: Parent-child relationships for master subscriptions
- **Lifecycle Management**: Start, pause, resume, cancel with notice periods
- **Billing Cycles**: Monthly, quarterly, annual, and custom cycles
- **Proration**: Automatic calculation for mid-cycle changes
- **Payment Processing**: Integration with payment service providers (mocked initially)

### Advanced Features
- **Dunning Process**: Automated retry logic for failed payments
- **Event Tracking**: Complete audit trail of subscription changes
- **Analytics**: MRR, churn, and growth metrics
- **Multi-product Support**: Link multiple products to a subscription

## Status Types

### Subscription Status
- `pending` - Created but not yet active
- `active` - Currently running subscription
- `paused` - Temporarily suspended by customer
- `cancelled` - Cancellation requested (may still be active until end date)
- `expired` - Subscription has ended

### Invoice Status
- `draft` - Invoice being prepared
- `pending` - Awaiting payment
- `paid` - Successfully paid
- `failed` - Payment failed
- `cancelled` - Invoice cancelled
- `refunded` - Payment refunded

## API Endpoints

### Basic CRUD
- `POST /subscriptions` - Create new subscription
- `GET /subscriptions` - List subscriptions (paginated)
- `GET /subscriptions/:id` - Get subscription details
- `PATCH /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Soft delete

### Lifecycle Management
- `POST /subscriptions/:id/start` - Activate subscription
- `POST /subscriptions/:id/pause` - Pause subscription
- `POST /subscriptions/:id/resume` - Resume paused subscription
- `POST /subscriptions/:id/cancel` - Cancel with notice period

### Billing & Invoices
- `GET /subscriptions/:id/invoices` - List subscription invoices
- `POST /subscriptions/:id/invoice` - Generate invoice
- `GET /invoices/:id` - Get invoice details

## Database Schema

### Main Tables
- `subscriptions` - Core subscription data
- `subscription_products` - Products linked to subscriptions
- `subscription_invoices` - Generated invoices
- `subscription_events` - Event audit log

## Configuration

Environment variables required:
```env
# Billing Configuration
BILLING_CYCLE_DAY=1
DUNNING_RETRY_DAYS=0,3,7,14
GRACE_PERIOD_DAYS=7
DEFAULT_NOTICE_PERIOD_DAYS=30

# Payment Provider (Mock)
PAYMENT_PROVIDER=mock
PAYMENT_WEBHOOK_SECRET=secret
```

## Testing

Run tests:
```bash
# Unit tests
npm run test:unit subscription

# E2E tests
npm run test:e2e subscription

# Coverage
npm run test:cov subscription
```

## Development Status

See [SUBSCRIPTION_ENGINE_DEVELOPMENT_PLAN.md](../../../docs/SUBSCRIPTION_ENGINE_DEVELOPMENT_PLAN.md) for the complete development roadmap.

Current Status: **Module Setup Complete** ✅
