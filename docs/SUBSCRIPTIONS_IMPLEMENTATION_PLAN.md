# Subscriptions Implementation Plan

## Overview
Comprehensive subscription engine for the PIM platform, enabling recurring revenue models, tiered plans, and automated billing cycles. This system will support both product subscriptions and service subscriptions, with flexibility for various billing models.

## Core Components

### 1. Subscription Plans
**Purpose:** Define the blueprint for subscription offerings
```typescript
{
  id: uuid,
  name: string,
  description: string,
  type: 'product' | 'service' | 'hybrid',
  billingModel: 'flat_rate' | 'tiered' | 'usage_based' | 'hybrid',
  pricing: {
    currency: string,
    basePrice: number,
    setupFee?: number,
    tiers?: [
      {
        upTo: number,
        unitPrice: number,
        flatPrice?: number
      }
    ]
  },
  billingCycle: {
    interval: 'day' | 'week' | 'month' | 'quarter' | 'year',
    intervalCount: number, // e.g., 2 for bi-monthly
    anchorDate?: Date // for aligned billing
  },
  features: {
    [key: string]: boolean | number | string
  },
  limits: {
    maxUsers?: number,
    maxProducts?: number,
    maxOrders?: number,
    customLimits?: {}
  },
  trialPeriod?: {
    duration: number,
    unit: 'day' | 'week' | 'month',
    requirePaymentMethod: boolean
  },
  gracePeriod?: number, // days before suspension
  status: 'active' | 'inactive' | 'deprecated',
  metadata: {}
}
```

### 2. Subscriptions
**Purpose:** Individual subscription instances for customers
```typescript
{
  id: uuid,
  accountId: string, // existing account
  planId: string,
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | 'expired',
  lifecycle: {
    startDate: Date,
    endDate?: Date,
    trialEndDate?: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    pausedAt?: Date,
    canceledAt?: Date,
    cancelationReason?: string,
    cancelationEffectiveDate?: Date
  },
  billing: {
    nextBillingDate: Date,
    lastBillingDate?: Date,
    paymentMethod?: string,
    billingAddress?: {},
    taxRate?: number,
    discount?: {
      type: 'percentage' | 'fixed',
      value: number,
      endDate?: Date
    }
  },
  usage: {
    currentPeriod: {},
    lifetime: {},
    limits: {} // overrides from plan
  },
  customFields: {},
  notes: [],
  metadata: {}
}
```

### 3. Billing Cycles & Invoices
```typescript
// Billing Cycle
{
  id: uuid,
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
  status: 'upcoming' | 'current' | 'processed' | 'failed',
  attempts: number,
  lastAttemptAt?: Date,
  invoiceId?: string
}

// Invoice
{
  id: uuid,
  subscriptionId: string,
  billingCycleId: string,
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'void',
  lineItems: [
    {
      description: string,
      quantity: number,
      unitPrice: number,
      amount: number,
      taxable: boolean
    }
  ],
  subtotal: number,
  tax: number,
  total: number,
  dueDate: Date,
  paidAt?: Date,
  paymentMethod?: string,
  transactionId?: string,
  metadata: {}
}
```

