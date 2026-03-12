import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import AdminSidebar from '../components/AdminSidebar'; 
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__wrapper">
        <AdminSidebar />
        <div className="admin-dashboard__content">
          <Outlet /> {/* Render nested routes here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
