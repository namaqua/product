# Marketplace Implementation Plan

## Overview
Transform the existing PIM into a robust marketplace platform supporting third-party (3P) sellers, similar to Mirakl and Izeberg, leveraging existing Account and Product APIs.

## Core Components

### 1. Seller Account Enhancement
**Extends:** Existing Account API
**New Attributes:**
```typescript
{
  accountType: 'customer' | 'seller' | 'both',
  sellerProfile: {
    businessName: string,
    businessRegistrationNumber: string,
    taxId: string,
    approvalStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended',
    approvalLevel: number, // 0-5 for workflow stages
    approvalHistory: [],
    commissionRate: number, // percentage
    paymentTerms: 'daily' | 'weekly' | 'monthly',
    bankingDetails: {}, // encrypted
    onboardingCompletedAt: Date,
    documentsSubmitted: []
  }
}
```

### 2. Product Offerings Model
**Concept:** Multiple sellers can offer the same product with different conditions
```typescript
{
  id: uuid,
  productId: string, // existing product
  sellerId: string, // account ID of seller
  offeringDetails: {
    price: number,
    quantity: number,
    condition: 'new' | 'refurbished' | 'used',
    fulfillmentMethod: 'seller' | 'marketplace' | 'dropship',
    shippingLeadTime: number, // days
    returnPolicy: string,
    warranty: string
  },
  status: 'active' | 'inactive' | 'out_of_stock',
  performanceMetrics: {
    salesCount: number,
    returnRate: number,
    rating: number
  }
}
```

### 3. Financial Components
```typescript
// Transaction Model
{
  orderId: string,
  sellerId: string,
  grossAmount: number,
  commissionAmount: number,
  netSellerAmount: number,
  status: 'pending' | 'processed' | 'disbursed',
  disbursementId: string
}

// Disbursement Model
{
  sellerId: string,
  period: Date,
  transactions: [],
  totalAmount: number,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  bankingReference: string
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
#### Backend Tasks
- [ ] Extend Account entity with seller attributes
- [ ] Create migration for seller profile fields
- [ ] Add AccountType enum and SellerApprovalStatus enum
- [ ] Create SellerProfile embedded entity
- [ ] Update Account DTOs for seller registration
- [ ] Add validation rules for seller-specific fields
- [ ] Create seller registration endpoint: `POST /api/accounts/seller/register`
- [ ] Add seller profile endpoints:
  - `GET /api/accounts/:id/seller-profile`
  - `PUT /api/accounts/:id/seller-profile`
  - `PATCH /api/accounts/:id/approval-status`

#### Frontend Tasks
- [ ] Create seller registration flow UI
- [ ] Add seller dashboard route and components
- [ ] Create seller profile management screens
- [ ] Add document upload interface
- [ ] Implement approval status display

### Phase 2: Product Offerings (Week 2-3)
#### Backend Tasks
- [ ] Create Offering entity and repository
- [ ] Link offerings to products and sellers
- [ ] Create offering CRUD endpoints:
  - `POST /api/offerings`
  - `GET /api/offerings/product/:productId`
  - `GET /api/offerings/seller/:sellerId`
  - `PUT /api/offerings/:id`
  - `DELETE /api/offerings/:id`
- [ ] Add offering validation (seller must be approved)
- [ ] Implement offering search and filtering
- [ ] Add price comparison logic
- [ ] Create "Buy Box" algorithm (best offering selection)

#### Frontend Tasks
- [ ] Create seller product listing interface
- [ ] Build offering creation/edit forms
- [ ] Add bulk upload interface for offerings
- [ ] Display multiple offerings per product
- [ ] Implement offering comparison view
- [ ] Add "winning offer" indicator

### Phase 3: Approval Workflow (Week 3-4)
#### Backend Tasks
- [ ] Create ApprovalWorkflow entity
- [ ] Define approval stages and rules
- [ ] Build approval queue endpoints:
  - `GET /api/admin/approval-queue`
  - `POST /api/admin/approve/:accountId`
  - `POST /api/admin/reject/:accountId`
- [ ] Add approval history tracking
- [ ] Implement notification system for status changes
- [ ] Create document verification endpoints

#### Frontend Admin Tasks
- [ ] Build approval dashboard for admin
- [ ] Create approval queue interface
- [ ] Add document review screens
- [ ] Implement bulk approval actions
- [ ] Add rejection reason forms
- [ ] Create approval history view

### Phase 4: Financial Management (Week 4-5)
#### Backend Tasks
- [ ] Create Transaction entity
- [ ] Create Disbursement entity
- [ ] Build commission calculation service
- [ ] Implement transaction recording on orders
- [ ] Create disbursement generation job:
  - Daily/Weekly/Monthly processing
  - Commission calculation
  - Net amount computation
- [ ] Add financial reporting endpoints:
  - `GET /api/sellers/:id/transactions`
  - `GET /api/sellers/:id/disbursements`
  - `GET /api/admin/marketplace-revenue`
- [ ] Create reconciliation tools

#### Frontend Tasks
- [ ] Build seller earnings dashboard
- [ ] Create transaction history view
- [ ] Add disbursement schedule display
- [ ] Implement commission calculator
- [ ] Create admin revenue dashboard
- [ ] Add financial reporting tools

### Phase 5: Marketplace Features (Week 5-6)
#### Backend Tasks
- [ ] Implement seller performance metrics
- [ ] Create seller rating system
- [ ] Build inventory sync mechanism
- [ ] Add order routing logic
- [ ] Create seller API keys for external integration
- [ ] Implement rate limiting per seller
- [ ] Add webhook system for seller notifications

#### Frontend Tasks
- [ ] Create public seller profiles
- [ ] Build seller comparison tools
- [ ] Add seller performance badges
- [ ] Implement seller search/filter
- [ ] Create seller onboarding wizard
- [ ] Add seller help center

## Database Schema Updates

### New Tables
```sql
-- Product Offerings
CREATE TABLE offerings (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  seller_id UUID REFERENCES accounts(id),
  price DECIMAL(10,2),
  quantity INTEGER,
  condition VARCHAR(20),
  fulfillment_method VARCHAR(20),
  shipping_lead_time INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Transactions
CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY,
  order_id UUID,
  seller_id UUID REFERENCES accounts(id),
  gross_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  net_seller_amount DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMP
);