### 4. Payment Integration
```typescript
// Payment Method
{
  id: uuid,
  accountId: string,
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet',
  isDefault: boolean,
  details: {}, // encrypted
  expiryDate?: Date,
  status: 'active' | 'expired' | 'invalid'
}

// Payment Transaction
{
  id: uuid,
  subscriptionId: string,
  invoiceId: string,
  amount: number,
  currency: string,
  status: 'pending' | 'succeeded' | 'failed' | 'refunded',
  gatewayResponse: {},
  processedAt: Date,
  refunds: []
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
#### Backend Tasks
- [ ] Create Subscription module structure
- [ ] Define Plan entity and migrations
- [ ] Define Subscription entity and migrations
- [ ] Create Plan CRUD endpoints:
  - `POST /api/subscription-plans`
  - `GET /api/subscription-plans`
  - `GET /api/subscription-plans/:id`
  - `PUT /api/subscription-plans/:id`
  - `DELETE /api/subscription-plans/:id`
- [ ] Create Subscription management endpoints:
  - `POST /api/subscriptions` - Create subscription
  - `GET /api/subscriptions/:id` - Get subscription
  - `GET /api/accounts/:id/subscriptions` - List account subscriptions
  - `PATCH /api/subscriptions/:id` - Update subscription

#### Frontend Tasks
- [ ] Create subscription plans listing page
- [ ] Build plan creation/edit forms
- [ ] Design subscription dashboard
- [ ] Implement plan comparison view

### Phase 2: Billing Cycles (Week 2)
#### Backend Tasks
- [ ] Create BillingCycle entity
- [ ] Implement cycle calculation logic
- [ ] Build prorated billing calculator
- [ ] Create cycle management service:
  - Generate upcoming cycles
  - Process current cycles
  - Handle cycle transitions
- [ ] Add cycle-related endpoints:
  - `GET /api/subscriptions/:id/billing-cycles`
  - `POST /api/subscriptions/:id/preview-changes`
  - `GET /api/subscriptions/:id/upcoming-invoice`

#### Frontend Tasks
- [ ] Create billing history view
- [ ] Build upcoming charges preview
- [ ] Add cycle visualization
- [ ] Implement proration calculator UI

### Phase 3: Lifecycle Management (Week 3)
#### Backend Tasks
- [ ] Implement subscription state machine
- [ ] Create lifecycle transition endpoints:
  - `POST /api/subscriptions/:id/activate`
  - `POST /api/subscriptions/:id/pause`
  - `POST /api/subscriptions/:id/resume`
  - `POST /api/subscriptions/:id/cancel`
  - `POST /api/subscriptions/:id/reactivate`
- [ ] Build trial period management
- [ ] Add grace period handling
- [ ] Create subscription upgrade/downgrade logic
- [ ] Implement immediate vs end-of-cycle changes

#### Frontend Tasks
- [ ] Create subscription management interface
- [ ] Build pause/resume workflows
- [ ] Add cancellation flow with retention
- [ ] Implement plan change preview
- [ ] Create trial expiration warnings

### Phase 4: Invoicing & Payments (Week 4)
#### Backend Tasks
- [ ] Create Invoice entity and service
- [ ] Build invoice generation logic
- [ ] Implement payment method management:
  - `POST /api/payment-methods`
  - `GET /api/accounts/:id/payment-methods`
  - `DELETE /api/payment-methods/:id`
  - `PUT /api/payment-methods/:id/set-default`
- [ ] Create payment processing service (mock initially)
- [ ] Add retry logic for failed payments
- [ ] Build dunning management (payment failure handling)
- [ ] Create invoice endpoints:
  - `GET /api/invoices/:id`
  - `GET /api/invoices/:id/pdf`
  - `POST /api/invoices/:id/pay`
  - `POST /api/invoices/:id/void`

#### Frontend Tasks
- [ ] Create payment method management UI
- [ ] Build invoice viewing interface
- [ ] Add payment failure notifications
- [ ] Implement retry payment flow
- [ ] Create downloadable invoice PDFs

### Phase 5: Advanced Features (Week 5)
#### Backend Tasks
- [ ] Implement usage-based billing
- [ ] Create metered billing tracking
- [ ] Build feature flag system
- [ ] Add subscription addons/extras
- [ ] Create coupon/discount system:
  - `POST /api/coupons`
  - `POST /api/subscriptions/:id/apply-coupon`
- [ ] Implement subscription webhooks
- [ ] Add subscription analytics endpoints

#### Frontend Tasks
- [ ] Create usage tracking dashboard
- [ ] Build addon management interface
- [ ] Add coupon application flow
- [ ] Implement analytics dashboards
- [ ] Create webhook configuration UI

### Phase 6: Integration & Polish (Week 6)
#### Backend Tasks
- [ ] Integrate with payment gateway (Stripe/PayPal)
- [ ] Add email notifications for all events
- [ ] Create subscription reporting tools
- [ ] Build admin tools for subscription management
- [ ] Implement audit logging
- [ ] Add subscription import/export

#### Frontend Tasks
- [ ] Create customer portal
- [ ] Build admin subscription manager
- [ ] Add bulk operations UI
- [ ] Implement subscription search
- [ ] Create onboarding flow

## API Endpoints Summary

### Plan Management
- `GET /api/subscription-plans` - List all plans
- `GET /api/subscription-plans/active` - Active plans only
- `GET /api/subscription-plans/:id` - Get specific plan
- `POST /api/subscription-plans` - Create plan
- `PUT /api/subscription-plans/:id` - Update plan
- `DELETE /api/subscription-plans/:id` - Delete/deprecate plan
- `GET /api/subscription-plans/compare` - Compare multiple plans

### Subscription Management
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/:id` - Get subscription details
- `PATCH /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription
- `GET /api/accounts/:id/subscriptions` - List account subscriptions
- `POST /api/subscriptions/:id/change-plan` - Change subscription plan
- `GET /api/subscriptions/:id/change-preview` - Preview plan change

### Lifecycle Operations
- `POST /api/subscriptions/:id/activate` - Activate subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/reactivate` - Reactivate canceled

