import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';

function AdminLayout() {
  const location = useLocation();
  const path = location.pathname;
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE' && user.role !== 'admin' && user.role !== 'employee')) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-sans)', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ color: '#ff4d4f', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Bạn không có quyền truy cập trang quản trị</h2>
        <Link to="/" className="btn btn-primary">Quay lại Cửa hàng</Link>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'admin';

  const renderSidebarLink = (to, icon, text, isReal = true) => {
    const isActive = isReal ? (to === '/admin' ? path === '/admin' : path.startsWith(to)) : false;
    return isReal ? (
      <Link to={to} className={`sidebar-link ${isActive ? 'active' : ''}`} style={isSidebarCollapsed ? { justifyContent: 'center', padding: '0.75rem 0' } : {}}>
        <i className={icon} style={isSidebarCollapsed ? { margin: 0, fontSize: '1.25rem' } : {}} title={isSidebarCollapsed ? text : ''}></i>
        {!isSidebarCollapsed && <span>{text}</span>}
      </Link>
    ) : (
      <a href="#" className="sidebar-link" onClick={(e) => { e.preventDefault(); alert('Đây là trang Demo (Mock Route)'); }} style={isSidebarCollapsed ? { justifyContent: 'center', padding: '0.75rem 0' } : {}}>
        <i className={icon} style={isSidebarCollapsed ? { margin: 0, fontSize: '1.25rem' } : {}} title={isSidebarCollapsed ? text : ''}></i>
        {!isSidebarCollapsed && <span>{text}</span>}
      </a>
    );
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'var(--font-sans)', color: '#1e293b' }}>
      <style>{`
        /* Custom styles for modern admin dashboard */
        .admin-layout * {
          box-sizing: border-box;
        }
        .admin-sidebar {
          width: 260px;
          background-color: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.2s ease;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .sidebar-brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.1rem;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        .sidebar-brand-text {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
        }
        .sidebar-brand-text span {
          color: #3b82f6;
        }
        .sidebar-menu-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0.75rem;
        }
        .sidebar-menu-group {
          margin-bottom: 1.5rem;
        }
        .sidebar-menu-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 0.65rem 0.75rem;
          color: #64748b;
          text-decoration: none !important;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 0.375rem;
          margin-bottom: 0.25rem;
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          background-color: #f8fafc;
          color: #1e293b;
        }
        .sidebar-link.active {
          background-color: #ebf3ff;
          color: #3b82f6;
          font-weight: 600;
        }
        .sidebar-link i {
          font-size: 1.1rem;
          margin-right: 0.75rem;
          transition: all 0.2s ease;
        }
        .sidebar-link.active i {
          color: #3b82f6;
        }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background-color: #f8fafc;
        }
        .sidebar-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #3b82f6;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }
        .sidebar-user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-role {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: capitalize;
        }

        .admin-header {
          height: 70px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .admin-header-search-wrap {
          position: relative;
          width: 280px;
        }
        body .admin-layout .admin-header-search-wrap input.header-search-input,
        body .admin-layout input.admin-search-input {
          width: 100% !important;
          height: 38px !important;
          padding: 0.5rem 1rem 0.5rem 2.5rem !important;
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 9999px !important;
          font-size: 0.85rem !important;
          color: #1e293b !important;
          outline: none !important;
          box-shadow: none !important;
          transition: all 0.2s ease !important;
        }
        body .admin-layout .admin-header-search-wrap input.header-search-input:focus,
        body .admin-layout input.admin-search-input:focus {
          border-color: #cbd5e1 !important;
          background-color: #ffffff !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .admin-header-search-wrap i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.95rem;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .header-btn:hover {
          background-color: #f8fafc;
          color: #1e293b;
          border-color: #cbd5e1;
        }
        .header-btn .badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }
        .profile-capsule {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem 0.25rem 0.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          cursor: pointer;
          background-color: #ffffff;
          transition: all 0.2s ease;
        }
        .profile-capsule:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }
        .profile-capsule-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #e2e8f0;
          object-fit: cover;
        }
        .profile-capsule-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
        }

        /* Dashboard Styles */
        .dashboard-container {
          padding: 0.5rem 0;
        }
        .dashboard-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dashboard-title-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .dashboard-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background-color: #ebf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-size: 1.25rem;
        }
        .dashboard-titles {
          display: flex;
          flex-direction: column;
        }
        .dashboard-pretitle {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dashboard-main-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .dashboard-actions-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .dashboard-btn-outline {
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #334155;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dashboard-btn-outline:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }
        .dashboard-btn-primary {
          border: none;
          background-color: #3b82f6;
          color: #ffffff;
          padding: 0.5rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }
        .dashboard-btn-primary:hover {
          background-color: #2563eb;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .stat-card-custom {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left-width: 4px;
        }
        .stat-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .stat-card-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }
        .stat-card-subtext {
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }
        .stat-icon-container {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .dashboard-grid-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .card-custom {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .card-custom-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .card-custom-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .activity-item {
          display: flex;
          gap: 0.75rem;
          font-size: 0.825rem;
          line-height: 1.4;
        }
        .activity-dot-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .activity-line {
          width: 2px;
          background-color: #f1f5f9;
          flex: 1;
          margin-top: 4px;
        }
        .activity-item:last-child .activity-line {
          display: none;
        }
        .activity-content {
          flex: 1;
        }
        .activity-text {
          color: #334155;
        }
        .activity-text strong {
          color: #1e293b;
        }
        .activity-time {
          color: #94a3b8;
          font-size: 0.75rem;
          margin-top: 0.125rem;
        }

        .table-custom {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .table-custom th {
          padding: 0.75rem 1rem;
          color: #64748b;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          background-color: #f8fafc;
        }
        .table-custom td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        .table-custom tr:last-child td {
          border-bottom: none;
        }

        /* Modal styling overrides to keep compatibility */
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 72, 82, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: adminFadeIn 0.3s ease;
        }
        .admin-modal-content, .promo-modal-content, .history-modal-content {
          background-color: #ffffff;
          padding: 2.5rem;
          border-radius: 0.5rem;
          width: 550px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          font-family: var(--font-sans);
          animation: adminSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .history-modal-content {
          width: 850px;
          max-width: 95vw;
        }
        .admin-modal-title, .promo-modal-title, .history-modal-title {
          font-family: var(--font-sans);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 1.15rem;
          color: #1e293b;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-modal-title button, .promo-modal-title button, .history-modal-title button {
          background: none;
          border: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: #64748b !important;
          line-height: 1;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        .admin-modal-title button:hover, .promo-modal-title button:hover, .history-modal-title button:hover {
          color: #3b82f6 !important;
        }
        .admin-form-group, .promo-form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .admin-form-label, .promo-form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }
        .admin-form-input, .promo-modal-input {
          width: 100%;
          padding: 0.8rem 1.25rem;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-form-input:focus, .promo-modal-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .admin-btn-primary, .promo-btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.8rem 1.5rem;
          border-radius: 0.375rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background-color: #3b82f6 !important;
          color: #ffffff !important;
          transition: all 0.2s ease;
          border: none !important;
          cursor: pointer;
        }
        .admin-btn-primary:hover, .promo-btn-save:hover {
          background-color: #2563eb !important;
        }
        .admin-btn-outline, .promo-btn-cancel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.8rem 1.5rem;
          border-radius: 0.375rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background-color: #ffffff !important;
          color: #475569 !important;
          border: 1px solid #cbd5e1 !important;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .admin-btn-outline:hover, .promo-btn-cancel:hover {
          background-color: #f8fafc !important;
          border-color: #94a3b8 !important;
        }

        /* Overrides to isolate admin inputs from global forms switcher theme */
        body .admin-layout select, 
        body .admin-layout input:not(.header-search-input):not(.admin-search-input), 
        body .admin-layout textarea,
        .admin-layout select, 
        .admin-layout input:not(.header-search-input):not(.admin-search-input), 
        .admin-layout textarea {
          border-radius: 0.375rem !important;
          border: 1px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          color: #1e293b !important;
          box-shadow: none !important;
          padding: 0.6rem 0.8rem !important;
        }
        
        body .admin-layout select.stats-filter-select,
        .admin-layout select.stats-filter-select {
          padding: 0.5rem 1rem !important;
          border-radius: 0.375rem !important;
        }

        body .admin-layout table select,
        .admin-layout table select {
          padding: 0.25rem 0.5rem !important;
          height: 32px !important;
          width: 120px !important;
        }
        
        /* Table Styles */
        .admin-layout table {
          border-collapse: collapse;
          width: 100%;
        }
        .admin-layout th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 1rem !important;
        }
        .admin-layout td {
          padding: 1rem !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .admin-layout tr:hover {
          background-color: #f8fafc !important;
        }

        /* Pagination custom wrapper overrides */
        .admin-layout .shadow-extruded {
          box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
          border: 1px solid #e2e8f0 !important;
          background-color: #ffffff !important;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: isSidebarCollapsed ? '70px' : '260px' }}>
        <div className="sidebar-brand" style={isSidebarCollapsed ? { justifyContent: 'center', padding: '1.5rem 0' } : {}}>
          <div className="sidebar-brand-icon">BN</div>
          {!isSidebarCollapsed && (
            <span className="sidebar-brand-text">
              admin<span>BN</span>
            </span>
          )}
        </div>
        
        <div className="sidebar-menu-container">
          <div className="sidebar-menu-group">
            {!isSidebarCollapsed && <div className="sidebar-menu-title">Main Menu</div>}
            {renderSidebarLink('/admin', 'ri-dashboard-line', 'Tổng Quan', true)}
            {renderSidebarLink('/admin/products', 'ri-shirt-line', 'Sản Phẩm', true)}
            {renderSidebarLink('/admin/stock', 'ri-stack-line', 'Quản Lý Tồn Kho', true)}
            {renderSidebarLink('/admin/orders', 'ri-file-list-3-line', 'Đơn Hàng', true)}
          </div>

          {isAdmin && (
            <div className="sidebar-menu-group">
              {!isSidebarCollapsed && <div className="sidebar-menu-title">Administration</div>}
              {renderSidebarLink('/admin/users', 'ri-group-line', 'Người Dùng', true)}
              {renderSidebarLink('/admin/promotions', 'ri-coupon-3-line', 'Khuyến Mãi', true)}
              {renderSidebarLink('/admin/logs', 'ri-history-line', 'Nhật Ký', true)}
            </div>
          )}

        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-user-card" style={isSidebarCollapsed ? { justifyContent: 'center', padding: '0.5rem 0' } : {}}>
            <div className="sidebar-user-avatar">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            {!isSidebarCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name || 'Người dùng'}</span>
                <span className="sidebar-user-role">{isAdmin ? 'Quản trị viên' : 'Nhân viên'}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem' }}>
            <Link to="/" className="sidebar-link" style={isSidebarCollapsed ? { justifyContent: 'center', padding: '0.5rem 0' } : { padding: '0.5rem' }}>
              <i className="ri-global-line" style={isSidebarCollapsed ? { margin: 0 } : {}}></i>
              {!isSidebarCollapsed && <span>Về Cửa Hàng</span>}
            </Link>
            <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} className="sidebar-link" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', ...(isSidebarCollapsed ? { justifyContent: 'center', padding: '0.5rem 0' } : { padding: '0.5rem' }) }}>
              <i className="ri-logout-circle-r-line" style={{ color: '#ef4444', ...(isSidebarCollapsed ? { margin: 0 } : {}) }}></i>
              {!isSidebarCollapsed && <span style={{ color: '#ef4444' }}>Đăng Xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="header-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Thu gọn menu">
              <i className={isSidebarCollapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"}></i>
            </button>
            <div className="admin-header-search-wrap">
              <input type="text" className="header-search-input" placeholder="Tìm kiếm nhanh..." />
              <i className="ri-search-line"></i>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="header-btn" onClick={() => alert('Chế độ tối đang được phát triển!')} title="Giao diện tối">
              <i className="ri-moon-line"></i>
            </button>
            <button className="header-btn" style={{ position: 'relative' }} onClick={() => alert('Bạn không có thông báo mới.')} title="Thông báo">
              <i className="ri-notification-3-line"></i>
              <span className="badge"></span>
            </button>
            
            <div className="profile-capsule" onClick={() => {
              if (window.confirm("Bạn có muốn đăng xuất không?")) {
                localStorage.removeItem('user');
                window.location.href = '/';
              }
            }} title="Tài khoản">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Admin')}&background=3b82f6&color=fff`} className="profile-capsule-avatar" alt="" />
              <span className="profile-capsule-name">{user.name || 'Admin'}</span>
              <i className="ri-arrow-down-s-line" style={{ fontSize: '0.9rem', color: '#64748b' }}></i>
            </div>
          </div>
        </header>

        {/* Dynamic outlet for child router components */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// === DASHBOARD ===
function Dashboard() {
  const [stats, setStats] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [logs, setLogs] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetch('/identity/api/stats/dashboard?filter=' + filter)
      .then(res => {
        if (!res.ok) throw new Error('API Error ' + res.status);
        return res.json();
      })
      .then(data => setStats(data))
      .catch(e => {
        console.error("Fetch stats error:", e);
        setStats({ isError: true });
      });
  }, [filter]);

  React.useEffect(() => {
    fetch('/identity/api/activity-logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data.slice(0, 5)); // get top 5 logs
        }
      })
      .catch(e => {
        console.error("Fetch activity logs in dashboard error:", e);
      });

    fetch('/identity/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort by id descending to show recent users
          const sorted = [...data].sort((a, b) => b.id - a.id);
          setUsers(sorted.slice(0, 5));
        }
      })
      .catch(e => {
        console.error("Fetch users in dashboard error:", e);
      });
  }, []);

  if (!stats) return <div style={{ padding: '2.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', letterSpacing: '0.05em' }}>ĐANG TẢI DỮ LIỆU THỐNG KÊ...</div>;
  if (stats.isError) return <div style={{ padding: '2.5rem', color: '#ff4d4f', fontWeight: 600 }}>LỖI KHI TẢI DỮ LIỆU TỪ MÁY CHỦ. HÃY KHỞI ĐỘNG SPRING BOOT BACKEND.</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div className="dashboard-title-area">
          <div className="dashboard-icon-wrap">
            <i className="ri-speed-up-line"></i>
          </div>
          <div className="dashboard-titles">
            <span className="dashboard-pretitle">TỔNG QUAN HỆ THỐNG</span>
            <h2 className="dashboard-main-title">Dashboard</h2>
          </div>
        </div>
        
        <div className="dashboard-actions-area">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none' }}>
            <option value="all">Tất cả thời gian</option>
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">1 năm qua</option>
          </select>
          <button className="dashboard-btn-outline" onClick={() => alert('Đang xuất báo cáo CSV doanh thu...')}>
            <i className="ri-download-2-line" style={{ marginRight: '0.25rem' }}></i> Xuất file
          </button>
          <button className="dashboard-btn-primary" onClick={() => alert('Báo cáo thống kê hoạt động đã sẵn sàng để gửi qua email.')}>
            <i className="ri-file-chart-line"></i> Báo cáo
          </button>
        </div>
      </div>
      
      {/* Stat Cards Row */}
      <div className="stat-grid">
        <div className="stat-card-custom" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-card-info">
            <span className="stat-card-label">Tổng Doanh Thu</span>
            <div className="stat-card-value">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.summary.totalRevenue || 0)}
            </div>
            <span className="stat-card-subtext" style={{ color: '#10b981' }}>
              <i className="ri-arrow-up-line"></i> +12.5% so với tháng trước
            </span>
          </div>
          <div className="stat-icon-container" style={{ backgroundColor: '#ebf3ff', color: '#3b82f6' }}>
            <i className="ri-money-dollar-circle-line"></i>
          </div>
        </div>

        <div className="stat-card-custom" style={{ borderLeftColor: '#14b8a6' }}>
          <div className="stat-card-info">
            <span className="stat-card-label">Tổng Đơn Hàng</span>
            <div className="stat-card-value">{stats.summary.totalOrders || '0'}</div>
            <span className="stat-card-subtext" style={{ color: '#10b981' }}>
              <i className="ri-arrow-up-line"></i> +8.2% đơn hàng mới
            </span>
          </div>
          <div className="stat-icon-container" style={{ backgroundColor: '#e6fcf5', color: '#14b8a6' }}>
            <i className="ri-shopping-cart-2-line"></i>
          </div>
        </div>

        <div className="stat-card-custom" style={{ borderLeftColor: '#f97316' }}>
          <div className="stat-card-info">
            <span className="stat-card-label">Khách Hàng</span>
            <div className="stat-card-value">{stats.summary.totalCustomers || '0'}</div>
            <span className="stat-card-subtext" style={{ color: '#10b981' }}>
              <i className="ri-arrow-up-line"></i> +5.1% người dùng mới
            </span>
          </div>
          <div className="stat-icon-container" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
            <i className="ri-user-line"></i>
          </div>
        </div>

        <div className="stat-card-custom" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-card-info">
            <span className="stat-card-label">Sản Phẩm</span>
            <div className="stat-card-value">{stats.summary.totalProducts || '0'}</div>
            <span className="stat-card-subtext" style={{ color: '#64748b' }}>
              <i className="ri-checkbox-circle-line"></i> Đang hoạt động trên web
            </span>
          </div>
          <div className="stat-icon-container" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <i className="ri-shirt-line"></i>
          </div>
        </div>
      </div>
      
      {/* Dynamic Graphs and Activity Grid */}
      <div className="dashboard-grid-row">
        {/* Sales Chart */}
        <div className="card-custom">
          <div className="card-custom-header">
            <h3 className="card-custom-title">Thống Kê Doanh Thu (Sales Performance)</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Doanh thu bán lẻ</span>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '0.75rem', fontWeight: 600, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)} style={{ fontSize: '0.75rem', fontWeight: 600, fill: '#64748b' }} />
                <RechartsTooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', color: '#1e293b', fontSize: '0.8rem' }} />
                <Bar dataKey="Doanh thu" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Activity Feed */}
        <div className="card-custom">
          <div className="card-custom-header">
            <h3 className="card-custom-title">Hoạt Động Gần Đây</h3>
            <i className="ri-history-line" style={{ color: '#64748b' }}></i>
          </div>
          <div className="activity-feed">
            {logs.length > 0 ? (
              logs.map((log, index) => {
                const act = log.action ? log.action.toUpperCase() : 'OTHER';
                let dotColor = '#3b82f6';
                if (act.includes('THÊM') || act.includes('CREATE') || act.includes('ADD')) dotColor = '#10b981';
                if (act.includes('XÓA') || act.includes('DELETE') || act.includes('REMOVE')) dotColor = '#ef4444';
                if (act.includes('SỬA') || act.includes('UPDATE') || act.includes('EDIT')) dotColor = '#f59e0b';

                return (
                  <div key={log.id || index} className="activity-item">
                    <div className="activity-dot-col">
                      <div className="activity-dot" style={{ backgroundColor: dotColor }}></div>
                      <div className="activity-line"></div>
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{log.userName || 'Hệ thống'}</strong> {log.action}: {log.details}
                      </div>
                      <div className="activity-time">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Không có nhật ký hoạt động nào mới.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="card-custom" style={{ marginBottom: 0 }}>
        <div className="card-custom-header">
          <h3 className="card-custom-title">Thành viên mới gia nhập</h3>
          <Link to="/admin/users" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
            Xem tất cả <i className="ri-arrow-right-line" style={{ verticalAlign: 'middle' }}></i>
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Vai Trò</th>
                <th>Ngày Gia Nhập</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=ebf3ff&color=3b82f6`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{u.name || 'Thành viên mới'}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'Chưa có SĐT'}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        backgroundColor: u.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.1)' : u.role === 'EMPLOYEE' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(100, 116, 139, 0.08)', 
                        color: u.role === 'ADMIN' ? '#3b82f6' : u.role === 'EMPLOYEE' ? '#0d9488' : '#64748b' 
                      }}>
                        {u.role === 'ADMIN' ? 'Admin' : u.role === 'EMPLOYEE' ? 'Nhân viên' : 'Khách hàng'}
                      </span>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                    Không có dữ liệu thành viên mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// === PRODUCTS ===
function Products() {
  const [products, setProducts] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ id: '', name: '', categoryId: '', price: '', salePrice: '', stock: '', isActive: true, description: '', images: [] });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/identity/api/products/admin');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Lỗi khi tải danh sách sản phẩm:', e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => {
      const updatedImages = (prev.images || []).map((img, i) => {
        if (i === index) {
          return { ...img, [field]: value };
        } else if (field === 'isMain' && value === true) {
          return { ...img, isMain: false };
        }
        return img;
      });
      return { ...prev, images: updatedImages };
    });
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), { imageUrl: '', color: '', isMain: (prev.images || []).length === 0, sortOrder: (prev.images || []).length }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting product formData:", formData);

    if (!formData.images || formData.images.length === 0) {
      alert('Vui lòng thêm ít nhất một ảnh cho sản phẩm!');
      return;
    }
    
    // Ensure all images have valid URLs
    const invalidImages = formData.images.filter(img => !img.imageUrl || !img.imageUrl.toString().trim());
    if (invalidImages.length > 0) {
      alert('Vui lòng điền đầy đủ URL cho tất cả các ảnh!');
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user ? (user.name || user.email || 'Admin') : 'Admin';

    const url = formData.id ? `/identity/api/products/${formData.id}` : '/identity/api/products';
    const method = formData.id ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Name': encodeURIComponent(userName)
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
        alert('Lưu sản phẩm thành công!');
      } else {
        const errorText = await res.text();
        console.error('Lỗi phản hồi từ server:', errorText);
        alert(`Không thể lưu sản phẩm. Lỗi từ server (HTTP ${res.status}): ${errorText || 'Không rõ lỗi'}`);
      }
    } catch (e) {
      console.error('Lỗi khi lưu sản phẩm:', e);
      alert('Lỗi kết nối mạng hoặc lỗi ứng dụng: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userName = user ? (user.name || user.email || 'Admin') : 'Admin';

      try {
        await fetch(`/identity/api/products/${id}`, { 
          method: 'DELETE',
          headers: { 'X-User-Name': encodeURIComponent(userName) }
        });
        fetchProducts();
      } catch (e) {
        console.error('Lỗi khi xóa sản phẩm:', e);
      }
    }
  };

  const openEditModal = (p) => {
    setFormData({ ...p, images: p.images || [] });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({ id: '', name: '', categoryId: 1, price: '', salePrice: '', stock: '', isActive: true, description: '', images: [] });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.id && p.id.toString().includes(searchQuery)) ||
    (p.categoryId && p.categoryId.toString().includes(searchQuery))
  );

  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>


      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>Quản Lý Sản Phẩm</h2>
         <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer' }}>
           <i className="ri-add-line"></i> Thêm Sản Phẩm Mới
         </button>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-light)', padding: '1.25rem', borderRadius: '24px', boxShadow: 'var(--shadow-extruded)' }}>
        <div className="search-wrapper" style={{ position: 'relative', width: '350px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="TÌM THEO TÊN, MÃ SẢN PHẨM..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-input admin-search-input" 
          />
          <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-title">
              <span>{formData.id ? 'Sửa Sản Phẩm Cao Cấp' : 'Thêm Sản Phẩm Mới'}</span>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#000000', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Tên sản phẩm *</label>
                <input type="text" name="name" placeholder="Ví dụ: Áo Sơ Mi Lụa Cổ Lãnh..." value={formData.name || ''} onChange={handleChange} className="admin-form-input" required />
              </div>
              
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }} className="admin-form-group">
                  <label className="admin-form-label">ID Danh mục *</label>
                  <input type="number" name="categoryId" placeholder="Ví dụ: 1" value={formData.categoryId || ''} onChange={handleChange} className="admin-form-input" required />
                </div>
                <div style={{ flex: 1 }} className="admin-form-group">
                  <label className="admin-form-label">Tồn kho *</label>
                  <input type="number" name="stock" placeholder="Số lượng" value={formData.stock || ''} onChange={handleChange} className="admin-form-input" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }} className="admin-form-group">
                  <label className="admin-form-label">Giá (VNĐ) *</label>
                  <input type="number" name="price" placeholder="Giá bán chính thức" value={formData.price || ''} onChange={handleChange} className="admin-form-input" required />
                </div>
                <div style={{ flex: 1 }} className="admin-form-group">
                  <label className="admin-form-label">Giá KM (VNĐ)</label>
                  <input type="number" name="salePrice" placeholder="Giá khuyến mãi" value={formData.salePrice || ''} onChange={handleChange} className="admin-form-input" />
                </div>
              </div>
              
              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả chi tiết</label>
                <textarea name="description" placeholder="Nhập mô tả sản phẩm cao cấp của bạn..." value={formData.description || ''} onChange={handleChange} className="admin-form-input" rows="4" style={{ resize: 'vertical', minHeight: '100px' }} />
              </div>

              {/* Images Section */}
              <div className="admin-section-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <label className="admin-form-label" style={{ margin: 0 }}>Ảnh Sản Phẩm (Bắt buộc)</label>
                  <button 
                    type="button" 
                    onClick={addImage} 
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.75rem', 
                      backgroundColor: '#000000', 
                      color: '#FFFFFF', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-gold)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#000000'}
                  >
                    <i className="ri-add-line"></i> Thêm Ảnh
                  </button>
                </div>
                
                {(formData.images || []).length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#ff4d4f', marginBottom: '0.75rem', fontWeight: 500 }}>
                    * Vui lòng thêm ít nhất một ảnh sản phẩm để hoàn tất hiển thị.
                  </div>
                ) : null}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(formData.images || []).map((img, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '1rem', border: '1px solid #E2E8F0', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                        <div className="admin-form-group" style={{ margin: 0 }}>
                          <label className="admin-form-label" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Đường Dẫn Hình Ảnh hoặc Tải Lên</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" placeholder="https://..." value={img.imageUrl} onChange={(e) => handleImageChange(index, 'imageUrl', e.target.value)} className="admin-form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', flex: 1 }} required />
                            <label className="admin-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.8rem', margin: 0, cursor: 'pointer', backgroundColor: '#eaeaea', border: '1px solid #d9d9d9', fontWeight: 600 }}>
                              Chọn File
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const uploadData = new FormData();
                                    uploadData.append('file', file);
                                    try {
                                      const uploadRes = await fetch('/identity/api/upload', {
                                        method: 'POST',
                                        body: uploadData
                                      });
                                      if (uploadRes.ok) {
                                        const data = await uploadRes.json();
                                        handleImageChange(index, 'imageUrl', data.imageUrl);
                                      } else {
                                        alert('Tải ảnh lên thất bại!');
                                      }
                                    } catch (err) {
                                      console.error('Lỗi tải ảnh:', err);
                                      alert('Lỗi kết nối server!');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <label className="admin-form-label" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Phân loại Màu</label>
                            <input type="text" placeholder="Ví dụ: Đen, Trắng..." value={img.color || ''} onChange={(e) => handleImageChange(index, 'color', e.target.value)} className="admin-form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, color: '#333333' }}>
                              <input 
                                type="radio" 
                                name={`isMainImage-${index}`} 
                                checked={Boolean(img.isMain)} 
                                onChange={() => handleImageChange(index, 'isMain', true)} 
                                style={{ accentColor: '#000000', width: '15px', height: '15px' }}
                              /> 
                              Ảnh Chính
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {img.imageUrl && (
                        <div style={{ width: '70px', height: '90px', overflow: 'hidden', border: '1px solid #E2E8F0', marginTop: '0.9rem', flexShrink: 0 }}>
                          <img src={img.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://via.placeholder.com/70x90?text=L%E1%BB%97i'} />
                        </div>
                      )}
                      
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)} 
                        style={{ 
                          color: '#ff4d4f', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '0.25rem',
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem'
                        }} 
                        title="Xóa ảnh này"
                      >
                        <i className="ri-close-circle-line" style={{ fontSize: '1.25rem' }}></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formData.isActive !== false} 
                    onChange={handleChange} 
                    style={{ width: '18px', height: '18px', accentColor: '#000000' }} 
                  /> 
                  Kích hoạt / Hiển thị sản phẩm trên cửa hàng
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1 }}>Lưu sản phẩm</button>
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Hủy bỏ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="shadow-extruded" style={{ backgroundColor: 'var(--bg-light)', borderRadius: '24px', overflow: 'hidden', border: 'none', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
            <thead style={{ backgroundColor: 'transparent' }}>
              <tr>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mã SP</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Tên Sản Phẩm</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mã DM</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Giá</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Kho</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Trạng Thái</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'center', width: '120px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                 <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!
                    </td>
                 </tr>
              ) : currentProducts.map((p) => (
                 <tr key={p.id} style={{ borderTop: '1px solid var(--border-light)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>{p.id}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>{p.categoryId}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>
                        <div style={{ fontWeight: 600, color: p.salePrice > 0 ? 'var(--primary-color)' : 'inherit' }}>{p.salePrice > 0 ? p.salePrice.toLocaleString() : p.price?.toLocaleString()}đ</div>
                        {p.salePrice > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{p.price?.toLocaleString()}đ</div>}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>{p.stock}</td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', border: '1px solid transparent', backgroundColor: p.isActive ? '#D1FAE5' : '#FEE2E2', color: p.isActive ? '#065F46' : '#991B1B', borderColor: p.isActive ? 'rgba(6,95,70,0.08)' : 'rgba(153,27,27,0.08)', marginRight: '0.5rem' }}>
                         {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                      </span>
                      <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', border: '1px solid transparent', backgroundColor: p.stock > 0 ? '#EAEAEA' : '#FFEDD5', color: p.stock > 0 ? '#000000' : '#9A3412', borderColor: p.stock > 0 ? 'rgba(0,0,0,0.08)' : 'rgba(154,52,18,0.08)' }}>
                         {p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                         <button onClick={() => openEditModal(p)} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', transition: 'transform 0.2s ease' }} title="Sửa sản phẩm" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                           <i className="ri-edit-line" style={{ fontSize: '1.1rem' }}></i>
                         </button>
                         <button onClick={() => handleDelete(p.id)} style={{ color: '#ff4d4f', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', transition: 'transform 0.2s ease' }} title="Xóa sản phẩm" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                           <i className="ri-delete-bin-line" style={{ fontSize: '1.1rem' }}></i>
                         </button>
                       </div>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
        </div>
        <Pagination
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}

// === ORDERS ===
function Orders() {
  const [orders, setOrders] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/identity/api/orders/admin')
      .then(res => res.json())
      .then(data => {
        console.log("Orders data:", data);
        if (Array.isArray(data)) setOrders(data);
        else console.error("Data is not an array:", data);
      })
      .catch(e => console.error("Fetch orders error:", e));
  };

  const handleStatusChange = (id, newStatus) => {
    if (!newStatus) return;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user ? (user.name || user.email || 'Admin') : 'Admin';

    fetch(`/identity/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Name': encodeURIComponent(userName)
      },
      body: JSON.stringify({ status: newStatus })
    }).then(res => {
      if(res.ok) fetchOrders();
    }).catch(e => console.error(e));
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusLabel = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    const baseStyle = {
      display: 'inline-block',
      fontSize: '0.7rem',
      padding: '0.3rem 0.6rem',
      borderRadius: '20px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      border: '1px solid transparent'
    };

    if (s === 'PENDING') {
      return (
        <span style={{ ...baseStyle, backgroundColor: 'rgba(185, 155, 107, 0.1)', color: '#B99B6B', borderColor: 'rgba(185, 155, 107, 0.15)' }}>
          <i className="ri-time-line" style={{ marginRight: '0.25rem' }}></i> Chờ xử lý
        </span>
      );
    }
    if (s === 'SHIPPING') {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#EAEAEA', color: '#000000', borderColor: 'rgba(0, 0, 0, 0.08)' }}>
          <i className="ri-truck-line" style={{ marginRight: '0.25rem' }}></i> Đang giao
        </span>
      );
    }
    if (s === 'COMPLETED') {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: '#065F46', borderColor: 'rgba(6, 95, 70, 0.08)' }}>
          <i className="ri-check-line" style={{ marginRight: '0.25rem' }}></i> Hoàn thành
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: 'rgba(153, 27, 27, 0.08)' }}>
          <i className="ri-close-circle-line" style={{ marginRight: '0.25rem' }}></i> Đã hủy
        </span>
      );
    }
    return <span style={baseStyle}>{s}</span>;
  };

  const filteredOrders = orders.filter(o => 
    (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.customerPhone && o.customerPhone.includes(searchQuery)) ||
    (o.ghnOrderCode && o.ghnOrderCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.id && o.id.toString().includes(searchQuery))
  );

  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>Quản Lý Đơn Hàng</h2>
         <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
              <i className="ri-refresh-line"></i> Tải Lại
            </button>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-light)', padding: '1.25rem', borderRadius: '24px', boxShadow: 'var(--shadow-extruded)' }}>
        <div className="search-wrapper" style={{ position: 'relative', width: '350px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="TÌM THEO TÊN, SĐT, MÃ ĐƠN HÀNG..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-input admin-search-input" 
          />
          <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
        </div>
      </div>
      
      <div className="shadow-extruded" style={{ backgroundColor: 'var(--bg-light)', borderRadius: '24px', overflow: 'hidden', border: 'none', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
           <thead style={{ backgroundColor: 'transparent' }}>
              <tr>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mã ĐH</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Khách Hàng</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Ngày Đặt</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Tổng Tiền</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Trạng Thái</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Thanh Toán</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'center', width: '220px' }}>Hành Động</th>
              </tr>
           </thead>
           <tbody>
              {filteredOrders.length === 0 ? (
                 <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có đơn hàng nào</td></tr>
              ) : currentOrders.map((o) => (
                 <tr key={o.id} style={{ borderTop: '1px solid var(--border-light)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>{o.ghnOrderCode || `#BN${o.id}`}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>
                       <div>{o.customerName || `User ID: ${o.userId}`}</div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.customerPhone || ''}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-color)' }}>{o.totalAmount?.toLocaleString()}đ</td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>{getStatusLabel(o.status)}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>{o.paymentMethod || 'COD'}</td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                       <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                          <button onClick={() => openDetails(o)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', height: '35px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                             Chi tiết
                          </button>
                          <select 
                             className="form-input" 
                             style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '35px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', boxShadow: 'var(--shadow-inset)', outline: 'none', cursor: 'pointer', fontWeight: 700 }}
                             value={o.status ? o.status.toUpperCase() : 'PENDING'}
                             onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          >
                             <option value="PENDING" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Chờ xử lý</option>
                             <option value="SHIPPING" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Đang giao</option>
                             <option value="COMPLETED" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Hoàn thành</option>
                             <option value="CANCELLED" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Hủy đơn</option>
                          </select>
                       </div>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
        </div>
        <Pagination
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
        />
      </div>

      {isModalOpen && selectedOrder && (
        <div className="admin-modal-overlay">
           <div className="admin-modal-content" style={{ width: '600px' }}>
              <div className="admin-modal-title">
                 <span>Chi Tiết Đơn Hàng {selectedOrder.ghnOrderCode || `#BN${selectedOrder.id}`}</span>
                 <button onClick={() => setIsModalOpen(false)}>&times;</button>
              </div>
              
              <div className="admin-section-container" style={{ margin: '0 0 1.5rem 0' }}>
                 <h4 style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dark)' }}>Thông tin người nhận</h4>
                 <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}><strong>Tên:</strong> {selectedOrder.customerName || `User ID: ${selectedOrder.userId}`}</p>
                 <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}><strong>SĐT:</strong> {selectedOrder.customerPhone || 'N/A'}</p>
                 <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                 <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dark)' }}>Sản phẩm đã đặt</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(selectedOrder.items || []).map((item, idx) => (
                       <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(163, 177, 198, 0.2)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                             <div className="shadow-inset" style={{ width: '50px', height: '50px', backgroundColor: 'var(--bg-light)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               {item.product && item.product.images && item.product.images.length > 0 ? (
                                  <img src={item.product.images.find(img=>img.isMain)?.imageUrl || item.product.images[0].imageUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/>
                               ) : <i className="ri-image-line" style={{fontSize:'1.5rem', color:'var(--text-muted)'}}></i>}
                             </div>
                             <div>
                               <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product?.name || 'Sản phẩm không xác định'}</div>
                               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Size: {item.size} {item.color ? `| Màu: ${item.color}` : ''}</div>
                             </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                             <div>{item.price?.toLocaleString()}đ x {item.quantity}</div>
                             <div style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '2px solid rgba(163, 177, 198, 0.3)', fontSize: '1.05rem', fontWeight: 700 }}>
                 <span>Tổng cộng (gồm phí ship):</span>
                 <span style={{ color: 'var(--primary-color)' }}>{selectedOrder.totalAmount?.toLocaleString()}đ</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)} style={{ padding: '0.8rem 2.5rem' }}>Đóng</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function Users() {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'admin');

  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterRole, setFilterRole] = React.useState('ALL'); // ALL, USER, ADMIN
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div style={{ padding: '2rem', color: '#ff4d4f', fontSize: '1.2rem', fontWeight: 500 }}>Bạn không có quyền quản lý người dùng.</div>;
  }

  const fetchUsers = () => {
    setLoading(true);
    fetch('/identity/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  };


  const handleDelete = (id) => {
    if(window.confirm('Bạn có chắc muốn xoá người dùng này?')) {
      fetch(`/identity/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'X-User-Name': encodeURIComponent(currentUser?.name || currentUser?.email || 'Admin') }
      })
        .then(res => {
          if(res.ok) fetchUsers();
          else alert('Lỗi khi xoá');
        });
    }
  };

  const handleRoleChange = (user, newRole) => {
    if(window.confirm(`Xác nhận đổi quyền thành ${newRole}?`)) {
      fetch(`/identity/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Name': encodeURIComponent(currentUser?.name || currentUser?.email || 'Admin')
        },
        body: JSON.stringify({ role: newRole })
      }).then(res => {
        if(res.ok) fetchUsers();
        else alert('Lỗi khi cập nhật quyền');
      });
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole !== 'ALL') {
      if (filterRole === 'ADMIN' && u.role !== 'ADMIN' && u.role !== 'EMPLOYEE') return false;
      if (filterRole === 'USER' && (u.role === 'ADMIN' || u.role === 'EMPLOYEE')) return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const nameMatch = u.name && u.name.toLowerCase().includes(q);
      const emailMatch = u.email && u.email.toLowerCase().includes(q);
      const phoneMatch = u.phone && u.phone.includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch) return false;
    }
    return true;
  });

  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', margin: 0 }}>Quản Lý Người Dùng</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className={`btn ${filterRole === 'ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setFilterRole('ALL'); setCurrentPage(1); }} style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}>Tất cả</button>
           <button className={`btn ${filterRole === 'USER' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setFilterRole('USER'); setCurrentPage(1); }} style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}>Khách hàng</button>
           <button className={`btn ${filterRole === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setFilterRole('ADMIN'); setCurrentPage(1); }} style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}>Nhân viên</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-light)', padding: '1.25rem', borderRadius: '24px', boxShadow: 'var(--shadow-extruded)' }}>
        <div className="search-wrapper" style={{ position: 'relative', width: '350px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="TÌM THEO TÊN, EMAIL, SĐT..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-input admin-search-input" 
          />
          <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
        </div>
      </div>
      
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <div className="shadow-extruded" style={{ backgroundColor: 'var(--bg-light)', borderRadius: '24px', overflow: 'hidden', border: 'none', marginBottom: '2rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead style={{ backgroundColor: 'transparent' }}>
              <tr>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'left' }}>Người dùng</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'left' }}>Email / SĐT</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'left' }}>Vai trò</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'left' }}>Ngày tham gia</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'center', width: '180px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6C63FF&color=fff`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.6)', objectFit: 'cover' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name || 'Người dùng'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.phone || 'Chưa cập nhật SĐT'}</div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: u.role === 'ADMIN' ? 'rgba(94, 106, 210, 0.15)' : u.role === 'EMPLOYEE' ? 'rgba(94, 106, 210, 0.08)' : 'transparent', color: u.role === 'ADMIN' ? '#5E6AD2' : u.role === 'EMPLOYEE' ? 'var(--primary-hover)' : 'var(--text-muted)', border: '1px solid var(--border-medium)' }}>
                      {u.role === 'ADMIN' ? 'Quản trị (Admin)' : u.role === 'EMPLOYEE' ? 'Nhân viên' : 'Khách hàng'}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                      <select 
                        value={u.role || 'USER'} 
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '12px', border: 'none', outline: 'none', height: '35px', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)', boxShadow: 'var(--shadow-inset)', fontWeight: 700 }}
                        disabled={u.id === currentUser?.id}
                      >
                        <option value="USER" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Khách hàng</option>
                        <option value="EMPLOYEE" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Nhân viên</option>
                        <option value="ADMIN" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Admin</option>
                      </select>
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        title="Xoá" 
                        disabled={u.id === currentUser?.id} 
                        style={{ 
                          padding: '0.5rem', 
                          color: u.id === currentUser?.id ? 'var(--text-muted)' : '#ff4d4f', 
                          border: 'none', 
                          backgroundColor: 'var(--bg-light)',
                          borderRadius: '12px', 
                          width: '35px', 
                          height: '35px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxShadow: u.id === currentUser?.id ? 'none' : '4px 4px 8px rgba(163, 177, 198, 0.7), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                          cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                         <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Không có người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
         </div>
          <Pagination
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        </div>
      )}
    </div>
  );
}


