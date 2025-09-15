export const productMapping = {
  properties: {
    id: { type: 'keyword' },
    sku: { 
      type: 'keyword',
      fields: {
        text: { type: 'text' }
      }
    },
    name: { 
      type: 'text',
      fields: {
        keyword: { type: 'keyword' },
        suggest: { type: 'completion' }
      }
    },
    description: { 
      type: 'text',
      analyzer: 'standard'
    },
    shortDescription: { type: 'text' },
    price: { type: 'float' },
    specialPrice: { type: 'float' },
    cost: { type: 'float' },
    quantity: { type: 'integer' },
    weight: { type: 'float' },
    status: { type: 'keyword' },
    isVisible: { type: 'boolean' },
    isFeatured: { type: 'boolean' },
    urlKey: { 
      type: 'keyword',
      fields: {
        text: { type: 'text' }
      }
    },
    metaTitle: { type: 'text' },
    metaDescription: { type: 'text' },
    categories: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        name: { type: 'keyword' },
        slug: { type: 'keyword' },
        level: { type: 'integer' }
      }
    },
    attributes: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        name: { type: 'keyword' },
        value: { 
          type: 'text',
          fields: {
            keyword: { type: 'keyword' }
          }
        },
        type: { type: 'keyword' },
        groupId: { type: 'keyword' },
        groupName: { type: 'keyword' }
      }
    },
    media: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        url: { type: 'keyword' },
        type: { type: 'keyword' },
        isPrimary: { type: 'boolean' }
      }
    },
    brand: { 
      type: 'keyword',
      fields: {
        text: { type: 'text' }
      }
    },
    manufacturer: { type: 'keyword' },
    tags: { type: 'keyword' },
    variantCount: { type: 'integer' },
    parentId: { type: 'keyword' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' }
  }
};
