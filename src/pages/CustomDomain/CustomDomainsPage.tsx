import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
  FaPlus,
  FaTimes,
  FaAngleLeft,
  FaAngleRight,
  FaGlobe,
  FaFilter,
  FaFileExport,
  FaFileCsv,
  FaFileCode,
  FaCalendarAlt
} from 'react-icons/fa';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customDomainService } from '../../services/api';
import { CustomDomain } from '../../services/CustomDomain';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import EmptyState from '../../cards/EmptyState';
import CustomDomainCard from '../../cards/CustomDomainCard';

const downloadFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToCSV = (data: any[], fileName: string) => {
  try {
    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] === null || row[header] === undefined ? '' : row[header];
        const escaped = (`${value}`)
          .replace(/"/g, '""')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${fileName}.csv`);
    return true;
  } catch (error) {
    console.error('CSV conversion error:', error);
    throw new Error('Failed to generate CSV file');
  }
};

const exportToJSON = (data: any[], fileName: string) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    downloadFile(blob, `${fileName}.json`);
    return true;
  } catch (error) {
    console.error('JSON conversion error:', error);
    throw new Error('Failed to generate JSON file');
  }
};

interface FilterCardProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  createdAtStart: string;
  setCreatedAtStart: (value: string) => void;
  createdAtEnd: string;
  setCreatedAtEnd: (value: string) => void;
  resetFilters: () => void;
  onClose: () => void;
  statusOptions: Array<{ value: string; label: string }>;
}