-- Disbursements
CREATE TABLE disbursements (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES accounts(id),
  period_start DATE,
  period_end DATE,
  total_amount DECIMAL(10,2),
  transaction_count INTEGER,
  status VARCHAR(20),
  banking_reference VARCHAR(100),
  created_at TIMESTAMP,
  processed_at TIMESTAMP
);
```

### Account Table Extensions
```sql
ALTER TABLE accounts 
ADD COLUMN account_type VARCHAR(20) DEFAULT 'customer',
ADD COLUMN seller_business_name VARCHAR(255),
ADD COLUMN seller_tax_id VARCHAR(50),
ADD COLUMN seller_approval_status VARCHAR(20),
ADD COLUMN seller_approval_level INTEGER DEFAULT 0,
ADD COLUMN seller_commission_rate DECIMAL(5,2),
ADD COLUMN seller_payment_terms VARCHAR(20),
ADD COLUMN seller_onboarded_at TIMESTAMP;
```

## API Endpoints Summary

### Seller Management
- `POST /api/accounts/seller/register` - Self-registration
- `GET /api/accounts/sellers` - List all sellers
- `GET /api/accounts/:id/seller-profile` - Get seller details
- `PUT /api/accounts/:id/seller-profile` - Update seller profile
- `PATCH /api/accounts/:id/approval-status` - Update approval

### Offerings
- `POST /api/offerings` - Create offering
- `GET /api/offerings/product/:productId` - Get all offerings for product
- `GET /api/offerings/seller/:sellerId` - Get seller's offerings
- `PUT /api/offerings/:id` - Update offering
- `DELETE /api/offerings/:id` - Remove offering
- `GET /api/offerings/best/:productId` - Get winning offer

### Financial
- `GET /api/sellers/:id/transactions` - Seller transactions
- `GET /api/sellers/:id/disbursements` - Seller payouts
- `GET /api/sellers/:id/earnings` - Earnings summary
- `POST /api/admin/disbursements/process` - Trigger disbursement
- `GET /api/admin/marketplace/revenue` - Platform revenue

### Admin
- `GET /api/admin/approval-queue` - Pending approvals
- `POST /api/admin/sellers/:id/approve` - Approve seller
- `POST /api/admin/sellers/:id/reject` - Reject seller
- `GET /api/admin/sellers/:id/documents` - Review documents
- `GET /api/admin/marketplace/metrics` - Platform metrics

## Configuration Requirements

### Environment Variables
```env
# Marketplace Configuration
MARKETPLACE_COMMISSION_DEFAULT=15
MARKETPLACE_APPROVAL_REQUIRED=true
MARKETPLACE_AUTO_DISBURSEMENT=true
MARKETPLACE_DISBURSEMENT_SCHEDULE=weekly
MARKETPLACE_MIN_DISBURSEMENT_AMOUNT=50
MARKETPLACE_SELLER_API_RATE_LIMIT=1000
```

### Feature Flags
```typescript
{
  enableMarketplace: true,
  enableSellerRegistration: true,
  enableAutoDisbursement: false,
  enableSellerAPI: false,
  requireManualApproval: true,
  enableBuyBox: true
}
```

## Security Considerations

1. **PCI Compliance**: Store banking details encrypted
2. **KYC/AML**: Implement identity verification
3. **Rate Limiting**: Per-seller API limits
4. **Fraud Detection**: Monitor suspicious patterns
5. **Data Isolation**: Ensure sellers can't access other sellers' data
6. **Audit Trail**: Log all financial transactions

## Success Metrics

### Platform Metrics
- Number of approved sellers
- Total offerings
- Gross Merchandise Value (GMV)
- Commission revenue
- Average offering price
- Seller approval rate

### Seller Metrics
- Time to first sale
- Average sales per seller
- Seller retention rate
- Offering quality score
- Fulfillment performance

## Next Steps

1. **Immediate Actions**:
   - Review and approve this plan
   - Set up marketplace feature branch
   - Create database migrations
   - Begin Phase 1 implementation

2. **Dependencies**:
   - Payment processor integration (Stripe/PayPal)
   - Document storage solution
   - Email notification service
   - Banking API for disbursements

3. **Future Enhancements**:
   - Multi-currency support
   - International sellers
   - Dropshipping integration
   - Advanced analytics
   - Mobile seller app
   - API marketplace

## Shell Scripts Needed

Create these in `/shell-scripts/`:
- `marketplace-setup.sh` - Initial setup and migrations
- `seed-test-sellers.sh` - Create test seller accounts
- `process-disbursements.sh` - Manual disbursement trigger
- `marketplace-metrics.sh` - Quick metrics report
- `seller-approval-bulk.sh` - Bulk approval tool

## Testing Strategy

1. **Unit Tests**: All new services and entities
2. **Integration Tests**: Seller registration flow
3. **E2E Tests**: Complete seller journey
4. **Load Testing**: Multiple sellers with offerings
5. **Security Testing**: Data isolation verification

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment failures | High | Retry mechanism, manual fallback |
| Seller fraud | High | KYC verification, gradual limits |
| Data breach | Critical | Encryption, access controls |
| Platform abuse | Medium | Rate limiting, monitoring |
| Legal compliance | High | Terms of service, tax handling |

## Conclusion

This marketplace implementation extends the existing PIM infrastructure to support a full-featured B2B2C marketplace. By leveraging existing Account and Product APIs, we minimize development time while creating a scalable solution. The phased approach allows for iterative development and testing, with each phase delivering functional value.

**Estimated Timeline**: 6 weeks for MVP
**Team Required**: 2 backend, 1 frontend, 1 QA
**Priority**: High - Revenue generating feature

---
*Document Version: 1.0*
*Created: [Today's Date]*
*Status: Draft - Awaiting Review*