function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange, onItemsPerPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [hoveredKey, setHoveredKey] = React.useState(null);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }
      
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getBtnStyle = (key, isActive, isDisabled) => {
    const isHovered = hoveredKey === key;
    
    let border = '1px solid var(--border-medium)';
    let backgroundColor = 'var(--bg-light)';
    let color = 'var(--text-dark)';
    
    if (isActive) {
      border = '1px solid var(--primary-color)';
      backgroundColor = 'var(--secondary-color)';
      color = 'var(--primary-color)';
    } else if (isDisabled) {
      border = '1px solid var(--border-light)';
      color = 'var(--text-muted)';
      backgroundColor = 'var(--bg-light)';
    } else if (isHovered) {
      border = '1px solid var(--text-dark)';
      backgroundColor = 'var(--secondary-color)';
    }

    return {
      padding: '0.5rem 0.75rem',
      border: border,
      backgroundColor: backgroundColor,
      color: color,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      fontSize: '0.8rem',
      fontWeight: 700,
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '35px',
      height: '35px',
      borderRadius: 'var(--radius-sm)',
      outline: 'none'
    };
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '1.25rem 1.5rem',
      backgroundColor: 'transparent',
      borderTop: '1px solid rgba(163, 177, 198, 0.2)',
      flexWrap: 'wrap',
      gap: '1rem',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {onItemsPerPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Số dòng hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                backgroundColor: 'var(--bg-light)',
                color: 'var(--text-dark)',
                outline: 'none',
                cursor: 'pointer',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.8rem',
                boxShadow: 'var(--shadow-inset)'
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            onClick={() => !(currentPage === 1) && onPageChange(1)}
            disabled={currentPage === 1}
            style={getBtnStyle('first', false, currentPage === 1)}
            onMouseEnter={() => setHoveredKey('first')}
            onMouseLeave={() => setHoveredKey(null)}
            title="Trang đầu"
          >
            <i className="ri-double-left-line"></i>
          </button>

          <button
            onClick={() => !(currentPage === 1) && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={getBtnStyle('prev', false, currentPage === 1)}
            onMouseEnter={() => setHoveredKey('prev')}
            onMouseLeave={() => setHoveredKey(null)}
            title="Trang trước"
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={getBtnStyle(`p-${p}`, p === currentPage, false)}
              onMouseEnter={() => setHoveredKey(`p-${p}`)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => !(currentPage === totalPages) && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={getBtnStyle('next', false, currentPage === totalPages)}
            onMouseEnter={() => setHoveredKey('next')}
            onMouseLeave={() => setHoveredKey(null)}
            title="Trang sau"
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>

          <button
            onClick={() => !(currentPage === totalPages) && onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            style={getBtnStyle('last', false, currentPage === totalPages)}
            onMouseEnter={() => setHoveredKey('last')}
            onMouseLeave={() => setHoveredKey(null)}
            title="Trang cuối"
          >
            <i className="ri-double-right-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

function Logs() {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'admin');

  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterAction, setFilterAction] = React.useState('ALL'); // ALL, CREATE, UPDATE, DELETE
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  React.useEffect(() => {
    if (!isAdmin) return;
    fetchLogs();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div style={{ padding: '2rem', color: '#ff4d4f', fontSize: '1.2rem', fontWeight: 500 }}>Bạn không có quyền xem nhật ký hoạt động của hệ thống.</div>;
  }

  const fetchLogs = () => {
    setLoading(true);
    fetch('/identity/api/activity-logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(e => {
        console.error("Fetch logs error:", e);
        setLoading(false);
      });
  };

  const getActionBadge = (action) => {
    const act = action ? action.toUpperCase() : 'OTHER';
    const baseStyle = {
      display: 'inline-block',
      fontSize: '0.7rem',
      padding: '0.3rem 0.6rem',
      borderRadius: '20px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      border: '1px solid transparent'
    };

    if (act.includes('THÊM') || act.includes('CREATE') || act.includes('ADD')) {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: '#065F46', borderColor: 'rgba(6, 95, 70, 0.08)' }}>
          <i className="ri-add-circle-line" style={{ marginRight: '0.25rem' }}></i> {action}
        </span>
      );
    }
    if (act.includes('SỬA') || act.includes('CẬP NHẬT') || act.includes('UPDATE') || act.includes('EDIT')) {
      return (
        <span style={{ ...baseStyle, backgroundColor: 'rgba(185, 155, 107, 0.15)', color: 'var(--accent-gold)', borderColor: 'rgba(185, 155, 107, 0.2)' }}>
          <i className="ri-edit-line" style={{ marginRight: '0.25rem' }}></i> {action}
        </span>
      );
    }
    if (act.includes('XÓA') || act.includes('DELETE') || act.includes('REMOVE')) {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: 'rgba(153, 27, 27, 0.08)' }}>
          <i className="ri-delete-bin-line" style={{ marginRight: '0.25rem' }}></i> {action}
        </span>
      );
    }
    return (
      <span style={{ ...baseStyle, backgroundColor: '#EAEAEA', color: '#000000', borderColor: 'rgba(0, 0, 0, 0.08)', borderRadius: '20px' }}>
        {action}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterAction === 'ALL') return true;

    const act = log.action ? log.action.toUpperCase() : '';
    if (filterAction === 'CREATE') {
      return act.includes('THÊM') || act.includes('CREATE') || act.includes('ADD');
    }
    if (filterAction === 'UPDATE') {
      return act.includes('SỬA') || act.includes('CẬP NHẬT') || act.includes('UPDATE') || act.includes('EDIT');
    }
    if (filterAction === 'DELETE') {
      return act.includes('XÓA') || act.includes('DELETE') || act.includes('REMOVE');
    }
    return true;
  });

  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', margin: 0 }}>Nhật Ký Hoạt Động Hệ Thống</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <i className="ri-refresh-line"></i> Tải Lại
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-light)', padding: '1.25rem', borderRadius: '24px', boxShadow: 'var(--shadow-extruded)' }}>
        <div className="search-wrapper" style={{ position: 'relative', width: '350px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="TÌM THEO NHÂN VIÊN, HÀNH ĐỘNG, CHI TIẾT..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-input admin-search-input" 
          />
          <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'CREATE', label: 'Thêm mới' },
            { key: 'UPDATE', label: 'Cập nhật' },
            { key: 'DELETE', label: 'Xóa' }
          ].map(opt => (
            <button 
              key={opt.key}
              onClick={() => { setFilterAction(opt.key); setCurrentPage(1); }}
              style={{
                padding: '0.5rem 1.2rem',
                border: filterAction === opt.key ? '1px solid var(--primary-color)' : '1px solid var(--border-medium)',
                backgroundColor: filterAction === opt.key ? 'var(--secondary-color)' : 'var(--bg-light)',
                color: filterAction === opt.key ? 'var(--primary-color)' : 'var(--text-dark)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.05em'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 500, fontSize: '0.9rem' }}>Đang tải nhật ký hoạt động...</div>
      ) : (
        <div className="shadow-extruded" style={{ backgroundColor: 'var(--bg-light)', borderRadius: '24px', overflow: 'hidden', border: 'none', marginBottom: '2rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead style={{ backgroundColor: 'transparent' }}>
              <tr>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '180px' }}>Thời Gian</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '180px' }}>Nhân Viên</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '180px' }}>Hành Động</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Chi Tiết Hoạt Động</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--bg-light)', border: 'none', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', borderRadius: '50%' }}>
                        {(log.userName || 'AD').substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600 }}>{log.userName || 'Hệ thống'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {getActionBadge(log.action)}
                  </td>
                  <td className="allow-wrap" style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', color: '#333333', lineHeight: '1.5' }}>
                    {log.details || 'Không có chi tiết'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Không tìm thấy nhật ký hoạt động nào khớp với điều kiện.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
         </div>
          <Pagination
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        </div>
      )}
    </div>
  );
}

