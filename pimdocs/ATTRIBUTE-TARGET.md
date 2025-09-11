# Attribute System - Target Architecture

**Created:** September 11, 2025  
**Purpose:** Document advanced attribute features for future implementation  
**Status:** Planning/Future Enhancement

## Overview

This document captures advanced attribute management features and scalability considerations for the PIM system. These are not immediate requirements but represent the target state for handling attributes at scale.

---

## 🎯 Target Capabilities

### 1. Attribute Scoping & Organization

#### Scope Levels
```typescript
enum AttributeScope {
  GLOBAL = 'global',           // Available to all products (Color, Weight)
  CATEGORY = 'category',       // Category-specific (Turbine specs for Industrial)
  PRODUCT_TYPE = 'product_type', // Type-specific (Digital vs Physical)
  CUSTOM = 'custom'            // One-off product attributes
}
```

#### Attribute Metadata
```typescript
interface AttributeMetadata {
  id: string;
  name: string;
  scope: AttributeScope;
  usageCount: number;          // How many products use this
  categories: string[];         // Which categories use this
  commonValues: string[];       // Top 10 most used values
  synonyms: string[];          // Alternative names (color/colour)
  suggestedFor: string[];      // ML-based suggestions
  lastUsed: Date;
}
```

### 2. Smart Attribute Discovery

#### Auto-complete with Intelligence
- Fuzzy matching on attribute names
- Show usage statistics inline
- Category-based suggestions
- Recently used attributes
- "Commonly used together" recommendations

#### Example Search Flow
```
User types: "col..."
System suggests:
  ├── Color (Global, 1,247 products) ⭐
  ├── Collar Style (Apparel, 89 products)
  ├── Collection Name (Global, 456 products)
  └── Cooling Type (Electronics, 23 products)
```

### 3. Attribute Templates

#### Category-Based Templates
```typescript
interface AttributeTemplate {
  categoryId: string;
  required: string[];      // Must have attributes
  recommended: string[];   // Should have attributes
  optional: string[];      // Nice to have attributes
}

// Example: Electronics Template
{
  required: ['Brand', 'Model', 'Weight', 'Dimensions'],
  recommended: ['Color', 'Warranty', 'Power Consumption'],
  optional: ['Certification', 'Operating Temperature']
}
```

### 4. Intelligent Import Matching

#### Fuzzy Matching Algorithm
```typescript
interface AttributeMatcher {
  findBestMatch(inputName: string): {
    attribute: Attribute;
    confidence: number;  // 0-100%
    reason: string;      // "Exact match" | "Synonym" | "Similar"
  }
}

// Examples:
"colour" → Color (95% - synonym)
"turbine_blade_dia" → Turbine Blade Diameter (85% - partial)
"wght" → Weight (75% - abbreviation)
"material_type" → Material (90% - suffix variation)
```

#### Matching Rules
1. Exact match (100%)
2. Case-insensitive match (95%)
3. Synonym match (90%)
4. Partial match with common patterns (80%)
5. Abbreviation match (75%)
6. Fuzzy string match (60-70%)

### 5. Value Management at Scale

#### Value Statistics
```typescript
interface AttributeValueStats {
  attributeId: string;
  value: string;
  usageCount: number;
  firstUsed: Date;
  lastUsed: Date;
  trends: 'increasing' | 'stable' | 'decreasing';
}
```

#### Value Aliasing
```typescript
interface ValueAlias {
  canonical: string;    // The main value
  aliases: string[];    // Alternative representations
}

// Examples:
{ canonical: "Small", aliases: ["S", "SM", "small", "Small Size"] }
{ canonical: "Blue", aliases: ["BLU", "blue", "Azure", "Navy"] }
```

### 6. Advanced Features

#### Attribute Inheritance
- Category attributes cascade to subcategories
- Override at any level
- Template inheritance

#### Computed Attributes
```typescript
interface ComputedAttribute {
  name: string;
  formula: string;
  dependencies: string[];
}

// Example: Volume
{
  name: "Volume",
  formula: "length * width * height",
  dependencies: ["length", "width", "height"]
}
```

#### Conditional Attributes
```typescript
interface ConditionalAttribute {
  attribute: string;
  condition: {
    when: string;      // Parent attribute
    equals: any;       // Value to match
    show: boolean;     // Show/hide this attribute
  }
}

// Example: Hide weight for digital products
{
  attribute: "weight",
  condition: {
    when: "productType",
    equals: "digital",
    show: false
  }
}
```

---

## 📊 Analytics & Insights

### Usage Analytics Dashboard
```typescript
interface AttributeAnalytics {
  // Most used attributes
  topAttributes: {
    name: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  
  // Unused attributes (cleanup candidates)
  unusedAttributes: {
    name: string;
    lastUsed: Date;
    createdBy: string;
  }[];
  
  // Duplicate detection
  duplicateCandidates: {
    attr1: string;
    attr2: string;
    similarity: number;
    suggestion: 'merge' | 'alias' | 'keep_both';
  }[];
  
  // Category coverage
  categoryCompleteness: {
    category: string;
    requiredFilled: number;
    recommendedFilled: number;
    completeness: number; // percentage
  }[];
}
```

---

## 🗄️ Database Schema Extensions

### Additional Tables Needed

