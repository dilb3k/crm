import React from 'react';
import { NavLink } from 'react-router-dom';
import LogoSidebar from '../../public/assets/icons/logoSidebar.png';
import IconLeft from '../../public/assets/icons/Chevrons-left.png';

const Sidebar = () => {
  return (
    <div className='w-[18%] h-[100vh] flex flex-col items-center pt-4 border-r bg-white'>
      {/* Logo va icon */}
      <div className='flex items-center gap-7 px-4'>
        <div className='flex items-center gap-3'>
          <img src={LogoSidebar} alt="Logo" />
          <h2 className="font-inter font-semibold text-[18px] leading-[30.96px] tracking-[0.014em]">
            UySavdo.uz
          </h2>
        </div>
        <img src={IconLeft} alt="Collapse" />
      </div>

      {/* Navigatsiya menyusi */}
      <nav className="mt-6 w-full">
        <ul className="space-y-2">
          {[
            { to: "/", label: "Dashboard" },
            { to: "/elonlarRoyxati", label: "E'lonlar ro‘yxati" },
            { to: "/foydalanuvchilar", label: "Foydalanuvchilar" }
          ].map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to} 
                className={({ isActive }) => 
                  `block px-6 py-3 rounded-md transition ${
                    isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
