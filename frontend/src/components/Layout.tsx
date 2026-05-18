import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Plug, Settings } from 'lucide-react'

export default function Layout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span style={{ fontSize: 24 }}>📊</span>
          <h1>AnalyticsHub</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink 
            to="/integrations" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Plug size={20} />
            Integrations
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} />
            Settings
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}