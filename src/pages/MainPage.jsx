import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainPage = () => {
  // Get the sidebar collapse state from localStorage to sync with sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  // Listen for changes to localStorage to keep state in sync
  useEffect(() => {
    const handleStorageChange = () => {
      setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check regularly for changes (since the storage event doesn't fire in the same window)
    const interval = setInterval(() => {
      const currentState = localStorage.getItem('sidebarCollapsed') === 'true';
      if (currentState !== sidebarCollapsed) {
        setSidebarCollapsed(currentState);
      }
    }, 300);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar container with fixed width */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-[70px]' : 'w-[250px]'
      }`}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar - fixed at top */}
        <div className="sticky top-0 z-10 bg-white">
          <Navbar />
        </div>
        
        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet /> {/* Inner pages will be loaded here */}
        </div>
      </div>
    </div>
  );
};

export default MainPage;