import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import attributeService, { Attribute, AttributeType } from '../../services/attribute.service';
import Pagination from '../../components/common/Pagination';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

export default function AttributeList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Filter state
  const [selectedType, setSelectedType] = useState<AttributeType | ''>('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // Pagination state - Initialize from URL params or defaults
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // Changed from 20 to 10 for consistency

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    setSearchParams(params, { replace: true });
  }, [currentPage]);

  // Fetch attributes when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttributes();
    }, searchQuery === searchInput ? 0 : 300); // Debounce search
    
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedType, selectedGroup]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as 'DESC',
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(selectedType && { type: selectedType }),
        ...(selectedGroup && { groupId: selectedGroup })
      };
      
      const response = await attributeService.getAttributes(params);
      setAttributes(response.items);
      
      // Update pagination info
      if (response.meta) {
        setTotalPages(response.meta.totalPages || 1);
        setTotalItems(response.meta.totalItems || response.items.length);
        
        // Reset to page 1 if current page is out of bounds
        if (currentPage > response.meta.totalPages && response.meta.totalPages > 0) {
          setCurrentPage(1);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch attributes:', err);
      setError('Failed to load attributes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (value !== searchQuery) {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on search
    }
  };

  const handleTypeChange = (type: AttributeType | '') => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the attribute "${name}"? This action cannot be undone.`)) {
      try {
        await attributeService.deleteAttribute(id);
        setSuccessMessage(`Attribute "${name}" deleted successfully.`);
        fetchAttributes();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Failed to delete attribute:', err);
        setError('Failed to delete attribute. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const getTypeBadge = (type: AttributeType) => {
    const colors: Record<AttributeType, string> = {
      [AttributeType.TEXT]: 'bg-blue-100 text-blue-800',
      [AttributeType.NUMBER]: 'bg-green-100 text-green-800',
      [AttributeType.DECIMAL]: 'bg-green-100 text-green-800',
      [AttributeType.INTEGER]: 'bg-green-100 text-green-800',
      [AttributeType.BOOLEAN]: 'bg-purple-100 text-purple-800',
      [AttributeType.SELECT]: 'bg-indigo-100 text-indigo-800',
      [AttributeType.MULTISELECT]: 'bg-indigo-100 text-indigo-800',
      [AttributeType.DATE]: 'bg-yellow-100 text-yellow-800',
      [AttributeType.DATETIME]: 'bg-yellow-100 text-yellow-800',
      [AttributeType.PRICE]: 'bg-emerald-100 text-emerald-800',
      [AttributeType.URL]: 'bg-cyan-100 text-cyan-800',
      [AttributeType.EMAIL]: 'bg-pink-100 text-pink-800',
      [AttributeType.JSON]: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {attributeService.getAttributeTypeIcon(type)} {attributeService.getAttributeTypeLabel(type)}
      </span>
    );
  };

  const getFeatureBadges = (attr: Attribute) => {
    const badges = [];
    
    if (attr.isRequired) {
      badges.push(
        <span key="required" className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded" title="Required">
          Required
        </span>
      );
    }
    
    if (attr.isFilterable) {
      badges.push(
        <span key="filterable" className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded" title="Filterable">
          <FunnelIcon className="w-3 h-3 inline" /> Filter
        </span>
      );
    }
    
    if (attr.isSearchable) {
      badges.push(
        <span key="searchable" className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded" title="Searchable">
          <MagnifyingGlassIcon className="w-3 h-3 inline" /> Search
        </span>
      );
    }
    
    return badges.length > 0 ? <div className="flex gap-1">{badges}</div> : null;
  };

  if (loading && attributes.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading attributes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Attributes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage product attributes and specifications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/attributes/groups')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <FolderIcon className="w-4 h-4" />
              Manage Groups
            </button>
            <button
              onClick={() => navigate('/attributes/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Attribute
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search attributes..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as AttributeType | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {Object.values(AttributeType).map(type => (
                <option key={type} value={type}>
                  {attributeService.getAttributeTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Results info */}
          {!loading && totalItems > 0 && (
            <div className="text-sm text-gray-600 flex items-center">
              {searchQuery && (
                <span className="mr-2">
                  Results for "{searchQuery}"
                </span>
              )}
              <span className="font-medium">{totalItems}</span> attributes found
            </div>
          )}
        </div>
      </div>

      {/* Table or Empty State */}
      {attributes.length === 0 && !loading ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? `No attributes found for "${searchQuery}"` 
              : selectedType 
                ? `No ${attributeService.getAttributeTypeLabel(selectedType)} attributes found`
                : 'No attributes found'
            }
          </p>
          <div className="flex gap-2 justify-center">
            {(searchQuery || selectedType) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setSelectedType('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => navigate('/attributes/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Your First Attribute
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Attributes Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attributes.map((attribute) => (
                  <tr key={attribute.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {attribute.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {attribute.code}
                        </div>
                        {attribute.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {attribute.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(attribute.type)}
                      {attribute.unit && (
                        <span className="ml-1 text-xs text-gray-500">({attribute.unit})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attribute.groupName || 
                       <span className="text-gray-400 italic">No group</span>}
                    </td>
                    <td className="px-6 py-4">
                      {getFeatureBadges(attribute)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attribute.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/attributes/${attribute.id}/edit`)}
                          className="p-1 text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {(attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) && (
                          <button
                            onClick={() => navigate(`/attributes/${attribute.id}/options`)}
                            className="p-1 text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Manage Options"
                          >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(attribute.id, attribute.name)}
                          className="p-1 text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        </>
      )}
    </div>
  );
}
