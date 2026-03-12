import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h2 className="admin-sidebar__title">Admin Menu</h2>
      <ul className="admin-sidebar__menu">
        <li><Link to="/admin-dashboard/songs">Manage Songs</Link></li>
        <li><Link to="/admin-dashboard/reports">Report Violations</Link></li>
        <li><Link to="/admin-dashboard/artists">Artist Info</Link></li>
        <li><Link to="/admin-dashboard/stats">System Stats</Link></li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
