# Marketplace MVP - Quick Task List

## 🚀 Immediate Tasks (This Week)

### Backend - Priority 1
```bash
# Run these from /engines directory
```
1. [ ] Extend Account entity with seller fields
2. [ ] Create seller registration DTO
3. [ ] Add `POST /api/accounts/seller/register` endpoint
4. [ ] Create Offering entity and repository
5. [ ] Add offering validation service

### Frontend - Priority 1  
```bash
# Run these from /admin directory
```
1. [ ] Create SellerRegistration component
2. [ ] Add seller dashboard route
3. [ ] Build offering creation form
4. [ ] Add seller status badge component

### Database - Priority 1
1. [ ] Create migration for account seller fields
2. [ ] Create offerings table migration
3. [ ] Add indexes for seller queries

## 📋 Core Entities to Create

### 1. Offering Entity (`/engines/src/offerings/`)
```typescript
@Entity('offerings')
export class Offering {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Product)
  product: Product;
  
  @ManyToOne(() => Account)
  seller: Account;
  
  @Column('decimal')
  price: number;
  
  @Column('int')
  quantity: number;
  
  @Column()
  condition: string;
  
  @Column()
  status: string;
}
```

### 2. Transaction Entity (`/engines/src/transactions/`)
```typescript
@Entity('marketplace_transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  orderId: string;
  
  @ManyToOne(() => Account)
  seller: Account;
  
  @Column('decimal')
  grossAmount: number;
  
  @Column('decimal')
  commissionAmount: number;
  
  @Column('decimal')
  netSellerAmount: number;
}
```

## 🛠️ Quick Shell Scripts

### marketplace-setup.sh
```bash
#!/bin/bash
# Creates all marketplace tables and seeds test data
cd /Users/colinroets/dev/projects/product/engines
npm run migration:generate -- MarketplaceSetup
npm run migration:run
npm run seed:marketplace
```

### test-seller-flow.sh
```bash
#!/bin/bash
# Tests complete seller registration and offering creation
curl -X POST http://localhost:3010/api/accounts/seller/register \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","businessName":"Test Seller Co"}'
```

## 🔄 API Response Patterns

All marketplace endpoints follow standard response:
```json
{
  "success": true,
  "message": "Seller registered successfully",
  "data": {
    "id": "uuid",
    "accountType": "seller",
    "approvalStatus": "pending"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 📊 Key Marketplace Metrics to Track

1. **Seller Metrics**
   - Total registered sellers
   - Approved vs pending
   - Average time to approval
   - Sellers with active offerings

2. **Offering Metrics**
   - Total offerings
   - Offerings per product
   - Average price variance
   - Out of stock rate

3. **Financial Metrics**
   - GMV (Gross Merchandise Value)
   - Total commission earned
   - Pending disbursements
   - Average order value per seller

## 🎯 MVP Success Criteria

- [ ] Seller can self-register
- [ ] Admin can approve/reject sellers  
- [ ] Approved seller can create offerings
- [ ] Multiple offerings display per product
- [ ] Commission calculated on transactions
- [ ] Basic disbursement tracking
- [ ] Seller dashboard with earnings

## 🚨 Critical Path Items

1. **Week 1**: Seller registration + approval
2. **Week 2**: Offerings CRUD + display
3. **Week 3**: Transaction tracking
4. **Week 4**: Disbursement calculation
5. **Week 5**: Testing + refinement
6. **Week 6**: Deploy to QA

## 💾 Test Data Seeds

```typescript
// Test sellers for development
const testSellers = [
  {
    email: 'electronics@seller.com',
    businessName: 'TechMart Pro',
    commissionRate: 15,
    approvalStatus: 'approved'
  },
  {
    email: 'fashion@seller.com', 
    businessName: 'Fashion Hub',
    commissionRate: 18,
    approvalStatus: 'approved'
  },
  {
    email: 'pending@seller.com',
    businessName: 'New Seller LLC',
    commissionRate: 20,
    approvalStatus: 'pending'
  }
];
```

## 🔗 Related Documents

- Main plan: `/docs/MARKETPLACE_IMPLEMENTATION_PLAN.md`
- API standards: `/docs/API_STANDARDIZATION_PLAN.md`
- TypeORM standards: `/docs/TYPEORM_STANDARDIZATION_PLAN.md`

## 📝 Notes

- Use existing Account API - don't create separate seller entity
- Offerings link products to sellers (many-to-many with attributes)
- Commission rates are per-seller (override default)
- All money stored as decimal(10,2) in cents
- Status fields use lowercase strings (not enums in DB)

---
*Quick reference for marketplace MVP implementation*
*Update this as tasks are completed*