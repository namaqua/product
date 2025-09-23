# APPROVAL_FLOW_MOCKUP.md

## Overview
This document outlines the development tasks and implementation guide for creating a demo-only approval workflow mockup in the `/admin` frontend application. No backend integration required - all data will be mocked.

**Duration**: 6 days  
**Location**: `/admin` folder  
**Purpose**: Demo presentation of approval workflow features  
**Created**: 2024  

---

## Prerequisites Checklist

- [ ] Navigate to `/admin` folder
- [ ] Verify React app runs on port 5173
- [ ] Install required dependencies:
  ```bash
  npm install react-dnd react-dnd-html5-backend
  npm install @faker-js/faker
  npm install framer-motion
  npm install react-hot-toast
  npm install date-fns
  npm install react-countup
  ```

---

## Task List by Day

### Day 1: Setup & Mock Data Structure

#### Morning Session (2-3 hours)
- [ ] Create mock data directory structure
  ```
  /admin/src/mocks/
  ├── approvalData.ts
  ├── sellerData.ts
  ├── userGroups.ts
  └── notifications.ts
  ```

- [ ] Create `approvalData.ts` with sample workflows
  ```typescript
  // Include at least 20 mock workflows across different stages
  // Stages: initial_submission, tech_gov_check, ecc_check_1, 
  //         bu_assignment, lead_bu_review, voting_period, etc.
  ```

- [ ] Create `userGroups.ts` with mock user groups
  ```typescript
  // MP_OPERATOR, BU_APPROVER, COUNTRY_APPROVER, 
  // INDUSTRY_APPROVER, ECC, TECH_GOV
  ```

- [ ] Create `sellerData.ts` with mock seller submissions
  ```typescript
  // At least 5 different seller profiles
  // Various offering types and statuses
  ```

#### Afternoon Session (2-3 hours)
- [ ] Create mock service layer
  - [ ] Create `/admin/src/services/mockApprovalService.ts`
  - [ ] Implement delay function for realistic feel
  - [ ] Add methods: getWorkflows(), moveCard(), vote(), updateWorkflow()
  
- [ ] Set up component folder structure
  ```bash
  mkdir -p src/components/approval/{KanbanBoard,SubmissionWizard,ApprovalDashboard,shared}
  ```

- [ ] Create base routing in App.tsx
  ```typescript
  // Add routes for /approval, /approval/kanban, /approval/submit
  ```

---

### Day 2: Kanban Board Core Structure

#### Morning Session (3 hours)
- [ ] Create `KanbanBoard.tsx` main component
  - [ ] Set up DndProvider with HTML5Backend
  - [ ] Create state for lanes and cards
  - [ ] Implement lane structure

- [ ] Create `KanbanLane.tsx` component
  - [ ] Implement useDrop hook
  - [ ] Add lane header with count
  - [ ] Style lanes with CSS

- [ ] Create `KanbanCard.tsx` component
  - [ ] Implement useDrag hook
  - [ ] Add card content structure
  - [ ] Include mock vote counts

#### Afternoon Session (3 hours)
- [ ] Implement drag and drop logic
  - [ ] Handle card movement between lanes
  - [ ] Add validation for allowed transitions
  - [ ] Update state on successful drop

- [ ] Add visual feedback
  - [ ] Drag preview styling
  - [ ] Drop target indicators
  - [ ] Forbidden drop visual cues

- [ ] Create `kanban.styles.css`
  ```css
  /* Include styles for board, lanes, cards, drag states */
  ```

---

### Day 3: Enhanced Kanban Features

#### Morning Session (3 hours)
- [ ] Add SLA indicators to cards
  - [ ] Create `SLAIndicator.tsx` component
  - [ ] Color coding: green (on time), yellow (warning), red (overdue)
  - [ ] Calculate days remaining

- [ ] Implement voting panel
  - [ ] Create `VotingPanel.tsx` component
  - [ ] Add Support/Neutral/Object buttons
  - [ ] Show vote counts with animations

- [ ] Add card actions
  - [ ] View details button
  - [ ] Quick approve/reject (for authorized users)
  - [ ] Add to favorites

#### Afternoon Session (3 hours)
- [ ] Implement filters
  - [ ] Create `FilterBar.tsx` component
  - [ ] Add filters: My Tasks, Priority, SLA Status, Stage
  - [ ] Implement search functionality

