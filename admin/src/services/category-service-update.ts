// Add these methods to category.service.ts:

/**
 * Get categories with product counts
 * Uses the new PIM-compliant endpoint
 */
async getCategoriesWithCounts(): Promise<CollectionResponse<CategoryWithCounts>> {
  try {
    const response = await api.get('/categories/with-counts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories with counts:', error);
    throw error;
  }
}

/**
 * Get category statistics
 */
async getCategoryStats(): Promise<CategoryStats> {
  try {
    const response = await api.get('/categories/stats');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to fetch category stats:', error);
    throw error;
  }
}

/**
 * Get single category with count
 */
async getCategoryWithCounts(id: string): Promise<CategoryWithCounts> {
  try {
    const response = await api.get(`/categories/${id}/with-counts`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to fetch category with counts:', error);
    throw error;
  }
}

// Add these TypeScript interfaces:
export interface CategoryWithCounts extends Category {
  productCount: number;
  totalProductCount: number;
  children?: CategoryWithCounts[];
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalProducts: number;
  emptyCategories: number;
  topCategory?: {
    id: string;
    name: string;
    count: number;
  };
}
