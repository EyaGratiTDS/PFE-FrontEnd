import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Transition } from '@headlessui/react';

interface SidebarProps {
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSideMenuOpen, setIsSideMenuOpen }) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const toggleButton = document.querySelector('[data-sidebar-toggle]');
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) && 
          (!toggleButton || !toggleButton.contains(event.target as Node))) {
        setIsSideMenuOpen(false);
      }
    };

    if (isSideMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSideMenuOpen, setIsSideMenuOpen]);

  const isActive = (path: string, exact = false) => {
    if (path === '/admin/dashboard') {
      return location.pathname.startsWith('/admin/dashboard');
    }
    if (path === '/admin/account') {
      return location.pathname.startsWith('/admin/account');
    }
    if (path === '/admin/project') {
      return location.pathname.startsWith('/admin/project');
    }
    return exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
  };

  const handleMobileLinkClick = () => {
    if (window.innerWidth < 1001) {
      setIsSideMenuOpen(false);
    }
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard',
      exact: false
    },
    {
      path: '/admin/account',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Account'
    },
    {
      path: '/admin/vcard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: 'vCards',
      subRoutes: ['/admin/vcard/create', '/admin/vcard/edit']
    },
    {
      path: '/admin/project',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      label: 'Projects'
    },
    {
      path: '/admin/pixels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      label: 'Pixels'
    },
    {
      path: '/admin/domains',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      label: 'Custom Domains'
    }
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const active = isActive(item.path, item.exact);
    
    return (
      <li key={item.path} className="relative px-6 py-3">
        {active && (
          <span 
            className="absolute inset-y-0 left-0 w-1 rounded-tr-lg rounded-br-lg bg-blue-50"
            aria-hidden="true"
          />
        )}
        
        <Link
          to={item.path}
          onClick={handleMobileLinkClick}
          className={`inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
            active ? 'text-blue-50 ' : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {item.icon}
          <span className="ml-4">{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="z-20 hidden w-64 bg-white dark:bg-gray-800 lg:block flex-shrink-0">
        <div className="py-4 text-gray-500 dark:text-gray-400">
          <ul className="mt-6">
            {menuItems.map(renderMenuItem)}
          </ul>
        </div>
      </div>

      <Transition
        show={isSideMenuOpen}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSideMenuOpen(false)}
        />
      </Transition>

      <Transition show={isSideMenuOpen}>
        <Transition.Child
          as="div"
          className="fixed inset-y-0 z-20 flex-shrink-0 w-64 mt-16 bg-white dark:bg-gray-800 lg:hidden"
          enter="transition-transform duration-300 ease-in-out"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition-transform duration-300 ease-in-out"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div ref={sidebarRef} className="py-4 text-gray-500 dark:text-gray-400 h-full overflow-y-auto">
            <ul className="mt-6">
              {menuItems.map(renderMenuItem)}
            </ul>
          </div>
        </Transition.Child>
      </Transition>
    </>
  );
};

export default Sidebar;