- [ ] Add real-time simulation
  ```typescript
  // Simulate vote updates every 10-30 seconds
  // Randomly move cards to show activity
  // Update SLA timers
  ```

- [ ] Performance optimizations
  - [ ] Implement virtual scrolling for lanes with many cards
  - [ ] Add lazy loading for off-screen lanes
  - [ ] Memoize expensive computations

---

### Day 4: Submission Wizard

#### Morning Session (3 hours)
- [ ] Create wizard container
  - [ ] Create `WizardContainer.tsx`
  - [ ] Implement step navigation logic
  - [ ] Add progress indicator component

- [ ] Create wizard context
  ```typescript
  // WizardContext for shared state
  // Include: currentStep, formData, validation errors
  ```

- [ ] Build Step 1: Basic Information
  - [ ] Create `steps/BasicInfo.tsx`
  - [ ] Add fields: offering name, description, category
  - [ ] Implement field validation

#### Afternoon Session (3 hours)
- [ ] Build Step 2: Technical Details
  - [ ] Create `steps/TechnicalDetails.tsx`
  - [ ] Add technical specification fields
  - [ ] Include file upload mock interface

- [ ] Build Step 3: Marketing Content
  - [ ] Create `steps/MarketingContent.tsx`
  - [ ] Dynamic benefits/features lists
  - [ ] FAQ builder interface

- [ ] Build Step 4: Review & Submit
  - [ ] Create `steps/ReviewSubmit.tsx`
  - [ ] Summary of all entered data
  - [ ] Preview mode toggle
  - [ ] Submit with confirmation modal

---

### Day 5: Dashboard & Metrics

#### Morning Session (3 hours)
- [ ] Create main dashboard
  - [ ] Create `Dashboard.tsx`
  - [ ] Implement grid layout
  - [ ] Add responsive design

- [ ] Build metrics panel
  - [ ] Create `MetricsPanel.tsx`
  - [ ] Add animated counters for:
    - Pending approvals
    - Average processing time
    - Approval rate
    - Overdue items

- [ ] Create activity feed
  - [ ] Recent votes cast
  - [ ] Stage transitions
  - [ ] New submissions
  - [ ] Auto-refresh every 30 seconds

#### Afternoon Session (3 hours)
- [ ] Build pending approvals list
  - [ ] Table view with sorting
  - [ ] Priority indicators
  - [ ] Quick action buttons
  - [ ] Pagination

- [ ] Add charts/visualizations
  - [ ] Approval pipeline funnel
  - [ ] Vote distribution pie chart
  - [ ] SLA compliance bar chart
  - [ ] Use Chart.js or Recharts

- [ ] Implement export functionality
  - [ ] Export to CSV (mock)
  - [ ] Print view CSS
  - [ ] Generate PDF report (mock)

---

### Day 6: Polish & Demo Features

#### Morning Session (3 hours)
- [ ] Create demo control panel
  ```typescript
  // Floating panel with demo controls
  // User role switcher
  // Scenario triggers
  // Data reset button
  ```

- [ ] Add user role simulation
  - [ ] MP Operator view (full access)
  - [ ] BU Approver view (voting only)
  - [ ] Seller view (read-only + submission)
  - [ ] Store current role in context

- [ ] Implement scenario triggers
  - [ ] "Trigger Objection" - adds objection vote
  - [ ] "Simulate Rejection" - moves card to rejected
  - [ ] "Fast Forward Time" - advances SLA deadlines
  - [ ] "Bulk Submit" - adds 5 new submissions

#### Afternoon Session (3 hours)
- [ ] Add animations and transitions
  - [ ] Framer Motion for page transitions
  - [ ] Card flip animations on vote
  - [ ] Smooth drag animations
  - [ ] Toast notifications for all actions

- [ ] Implement tour mode
  ```typescript
  // Step-by-step walkthrough
  // Highlight active elements
  // Explanatory tooltips
  ```

- [ ] Final testing and bug fixes
  - [ ] Test all drag and drop scenarios
  - [ ] Verify role-based visibility
  - [ ] Check responsive design
  - [ ] Ensure smooth animations

---

## Component Specifications