### Billing & Invoicing
- `GET /api/subscriptions/:id/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices/:id/pay` - Manual payment
- `POST /api/invoices/:id/refund` - Refund invoice
- `GET /api/subscriptions/:id/upcoming-invoice` - Preview next invoice

### Payment Methods
- `GET /api/accounts/:id/payment-methods` - List payment methods
- `POST /api/payment-methods` - Add payment method
- `PUT /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Remove payment method
- `PUT /api/payment-methods/:id/set-default` - Set as default

### Usage & Metering
- `POST /api/subscriptions/:id/usage` - Record usage
- `GET /api/subscriptions/:id/usage` - Get usage data
- `GET /api/subscriptions/:id/usage/current` - Current period usage
- `POST /api/subscriptions/:id/usage/reset` - Reset usage counters

### Admin Operations
- `GET /api/admin/subscriptions` - List all subscriptions
- `GET /api/admin/subscriptions/metrics` - Platform metrics
- `POST /api/admin/subscriptions/:id/adjust` - Manual adjustment
- `POST /api/admin/billing/process` - Trigger billing run
- `GET /api/admin/revenue/report` - Revenue reporting

## Database Schema

### Core Tables
```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  billing_model VARCHAR(50),
  pricing JSONB,
  billing_cycle JSONB,
  features JSONB,
  limits JSONB,
  trial_period JSONB,
  grace_period INTEGER,
  status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  paused_at TIMESTAMP,
  canceled_at TIMESTAMP,
  cancellation_reason TEXT,
  next_billing_date TIMESTAMP,
  last_billing_date TIMESTAMP,
  payment_method_id UUID,
  tax_rate DECIMAL(5,2),
  discount JSONB,
  usage_data JSONB,
  custom_fields JSONB,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Billing Cycles
CREATE TABLE billing_cycles (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  status VARCHAR(20),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  invoice_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  billing_cycle_id UUID REFERENCES billing_cycles(id),
  invoice_number VARCHAR(50) UNIQUE,
  status VARCHAR(20),
  line_items JSONB,
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2),
  due_date DATE,
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Payment Transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status VARCHAR(20),
  gateway_response JSONB,
  processed_at TIMESTAMP,
  refunds JSONB,
  created_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

## Configuration

