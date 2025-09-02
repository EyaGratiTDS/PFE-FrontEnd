import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FaPlus,
  FaFilter,
  FaTimes,
  FaChartLine,
  FaFileExport,
} from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import PixelItem from '../../cards/PixelItem';
import EmptyState from '../../cards/EmptyState';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import FilterCardPixels from '../../cards/FilterCardPixels';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pixelService, limitService } from '../../services/api';
import { Pixel } from '../../services/Pixel';
import ExportMenu from '../../cards/ExportMenu'; 
import Pagination from '../../atoms/Pagination/Pagination';

// Utility functions moved outside component to prevent recreation on each render
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

interface FilterState {
  status: 'all' | 'active' | 'inactive';
  dateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

const PixelPage: React.FC = () => {
  // State management
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: 'all',
    dateRange: {
      start: undefined,
      end: undefined
    }
  });

  // Refs
  const navigate = useNavigate();
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);

  // Constants
  const cardsPerPage = 12;

  // Get current user from localStorage (memoized)
  const currentUser = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  // Filter and search logic (memoized)
  const filteredPixels = useMemo(() => {
    let filtered = [...pixels];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pixel =>
        pixel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(pixel =>
        pixel.is_active === (activeFilters.status === 'active')
      );
    }

    // Apply date range filter
    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(pixel => {
        const pixelDate = new Date(pixel.created_at);
        const start = activeFilters.dateRange.start || new Date(0);
        const end = activeFilters.dateRange.end || new Date();
        return pixelDate >= start && pixelDate <= end;
      });
    }

    return filtered;
  }, [pixels, searchTerm, activeFilters]);

  // Pagination logic (memoized)
  const paginationData = useMemo(() => {
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = filteredPixels.slice(indexOfFirstCard, indexOfLastCard);
    const totalPages = Math.ceil(filteredPixels.length / cardsPerPage);
    
    return { currentCards, totalPages };
  }, [filteredPixels, currentPage, cardsPerPage]);

  // Check if filters are active (memoized)
  const hasActiveFilters = useMemo(() => {
    return activeFilters.status !== 'all' ||
           activeFilters.dateRange.start !== undefined ||
           activeFilters.dateRange.end !== undefined ||
           searchTerm.trim() !== '';
  }, [activeFilters, searchTerm]);

  // Initialize data on mount - SOLUTION PRINCIPALE POUR ÉVITER DOUBLE RELOAD
  useEffect(() => {
    if (!currentUser?.id || initializationRef.current) return;
    
    initializationRef.current = true;

    const initializeData = async () => {
      try {
        setLoading(true);

        // Fetch plan limit et pixels en parallèle
        const [limitResponse, pixelsResponse] = await Promise.all([
          limitService.checkPixelLimit().catch(err => {
            console.error('Error fetching plan limits:', err);
            return { max: 1 };
          }),
          pixelService.getUserPixels(currentUser.id).catch(err => {
            console.error('Error fetching pixels:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load pixels';
            toast.error(errorMessage);
            return [];
          })
        ]);

        // Set plan limit
        const planLimit = limitResponse.max === -1 ? Infinity : limitResponse.max;
        
        // Process pixels response
        let pixels: Pixel[] = [];
        if (Array.isArray(pixelsResponse)) {
          pixels = pixelsResponse;
        } else if (pixelsResponse && Array.isArray(pixelsResponse.data)) {
          pixels = pixelsResponse.data;
        } else if (pixelsResponse && Array.isArray(pixelsResponse.pixels)) {
          pixels = pixelsResponse.pixels;
        } else if (pixelsResponse === null || pixelsResponse === undefined) {
          pixels = [];
        } else {
          console.warn('Unexpected response format:', pixelsResponse);
          pixels = [];
        }

        // Sort and format pixels
        const sortedPixels = pixels
          .sort((a: Pixel, b: Pixel) => 
            new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
          )
          .map((pixel: Pixel, index: number) => ({
            ...pixel,
            isDisabled: planLimit !== Infinity && index >= planLimit
          }));

        setPixels(sortedPixels);
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error('Failed to load data');
        setPixels([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentUser?.id]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: any) => {
    setActiveFilters(prev => ({ 
      ...prev, 
      [filterType]: value 
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setActiveFilters({
      status: 'all',
      dateRange: { start: undefined, end: undefined }
    });
    setSearchTerm('');
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // Handle pixel creation
  const handleCreatePixel = useCallback(async () => {
    try {
      const { current, max } = await limitService.checkPixelLimit();
      if (max !== -1 && current >= max) {
        const message = max === 0 
          ? 'Pixel creation is not available on the Free plan. Upgrade to create pixels.'
          : `You've reached the maximum of ${max} Pixels. Upgrade your plan to create more.`;
        toast.warning(message);
      } else {
        navigate('/admin/pixel/create');
      }
    } catch (error) {
      toast.error('Error checking plan limits. Please try again.');
    }
  }, [navigate]);

  // Handle pixel deletion
  const handleDeletePixel = useCallback(async (pixelId: string) => {
    try {
      const result = await pixelService.delete(pixelId);
      if (result?.success) {
        toast.success('Pixel deleted successfully');
        // Update pixels state directly instead of refetching
        setPixels(prev => prev.filter(pixel => pixel.id !== pixelId));
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error: any) {
      console.error('Error deleting pixel:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete pixel';
      toast.error(errorMessage);
    }
  }, []);

  // Handle export
  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    if (filteredPixels.length === 0) {
      toast.warning('No pixels to export');
      return;
    }

    setExporting(true);
    try {
      const exportData = filteredPixels.map(pixel => ({
        id: pixel.id,
        name: pixel.name,
        is_active: pixel.is_active ? 'Active' : 'Inactive',
        vcard_name: pixel.vcard?.name || 'Not associated',
        created_at: new Date(pixel.created_at).toLocaleDateString()
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `pixels_export_${timestamp}`;

      if (format === 'csv') {
        exportToCSV(exportData, fileName);
        toast.success('Pixels exported to CSV successfully!');
      } else {
        exportToJSON(exportData, fileName);
        toast.success('Pixels exported to JSON successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export pixels');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  }, [filteredPixels]);

  // Handle click outside for menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Handle export menu
      if (
        exportMenuRef.current &&
        exportButtonRef.current &&
        !exportMenuRef.current.contains(target) &&
        !exportButtonRef.current.contains(target)
      ) {
        setShowExportMenu(false);
      }

      // Handle filter menu
      if (
        filterMenuRef.current &&
        filterButtonRef.current &&
        !filterMenuRef.current.contains(target) &&
        !filterButtonRef.current.contains(target)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />

      <div className="mb-6 w-full max-w-3xl pl-6">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: "/admin/pixel" }}
            active={true}
            className="text-sm font-medium text-primary"
          >
            Tracking Pixels
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pixels Manager</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            Track user interactions and analytics
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search pixels..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            {/* Export Button */}
            <div className="relative overflow-visible" ref={exportButtonRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || filteredPixels.length === 0}
              >
                <FaFileExport className={`text-purple-500 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
              </button>

              {showExportMenu && (
                <div ref={exportMenuRef}>
                  <ExportMenu 
                    onExport={handleExport} 
                    exporting={exporting} 
                  />
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative overflow-visible">
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

              {/* Filter Menu */}
              {showFilterMenu && (
                <FilterCardPixels
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                />
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreatePixel}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base relative"
            >
              <FaPlus className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none sm:mr-2 w-10" />
              <span className="hidden xs:inline sm:ml-0">Create Pixel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {activeFilters.status !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Status: {activeFilters.status.charAt(0).toUpperCase() + activeFilters.status.slice(1)}
            </span>
          )}
          {(activeFilters.dateRange.start || activeFilters.dateRange.end) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              Date:
              {activeFilters.dateRange.start && ` From ${activeFilters.dateRange.start.toLocaleDateString()}`}
              {activeFilters.dateRange.end && ` To ${activeFilters.dateRange.end.toLocaleDateString()}`}
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Search: "{searchTerm}"
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
          >
            <FaTimes className="mr-1" /> Clear all
          </button>
        </div>
      )}

      {/* Content */}
      {filteredPixels.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {paginationData.currentCards.map(pixel => (
                <PixelItem
                  key={pixel.id}
                  pixel={pixel}
                  onDelete={() => handleDeletePixel(pixel.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {paginationData.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={hasActiveFilters 
            ? "No pixels match your filters" 
            : "No pixels yet"}
          description={hasActiveFilters
            ? "Try adjusting your search or filters"
            : "Get started by creating your first Pixel"}
          actionText="Create Pixel"
          actionLink="/admin/pixel/create"
          icon={<FaChartLine size={40} />}
        />
      )}
    </div>
  );
};

export default PixelPage;