### Kanban Board Component
```typescript
interface KanbanBoardProps {
  viewMode: 'compact' | 'detailed';
  filters: FilterState;
  userRole: UserRole;
}

// Features:
// - 8 swim lanes for different stages
// - Drag and drop between allowed stages
// - Real-time updates simulation
// - Color-coded SLA status
// - Vote indicators on cards
```

### Submission Wizard Component
```typescript
interface WizardProps {
  mode: 'create' | 'edit';
  initialData?: OfferingData;
  onComplete: (data: OfferingData) => void;
}

// Features:
// - 4-step process
// - Validation per step
// - Auto-save indicator (fake)
// - Progress persistence in localStorage
```

### Dashboard Component
```typescript
interface DashboardProps {
  timeRange: 'today' | 'week' | 'month';
  department?: string;
}

// Features:
// - Real-time metrics
// - Activity feed
// - Quick actions
// - Export capabilities
```

---

## Mock Data Specifications

### Workflow Object Structure
```typescript
interface MockWorkflow {
  id: string;
  offeringName: string;
  sellerName: string;
  stage: WorkflowStage;
  status: 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  slaDeadline: Date;
  votes: {
    support: number;
    neutral: number;
    object: number;
  };
  assignedGroups: string[];
  currentAssignee?: string;
  createdAt: Date;
  stageEnteredAt: Date;
  history: StageHistory[];
}
```

### Stage Definitions
```typescript
enum WorkflowStage {
  INITIAL_SUBMISSION = 'initial_submission',
  TECH_GOV_CHECK = 'tech_gov_check',
  ECC_CHECK_1 = 'ecc_check_1',
  BU_ASSIGNMENT = 'bu_assignment',
  LEAD_BU_REVIEW = 'lead_bu_review',
  VOTING_PERIOD = 'voting_period',
  VOTE_EVALUATION = 'vote_evaluation',
  OBJECTION_HANDLING = 'objection_handling',
  FINAL_SUBMISSION = 'final_submission',
  ECC_CHECK_2 = 'ecc_check_2',
  QUALITY_CHECK = 'quality_check',
  PUBLISHED = 'published',
  REJECTED = 'rejected'
}
```

### Generate Realistic Mock Data
```typescript
// Use faker.js for:
// - Company names
// - Product names
// - User names
// - Dates within realistic ranges
// - Comments and descriptions

// Example:
import { faker } from '@faker-js/faker';

const generateMockWorkflow = (): MockWorkflow => ({
  id: faker.string.uuid(),
  offeringName: faker.commerce.productName(),
  sellerName: faker.company.name(),
  stage: faker.helpers.enumValue(WorkflowStage),
  status: faker.helpers.arrayElement(['active', 'paused', 'completed']),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
  slaDeadline: faker.date.future(),
  votes: {
    support: faker.number.int({ min: 0, max: 5 }),
    neutral: faker.number.int({ min: 0, max: 3 }),
    object: faker.number.int({ min: 0, max: 2 })
  },
  assignedGroups: faker.helpers.arrayElements(['BU_DI_FA', 'MP_OPERATOR', 'ECC'], 2),
  createdAt: faker.date.past(),
  stageEnteredAt: faker.date.recent(),
  history: []
});
```

---

## Testing Checklist

### Functionality Tests
- [ ] Drag card from one stage to another
- [ ] Verify stage transition rules
- [ ] Test vote casting
- [ ] Complete wizard flow
- [ ] Apply and clear filters
- [ ] Switch user roles
- [ ] Trigger demo scenarios

### Visual Tests
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] Dark mode compatibility (if implemented)
- [ ] Animation smoothness
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### Performance Tests
- [ ] Load 100+ cards
- [ ] Rapid drag and drop
- [ ] Multiple filters applied
- [ ] Quick navigation between views

---

## Demo Script

### 5-Minute Demo Flow

#### 1. Dashboard Overview (30 seconds)
- Show key metrics (42 pending, 85% approval rate)
- Highlight 3 overdue items in red
- Point out activity feed with recent actions

#### 2. Kanban Board (2 minutes)
- Show 8 workflow stages with cards
- Drag "AI Analytics Platform" from "Lead BU Review" to "Voting Period"
- Click vote buttons to add support vote
- Apply "My Tasks" filter to show assigned items
- Demonstrate real-time update simulation

