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
    { to: "/elonlarRoyxati", label: "E'lonlar ro‘yxati", icon: "https://i.imgur.com/MBh0NZL.png" },
    { to: "/foydalanuvchilar", label: "Foydalanuvchilar", icon: "https://i.imgur.com/iswh1jy.png" },
  ].filter(Boolean);

  return (
    <div 
      className={`h-[100vh] px-2 border-r bg-white flex flex-col pt-4 transition-all duration-1000 ease-in-out ${
        isCollapsed ? 'w-[70px]' : 'w-[18%]'
      }`}
    >
      {/* Logo and Collapse Icon */}
      <div className='relative flex items-center px-4 h-10'>
        <div 
          className={`flex items-center gap-3  transition-all duration-1000 ease-in-out ${
            isCollapsed ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
          }`}
        >
          <img src={LogoSidebar} alt="Logo" className="w-10 h-10" />
          <h2 className="font-inter font-semibold text-[18px] leading-[30.96px] tracking-[0.014em]">
            UySavdo.uz
          </h2>
        </div>
        
        <img 
          src={IconLeft} 
          alt="Collapse" 
          className={`w-6 h-6 cursor-pointer transition-all duration-1000 ease-in-out absolute z-10 ${
            isCollapsed 
              ? 'left-4 rotate-180' 
              : 'right-4 rotate-0'
          }`} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 w-full flex flex-col gap-2 flex-grow overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <li key={item.to}>
                <NavLink 
                  to={item.to} 
                  className={`flex items-center py-3 rounded-md transition-all duration-1000 ease-in-out ${
                    isCollapsed ? 'justify-center px-0' : 'justify-start px-2'
                  } ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#0AA3A1] to-[#B4C29E]' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center px-4">
                    <img 
                      src={item.icon} 
                      alt={item.label} 
                      className={`w-5 h-5 transition-all  ease-in-out ${
                        isActive ? 'filter brightness-0 invert' : ''
                      }`}
                    />
                    <span 
                      className={`ml-3 whitespace-nowrap transition-all  ease-in-out ${
                        isCollapsed 
                          ? 'hidden' 
                          : 'block'
                      } ${isActive ? 'text-white' : 'text-gray-700'}`}
                    >
                      {item.label}
                    </span>
                  </div>
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