### Environment Variables
```env
# Subscription Configuration
SUBSCRIPTION_TRIAL_DAYS_DEFAULT=14
SUBSCRIPTION_GRACE_PERIOD_DAYS=7
SUBSCRIPTION_AUTO_CHARGE=true
SUBSCRIPTION_RETRY_ATTEMPTS=3
SUBSCRIPTION_RETRY_INTERVAL_HOURS=24

# Payment Gateway
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYMENT_SUCCESS_URL=https://app.example.com/subscription/success
PAYMENT_CANCEL_URL=https://app.example.com/subscription/cancel

# Invoice Settings
INVOICE_PREFIX=INV
INVOICE_DUE_DAYS=7
INVOICE_LATE_FEE_PERCENTAGE=5
INVOICE_AUTO_GENERATE=true
```

## Integration Points

### With Existing Systems
1. **Account System**
   - Link subscriptions to accounts
   - Check subscription status for feature access
   - Apply account-level discounts

2. **Product System**
   - Product-based subscriptions
   - Access control based on subscription tier
   - Usage tracking for product operations

3. **Marketplace System**
   - Seller subscription plans
   - Commission adjustments based on tier
   - Feature limitations by plan

4. **Notification System**
   - Billing reminders
   - Payment failures
   - Plan changes
   - Trial expiration

### External Integrations
1. **Payment Gateways**
   - Stripe
   - PayPal
   - Square
   - Custom processors

2. **Accounting Systems**
   - QuickBooks
   - Xero
   - NetSuite
   - Custom ERP

3. **Analytics**
   - MRR/ARR tracking
   - Churn analysis
   - Customer lifetime value
   - Cohort analysis

## Success Metrics

### Technical Metrics
- Payment processing success rate > 95%
- Billing job completion < 2 hours
- Invoice generation time < 1 second
- System uptime > 99.9%

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Churn rate < 5%
- Trial to paid conversion > 20%

## Security Considerations

1. **PCI Compliance**
   - No credit card storage
   - Use tokenization
   - Secure payment method references

2. **Data Protection**
   - Encrypt sensitive billing data
   - Audit trail for all changes
   - Role-based access control

3. **Fraud Prevention**
   - Velocity checks
   - Address verification
   - 3D Secure authentication
   - Suspicious activity monitoring

## Testing Strategy

1. **Unit Tests**
   - Billing calculations
   - Proration logic
   - State transitions

2. **Integration Tests**
   - Payment gateway interactions
   - Email notifications
   - Webhook handling

3. **End-to-End Tests**
   - Complete subscription lifecycle
   - Plan changes
   - Payment failures and retries

4. **Load Testing**
   - Bulk billing runs
   - Concurrent subscriptions
   - High-volume usage tracking

## Rollout Strategy

### Phase 1: Internal Testing (Week 7)
- Deploy to staging
- Internal team subscriptions
- Test all workflows

### Phase 2: Beta Launch (Week 8)
- Select beta customers
- Limited plan offerings
- Close monitoring

### Phase 3: General Availability (Week 9)
- Full launch
- All features enabled
- Marketing campaign

## Future Enhancements

1. **Advanced Billing**
   - Multi-currency support
   - Tax calculation service
   - Complex pricing models
   - Revenue recognition

2. **Subscription Analytics**
   - Predictive churn
   - Upsell opportunities
   - Usage patterns
   - Cohort analysis

3. **Customer Portal**
   - Self-service plan changes
   - Billing history
   - Usage dashboard
   - Payment method management

4. **Marketplace**
   - Reseller subscriptions
   - Bundle offerings
   - Referral programs
   - Affiliate tracking

## Conclusion

The subscription engine provides a comprehensive solution for recurring billing and subscription management. By integrating with existing systems and following a phased implementation approach, we can deliver a robust, scalable subscription platform that supports various business models and pricing strategies.

**Estimated Timeline**: 6 weeks for core features, 3 additional weeks for advanced features
**Team Required**: 2 backend, 1 frontend, 1 QA
**Priority**: High - Revenue-critical feature

---
*Document Version: 1.0*
*Created: January 2025*
*Status: Planning - Ready for Implementation*