#### 3. Submission Wizard (1.5 minutes)
- Start new submission
- Fill basic information (show validation)
- Skip to review step
- Show preview mode
- Submit and see toast notification

#### 4. Role Switching (1 minute)
- Switch from MP Operator to BU Approver
- Show reduced permissions (can't drag certain cards)
- Switch to Seller view
- Show read-only state

#### 5. Demo Controls (30 seconds)
- Trigger objection scenario
- Fast forward time to show SLA changes
- Reset demo data

---

## Known Limitations (Demo Only)

### Data Persistence
- All data is mocked and stored in memory
- Changes don't persist on page refresh
- No real backend connections

### Business Rules
- Stage transitions simplified (not all rules enforced)
- Vote evaluation logic simplified
- SLA calculations are approximate
- User permissions are simulated

### Performance
- Limited to ~200 cards for smooth performance
- No real WebSocket connections
- Async operations are simulated with setTimeout

---

## Future Enhancements (Post-Demo)

### Phase 1: Backend Integration
- Connect to real NestJS APIs
- Implement WebSocket for real-time updates
- Add proper authentication/authorization
- Connect to PostgreSQL database

### Phase 2: Advanced Features
- Email notification system
- Document attachment handling
- Complete audit trail
- Advanced analytics dashboard
- Bulk operations

### Phase 3: Production Readiness
- Error boundaries and fallbacks
- Logging and monitoring
- Performance optimization
- Security hardening
- Accessibility compliance (WCAG)

---

## File Structure Reference

```
/admin/src/
├── components/
│   └── approval/
│       ├── KanbanBoard/
│       │   ├── KanbanBoard.tsx
│       │   ├── KanbanLane.tsx
│       │   ├── KanbanCard.tsx
│       │   └── kanban.styles.css
│       ├── SubmissionWizard/
│       │   ├── WizardContainer.tsx
│       │   ├── steps/
│       │   └── wizard.styles.css
│       ├── ApprovalDashboard/
│       │   ├── Dashboard.tsx
│       │   ├── MetricsPanel.tsx
│       │   └── FilterBar.tsx
│       └── shared/
│           ├── VotingPanel.tsx
│           ├── SLAIndicator.tsx
│           └── StatusBadge.tsx
├── mocks/
│   ├── approvalData.ts
│   ├── sellerData.ts
│   ├── userGroups.ts
│   └── notifications.ts
├── services/
│   └── mockApprovalService.ts
└── utils/
    └── demoMode.ts
```

---

## Resources

### Documentation Links
- [React DnD Documentation](https://react-dnd.github.io/react-dnd/docs/overview)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Faker.js API](https://fakerjs.dev/api/)
- [Date-fns Documentation](https://date-fns.org/docs/)

### Internal References
- [Project TypeORM Standards](/docs/TYPEORM_STANDARDIZATION_PLAN.md)
- [API Standards](/docs/API_STANDARDIZATION_PLAN.md)
- [Main Project Instructions](/docs/PROJECT_INSTRUCTIONS.md)

### Design Guidelines
- Use existing PIM color scheme from `/admin/src/styles`
- Follow current component patterns in `/admin/src/components`
- Maintain consistent 8px spacing grid
- Use existing font stack and sizes

---

## Questions/Issues Log

| Date | Issue | Resolution | Status |
|------|-------|------------|--------|
| | Mock data volume | Start with 20 workflows, expand if needed | Open |
| | Animation performance | Use CSS transforms over JS animations | Open |
| | Mobile responsiveness | Focus on desktop first, mobile enhancement later | Open |

---

## Completion Checklist

### Pre-Development
- [ ] Dependencies installed
- [ ] File structure created
- [ ] Mock data prepared

### Development Complete
- [ ] All Day 1-6 tasks checked
- [ ] Testing checklist passed
- [ ] Demo script tested

### Sign-off
- [ ] Technical Lead Review
- [ ] UX Review (if available)
- [ ] Stakeholder Demo Successful
- [ ] Documentation Updated

---

## Notes

- Focus on visual polish over complex logic
- Use loading states liberally to simulate async operations
- Keep all mock delays between 300-800ms for realism
- Use console.log for demo mode actions to show what would happen
- Store demo preferences in localStorage for persistence

---

*Last Updated: 2024*  
*Version: 1.0 - Demo Only*  
*Next Review: After stakeholder demo*
