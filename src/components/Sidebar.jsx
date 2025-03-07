import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoSidebar from '../../public/assets/icons/logoSidebar.png';
import IconLeft from '../../public/assets/icons/Chevrons-left.png';

const Sidebar = () => {
  const { user } = useAuth(); // ✅ Берем данные пользователя
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  // 🔹 Фильтруем меню по роли пользователя
  const menuItems = [
    user?.isAdmin && { to: "/", label: "Statistika", icon: "https://i.imgur.com/rHqm4hy.png" },
    { to: "/elonlarRoyxati", label: "E'lonlar ro‘yxati", icon: "https://i.imgur.com/MBh0NZL.png" },
    { to: "/foydalanuvchilar", label: "Foydalanuvchilar", icon: "https://i.imgur.com/iswh1jy.png" },
  ].filter(Boolean); // Убираем `null` если user.isAdmin === false

  return (
    <div 
      className={`h-screen border-r bg-white flex flex-col pt-4 transition-[width] duration-300 ease-in-out ${
        isCollapsed ? 'w-[70px] min-w-[70px]' : 'w-[18%] min-w-[200px] max-w-[250px]'
      }`}
    >
      {/* ✅ Logo and Collapse Icon */}
      <div className='flex items-center justify-between px-4'>
        {!isCollapsed && (
          <div className='flex items-center gap-3'>
            <img src={LogoSidebar} alt="Logo" className="w-10 h-10" />
            <h2 className="font-inter font-semibold text-[18px] leading-[30.96px] tracking-[0.014em]">
              UySavdo.uz
            </h2>
          </div>
        )}
        
        <img 
          src={IconLeft} 
          alt="Collapse" 
          className={`w-6 h-6 cursor-pointer transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`} 
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* ✅ Navigation Menu */}
      <nav className="mt-6 w-full flex flex-col gap-2 flex-grow overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <li key={item.to}>
                <NavLink 
                  to={item.to} 
                  className={`flex items-center gap-3 py-3 rounded-md transition-all duration-300 pl-[12px] pr-6 ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-[#0AA3A1] to-[#B4C29E]' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className={`w-5 h-5 transition ${isActive ? 'filter brightness-0 invert' : ''}`}
                  />
                  <span className={`${isCollapsed ? 'hidden' : 'block'}`}>
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
