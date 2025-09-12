import { DataSource } from 'typeorm';
import { Attribute, AttributeType, ValidationRule } from '../modules/attributes/entities/attribute.entity';
import { AttributeGroup } from '../modules/attributes/entities/attribute-group.entity';
import { AttributeOption } from '../modules/attributes/entities/attribute-option.entity';

/**
 * Comprehensive Attribute Seed Data
 * Creates a full set of attributes for various product categories
 */
export async function seedAttributes(dataSource: DataSource) {
  const attributeRepository = dataSource.getRepository(Attribute);
  const groupRepository = dataSource.getRepository(AttributeGroup);
  const optionRepository = dataSource.getRepository(AttributeOption);

  console.log('🌱 Seeding Attributes...');

  // ============================================
  // ATTRIBUTE GROUPS
  // ============================================
  
  const groups = [
    { code: 'general', name: 'General', description: 'General product information', sortOrder: 1 },
    { code: 'physical', name: 'Physical Properties', description: 'Size, weight, dimensions', sortOrder: 2 },
    { code: 'materials', name: 'Materials & Construction', description: 'What the product is made of', sortOrder: 3 },
    { code: 'technical', name: 'Technical Specifications', description: 'Technical details and specs', sortOrder: 4 },
    { code: 'features', name: 'Features', description: 'Product features and capabilities', sortOrder: 5 },
    { code: 'compliance', name: 'Compliance & Certifications', description: 'Standards and certifications', sortOrder: 6 },
    { code: 'care', name: 'Care & Maintenance', description: 'How to care for the product', sortOrder: 7 },
    { code: 'shipping', name: 'Shipping & Packaging', description: 'Packaging and shipping info', sortOrder: 8 },
  ];

  const savedGroups: Record<string, AttributeGroup> = {};
  
  for (const groupData of groups) {
    let group = await groupRepository.findOne({ where: { code: groupData.code } });
    if (!group) {
      group = groupRepository.create(groupData);
      group = await groupRepository.save(group);
      console.log(`  ✅ Created group: ${group.name}`);
    }
    savedGroups[groupData.code] = group;
  }

  // ============================================
  // ATTRIBUTES WITH OPTIONS
  // ============================================

  const attributesData = [
    // ========== GENERAL GROUP ==========
    {
      code: 'brand',
      name: 'Brand',
      type: AttributeType.TEXT,
      group: 'general',
      isRequired: false,
      isSearchable: true,
      isFilterable: true,
      sortOrder: 1,
      helpText: 'Product brand or manufacturer',
    },
    {
      code: 'manufacturer',
      name: 'Manufacturer',
      type: AttributeType.TEXT,
      group: 'general',
      isRequired: false,
      isSearchable: true,
      isFilterable: true,
      sortOrder: 2,
      helpText: 'Company that manufactures the product',
    },
    {
      code: 'model_number',
      name: 'Model Number',
      type: AttributeType.TEXT,
      group: 'general',
      isRequired: false,
      isSearchable: true,
      sortOrder: 3,
      placeholder: 'e.g., MDL-2024-X',
    },
    {
      code: 'product_line',
      name: 'Product Line',
      type: AttributeType.SELECT,
      group: 'general',
      isFilterable: true,
      sortOrder: 4,
      options: ['Premium', 'Standard', 'Budget', 'Professional', 'Consumer'],
    },
    {
      code: 'release_year',
      name: 'Release Year',
      type: AttributeType.NUMBER,
      group: 'general',
      isFilterable: true,
      sortOrder: 5,
      validationRules: [
        { type: 'min' as const, value: 2000, message: 'Year must be 2000 or later' },
        { type: 'max' as const, value: 2030, message: 'Year cannot be in the future' },
      ],
    },
    {
      code: 'country_of_origin',
      name: 'Country of Origin',
      type: AttributeType.SELECT,
      group: 'general',
      isFilterable: true,
      sortOrder: 6,
      options: [
        'USA', 'China', 'Germany', 'Japan', 'Italy', 'France', 'UK', 
        'Canada', 'Mexico', 'India', 'Vietnam', 'Thailand', 'Indonesia'
      ],
    },

    // ========== PHYSICAL PROPERTIES ==========
    {
      code: 'color',
      name: 'Color',
      type: AttributeType.MULTISELECT,
      group: 'physical',
      isFilterable: true,
      isVisibleInListing: true,
      sortOrder: 1,
      options: [
        'Black', 'White', 'Gray', 'Silver', 'Gold', 'Brown',
        'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink',
        'Navy', 'Beige', 'Turquoise', 'Multi-Color'
      ],
    },
    {
      code: 'primary_color',
      name: 'Primary Color',
      type: AttributeType.COLOR,
      group: 'physical',
      sortOrder: 2,
      helpText: 'Hex color code for the primary color',
      placeholder: '#000000',
    },
    {
      code: 'product_weight',
      name: 'Product Weight',
      type: AttributeType.DECIMAL,
      group: 'physical',
      sortOrder: 3,
      unit: 'kg',
      validationRules: [
        { type: 'min' as const, value: 0, message: 'Weight must be positive' },
      ],
    },
    {
      code: 'package_weight',
      name: 'Package Weight',
      type: AttributeType.DECIMAL,
      group: 'physical',
      sortOrder: 4,
      unit: 'kg',
    },
    {
      code: 'dimensions_length',
      name: 'Length',
      type: AttributeType.DECIMAL,
      group: 'physical',
      sortOrder: 5,
      unit: 'cm',
    },
    {
      code: 'dimensions_width',
      name: 'Width',
      type: AttributeType.DECIMAL,
      group: 'physical',
      sortOrder: 6,
      unit: 'cm',
    },
    {
      code: 'dimensions_height',
      name: 'Height',
      type: AttributeType.DECIMAL,
      group: 'physical',
      sortOrder: 7,
      unit: 'cm',
    },
    {
      code: 'size',
      name: 'Size',
      type: AttributeType.SELECT,
      group: 'physical',
      isFilterable: true,
      sortOrder: 8,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'],
    },

    // ========== MATERIALS & CONSTRUCTION ==========
    {
      code: 'material',
      name: 'Primary Material',
      type: AttributeType.SELECT,
      group: 'materials',
      isFilterable: true,
      isComparable: true,
      sortOrder: 1,
      options: [
        'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Leather', 'Synthetic Leather',
        'Wood', 'Metal', 'Plastic', 'Glass', 'Ceramic', 'Stainless Steel', 
        'Aluminum', 'Carbon Fiber', 'Rubber', 'Silicone', 'Fabric', 'Paper'
      ],
    },
    {
      code: 'material_composition',
      name: 'Material Composition',
      type: AttributeType.TEXT,
      group: 'materials',
      sortOrder: 2,
      placeholder: 'e.g., 60% Cotton, 40% Polyester',
      helpText: 'Detailed breakdown of materials used',
    },
    {
      code: 'construction_method',
      name: 'Construction Method',
      type: AttributeType.SELECT,
      group: 'materials',
      sortOrder: 3,
      options: [
        'Handmade', 'Machine Made', 'Hand Assembled', 'Molded', 
        'Welded', 'Sewn', '3D Printed', 'Cast', 'Forged'
      ],
    },
    {
      code: 'finish',
      name: 'Finish',
      type: AttributeType.SELECT,
      group: 'materials',
      isFilterable: true,
      sortOrder: 4,
      options: [
        'Matte', 'Glossy', 'Satin', 'Brushed', 'Polished', 
        'Textured', 'Smooth', 'Raw', 'Painted', 'Powder Coated'
      ],
    },

    // ========== TECHNICAL SPECIFICATIONS ==========
    {
      code: 'power_consumption',
      name: 'Power Consumption',
      type: AttributeType.NUMBER,
      group: 'technical',
      sortOrder: 1,
      unit: 'watts',
      helpText: 'Power consumption in watts',
    },
    {
      code: 'voltage',
      name: 'Voltage',
      type: AttributeType.SELECT,
      group: 'technical',
      sortOrder: 2,
      options: ['110V', '220V', '110-240V', '12V', '24V', '5V USB', 'Battery'],
    },
    {
      code: 'connectivity',
      name: 'Connectivity',
      type: AttributeType.MULTISELECT,
      group: 'technical',
      isFilterable: true,
      sortOrder: 3,
      options: [
        'WiFi', 'Bluetooth', 'USB-C', 'USB-A', 'HDMI', 'Ethernet',
        'NFC', '3.5mm Audio', 'Lightning', 'Thunderbolt', 'DisplayPort'
      ],
    },
    {
      code: 'battery_life',
      name: 'Battery Life',
      type: AttributeType.NUMBER,
      group: 'technical',
      sortOrder: 4,
      unit: 'hours',
      helpText: 'Battery life in hours of typical use',
    },
    {
      code: 'screen_size',
      name: 'Screen Size',
      type: AttributeType.DECIMAL,
      group: 'technical',
      isFilterable: true,
      sortOrder: 5,
      unit: 'inches',
    },
    {
      code: 'resolution',
      name: 'Resolution',
      type: AttributeType.SELECT,
      group: 'technical',
      isFilterable: true,
      sortOrder: 6,
      options: [
        'HD (720p)', 'Full HD (1080p)', '2K', '4K', '5K', '8K',
        '1024x768', '1280x720', '1920x1080', '2560x1440', '3840x2160'
      ],
    },
    {
      code: 'processor',
      name: 'Processor',
      type: AttributeType.TEXT,
      group: 'technical',
      isSearchable: true,
      sortOrder: 7,
      placeholder: 'e.g., Intel Core i7-12700K',
    },
    {
      code: 'memory_ram',
      name: 'RAM',
      type: AttributeType.SELECT,
      group: 'technical',
      isFilterable: true,
      sortOrder: 8,
      options: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'],
    },
    {
      code: 'storage_capacity',
      name: 'Storage Capacity',
      type: AttributeType.SELECT,
      group: 'technical',
      isFilterable: true,
      sortOrder: 9,
      options: [
        '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', 
        '1TB', '2TB', '4TB', '8TB', '16TB'
      ],
    },

    // ========== FEATURES ==========
    {
      code: 'water_resistance',
      name: 'Water Resistance',
      type: AttributeType.SELECT,
      group: 'features',
      isFilterable: true,
      isComparable: true,
      sortOrder: 1,
      options: [
        'None', 'Water Repellent', 'IPX4', 'IPX5', 'IPX6', 
        'IPX7', 'IPX8', 'IP65', 'IP67', 'IP68'
      ],
    },
    {
      code: 'is_wireless',
      name: 'Wireless',
      type: AttributeType.BOOLEAN,
      group: 'features',
      isFilterable: true,
      sortOrder: 2,
      defaultValue: 'false',
    },
    {
      code: 'is_rechargeable',
      name: 'Rechargeable',
      type: AttributeType.BOOLEAN,
      group: 'features',
      isFilterable: true,
      sortOrder: 3,
      defaultValue: 'false',
    },
    {
      code: 'is_eco_friendly',
      name: 'Eco-Friendly',
      type: AttributeType.BOOLEAN,
      group: 'features',
      isFilterable: true,
      sortOrder: 4,
      helpText: 'Made from sustainable or recycled materials',
    },
    {
      code: 'smart_features',
      name: 'Smart Features',
      type: AttributeType.MULTISELECT,
      group: 'features',
      isFilterable: true,
      sortOrder: 5,
      options: [
        'Voice Control', 'App Control', 'Remote Control', 'Touch Control',
        'AI Powered', 'IoT Enabled', 'Alexa Compatible', 'Google Home Compatible',
        'HomeKit Compatible', 'IFTTT Support'
      ],
    },
    {
      code: 'special_features',
      name: 'Special Features',
      type: AttributeType.TEXTAREA,
      group: 'features',
      sortOrder: 6,
      placeholder: 'List any special features...',
    },

    // ========== COMPLIANCE & CERTIFICATIONS ==========
    {
      code: 'warranty_period',
      name: 'Warranty Period',
      type: AttributeType.SELECT,
      group: 'compliance',
      isFilterable: true,
      isComparable: true,
      sortOrder: 1,
      options: [
        'No Warranty', '30 Days', '90 Days', '6 Months', 
        '1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'
      ],
    },
    {
      code: 'certifications',
      name: 'Certifications',
      type: AttributeType.MULTISELECT,
      group: 'compliance',
      isFilterable: true,
      sortOrder: 2,
      options: [
        'CE', 'FCC', 'RoHS', 'Energy Star', 'UL Listed', 'ETL', 
        'ISO 9001', 'ISO 14001', 'Fair Trade', 'Organic', 'GOTS',
        'FSC Certified', 'OEKO-TEX', 'CPSC', 'FDA Approved'
      ],
    },
    {
      code: 'age_group',
      name: 'Age Group',
      type: AttributeType.SELECT,
      group: 'compliance',
      isFilterable: true,
      sortOrder: 3,
      options: [
        'All Ages', 'Adults', 'Teens', 'Kids', 'Toddlers', 'Infants',
        '3+', '6+', '8+', '12+', '14+', '16+', '18+'
      ],
    },
    {
      code: 'safety_warnings',
      name: 'Safety Warnings',
      type: AttributeType.TEXTAREA,
      group: 'compliance',
      sortOrder: 4,
      placeholder: 'Any safety warnings or precautions',
    },

    // ========== CARE & MAINTENANCE ==========
    {
      code: 'care_instructions',
      name: 'Care Instructions',
      type: AttributeType.MULTISELECT,
      group: 'care',
      sortOrder: 1,
      options: [
        'Machine Washable', 'Hand Wash Only', 'Dry Clean Only', 
        'Do Not Wash', 'Cold Water Only', 'No Bleach', 'No Tumble Dry',
        'Iron Low Heat', 'Do Not Iron', 'Professional Clean Only'
      ],
    },
    {
      code: 'maintenance_schedule',
      name: 'Maintenance Schedule',
      type: AttributeType.TEXT,
      group: 'care',
      sortOrder: 2,
      placeholder: 'e.g., Oil every 3 months',
    },
    {
      code: 'expected_lifespan',
      name: 'Expected Lifespan',
      type: AttributeType.SELECT,
      group: 'care',
      sortOrder: 3,
      options: [
        'Single Use', '< 1 Year', '1-2 Years', '2-5 Years', 
        '5-10 Years', '10-20 Years', '20+ Years', 'Lifetime'
      ],
    },

    // ========== SHIPPING & PACKAGING ==========
    {
      code: 'package_contents',
      name: 'Package Contents',
      type: AttributeType.TEXTAREA,
      group: 'shipping',
      sortOrder: 1,
      placeholder: 'List all items included in the package',
    },
    {
      code: 'package_type',
      name: 'Package Type',
      type: AttributeType.SELECT,
      group: 'shipping',
      sortOrder: 2,
      options: [
        'Box', 'Bag', 'Blister Pack', 'Bulk', 'Clamshell', 
        'Envelope', 'Pallet', 'Tube', 'Wrapped'
      ],
    },
    {
      code: 'is_fragile',
      name: 'Fragile',
      type: AttributeType.BOOLEAN,
      group: 'shipping',
      sortOrder: 3,
      helpText: 'Requires careful handling during shipping',
    },
    {
      code: 'ships_from',
      name: 'Ships From',
      type: AttributeType.TEXT,
      group: 'shipping',
      sortOrder: 4,
      placeholder: 'e.g., New York, USA',
    },
    {
      code: 'assembly_required',
      name: 'Assembly Required',
      type: AttributeType.BOOLEAN,
      group: 'shipping',
      isFilterable: true,
      sortOrder: 5,
      defaultValue: 'false',
    },
    {
      code: 'assembly_time',
      name: 'Assembly Time',
      type: AttributeType.SELECT,
      group: 'shipping',
      sortOrder: 6,
      options: [
        'No Assembly', '< 15 minutes', '15-30 minutes', 
        '30-60 minutes', '1-2 hours', '2+ hours', 'Professional Required'
      ],
    },
  ];

  // Create attributes
  for (const attrData of attributesData) {
    let attribute = await attributeRepository.findOne({ 
      where: { code: attrData.code } 
    });

    if (!attribute) {
      const { group: groupCode, options, validationRules, ...attributeFields } = attrData;
      
      // Properly type the validation rules
      const typedValidationRules = validationRules as ValidationRule[] | undefined;
      
      attribute = attributeRepository.create({
        ...attributeFields,
        groupId: savedGroups[groupCode]?.id || null,
        validationRules: typedValidationRules || null,
      });
      
      attribute = await attributeRepository.save(attribute);
      console.log(`  ✅ Created attribute: ${attribute.name}`);

      // Create options if it's a select/multiselect type
      if (options && (attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT)) {
        for (let i = 0; i < options.length; i++) {
          const optionValue = options[i];
          let option = await optionRepository.findOne({
            where: { 
              attributeId: attribute.id,
              value: optionValue 
            }
          });

          if (!option) {
            option = optionRepository.create({
              attributeId: attribute.id,
              value: optionValue,
              label: optionValue,
              sortOrder: i + 1,
            });
            await optionRepository.save(option);
          }
        }
        console.log(`    → Added ${options.length} options for ${attribute.name}`);
      }
    } else {
      console.log(`  ⏭️  Attribute already exists: ${attribute.name}`);
    }
  }

  console.log('✅ Attribute seeding completed!');
  
  // Display summary
  const totalAttributes = await attributeRepository.count();
  const totalGroups = await groupRepository.count();
  const totalOptions = await optionRepository.count();
  
  console.log('\n📊 Summary:');
  console.log(`  • ${totalGroups} attribute groups`);
  console.log(`  • ${totalAttributes} attributes`);
  console.log(`  • ${totalOptions} attribute options`);
}