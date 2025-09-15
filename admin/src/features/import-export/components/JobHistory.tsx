import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { importExportService } from '../../../services/import-export.service';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: string;
  type: 'import' | 'export';
  dataType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fileName?: string;
  format?: string;
  totalRecords?: number;
  processedRecords?: number;
  failedRecords?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

export default function JobHistory() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'import' | 'export'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [filter, statusFilter]);

  const loadJobs = async () => {
    try {
      const promises = [];
      
      if (filter === 'all' || filter === 'import') {
        promises.push(importExportService.getImportJobs({
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }));
      }
      
      if (filter === 'all' || filter === 'export') {
        promises.push(importExportService.getExportJobs({
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }));
      }

      const results = await Promise.all(promises);
      const allJobs: Job[] = [];
      
      results.forEach((response, index) => {
        if (response.success && response.data.items) {
          const jobType = (filter === 'export' || (filter === 'all' && index === 1)) ? 'export' : 'import';
          allJobs.push(...response.data.items.map((job: any) => ({
            ...job,
            type: jobType,
          })));
        }
      });

      // Sort by creation date
      allJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (job: Job) => {
    try {
      if (job.type === 'import') {
        await importExportService.cancelImportJob(job.id);
      } else {
        await importExportService.cancelExportJob(job.id);
      }
      loadJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const downloadExport = async (jobId: string) => {
    try {
      await importExportService.downloadExport(jobId);
    } catch (error) {
      console.error('Failed to download export:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Jobs
          </button>
          <button
            onClick={() => setFilter('import')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'import'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Imports
          </button>
          <button
            onClick={() => setFilter('export')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'export'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Exports
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(job.status)}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {job.type === 'import' ? 'Import' : 'Export'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{job.dataType}</div>
                  {job.fileName && (
                    <div className="text-xs text-gray-500">{job.fileName}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(job.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {job.totalRecords ? (
                    <div className="text-sm text-gray-900">
                      {job.processedRecords || 0} / {job.totalRecords}
                      {job.failedRecords ? (
                        <span className="text-red-600 ml-2">
                          ({job.failedRecords} failed)
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </div>
                  {job.createdBy && (
                    <div className="text-xs text-gray-500">{job.createdBy.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {job.type === 'export' && job.status === 'completed' && (
                      <button
                        onClick={() => downloadExport(job.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    )}
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <button
                        onClick={() => cancelJob(job)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No jobs found</p>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedJob(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Job Details
                </h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">ID:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedJob.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedJob.type}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Data Type:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedJob.dataType}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedJob.status)}</span>
                  </div>
                  {selectedJob.error && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Error:</span>
                      <p className="mt-1 text-sm text-red-600">{selectedJob.error}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