// === PROMOTIONS ===
function Promotions() {
  const [promotions, setPromotions] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ id: '', code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minimumOrderAmount: '', maxDiscountAmount: '', startDate: '', endDate: '', usageLimit: '', usageCount: 0, isActive: true });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL'); // ALL, ACTIVE, EXPIRED, INACTIVE

  // States and actions for Promotion Usage History
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = React.useState('');
  const [usageHistory, setUsageHistory] = React.useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);

  const openHistoryModal = async (promoCode) => {
    setSelectedPromoCode(promoCode);
    setIsHistoryOpen(true);
    setUsageHistory([]);
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/identity/api/promotions/${promoCode}/usage`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsageHistory(data);
      }
    } catch (e) {
      console.error("Lỗi khi tải lịch sử dùng mã:", e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/identity/api/promotions');
      const data = await res.json();
      if (Array.isArray(data)) setPromotions(data);
    } catch (e) {
      console.error('Lỗi khi tải danh sách khuyến mãi:', e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = formData.code ? formData.code.trim().toUpperCase() : '';
    if (!code) {
      alert('Vui lòng nhập mã khuyến mãi!');
      return;
    }

    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      alert('Giá trị giảm giá phải là số dương lớn hơn 0!');
      return;
    }

    if (formData.discountType === 'PERCENTAGE' && discountValue > 100) {
      alert('Giảm giá phần trăm không được lớn hơn 100%!');
      return;
    }

    const minimumOrderAmount = formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : null;
    if (minimumOrderAmount !== null && (isNaN(minimumOrderAmount) || minimumOrderAmount < 0)) {
      alert('Đơn hàng tối thiểu không được âm!');
      return;
    }

    const maxDiscountAmount = formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null;
    if (maxDiscountAmount !== null && (isNaN(maxDiscountAmount) || maxDiscountAmount < 0)) {
      alert('Mức giảm tối đa không được âm!');
      return;
    }

    const usageLimit = formData.usageLimit ? parseInt(formData.usageLimit) : null;
    if (usageLimit !== null && (isNaN(usageLimit) || usageLimit <= 0)) {
      alert('Giới hạn lượt dùng phải là số nguyên dương lớn hơn 0!');
      return;
    }

    const url = formData.id ? `/identity/api/promotions/${formData.id}` : '/identity/api/promotions';
    const method = formData.id ? 'PUT' : 'POST';
    
    // Parse fields safely
    const payload = {
      id: formData.id || null,
      code: code,
      description: formData.description || '',
      discountType: formData.discountType,
      discountValue: discountValue,
      minimumOrderAmount: minimumOrderAmount,
      maxDiscountAmount: formData.discountType === 'PERCENTAGE' ? maxDiscountAmount : null,
      startDate: formData.startDate ? formData.startDate + ':00' : null,
      endDate: formData.endDate ? formData.endDate + ':00' : null,
      usageLimit: usageLimit,
      usageCount: formData.usageCount ? parseInt(formData.usageCount) : 0,
      isActive: formData.isActive !== false
    };

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user ? (user.name || user.email || 'Admin') : 'Admin';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Name': encodeURIComponent(userName)
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPromotions();
        alert('Lưu mã khuyến mãi thành công!');
      } else {
        const err = await res.json();
        alert(`Không thể lưu. Lỗi: ${err.error || 'Đã có lỗi xảy ra'}`);
      }
    } catch (e) {
      console.error('Lỗi khi lưu khuyến mãi:', e);
      alert('Lỗi kết nối mạng: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userName = user ? (user.name || user.email || 'Admin') : 'Admin';

      try {
        const res = await fetch(`/identity/api/promotions/${id}`, { 
          method: 'DELETE',
          headers: {
            'X-User-Name': encodeURIComponent(userName)
          }
        });
        if (res.ok) {
          fetchPromotions();
          alert('Xóa thành công!');
        } else {
          alert('Lỗi khi xóa!');
        }
      } catch (e) {
        console.error('Lỗi khi xóa:', e);
      }
    }
  };

  const openEditModal = (promo) => {
    setFormData({
      id: promo.id,
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue || '',
      minimumOrderAmount: promo.minimumOrderAmount || '',
      maxDiscountAmount: promo.maxDiscountAmount || '',
      startDate: promo.startDate ? promo.startDate.substring(0, 16) : '',
      endDate: promo.endDate ? promo.endDate.substring(0, 16) : '',
      usageLimit: promo.usageLimit || '',
      usageCount: promo.usageCount || 0,
      isActive: promo.isActive !== false
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({ id: '', code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minimumOrderAmount: '', maxDiscountAmount: '', startDate: '', endDate: '', usageLimit: '', usageCount: 0, isActive: true });
    setIsModalOpen(true);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { hour12: false });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = 
      (promo.code && promo.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;

    const isExpired = promo.endDate && new Date() > new Date(promo.endDate);
    const isLimitReached = promo.usageLimit && promo.usageCount >= promo.usageLimit;
    const isValid = promo.isActive && !isExpired && !isLimitReached;

    if (statusFilter === 'ACTIVE') return isValid;
    if (statusFilter === 'EXPIRED') return isExpired;
    if (statusFilter === 'INACTIVE') return !promo.isActive || isLimitReached;
    return true;
  });

  const currentPromotions = filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>Quản Lý Mã Khuyến Mãi</h2>
         <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer' }}>
           <i className="ri-add-line"></i> Tạo Mã Khuyến Mãi Mới
         </button>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-light)', padding: '1.25rem', borderRadius: '24px', boxShadow: 'var(--shadow-extruded)' }}>
        <div className="search-wrapper" style={{ position: 'relative', width: '350px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="TÌM THEO MÃ, MÔ TẢ VOUCHER..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-input admin-search-input" 
          />
          <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'ACTIVE', label: 'Đang hoạt động' },
            { key: 'EXPIRED', label: 'Hết hạn' },
            { key: 'INACTIVE', label: 'Đã ẩn / Hết lượt' }
          ].map(opt => (
            <button 
              key={opt.key}
              onClick={() => { setStatusFilter(opt.key); setCurrentPage(1); }}
              style={{
                padding: '0.5rem 1.2rem',
                border: statusFilter === opt.key ? '1px solid var(--primary-color)' : '1px solid var(--border-medium)',
                backgroundColor: statusFilter === opt.key ? 'var(--secondary-color)' : 'var(--bg-light)',
                color: statusFilter === opt.key ? 'var(--primary-color)' : 'var(--text-dark)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.05em'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="promo-modal-content">
            <div className="promo-modal-title">
              <span>{formData.id ? 'Cập Nhật Chương Trình Khuyến Mãi' : 'Thêm Chương Trình Khuyến Mãi Mới'}</span>
              <button type="button" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="promo-form-group">
                <label className="promo-form-label">Mã khuyến mãi * (e.g. SUMMER20)</label>
                <input type="text" name="code" placeholder="Ví dụ: VOUCHER50K" value={formData.code || ''} onChange={handleChange} className="promo-modal-input" style={{ textTransform: 'uppercase' }} required />
              </div>

              <div className="promo-form-group">
                <label className="promo-form-label">Mô tả chương trình</label>
                <input type="text" name="description" placeholder="Ví dụ: Giảm giá 50k cho đơn hàng từ 500k dịp hè" value={formData.description || ''} onChange={handleChange} className="promo-modal-input" />
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Loại giảm giá *</label>
                  <select name="discountType" value={formData.discountType} onChange={handleChange} className="promo-modal-input" style={{ cursor: 'pointer', fontWeight: 700 }} required>
                    <option value="PERCENTAGE" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Phần trăm (%)</option>
                    <option value="FIXED" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Giá trị giảm giá *</label>
                  <input type="number" name="discountValue" placeholder={formData.discountType === 'PERCENTAGE' ? 'Ví dụ: 10 (%)' : 'Ví dụ: 50000 (đ)'} value={formData.discountValue || ''} onChange={handleChange} className="promo-modal-input" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Đơn tối thiểu (VNĐ)</label>
                  <input type="number" name="minimumOrderAmount" placeholder="Ví dụ: 200000" value={formData.minimumOrderAmount || ''} onChange={handleChange} className="promo-modal-input" />
                </div>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Giảm tối đa (VNĐ) - (Chỉ cho %)</label>
                  <input type="number" name="maxDiscountAmount" placeholder="Ví dụ: 50000" value={formData.maxDiscountAmount || ''} onChange={handleChange} className="promo-modal-input" disabled={formData.discountType !== 'PERCENTAGE'} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Ngày bắt đầu</label>
                  <input type="datetime-local" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="promo-modal-input" />
                </div>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Ngày kết thúc</label>
                  <input type="datetime-local" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="promo-modal-input" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Giới hạn lượt dùng * (Tối đa số lượt nhập)</label>
                  <input type="number" name="usageLimit" placeholder="Ví dụ: 100 (để trống nếu không giới hạn)" value={formData.usageLimit || ''} onChange={handleChange} className="promo-modal-input" />
                </div>
                <div style={{ flex: 1 }} className="promo-form-group">
                  <label className="promo-form-label">Số lượt đã dùng</label>
                  <input type="number" name="usageCount" value={formData.usageCount || 0} className="promo-modal-input" disabled />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '0.25rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive !== false} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#000000', cursor: 'pointer' }} /> 
                  Kích hoạt mã khuyến mãi ngay lập tức
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
                <button type="submit" className="promo-btn-save">Lưu khuyến mãi</button>
                <button type="button" className="promo-btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="shadow-extruded" style={{ backgroundColor: 'var(--bg-light)', borderRadius: '24px', overflow: 'hidden', border: 'none', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1150px' }}>
           <thead style={{ backgroundColor: 'transparent' }}>
              <tr>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mã Code</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mô tả</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Loại Giảm</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Giá Trị Giảm</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Đơn Tối Thiểu</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Lượt Dùng / Giới Hạn</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Thời Hạn</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Trạng Thái</th>
                 <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-dark)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'center', width: '150px' }}>Hành Động</th>
              </tr>
           </thead>
           <tbody>
              {filteredPromotions.length === 0 ? (
                 <tr>
                    <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {promotions.length === 0 
                        ? 'Chưa có chương trình khuyến mãi nào được tạo. Hãy tạo mã khuyến mãi đầu tiên!'
                        : 'Không tìm thấy chương trình khuyến mãi nào khớp với điều kiện lọc.'}
                    </td>
                 </tr>
              ) : currentPromotions.map((promo) => {
                  const isExpired = promo.endDate && new Date() > new Date(promo.endDate);
                  const isLimitReached = promo.usageLimit && promo.usageCount >= promo.usageLimit;
                  const isValid = promo.isActive && !isExpired && !isLimitReached;
 
                  return (
                   <tr key={promo.id} style={{ borderTop: '1px solid var(--border-light)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-color)', letterSpacing: '0.05em' }}>{promo.code}</td>
                      <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={promo.description}>{promo.description || '---'}</td>
                      <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem' }}>
                        {promo.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Cố định (đ)'}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue || 0}%` : `${(promo.discountValue || 0).toLocaleString()}đ`}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem' }}>
                        {promo.minimumOrderAmount ? `${promo.minimumOrderAmount.toLocaleString()}đ` : 'Không có'}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ color: isLimitReached ? '#ff4d4f' : 'inherit' }}>{promo.usageCount}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / {promo.usageLimit ? promo.usageLimit : '∞'}</span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        <div>Bắt đầu: {formatDateTime(promo.startDate)}</div>
                        <div style={{ marginTop: '0.2rem' }}>Kết thúc: {formatDateTime(promo.endDate)}</div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        {isValid ? (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.7rem', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '20px',
                            fontWeight: 700, 
                            letterSpacing: '0.05em', 
                            textTransform: 'uppercase', 
                            backgroundColor: '#D1FAE5', 
                            color: '#065F46',
                            border: '1px solid rgba(6, 95, 70, 0.1)',
                          }}>
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#065F46', borderRadius: '50%' }}></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.7rem', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '20px',
                            fontWeight: 700, 
                            letterSpacing: '0.05em', 
                            textTransform: 'uppercase', 
                            backgroundColor: !promo.isActive ? '#F3F4F6' : (isExpired ? '#FEE2E2' : '#FEF3C7'), 
                            color: !promo.isActive ? '#4B5563' : (isExpired ? '#991B1B' : '#92400E'),
                            border: `1px solid ${!promo.isActive ? 'rgba(75, 85, 99, 0.1)' : (isExpired ? 'rgba(153, 27, 27, 0.1)' : 'rgba(146, 64, 14, 0.1)')}`,
                          }}>
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: !promo.isActive ? '#4B5563' : (isExpired ? '#991B1B' : '#92400E'), borderRadius: '50%' }}></span>
                            {!promo.isActive ? 'Đã ẩn' : (isExpired ? 'Hết hạn' : 'Hết lượt')}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                          <button onClick={() => openHistoryModal(promo.code)} style={{ color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', transition: 'transform 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Lịch sử dùng" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <i className="ri-history-line" style={{ fontSize: '1.1rem' }}></i>
                          </button>
                          <button onClick={() => openEditModal(promo)} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', transition: 'transform 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Sửa" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <i className="ri-edit-line" style={{ fontSize: '1.1rem' }}></i>
                          </button>
                          <button onClick={() => handleDelete(promo.id)} style={{ color: '#ff4d4f', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', transition: 'transform 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Xóa" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <i className="ri-delete-bin-line" style={{ fontSize: '1.1rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
               })}
            </tbody>
         </table>
        </div>
         <Pagination
           totalItems={filteredPromotions.length}
           itemsPerPage={itemsPerPage}
           currentPage={currentPage}
           onPageChange={setCurrentPage}
           onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
         />
      </div>

      {isHistoryOpen && (
        <div className="admin-modal-overlay">
          <div className="history-modal-content">
            <div className="history-modal-title">
              <span>Lịch Sử Sử Dụng Mã: <span style={{ color: 'var(--primary-color)' }}>{selectedPromoCode}</span></span>
              <button type="button" onClick={() => setIsHistoryOpen(false)}>&times;</button>
            </div>
            
            {isHistoryLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Đang tải lịch sử sử dụng...</div>
            ) : usageHistory.length === 0 ? (
              <div className="history-empty-wrap">
                <div style={{
                  width: '70px',
                  height: '70px',
                  backgroundColor: 'var(--bg-light)',
                  border: 'none',
                  boxShadow: 'var(--shadow-extruded)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: 'var(--primary-color)',
                  borderRadius: '50%'
                }}>
                  <i className="ri-coupon-3-line" style={{ fontSize: '2rem' }}></i>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mã giảm giá chưa được dùng</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.5 }}>Chưa có đơn hàng nào áp dụng mã giảm giá này trên hệ thống Bờ Nờ Store.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Tìm thấy <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{usageHistory.length}</span> đơn hàng đã áp dụng thành công mã giảm giá này:
                </div>
                
                <div className="shadow-inset" style={{ overflowX: 'auto', borderRadius: '16px', backgroundColor: 'var(--bg-light)', padding: '0.5rem' }}>
                  <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'transparent' }}>
                      <tr>
                        <th>STT</th>
                        <th>Mã Đơn Hàng</th>
                        <th>Khách Hàng</th>
                        <th>SĐT</th>
                        <th>Ngày Dùng</th>
                        <th style={{ textAlign: 'right' }}>Tiền Giảm</th>
                        <th style={{ textAlign: 'right' }}>Tổng Thanh Toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageHistory.map((history, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(163, 177, 198, 0.2)', transition: 'background-color 0.2s' }}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{history.ghnOrderCode || `#BN${history.orderId}`}</td>
                          <td style={{ fontWeight: 600 }}>{history.customerName}</td>
                          <td>{history.customerPhone}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {history.createdAt ? new Date(history.createdAt).toLocaleString('vi-VN') : '---'}
                          </td>
                          <td style={{ fontWeight: 700, color: '#ff4d4f', textAlign: 'right' }}>
                            -{history.discountAmount.toLocaleString()}đ
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 700, textAlign: 'right' }}>
                            {history.totalAmount.toLocaleString()}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="button" className="admin-btn-outline" onClick={() => setIsHistoryOpen(false)} style={{ padding: '0.8rem 2.5rem' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === 9. STOCK MANAGEMENT (INLINE EDIT & WARNING STATUS) ===
function Stock() {
  const [products, setProducts] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('all'); // all, low, out
  const [editingId, setEditingId] = React.useState(null); // 'p-id' or 'v-id'
  const [editValues, setEditValues] = React.useState({});
  const [savingId, setSavingId] = React.useState(null);
  const [expandedRows, setExpandedRows] = React.useState({});

  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/identity/api/products/admin');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Lỗi khi tải danh sách sản phẩm:', e);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStockChange = (key, val) => {
    setEditValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveStock = async (product, variantId = null) => {
    const key = variantId ? `v-${variantId}` : `p-${product.id}`;
    const newStockVal = editValues[key];
    if (newStockVal === undefined || newStockVal === '') return;
    
    const newStock = parseInt(newStockVal);
    if (isNaN(newStock) || newStock < 0) {
      alert("Số lượng tồn kho phải là số lớn hơn hoặc bằng 0!");
      return;
    }

    setSavingId(key);
    
    // Prepare updated product object
    const updatedProduct = { ...product };
    if (variantId) {
      updatedProduct.variants = product.variants.map(v => {
        if (v.id === variantId) {
          return { ...v, stock: newStock };
        }
        return v;
      });
    } else {
      updatedProduct.stock = newStock;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user ? (user.name || user.email || 'Admin') : 'Admin';

    try {
      const res = await fetch(`/identity/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Name': encodeURIComponent(userName)
        },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        setEditingId(null);
        await fetchProducts();
      } else {
        alert("Lưu tồn kho thất bại!");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối!");
    } finally {
      setSavingId(null);
    }
  };

  const getProductStockStatus = (p) => {
    const hasVariants = p.variants && p.variants.length > 0;
    if (hasVariants) {
      const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const hasOut = p.variants.some(v => (v.stock || 0) === 0);
      const hasLow = p.variants.some(v => (v.stock || 0) > 0 && (v.stock || 0) <= 5);
      return { totalStock, hasOut, hasLow };
    } else {
      const totalStock = p.stock || 0;
      return { 
        totalStock, 
        hasOut: totalStock === 0, 
        hasLow: totalStock > 0 && totalStock <= 5 
      };
    }
  };

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    let matchesSearch = true;
    if (query) {
      const matchesProduct = p.name.toLowerCase().includes(query) || 
                             (p.description && p.description.toLowerCase().includes(query)) ||
                             p.id.toString().includes(query);
      
      let matchesVariant = false;
      if (p.variants && p.variants.length > 0) {
        matchesVariant = p.variants.some(v => 
          (v.sku && v.sku.toLowerCase().includes(query)) ||
          (v.size && v.size.toLowerCase().includes(query)) ||
          (v.color && v.color.toLowerCase().includes(query))
        );
      }
      matchesSearch = matchesProduct || matchesVariant;
    }
    
    const { totalStock, hasOut, hasLow } = getProductStockStatus(p);
    
    if (filterType === 'out') {
      return matchesSearch && hasOut;
    } else if (filterType === 'low') {
      return matchesSearch && hasLow;
    }
    return matchesSearch;
  });

  const stats = React.useMemo(() => {
    let outOfStockCount = 0;
    let lowStockCount = 0;
    products.forEach(p => {
      const { hasOut, hasLow } = getProductStockStatus(p);
      if (hasOut) outOfStockCount++;
      if (hasLow) lowStockCount++;
    });
    return {
      total: products.length,
      outOfStock: outOfStockCount,
      lowStock: lowStockCount
    };
  }, [products]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', margin: 0 }}>Quản Lý Tồn Kho</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Theo dõi và chỉnh sửa trực tiếp số lượng tồn kho sản phẩm, size và màu sắc.</p>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ebf3ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="ri-archive-line"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Tổng Sản Phẩm</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginTop: '0.1rem' }}>{stats.total}</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="ri-error-warning-line"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Sắp Hết Hàng (≤ 5)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.1rem' }}>{stats.lowStock}</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="ri-close-circle-line"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Đã Hết Hàng (0)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.1rem' }}>{stats.outOfStock}</div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button"
            onClick={() => { setFilterType('all'); setCurrentPage(1); }} 
            style={{ 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              backgroundColor: filterType === 'all' ? '#3b82f6' : '#ffffff',
              color: filterType === 'all' ? '#ffffff' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tất Cả
          </button>
          <button 
            type="button"
            onClick={() => { setFilterType('low'); setCurrentPage(1); }} 
            style={{ 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              backgroundColor: filterType === 'low' ? '#f59e0b' : '#ffffff',
              color: filterType === 'low' ? '#ffffff' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sắp Hết Hàng
          </button>
          <button 
            type="button"
            onClick={() => { setFilterType('out'); setCurrentPage(1); }} 
            style={{ 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              backgroundColor: filterType === 'out' ? '#ef4444' : '#ffffff',
              color: filterType === 'out' ? '#ffffff' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Đã Hết Hàng
          </button>
        </div>

        <div className="search-wrapper" style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="form-input admin-search-input" 
          />
          <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '80px' }}>ID</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Tên Sản Phẩm</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '180px' }}>Loại</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '180px' }}>Tồn Kho Tổng</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '180px' }}>Trạng Thái</th>
              <th style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, width: '120px', textAlign: 'center' }}>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy sản phẩm nào phù hợp.</td>
              </tr>
            ) : currentProducts.map(p => {
              const { totalStock, hasOut, hasLow } = getProductStockStatus(p);
              const hasVariants = p.variants && p.variants.length > 0;
              const isRowExpanded = expandedRows[p.id];
              const editKey = `p-${p.id}`;
              const isEditing = editingId === editKey;

              return (
                <React.Fragment key={p.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', backgroundColor: hasOut ? '#fff5f5' : hasLow ? '#fffbeb' : 'transparent' }}>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', color: '#64748b' }}>{p.id}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                      {hasVariants ? (
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Có phiên bản ({p.variants.length})</span>
                      ) : (
                        <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Sản phẩm đơn</span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem' }}>
                      {hasVariants ? (
                        <strong style={{ color: '#1e293b' }}>{totalStock}</strong>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isEditing ? (
                            <>
                              <input 
                                type="number" 
                                value={editValues[editKey] !== undefined ? editValues[editKey] : (p.stock || 0)}
                                onChange={(e) => handleStockChange(editKey, e.target.value)}
                                style={{ width: '70px', padding: '0.2rem 0.4rem', border: '1px solid #3b82f6', borderRadius: '4px', outline: 'none' }}
                                min="0"
                              />
                              <button 
                                type="button"
                                onClick={() => handleSaveStock(p)} 
                                disabled={savingId === editKey}
                                style={{ border: 'none', background: '#3b82f6', color: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                {savingId === editKey ? '...' : <i className="ri-check-line"></i>}
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingId(null)} 
                                style={{ border: 'none', background: '#e2e8f0', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                <i className="ri-close-line"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <span>{p.stock || 0}</span>
                              <button 
                                type="button"
                                onClick={() => { setEditingId(editKey); handleStockChange(editKey, p.stock || 0); }}
                                style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                                title="Sửa nhanh"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {hasOut ? (
                        <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#fee2e2', color: '#b91c1c' }}>Hết Hàng</span>
                      ) : hasLow ? (
                        <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#fef3c7', color: '#b45309' }}>Sắp Hết</span>
                      ) : (
                        <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#d1fae5', color: '#065f46' }}>Còn Hàng</span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                      {hasVariants ? (
                        <button 
                          type="button"
                          onClick={() => toggleRow(p.id)}
                          style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          {isRowExpanded ? 'Ẩn' : 'Xem'} <i className={isRowExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                  </tr>

                  {/* EXPANDED VARIANTS ROW */}
                  {hasVariants && isRowExpanded && (
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td colSpan="6" style={{ padding: '1rem 2rem' }}>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#475569', width: '120px' }}>Kích cỡ (Size)</th>
                                <th style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#475569', width: '120px' }}>Màu sắc</th>
                                <th style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#475569' }}>Mã SKU</th>
                                <th style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#475569', width: '200px' }}>Số Lượng Tồn</th>
                                <th style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#475569', width: '150px' }}>Trạng Thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.variants.map(v => {
                                const vEditKey = `v-${v.id}`;
                                const isVEditing = editingId === vEditKey;
                                const isVLow = (v.stock || 0) > 0 && (v.stock || 0) <= 5;
                                const isVOut = (v.stock || 0) === 0;

                                return (
                                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isVOut ? '#fffdfd' : isVLow ? '#fffdf6' : 'transparent' }}>
                                    <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{v.size}</td>
                                    <td style={{ padding: '0.6rem 1rem' }}>{v.color || 'Mặc định'}</td>
                                    <td style={{ padding: '0.6rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>{v.sku || '-'}</td>
                                    <td style={{ padding: '0.6rem 1rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {isVEditing ? (
                                          <>
                                            <input 
                                              type="number" 
                                              value={editValues[vEditKey] !== undefined ? editValues[vEditKey] : (v.stock || 0)}
                                              onChange={(e) => handleStockChange(vEditKey, e.target.value)}
                                              style={{ width: '70px', padding: '0.15rem 0.3rem', border: '1px solid #3b82f6', borderRadius: '4px', outline: 'none' }}
                                              min="0"
                                            />
                                            <button 
                                              type="button"
                                              onClick={() => handleSaveStock(p, v.id)} 
                                              disabled={savingId === vEditKey}
                                              style={{ border: 'none', background: '#3b82f6', color: '#ffffff', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                              {savingId === vEditKey ? '...' : <i className="ri-check-line"></i>}
                                            </button>
                                            <button 
                                              type="button"
                                              onClick={() => setEditingId(null)} 
                                              style={{ border: 'none', background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                              <i className="ri-close-line"></i>
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <span>{v.stock || 0}</span>
                                            <button 
                                              type="button"
                                              onClick={() => { setEditingId(vEditKey); handleStockChange(vEditKey, v.stock || 0); }}
                                              style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}
                                              title="Sửa nhanh"
                                            >
                                              <i className="ri-edit-line"></i>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: '0.6rem 1rem' }}>
                                      {isVOut ? (
                                        <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>Hết hàng</span>
                                      ) : isVLow ? (
                                        <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.75rem' }}>Sắp hết (≤5)</span>
                                      ) : (
                                        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }}>Còn hàng</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
       </div>
        <Pagination
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}

const AdminPages = { AdminLayout, Dashboard, Products, Orders, Users, Logs, Promotions, Stock };
export default AdminPages;
