// Browser Console Debug Script for Category Tree
// Run this in browser console while on Category Management page

console.group('🔍 Category Tree Debug');

// Check if categoryService is available
if (window.categoryService || window.api) {
    console.log('✅ API service found');
} else {
    console.log('⚠️ Run this from the Category Management page');
}

// Function to analyze tree structure
function analyzeTreeStructure(tree, prefix = '') {
    if (!Array.isArray(tree)) {
        console.log(`${prefix}❌ Not an array:`, typeof tree);
        return;
    }
    
    console.log(`${prefix}📊 Level has ${tree.length} items`);
    
    tree.forEach((node, index) => {
        const hasChildren = node.children && node.children.length > 0;
        const icon = hasChildren ? '📁' : '📄';
        console.log(`${prefix}${icon} [${index}] ${node.name} (ID: ${node.id})`);
        
        if (node.parentId) {
            console.log(`${prefix}  └─ Parent: ${node.parentId}`);
        }
        
        if (hasChildren) {
            console.log(`${prefix}  └─ Has ${node.children.length} children:`);
            analyzeTreeStructure(node.children, prefix + '    ');
        }
    });
}

// Try to fetch and analyze the tree data
async function debugCategoryTree() {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        if (!token) {
            console.log('❌ No auth token found. Please login first.');
            return;
        }
        
        console.log('🔑 Auth token found');
        
        // Fetch categories list
        console.group('📋 Flat Categories List');
        const categoriesResponse = await fetch('http://localhost:3010/api/categories?limit=100', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const categoriesData = await categoriesResponse.json();
        console.log('Response structure:', Object.keys(categoriesData));
        
        if (categoriesData.data?.items) {
            console.log(`Found ${categoriesData.data.items.length} categories`);
            
            // Check parent-child relationships
            const hasParents = categoriesData.data.items.filter(c => c.parentId);
            console.log(`Categories with parents: ${hasParents.length}`);
            
            if (hasParents.length === 0) {
                console.warn('⚠️ No categories have parentId set - this is why tree is flat!');
            }
            
            // List parent-child relationships
            console.table(categoriesData.data.items.map(c => ({
                name: c.name,
                id: c.id.substring(0, 8) + '...',
                parentId: c.parentId ? c.parentId.substring(0, 8) + '...' : 'ROOT',
                level: c.level
            })));
        }
        console.groupEnd();
        
        // Fetch tree structure
        console.group('🌳 Tree Structure');
        const treeResponse = await fetch('http://localhost:3010/api/categories/tree', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const treeData = await treeResponse.json();
        console.log('Tree response structure:', Object.keys(treeData));
        
        if (treeData.success && treeData.data) {
            console.log('Tree data type:', typeof treeData.data);
            console.log('Tree data keys:', Object.keys(treeData.data));
            
            // Check if it's wrapped in items
            let tree = treeData.data.items || treeData.data;
            
            if (Array.isArray(tree)) {
                console.log(`Tree has ${tree.length} root nodes`);
                
                // Analyze tree structure
                analyzeTreeStructure(tree);
                
                // Check if children arrays exist
                const nodesWithChildren = tree.filter(n => n.children && n.children.length > 0);
                if (nodesWithChildren.length === 0) {
                    console.warn('⚠️ No nodes have children - tree is completely flat!');
                } else {
                    console.log(`✅ ${nodesWithChildren.length} nodes have children`);
                }
            } else {
                console.error('❌ Tree data is not an array:', tree);
            }
        }
        console.groupEnd();
        
    } catch (error) {
        console.error('❌ Error fetching data:', error);
    }
}

// Run the debug
debugCategoryTree();

console.groupEnd();

// Additional helper to check React component state
console.log('\n📝 To check React component state:');
console.log('1. Install React DevTools browser extension');
console.log('2. Select CategoryManagement component in React DevTools');
console.log('3. Check state.categoryTree value');
console.log('4. Check if expandedNodes Set has any entries');