const FilterCard = forwardRef<HTMLDivElement, FilterCardProps>(
  (
    {
      statusFilter,
      setStatusFilter,
      createdAtStart,
      setCreatedAtStart,
      createdAtEnd,
      setCreatedAtEnd,
      resetFilters,
      onClose,
      statusOptions
    },
    ref
  ) => {
    return (
      <div 
        ref={ref}
        className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 w-72 p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:[color-scheme:dark]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-gray-800 dark:text-gray-300">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 items-center">
              <FaCalendarAlt className="mr-2" /> Created At
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={createdAtStart}
                  onChange={(e) => setCreatedAtStart(e.target.value)}
                  max={createdAtEnd || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={createdAtEnd}
                  onChange={(e) => setCreatedAtEnd(e.target.value)}
                  min={createdAtStart}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetFilters}
              className="w-full bg-red-100 dark:bg-gray-700 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
            >
              <FaTimes className="mr-2" /> Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  }
);

FilterCard.displayName = "FilterCard";

const CustomDomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDomains, setFilteredDomains] = useState<CustomDomain[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createdAtStart, setCreatedAtStart] = useState<string>('');
  const [createdAtEnd, setCreatedAtEnd] = useState<string>('');
  const navigate = useNavigate();
  const domainsPerPage = 12;
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterCardRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'failed', label: 'Failed' },
    { value: 'disabled', label: 'Disabled' }
  ];

  const fetchCustomDomains = async () => {
    try {
      setLoading(true);
      const domainsData = await customDomainService.getUserDomains();
      setDomains(domainsData);
    } catch (error) {
      console.error('Error fetching custom domains:', error);
      toast.error('Error loading domains');
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomDomains();
  }, []);

  useEffect(() => {
    let result = domains;
    
    if (searchTerm) {
      result = result.filter(domain =>
        domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(domain => domain.status === statusFilter);
    }
    
    if (createdAtStart) {
      const startDate = new Date(createdAtStart);
      result = result.filter(domain => {
        const domainDate = new Date(domain.created_at);
        return domainDate >= startDate;
      });
    }
    
    if (createdAtEnd) {
      const endDate = new Date(createdAtEnd);
      endDate.setDate(endDate.getDate() + 1);
      result = result.filter(domain => {
        const domainDate = new Date(domain.created_at);
        return domainDate < endDate;
      });
    }
    
    setFilteredDomains(result);
    setCurrentPage(1);
  }, [domains, searchTerm, statusFilter, createdAtStart, createdAtEnd]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      try {
        await customDomainService.delete(id);
        toast.success('Domain deleted successfully');
        fetchCustomDomains();
      } catch (error) {
        console.error('Error deleting domain:', error);
        toast.error('Failed to delete domain');
      }
    }
  };

  const handleVerify = async (id: number) => {
    try {
      const response = await customDomainService.verify(id);
      toast.success(response.message || 'Domain verified successfully');
      fetchCustomDomains();
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      toast.error(error.response?.data?.message || 'Failed to verify domain');
    }
  };

  const indexOfLastDomain = currentPage * domainsPerPage;
  const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
  const currentDomains = filteredDomains.slice(indexOfFirstDomain, indexOfLastDomain);
  const totalPages = Math.ceil(filteredDomains.length / domainsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCreatedAtStart('');
    setCreatedAtEnd('');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || createdAtStart || createdAtEnd;

  const breadcrumbLinks = [
    { name: "Custom Domains", path: "/admin/custom-domains" },
  ];

  const handleExport = async (format: 'csv' | 'json') => {
    if (filteredDomains.length === 0) {
      toast.warning('No domains to export');
      return;
    }

    setExporting(true);
    try {
      const exportData = filteredDomains.map(domain => ({
        id: domain.id,
        domain: domain.domain,
        status: domain.status,
        vcard: domain.vcard?.name || 'Not associated',
        created_at: domain.created_at || 'N/A'
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `domains_export_${timestamp}`;

      if (format === 'csv') {
        exportToCSV(exportData, fileName);
        toast.success('Domains exported to CSV successfully!');
      } else {
        exportToJSON(exportData, fileName);
        toast.success('Domains exported to JSON successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export domains');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (showExportMenu) {
        if (
          !exportButtonRef.current?.contains(target) && 
          !exportMenuRef.current?.contains(target)
        ) {
          setShowExportMenu(false);
        }
      }

      if (showFilterMenu) {
        if (
          !filterButtonRef.current?.contains(target) && 
          !filterCardRef.current?.contains(target)
        ) {
          setShowFilterMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu, showExportMenu]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Breadcrumb className="mb-4 sm:mb-6">
        {breadcrumbLinks.map((link, index) => (
          <Breadcrumb.Item
            key={index}
            linkAs={Link}
            linkProps={{ to: link.path }}
            active={index === breadcrumbLinks.length - 1}
            className={`text-sm font-medium ${index === breadcrumbLinks.length - 1 ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
          >
            {index < breadcrumbLinks.length - 1 ? (
              <div className="flex items-center">
                {link.name}
                <FiChevronRight className="mx-2 text-gray-400" size={14} />
              </div>
            ) : (
              link.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Custom Domains</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your custom domains and associations
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search domains..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto relative">
            <div className="relative" ref={exportButtonRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || filteredDomains.length === 0}
              >
                <FaFileExport className={`text-purple-500 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
              </button>

              {showExportMenu && (
                <div
                  ref={exportMenuRef}
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => handleExport('csv')}
                      disabled={exporting}
                    >
                      <FaFileCsv className="text-green-500" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => handleExport('json')}
                      disabled={exporting}
                    >
                      <FaFileCode className="text-blue-500" />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                ref={filterButtonRef}
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                  hasActiveFilters
                    ? 'border-red-500'
                    : 'border-purple-500'
                } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={
                  hasActiveFilters
                    ? 'text-red-500'
                    : 'text-purple-500'
                } />
              </button>

              {showFilterMenu && (
                <FilterCard
                  ref={filterCardRef}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  createdAtStart={createdAtStart}
                  setCreatedAtStart={setCreatedAtStart}
                  createdAtEnd={createdAtEnd}
                  setCreatedAtEnd={setCreatedAtEnd}
                  resetFilters={resetAllFilters}
                  onClose={() => setShowFilterMenu(false)}
                  statusOptions={statusOptions}
                />
              )}
            </div>

            <button
              onClick={() => navigate('/admin/custom-domains/create')}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base relative"
            >
              <FaPlus className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none sm:mr-2 w-10" />
              <span className="hidden xs:inline sm:ml-0">Add Domain</span>
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Status: {statusOptions.find(o => o.value === statusFilter)?.label}
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Search: "{searchTerm}"
            </span>
          )}
          {createdAtStart && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <FaCalendarAlt className="mr-1" /> From: {new Date(createdAtStart).toLocaleDateString()}
            </span>
          )}
          {createdAtEnd && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <FaCalendarAlt className="mr-1" /> To: {new Date(createdAtEnd).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
          >
            <FaTimes className="mr-1" /> Clear all
          </button>
        </div>
      )}

      {filteredDomains.length > 0 ? (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {currentDomains.map((domain) => (
                <CustomDomainCard
                  key={domain.id}
                  domain={domain}
                  onDelete={handleDelete}
                  onVerify={handleVerify}
                  onRefresh={fetchCustomDomains}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md flex items-center justify-center ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <FaAngleLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`w-8 h-8 text-sm rounded-md flex items-center justify-center ${
                        currentPage === pageNumber
                          ? 'bg-primary text-white font-medium'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md flex items-center justify-center ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <FaAngleRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={hasActiveFilters
            ? "No domains match your criteria"
            : "No custom domains yet"}
          description={hasActiveFilters
            ? "Try adjusting your search or filters"
            : "Get started by adding your first custom domain"}
          actionText="Add Domain"
          actionLink="/admin/custom-domains/create"
          icon={<FaGlobe />}
        />
      )}
    </div>
  );
};

export default CustomDomainsPage;