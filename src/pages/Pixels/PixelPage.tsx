import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaFilter,
  FaAngleLeft,
  FaAngleRight,
  FaTimes,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import PixelItem from '../../cards/PixelItem';
import EmptyState from '../../cards/EmptyState';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pixelService, limitService } from '../../services/api';
import { Pixel } from '../../services/Pixel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PixelPage: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPixels, setFilteredPixels] = useState<Pixel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigate = useNavigate();
  const [currentPlanLimit, setCurrentPlanLimit] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    dateRange: {
      start: undefined as Date | undefined,
      end: undefined as Date | undefined
    }
  });
  const cardsPerPage = 12;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const fetchPlanLimit = async () => {
      try {
        const { max } = await limitService.checkVcardLimit();
        setCurrentPlanLimit(max === -1 ? Infinity : max);
      } catch (error) {
        console.error('Error fetching plan limits:', error);
      }
    };
    fetchPlanLimit();
  }, []);

  const fetchPixels = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await pixelService.getUserPixels(currentUser.id);

      const formattedPixels = response.pixels.map((pixel: Pixel, index: number) => ({
        ...pixel,
        isDisabled: currentPlanLimit !== Infinity && index >= currentPlanLimit
      }));

      setPixels(formattedPixels);
      setFilteredPixels(formattedPixels);
    } catch (err) {
      console.error('Error fetching pixels:', err);
      toast.error('Failed to load pixels');
      setPixels([]);
      setFilteredPixels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPixels();
  }, [currentUser, refreshTrigger, currentPlanLimit]);

  const applyFilters = () => {
    let filtered = [...pixels];

    filtered = filtered.filter(pixel =>
      pixel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(pixel =>
        pixel.is_active === (activeFilters.status === 'active')
      );
    }

    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(pixel => {
        const pixelDate = new Date(pixel.created_at);
        const start = activeFilters.dateRange.start || new Date(0);
        const end = activeFilters.dateRange.end || new Date();

        return pixelDate >= start && pixelDate <= end;
      });
    }

    setFilteredPixels(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, pixels, activeFilters]);

  const handleFilterChange = (filterType: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      dateRange: { start: undefined, end: undefined }
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return activeFilters.status !== 'all' ||
           activeFilters.dateRange.start !== undefined ||
           activeFilters.dateRange.end !== undefined;
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredPixels.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredPixels.length / cardsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCreatePixel = async () => {
    try {
      const { current, max } = await limitService.checkVcardLimit();
      if (max !== -1 && current >= max) {
        toast.warning(`You've reached the maximum of ${max} Pixels. Upgrade your plan.`);
      } else {
        navigate('/admin/pixel/create');
      }
    } catch (error) {
      toast.error('Error checking plan limits');
    }
  };

  const handleDeletePixel = async (pixelId: string) => {
    try {
      await pixelService.delete(pixelId);
      toast.success('Pixel deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to delete pixel');
    }
  };

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pixels Manager</h1>
          <p className="text-primary mt-2 text-sm">Track user interactions and analytics</p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search pixels..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                hasActiveFilters() ? 'border-red-500' : 'border-purple-500'
              } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <FaFilter className={hasActiveFilters() ? 'text-red-500' : 'text-purple-500'} />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 w-72 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setShowFilterMenu(false)}
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
                      value={activeFilters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="all" className="dark:bg-gray-800 dark:text-gray-300">All Statuses</option>
                      <option value="active" className="dark:bg-gray-800 dark:text-gray-300">Active</option>
                      <option value="inactive" className="dark:bg-gray-800 dark:text-gray-300">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Creation Date Range
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <DatePicker
                          selected={activeFilters.dateRange.start}
                          onChange={(date: Date | null) => handleFilterChange('dateRange', {
                            ...activeFilters.dateRange,
                            start: date || undefined
                          })}
                          selectsStart
                          startDate={activeFilters.dateRange.start}
                          endDate={activeFilters.dateRange.end}
                          maxDate={activeFilters.dateRange.end || new Date()}
                          placeholderText="Start date"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:[color-scheme:dark]"
                        />
                        <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                      <div className="relative">
                        <DatePicker
                          selected={activeFilters.dateRange.end}
                          onChange={(date: Date | null) => handleFilterChange('dateRange', {
                            ...activeFilters.dateRange,
                            end: date || undefined
                          })}
                          selectsEnd
                          startDate={activeFilters.dateRange.start}
                          endDate={activeFilters.dateRange.end}
                          minDate={activeFilters.dateRange.start}
                          placeholderText="End date"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:[color-scheme:dark]"
                        />
                        <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
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
            )}
          </div>

          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-10 sm:h-12"
            onClick={handleCreatePixel}
          >
            <FaPlus /> New Pixel
          </button>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {activeFilters.status !== 'all' && (
            <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Status: {activeFilters.status}
            </span>
          )}
          {(activeFilters.dateRange.start || activeFilters.dateRange.end) && (
            <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Date Range: {activeFilters.dateRange.start?.toLocaleDateString() || 'Any'} - {activeFilters.dateRange.end?.toLocaleDateString() || 'Any'}
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-sm text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTimes className="mr-1" /> Clear filters
          </button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence>
          {currentCards.map(pixel => (
            <PixelItem
              key={pixel.id}
              pixel={pixel}
              onDelete={() => handleDeletePixel(pixel.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredPixels.length === 0 && (
        <EmptyState
          title={searchTerm ? "No pixels found" : "No pixels created yet"}
          description={searchTerm ? "Try adjusting your search" : "Start tracking user interactions"}
          actionText="Create Pixel"
          actionLink="/admin/pixel/create"
          icon={<FaChartLine size={40} />}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <nav className="flex gap-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaAngleLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-8 h-8 rounded ${currentPage === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaAngleRight />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default PixelPage;