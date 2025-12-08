import React from 'react';

const Sidebar = () => {
  const ChevronDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <aside className="app-sidebar">
      <div className="sidebar-card header-card">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <div className="user-info">
          <div className="app-name">Vault</div>
          <div className="user-name">Navneeta K</div>
        </div>
        <div className="header-arrow">
          <ChevronDown />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item">
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </span>
          Dashboard
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
