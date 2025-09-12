import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import attributeService, { Attribute, AttributeType } from '../../services/attribute.service';
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
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<AttributeType | ''>('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    fetchAttributes();
  }, [currentPage, searchTerm, selectedType, selectedGroup]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType }),
        ...(selectedGroup && { groupId: selectedGroup })
      };
      
      const response = await attributeService.getAttributes(params);
      setAttributes(response.items);
      setTotalPages(response.meta.totalPages || 1);
      setTotalItems(response.meta.totalItems || 0);
    } catch (err: any) {
      console.error('Failed to fetch attributes:', err);
      setError('Failed to load attributes. Please try again.');
    } finally {
      setLoading(false);
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
      [AttributeType.TEXT]: 'bg-primary-100 text-primary-800',
      [AttributeType.NUMBER]: 'bg-success-100 text-success-800',
      [AttributeType.DECIMAL]: 'bg-success-100 text-success-800',
      [AttributeType.INTEGER]: 'bg-success-100 text-success-800',
      [AttributeType.BOOLEAN]: 'bg-purple-100 text-purple-800',
      [AttributeType.SELECT]: 'bg-indigo-100 text-indigo-800',
      [AttributeType.MULTISELECT]: 'bg-indigo-100 text-indigo-800',
      [AttributeType.DATE]: 'bg-warning-100 text-warning-800',
      [AttributeType.DATETIME]: 'bg-warning-100 text-warning-800',
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
        <span key="required" className="px-2 py-0.5 text-xs bg-danger-100 text-danger-700 rounded" title="Required">
          Required
        </span>
      );
    }
    
    if (attr.isFilterable) {
      badges.push(
        <span key="filterable" className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded" title="Filterable">
          <FunnelIcon className="w-3 h-3 inline" /> Filter
        </span>
      );
    }
    
    if (attr.isSearchable) {
      badges.push(
        <span key="searchable" className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded" title="Searchable">
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
      <div className="mb-6 flex justify-between items-center">
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
            className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Attribute
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-success-50 border border-success-200 text-success-800 rounded-lg flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger-800 rounded-lg flex items-center gap-2">
          <XCircleIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as AttributeType | '')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Types</option>
          {Object.values(AttributeType).map(type => (
            <option key={type} value={type}>
              {attributeService.getAttributeTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {attributes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No attributes found</p>
          <button
            onClick={() => navigate('/attributes/new')}
            className="mt-4 px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800"
          >
            Create Your First Attribute
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code / Name
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {attribute.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {attribute.code}
                      </div>
                      {attribute.description && (
                        <div className="text-xs text-gray-400 mt-1">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getFeatureBadges(attribute)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attribute.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/attributes/${attribute.id}/edit`)}
                      className="text-primary-600 hover:text-primary-800 mr-3"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4 inline" />
                    </button>
                    {(attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) && (
                      <button
                        onClick={() => navigate(`/attributes/${attribute.id}/options`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Manage Options"
                      >
                        <AdjustmentsHorizontalIcon className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(attribute.id, attribute.name)}
                      className="text-danger-600 hover:text-danger-800"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{totalItems}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}