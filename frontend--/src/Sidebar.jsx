import Icon from "./Icon.jsx"
import "./Sidebar.css"

const navigationItems = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'All Complaints', icon: 'clipboard', count:12 },
  { label: 'Incident Clusters', icon: 'layers' },
  { label: 'Issue Map', icon: 'map' },
  { label: 'Resource Allocation', icon: 'users' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ activeSection, onNavigate, collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); onNavigate('Dashboard') }}>
        <span className="brand-mark"><Icon name="grid" size={21} /></span>
        {!collapsed && <span><strong>CivicSense</strong><small>CIVIC INTELLIGENCE</small></span>}
      </a>
      <div className="workspace-label">{!collapsed && 'WORKSPACE'}</div>
      <nav aria-label="Main navigation">
        {navigationItems.map((item) => (
          <button
            className={`nav-item ${activeSection === item.label ? 'nav-item-active' : ''}`}
            key={item.label}
            type="button"
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            aria-current={activeSection === item.label ? 'page' : undefined}
            onClick={() => onNavigate(item.label)}
          >
            <Icon name={item.icon} size={19} />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.count != null && (
            <span className="nav-count">{item.count}</span>
            )}
          </button>
        ))}
      </nav>
      <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <span>{collapsed ? '›' : '‹'}</span>
        {!collapsed && <span>Collapse sidebar</span>}
      </button>
      <div className="sidebar-footer">
        <span className="avatar avatar-light">AD</span>
        {!collapsed && <span><strong>Alex Morgan</strong><small>City Administrator</small></span>}
      </div>
    </aside>
  )
}