import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Asosiy kontent qismi */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Navbar />
        <Outlet /> {/* Ichki sahifalarni shu joyga yuklash */}
      </div>
    </div>
  );
};

export default MainPage;
