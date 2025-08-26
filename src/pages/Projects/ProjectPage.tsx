import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaFileExport,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import { FiChevronRight, FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { projectService, limitService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import { Project } from "../../services/Project";
import ProjectItem from '../../cards/ProjectItem';
import FilterCard, { ActiveFilters } from '../../cards/FilterProjectCard';
import EmptyState from '../../cards/EmptyState';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExportMenu from '../../cards/ExportMenu'; 
import Pagination from '../../atoms/Pagination/Pagination';

// Utility function for file download
const downloadFile = (blob: Blob, fileName: string): void => {
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

// Export to CSV function
const exportToCSV = (data: any[], fileName: string): boolean => {
  try {
    if (!data.length) return false;
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] ?? '';
        const escaped = String(value)
          .replace(/"/g, '""')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${fileName}.csv`);
    return true;
  } catch (error) {
    console.error('CSV conversion error:', error);
    throw new Error('Failed to generate CSV file');
  }
};

// Export to JSON function
const exportToJSON = (data: any[], fileName: string): boolean => {
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

interface User {
  id: string;
  [key: string]: any;
}

interface PlanLimit {
  current: number;
  max: number;
}

const ProjectPage: React.FC = () => {
  // State declarations
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPlanLimit, setCurrentPlanLimit] = useState<number>(1);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    color: 'all',
    dateRange: {
      start: undefined,
      end: undefined
    },
    search: ''
  });

  // Refs
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const cardsPerPage = 12;

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Failed to load user data');
      }
    }
  }, []);

  // Fetch plan limits
  useEffect(() => {
    const fetchPlanLimits = async () => {
      try {
        const projectLimit: PlanLimit = await limitService.checkProjectLimit();
        setCurrentPlanLimit(projectLimit.max === -1 ? Infinity : projectLimit.max);
      } catch (error) {
        console.error('Error fetching plan limits:', error);
        toast.error('Failed to load plan information');
      }
    };
    fetchPlanLimits();
  }, []);

  // Handle click outside for export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        exportButtonRef.current &&
        !exportMenuRef.current.contains(event.target as Node) &&
        !exportButtonRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle create button click with plan limit check
  const handleCreateClick = async () => {
    try {
      const { current, max }: PlanLimit = await limitService.checkProjectLimit();

      if (max !== -1 && current >= max) {
        toast.warning(`You've reached the maximum of ${max} Projects. Upgrade your plan to create more.`);
        return;
      }
      
      navigate('/admin/project/create');
    } catch (error) {
      console.error('Error checking Project limits:', error);
      toast.error('Error checking plan limits. Please try again.');
    }
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await projectService.getUserProjects(Number(currentUser.id));

      const projectsData = Array.isArray(response) ? response : response?.data || [];
      
      const sortedProjects = projectsData.sort((a: Project, b: Project) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateA - dateB; // Oldest first (ascending order)
      });

      const formattedProjects = sortedProjects.map((project: Project, index: number) => ({
        ...project,
        id: project.id || '',
        name: project.name || 'Untitled Project',
        description: project.description || '',
        logo: project.logo,
        color: project.color || '#4f46e5',
        status: project.status || 'active',
        isDisabled: currentPlanLimit !== Infinity && index >= currentPlanLimit
      }));

      const validProjects = formattedProjects.filter(Boolean);
      setProjects(validProjects);
      setFilteredProjects(validProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects when dependencies change
  useEffect(() => {
    fetchProjects();
  }, [currentUser, refreshTrigger, currentPlanLimit]);

  // Apply filters to projects
  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        (project.description && project.description.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(project => project.status === activeFilters.status);
    }

    // Color filter
    if (activeFilters.color !== 'all') {
      filtered = filtered.filter(project => project.color === activeFilters.color);
    }

    // Date range filter
    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(project => {
        if (!project.createdAt) return false;

        try {
          const projectDate = new Date(project.createdAt);
          if (isNaN(projectDate.getTime())) return false;

          const projectDateUTC = new Date(Date.UTC(
            projectDate.getUTCFullYear(),
            projectDate.getUTCMonth(),
            projectDate.getUTCDate()
          ));

          if (activeFilters.dateRange.start) {
            const startDate = new Date(Date.UTC(
              activeFilters.dateRange.start.getFullYear(),
              activeFilters.dateRange.start.getMonth(),
              activeFilters.dateRange.start.getDate()
            ));
            if (projectDateUTC < startDate) return false;
          }

          if (activeFilters.dateRange.end) {
            const endDate = new Date(Date.UTC(
              activeFilters.dateRange.end.getFullYear(),
              activeFilters.dateRange.end.getMonth(),
              activeFilters.dateRange.end.getDate() + 1
            ));
            if (projectDateUTC >= endDate) return false;
          }

          return true;
        } catch (e) {
          console.error('Invalid date format:', project.createdAt, e);
          return false;
        }
      });
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, projects, activeFilters]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof ActiveFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      color: 'all',
      dateRange: {
        start: undefined,
        end: undefined
      },
      search: ''
    });
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = (): boolean => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.color !== 'all' ||
      activeFilters.dateRange.start !== undefined ||
      activeFilters.dateRange.end !== undefined ||
      searchTerm.trim() !== ''
    );
  };

  // Pagination calculations
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredProjects.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredProjects.length / cardsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle export functionality
  const handleExport = async (format: 'csv' | 'json') => {
    if (exporting) return;

    try {
      if (filteredProjects.length === 0) {
        toast.warning('No Projects to export');
        return;
      }

      setExporting(true);
      setShowExportMenu(false);

      const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);

      const dataToExport = filteredProjects.map(project => ({
        Name: project.name,
        Description: project.description || '',
        Status: project.status.charAt(0).toUpperCase() + project.status.slice(1),
        Color: project.color,
        'Created Date': project.createdAt
          ? new Date(project.createdAt).toLocaleDateString()
          : 'N/A'
      }));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));

      const fileName = `projects_export_${new Date().toISOString().slice(0, 10)}`;
      let success = false;

      if (format === 'csv') {
        success = exportToCSV(dataToExport, fileName);
      } else {
        success = exportToJSON(dataToExport, fileName);
      }

      if (success) {
        toast.update(toastId, {
          render: `${format.toUpperCase()} export completed successfully!`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } else {
        throw new Error(`Failed to export as ${format.toUpperCase()}`);
      }

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Breadcrumb configuration
  const breadcrumbLinks = [
    { name: "Projects", path: "/projects" },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

      {/* Breadcrumb */}
      <Breadcrumb className="mb-4 sm:mb-6">
        {breadcrumbLinks.map((link, index) => (
          <Breadcrumb.Item
            key={index}
            linkAs={Link}
            linkProps={{ to: link.path }}
            active={index === breadcrumbLinks.length - 1}
            className={`text-sm font-medium ${
              index === breadcrumbLinks.length - 1 
                ? 'text-primary' 
                : 'text-gray-600 hover:text-primary'
            }`}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Projects</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            Manage and organize your development projects
          </p>
        </div>

        {/* Controls */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search Projects..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            {/* Export Button */}
            <div className="relative" ref={exportButtonRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || filteredProjects.length === 0}
              >
                <FaFileExport className={`text-purple-600 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
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
            <div className="relative">
              <button
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border transition-colors duration-200 ${
                  hasActiveFilters()
                    ? 'border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={`text-sm sm:text-base ${
                  hasActiveFilters()
                    ? 'text-red-500'
                    : 'text-purple-600'
                }`} />
              </button>

              {showFilterMenu && (
                <FilterCard
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                  filterConfig={[
                    {
                      type: 'select',
                      label: 'Status',
                      options: [
                        { value: 'all', label: 'All Statuses' },
                        { value: 'active', label: 'Active' },
                        { value: 'archived', label: 'Archived' },
                        { value: 'pending', label: 'Pending' }
                      ],
                      currentValue: activeFilters.status,
                      filterKey: 'status'
                    },
                    {
                      type: 'color',
                      label: 'Color',
                      options: [
                        { value: 'all', label: 'All Colors' },
                        { value: '#4f46e5', label: 'Indigo' },
                        { value: '#10b981', label: 'Emerald' },
                        { value: '#ef4444', label: 'Red' },
                        { value: '#f59e0b', label: 'Amber' }
                      ],
                      currentValue: activeFilters.color,
                      filterKey: 'color'
                    },
                    {
                      type: 'date',
                      label: 'Date Range',
                      currentValue: activeFilters.dateRange,
                      filterKey: 'dateRange'
                    }
                  ]}
                />
              )}
            </div>

            {/* Create Button */}
            <button
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base shadow-md hover:shadow-lg"
              onClick={handleCreateClick}
            >
              <FaPlus className="mr-2 text-sm sm:text-base" />
              <span className="hidden xs:inline">Create Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {activeFilters.status !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Status: {activeFilters.status.charAt(0).toUpperCase() + activeFilters.status.slice(1)}
            </span>
          )}
          {activeFilters.color !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Color: {activeFilters.color}
            </span>
          )}
          {(activeFilters.dateRange.start || activeFilters.dateRange.end) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              Date:
              {activeFilters.dateRange.start && ` From ${activeFilters.dateRange.start.toLocaleDateString()}`}
              {activeFilters.dateRange.end && ` To ${activeFilters.dateRange.end.toLocaleDateString()}`}
            </span>
          )}
          {searchTerm.trim() && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
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
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredProjects.length > 0 ? (
          <>
            {/* Project Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {currentCards.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.05,
                        duration: 0.3
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -20,
                      transition: { duration: 0.2 }
                    }}
                    className="flex justify-center"
                  >
                    <ProjectItem
                      project={project}
                      onDeleteSuccess={handleDeleteSuccess}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={paginate}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState
              title={searchTerm || hasActiveFilters()
                ? "No Projects match your filters"
                : "No Projects yet"}
              description={searchTerm || hasActiveFilters()
                ? "Try adjusting your search or filters"
                : "Get started by creating your first Project"}
              actionText="Create Project"
              actionLink="/projects/create"
              icon={<FaPlus />}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectPage;