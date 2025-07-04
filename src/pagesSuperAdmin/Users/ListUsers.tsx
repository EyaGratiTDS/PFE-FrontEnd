import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaPlus, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { User } from '../../services/user';
import StatsCards from '../../cards/StatsCard';
import FilterMenu from '../../cards/FilterCardUsers';
import ExportMenu from '../../cards/ExportMenu';
import UserTable from '../../atoms/Tables/UsersTable';
import Pagination from '../../atoms/Pagination/Pagination';
import ActiveFilters from '../../cards/ActiveFilters';
import UserCharts from '../../atoms/Charts/UserCharts';
import AddUserModal from '../../modals/AddUserModal';

export interface ActiveFilters {
  status: string;
  role: string;
  verified: string;
  search: string;
}

const ListUsers: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    role: 'all',
    verified: 'all',
    search: ''
  });
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    admins: 0,
    superAdmins: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allUsers.length > 0) {
      const total = allUsers.length;
      const active = allUsers.filter(user => user.isActive).length;
      const verified = allUsers.filter(user => user.isVerified).length;
      const admins = allUsers.filter(user => user.role === 'admin').length;
      const superAdmins = allUsers.filter(user => user.role === 'superAdmin').length;
      
      setStats({ total, active, verified, admins, superAdmins });
    } else {
      setStats({ total: 0, active: 0, verified: 0, admins: 0, superAdmins: 0 });
    }
  }, [allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && exportMenuRef.current && 
          !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }

      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target as Node) &&
          filterButtonRef.current && 
          !filterButtonRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu, showExportMenu]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authService.getAllUsers();
        
        if (response.data) {
          const userData = response.data;
          if (Array.isArray(userData)) {
            setAllUsers(userData);
          } else {
            setAllUsers([]);
            console.error('Invalid user data format:', userData);
            toast.error('Received invalid user data format');
          }
        } else {
          setAllUsers([]);
          toast.error('No user data received from server');
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
        toast.error('Failed to load users. Please try again.');
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    let result = [...allUsers];
    
    if (activeFilters.search) {
      result = result.filter(user => 
        (user.name?.toLowerCase().includes(activeFilters.search.toLowerCase())) ||
        (user.email?.toLowerCase().includes(activeFilters.search.toLowerCase()))
      );
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(user => 
        activeFilters.status === 'active' ? user.isActive : !user.isActive
      );
    }
    
    if (activeFilters.role !== 'all') {
      result = result.filter(user => user.role === activeFilters.role);
    }
    
    if (activeFilters.verified !== 'all') {
      result = result.filter(user => 
        activeFilters.verified === 'verified' ? user.isVerified : !user.isVerified
      );
    }
    
    // Trier d'abord par superAdmin, puis admin, puis user
    result.sort((a, b) => {
      const roleOrder: Record<string, number> = {
        'superAdmin': 0, // SuperAdmin en premier
        'admin': 1,      // Admin ensuite
        'user': 2        // User en dernier
      };

      const aRole = a.role || 'user';
      const bRole = b.role || 'user';

      const roleComparison = (roleOrder[aRole] || 2) - (roleOrder[bRole] || 2);

      if (roleComparison === 0) {
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
      }

      return roleComparison;
    });
    
    return result;
  }, [activeFilters, allUsers]);

  const currentPageUsers = useMemo(() => {
    if (!filteredUsers || filteredUsers.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      role: 'all',
      verified: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.role !== 'all' ||
      activeFilters.verified !== 'all' ||
      activeFilters.search !== ''
    );
  };

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isActive } : user
        )
      );

      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }

      await authService.toggleUserStatus(numericUserId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle user status', error);
      toast.error('Failed to update user status');

      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isActive: !isActive } : user
        )
      );
    }
  };

  const formatUserData = (user: User) => ({
    ID: user.id,
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Status: user.isActive ? 'Active' : 'Inactive',
    Verified: user.isVerified ? 'Yes' : 'No',
    'Created At': user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredUsers || filteredUsers.length === 0) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `users_export_${date}`;
      
      if (format === 'csv') {
        exportToCsv(filteredUsers.map(formatUserData), filename);
      } else {
        exportToJson(filteredUsers.map(formatUserData), filename);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportToCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export completed successfully');
  };

  const exportToJson = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('JSON export completed successfully');
  };

  const handleCreateUser = async (newUser: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      const createdUser = await authService.createUser(newUser);
      
      setAllUsers(prev => [createdUser, ...prev]);
      
      toast.success('User created successfully!');
      setShowAddUserModal(false);
      
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
        ...(createdUser.role === 'admin' && { admins: prev.admins + 1 }),
        ...(createdUser.role === 'superAdmin' && { superAdmins: prev.superAdmins + 1 }),
        ...(createdUser.isVerified && { verified: prev.verified + 1 })
      }));
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            View and manage all system users
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={activeFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="relative">
              <button
                ref={filterButtonRef}
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                  hasActiveFilters()
                    ? 'border-red-500'
                    : 'border-purple-500'
                } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={
                  hasActiveFilters()
                    ? 'text-red-500'
                    : 'text-purple-500'
                } />
              </button>

              {showFilterMenu && (
                <FilterMenu 
                  ref={filterMenuRef}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onReset={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                />
              )}
            </div>

            <div className="relative" ref={exportMenuRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || !filteredUsers || filteredUsers.length === 0}
              >
                <FaFileExport className={`text-purple-500 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
              </button>

              {showExportMenu && (
                <ExportMenu 
                  onExport={handleExport}
                  exporting={exporting}
                />
              )}
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base relative"
            >
              <FaPlus className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none sm:mr-2 w-10" />
              <span className="hidden xs:inline sm:ml-0">Add User</span>
            </button>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFilters 
          activeFilters={activeFilters} 
          resetFilters={resetFilters} 
        />
      )}

      <UserTable
        filteredUsers={currentPageUsers}
        hasActiveFilters={hasActiveFilters()}
        onToggleStatus={toggleUserStatus}
      />

      <UserCharts users={allUsers} />

      {filteredUsers && filteredUsers.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}

      <AddUserModal 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
};

export default ListUsers;