```sql
-- Attribute metadata and statistics
CREATE TABLE attribute_metadata (
  attribute_id UUID PRIMARY KEY REFERENCES attributes(id),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  search_terms TEXT[],           -- For better search
  synonyms TEXT[],                -- Alternative names
  category_ids UUID[],            -- Categories using this
  common_values JSONB,            -- Top values with counts
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Category attribute templates
CREATE TABLE category_attribute_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  attribute_id UUID REFERENCES attributes(id),
  requirement_level VARCHAR(20) CHECK (requirement_level IN ('required', 'recommended', 'optional')),
  sort_order INTEGER DEFAULT 0,
  conditions JSONB,               -- Conditional display rules
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, attribute_id)
);

-- Attribute value statistics
CREATE TABLE attribute_value_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID REFERENCES attributes(id),
  value TEXT NOT NULL,
  normalized_value TEXT,          -- Canonical form
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(attribute_id, value)
);

-- Attribute synonyms and aliases
CREATE TABLE attribute_synonyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID REFERENCES attributes(id),
  synonym TEXT NOT NULL,
  confidence DECIMAL(3,2),        -- Matching confidence 0.00-1.00
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(synonym)
);

-- Import mapping memory
CREATE TABLE import_attribute_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name TEXT NOT NULL,      -- CSV column name
  attribute_id UUID REFERENCES attributes(id),
  confidence DECIMAL(3,2),
  times_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(source_name)
);
```

### Indexes for Performance

```sql
-- Search performance
CREATE INDEX idx_attribute_metadata_search ON attribute_metadata USING GIN(search_terms);
CREATE INDEX idx_attribute_synonyms_search ON attribute_synonyms(synonym);

-- Usage tracking
CREATE INDEX idx_attribute_metadata_usage ON attribute_metadata(usage_count DESC);
CREATE INDEX idx_attribute_value_stats_usage ON attribute_value_stats(attribute_id, usage_count DESC);

-- Template lookups
CREATE INDEX idx_category_templates_category ON category_attribute_templates(category_id);
CREATE INDEX idx_category_templates_requirement ON category_attribute_templates(requirement_level);
```

---

## 🔄 Migration Strategy

### Phase 1: Basic Foundation (Current)
- Simple CRUD for attributes
- Basic value management
- Manual assignment to products

### Phase 2: Enhanced Discovery (Q1 2026)
- Search with auto-complete
- Usage statistics
- Basic templates

### Phase 3: Intelligence Layer (Q2 2026)
- Fuzzy matching
- Import mappings
- Synonym management
- Value aliasing

### Phase 4: Scale Optimization (Q3 2026)
- Computed attributes
- Conditional logic
- Inheritance system
- Analytics dashboard

### Phase 5: ML Enhancement (Q4 2026)
- Auto-categorization
- Smart suggestions
- Anomaly detection
- Predictive templates

---

## 🎯 Success Metrics

### Efficiency Metrics
- **Attribute Reuse Rate**: > 80% of assignments use existing attributes
- **Discovery Time**: < 3 seconds to find right attribute
- **Import Mapping Accuracy**: > 90% auto-match on imports
- **Template Adoption**: > 70% products use category templates

### Quality Metrics
- **Duplicate Reduction**: < 5% duplicate attributes
- **Value Consistency**: > 95% values use canonical form
- **Completeness Score**: > 85% required attributes filled

### Scale Metrics
- **Search Performance**: < 100ms for 10,000+ attributes
- **Import Speed**: > 1,000 products/minute with mapping
- **Concurrent Users**: Support 100+ simultaneous editors

---

## 🤔 Open Questions

### Business Logic
1. Should attributes be versioned? (track changes over time)
2. Do we need approval workflows for new attributes?
3. Should we support multi-language attributes?
4. How to handle unit conversions? (meters ↔ feet)
5. Should attributes have expiration dates?

### Technical Decisions
1. Use Elasticsearch for attribute search?
2. Implement caching layer for templates?
3. GraphQL for complex attribute queries?
4. Real-time collaboration on attributes?
5. Event sourcing for attribute history?

### UX Considerations
1. Inline attribute creation vs separate form?
2. Drag-drop for template ordering?
3. Visual indicators for required attributes?
4. Bulk edit interface design?
5. Mobile-responsive attribute management?

---

## 📚 References

### Industry Standards
- Schema.org product properties
- GS1 Global Data Standards
- ETIM Classification System
- UN/CEFACT Standards

### Inspiration Sources
- Akeneo PIM attribute system
- Pimcore data objects
- Salsify property management
- inRiver attribute framework

---

## 🚀 Implementation Checklist

When implementing advanced features:

- [ ] Performance test with 10,000+ attributes
- [ ] Implement caching strategy
- [ ] Add telemetry for usage tracking
- [ ] Create migration tools for existing data
- [ ] Build admin tools for cleanup
- [ ] Document best practices
- [ ] Train users on templates
- [ ] Set up monitoring alerts
- [ ] Create backup/restore procedures
- [ ] Plan for data archival

---

## 📝 Notes

### Current Limitations (Sept 2025)
- Backend supports 13 attribute types
- No template system yet
- Manual attribute assignment only
- No usage tracking
- No import mapping

### Immediate Opportunities
- Add search to attribute selection
- Show usage count in UI
- Create common attribute sets
- Add keyboard shortcuts
- Implement type-ahead

### Risk Mitigation
- Start with read-only analytics
- Phase rollout by user group
- Keep manual override options
- Maintain audit trail
- Plan rollback procedures

---

*This document represents the target state for attribute management. Implementation will be phased based on user needs and system growth.*

**Document Status:** Living document - update as requirements evolve  
**Review Cycle:** Quarterly  
**Owner:** PIM Development Team  
**Last Review:** September 11, 2025