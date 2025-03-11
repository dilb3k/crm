import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoSidebar from '../../public/assets/icons/logoSidebar.png';
import IconLeft from '../../public/assets/icons/Chevrons-left.png';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const menuItems = [
    user?.isAdmin && { to: "/", label: "Statistika", icon: "https://i.imgur.com/rHqm4hy.png" },
    { to: "/elonlarRoyxati", label: "E'lonlar ro'yxati", icon: "https://i.imgur.com/MBh0NZL.png" },
    { to: "/maklerlar", label: "Maklerlar", icon: "https://i.imgur.com/iswh1jy.png" },
  ].filter(Boolean);

  return (
    <div 
      className="h-screen bg-white shadow-md flex flex-col overflow-hidden"
    >
      {/* Logo and Collapse Icon */}
      <div className='relative flex items-center px-4 h-16 mb-4'>
        <div 
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}
        >
          <img src={LogoSidebar} alt="Logo" className="w-10 h-10" />
          <h2 className="font-inter font-semibold text-[18px] leading-[30px] tracking-[0.014em] whitespace-nowrap">
            UySavdo.uz
          </h2>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 flex items-center justify-center cursor-pointer absolute transition-all duration-300 ${
            isCollapsed ? 'right-1' : 'right-4'
          }`}
        >
          <img 
            src={IconLeft} 
            alt="Collapse" 
            className={`w-6 h-6 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : 'rotate-0'
            }`} 
          />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow overflow-y-auto overflow-x-hidden px-2">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <li key={item.to}>
                <NavLink 
                  to={item.to} 
                  className={`flex items-center py-3 rounded-md transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : 'px-4'
                  } ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#0AA3A1] to-[#B4C29E]' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className={`w-5 h-5 ${
                      isActive ? 'filter brightness-0 invert' : ''
                    }`}
                  />
                  <span 
                    className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
                      isCollapsed ? 'hidden' : 'block'
                    } ${isActive ? 'text-white' : 'text-gray-700'}`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;