import { useEffect, useMemo, useRef, useState } from 'react'
import './HomePage.css'
import {
  categories,
  complaintStatuses,
  initialClusters,
  initialComplaints,
  initialResourceRecommendations,
  recurringHotspots,
  sampleInsights,
  severityPriorityScores,
  teams,
} from './data/sampleData.js'

const navigationItems = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'All Complaints', icon: 'clipboard' },
  { label: 'Incident Clusters', icon: 'layers' },
  { label: 'Issue Map', icon: 'map' },
  { label: 'Resource Allocation', icon: 'users' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Settings', icon: 'settings' },
]

const categoryColors = {
  'Water Leakage': 'blue',
  'Road Damage': 'orange',
  'Pothole / Road Damage': 'orange',
  Garbage: 'green',
  'Garbage Accumulation': 'green',
  Streetlight: 'amber',
  'Broken Streetlight': 'amber',
  Other: 'slate',
}

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6M9 10h6M9 14h6M9 18h3" /><path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2A2 2 0 0 0 5.8 17l-.1.1a2 2 0 1 1-2.8-2.8L3 14a2 2 0 0 0-1.4-3.4h-.3a2 2 0 1 1 0-4h.2A2 2 0 0 0 3 3.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a2 2 0 0 0 3.4-1.4v-.3a2 2 0 1 1 4 0v.2A2 2 0 0 0 16.6 1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.3a2 2 0 1 1 0 4h-.2a2 2 0 0 0-1.5 3.8Z" transform="translate(1 2) scale(.9)" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 11 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.grid}
    </svg>
  )
}

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replaceAll(' ', '-')
  return <span className={`status-badge status-${statusClass}`}>{status}</span>
}

function PriorityBadge({ score }) {
  const priorityClass = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
  const label = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'
  return <span className={`priority-badge priority-${priorityClass}`}>{label}</span>
}

function Header({ activeSection, searchQuery, onSearchChange, onReport, notificationsOpen, onToggleNotifications, notificationCount }) {
  const title = activeSection === 'Incident Details' ? 'Incident details' : activeSection

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-separator">/</span>
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Icon name="search" size={17} />
          <span className="visually-hidden">Search complaints and locations</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search complaints, locations..."
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="notification-wrap">
          <button
            className="icon-button"
            type="button"
            aria-label={`Notifications, ${notificationCount} unread`}
            aria-expanded={notificationsOpen}
            onClick={onToggleNotifications}
          >
            <Icon name="bell" />
            {notificationCount > 0 && <span className="notification-dot" />}
          </button>
          {notificationsOpen && (
            <section className="notification-popover">
              <h2>Notifications</h2>
              <p>{notificationCount > 0 ? `${notificationCount} new reports are waiting for review.` : 'You are all caught up.'}</p>
            </section>
          )}
        </div>
        <div className="profile-summary">
          <span className="avatar" aria-hidden="true">AD</span>
          <span><strong>Alex Morgan</strong><small>Administrator</small></span>
        </div>
        <button className="button button-primary top-report-button" type="button" onClick={onReport}>
          <Icon name="plus" size={17} />
          Report new issue
        </button>
      </div>
    </header>
  )
}

function Sidebar({ activeSection, onNavigate, collapsed, onToggle }) {
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

function SummaryCard({ icon, label, value, note, tone, onClick }) {
  return (
    <button className={`metric-card metric-${tone}`} type="button" onClick={onClick}>
      <span className="metric-top">
        <span className={`metric-icon icon-${tone}`}><Icon name={icon} size={19} /></span>
        <span className="metric-note">{note}</span>
      </span>
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
      <span className="metric-link">View complaints <Icon name="arrow" size={14} /></span>
    </button>
  )
}

function SummaryCards({ complaints, onMetricClick }) {
  const metrics = [
    {
      label: 'Total Complaints',
      value: complaints.length,
      note: 'All reported issues',
      tone: 'navy',
      icon: 'clipboard',
      filter: {},
    },
    {
      label: 'Pending Issues',
      value: complaints.filter((complaint) => complaint.status !== 'Resolved').length,
      note: 'Awaiting resolution',
      tone: 'teal',
      icon: 'clock',
      filter: { status: 'pending' },
    },
    {
      label: 'High-Priority Incidents',
      value: complaints.filter((complaint) => complaint.priorityScore >= 80).length,
      note: 'Needs attention',
      tone: 'orange',
      icon: 'layers',
      filter: { priority: 'High' },
    },
    {
      label: 'Resolved Issues',
      value: complaints.filter((complaint) => complaint.status === 'Resolved').length,
      note: 'Successfully resolved',
      tone: 'green',
      icon: 'check',
      filter: { status: 'Resolved' },
    },
  ]

  return (
    <section className="metrics-grid" aria-label="Complaint summary">
      {metrics.map((metric) => (
        <SummaryCard key={metric.label} {...metric} onClick={() => onMetricClick(metric.filter)} />
      ))}
    </section>
  )
}

function SectionHeading({ eyebrow, title, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action && <button className="text-button" type="button" onClick={onAction}>{action}<Icon name="arrow" size={15} /></button>}
    </div>
  )
}

function PriorityIssues({ complaints, onViewDetails, onViewAll }) {
  const priorityComplaints = [...complaints]
    .sort((first, second) => second.priorityScore - first.priorityScore)
    .slice(0, 3)

  return (
    <section className="panel priority-panel">
      <SectionHeading eyebrow="AI-RANKED INCIDENTS · DEMO DATA" title="Priority issues" action="View all" onAction={onViewAll} />
      {priorityComplaints.length === 0 ? <p className="empty-state">No priority issues to show.</p> : (
        <div className="priority-list">
          {priorityComplaints.map((complaint, index) => (
            <article className="priority-item" key={complaint.id}>
              <span className={`priority-number priority-number-${index + 1}`}>0{index + 1}</span>
              <div className="priority-content">
                <div className="priority-title-row">
                  <h3>{complaint.title}</h3>
                  <span className="score">{complaint.priorityScore}<small>/100</small></span>
                </div>
                <div className="priority-meta">
                  <span className={`category-label category-${categoryColors[complaint.category] || 'slate'}`}>{complaint.category}</span>
                  <span><Icon name="pin" size={14} />{complaint.location}</span>
                  <PriorityBadge score={complaint.priorityScore} />
                </div>
                <p className="priority-explanation">{complaint.priorityExplanation}</p>
                <p className="recommended-action"><strong>Recommended:</strong> {complaint.recommendedAction}</p>
              </div>
              <button className="button button-secondary priority-view" type="button" onClick={() => onViewDetails(complaint.id)}>
                View details
              </button>
            </article>
          ))}
        </div>
      )}
      <p className="demo-note"><Icon name="sparkle" size={15} /> Priority scores and explanations are illustrative demonstration data.</p>
    </section>
  )
}

function ComplaintsTable({ complaints, searchQuery, filters, onFiltersChange, onViewDetails, onViewAll }) {
  const filteredComplaints = complaints.filter((complaint) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || [
      complaint.id,
      complaint.title,
      complaint.description,
      complaint.location,
      complaint.category,
    ].some((value) => value.toLowerCase().includes(query))
    const matchesCategory = !filters.category || complaint.category === filters.category
    const matchesPriority = !filters.priority ||
      (filters.priority === 'High' ? complaint.priorityScore >= 80 : complaint.priorityScore < 80)
    const matchesStatus = !filters.status ||
      (filters.status === 'pending' ? complaint.status !== 'Resolved' : complaint.status === filters.status)

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus
  })

  function updateFilter(name, value) {
    onFiltersChange({ ...filters, [name]: value })
  }

  return (
    <section className="panel complaints-panel">
      <SectionHeading title="Recent complaints" action="View all complaints" onAction={onViewAll} />
      <div className="filters-row">
        <label className="filter-control">
          <span>Category</span>
          <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="filter-control">
          <span>Priority</span>
          <select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}>
            <option value="">All priorities</option>
            <option value="High">High priority</option>
            <option value="Low">Medium / low</option>
          </select>
        </label>
        <label className="filter-control">
          <span>Status</span>
          <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">All statuses</option>
            {complaintStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            <option value="pending">Pending issues</option>
          </select>
        </label>
        <span className="result-count">{filteredComplaints.length} results</span>
      </div>
      <div className="table-scroll">
        <table className="complaints-table">
          <thead>
            <tr>
              <th scope="col">Complaint ID</th>
              <th scope="col">Issue</th>
              <th scope="col">Category</th>
              <th scope="col">Location</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
              <th scope="col">Reported date</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id}>
                <td className="complaint-id">{complaint.id}</td>
                <td className="issue-cell"><strong>{complaint.title}</strong><small>{complaint.id}</small></td>
                <td><span className={`category-label category-${categoryColors[complaint.category] || 'slate'}`}>{complaint.category}</span></td>
                <td><span className="location-cell"><Icon name="pin" size={14} />{complaint.location}</span></td>
                <td><span className="table-priority"><PriorityBadge score={complaint.priorityScore} /><small>{complaint.priorityScore}/100</small></span></td>
                <td><StatusBadge status={complaint.status} /></td>
                <td>{complaint.submittedAt}</td>
                <td><button className="row-action" type="button" onClick={() => onViewDetails(complaint.id)} aria-label={`View details for ${complaint.id}`}>···</button></td>
              </tr>
            ))}
            {filteredComplaints.length === 0 && (
              <tr><td className="table-empty" colSpan="8">No complaints match these filters. Try changing or clearing your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ComplaintForm({ onSubmit, onCancel }) {
  const [formError, setFormError] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const photoUrlRef = useRef('')

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
    }
  }, [])

  function handlePhotoChange(event) {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
    const nextPhoto = event.target.files?.[0] || null
    const nextUrl = nextPhoto ? URL.createObjectURL(nextPhoto) : ''
    photoUrlRef.current = nextUrl
    setPhoto(nextPhoto)
    setPhotoUrl(nextUrl)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      title: String(formData.get('title') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      category: String(formData.get('category') || ''),
      location: String(formData.get('location') || '').trim(),
      severity: String(formData.get('severity') || ''),
      imageFileName: photo?.name || '',
    }

    if (!values.title || !values.description || !values.category || !values.location || !values.severity) {
      setFormError('Please complete all required fields.')
      return
    }
    onSubmit(values)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="complaint-form-heading">
        <div className="modal-heading">
          <div><p className="eyebrow">CIVIC ISSUE INTAKE</p><h2 id="complaint-form-heading">Report a new issue</h2></div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close report form"><Icon name="close" /></button>
        </div>
        <p className="form-intro">Share a few details to help the response team review and prioritize this issue.</p>
        <form className="complaint-form" onSubmit={handleSubmit}>
          <label className="form-field form-full">
            <span>Complaint title <b>*</b></span>
            <input name="title" required placeholder="e.g. Water leakage near Hostel Block B" />
          </label>
          <label className="form-field form-full">
            <span>Description <b>*</b></span>
            <textarea name="description" required rows="4" placeholder="Describe what happened and who may be affected..." />
          </label>
          <label className="form-field">
            <span>Category <b>*</b></span>
            <select name="category" required defaultValue="">
              <option value="" disabled>Select a category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Severity <b>*</b></span>
            <select name="severity" required defaultValue="">
              <option value="" disabled>Select severity</option>
              {Object.keys(severityPriorityScores).map((severity) => <option key={severity} value={severity}>{severity}</option>)}
            </select>
          </label>
          <label className="form-field form-full">
            <span>Location <b>*</b></span>
            <input name="location" required placeholder="Street, landmark, or area" />
          </label>
          <label className="form-field form-full">
            <span>Photo <small>Optional</small></span>
            <input name="image" type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoUrl && <img className="photo-preview" src={photoUrl} alt="Selected complaint attachment preview" />}
            <small>Photo preview stays in your browser and is not uploaded.</small>
          </label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions form-full">
            <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
            <button className="button button-primary" type="submit"><Icon name="plus" size={17} /> Submit complaint</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function IncidentDetails({ complaint, complaints, clusters, onStatusChange, onTeamChange, onBack }) {
  if (!complaint) {
    return <section className="panel"><h2>Incident not found</h2><button className="button button-secondary" type="button" onClick={onBack}>Go back</button></section>
  }

  const cluster = clusters.find((item) => item.complaintIds.includes(complaint.id))
  const relatedComplaints = cluster
    ? complaints.filter((item) => item.id !== complaint.id && cluster.complaintIds.includes(item.id))
    : []

  return (
    <section className="detail-layout">
      <div className="panel detail-main">
        <button className="text-button detail-back" type="button" onClick={onBack}>← Back to complaints</button>
        <div className="detail-title-row">
          <div><p className="eyebrow">{complaint.id} · REPORTED {complaint.submittedAt}</p><h2>{complaint.title}</h2></div>
          <PriorityBadge score={complaint.priorityScore} />
        </div>
        <p className="detail-description">{complaint.description}</p>
        <dl className="detail-facts">
          <div><dt>Category</dt><dd>{complaint.category}</dd></div>
          <div><dt>Location</dt><dd>{complaint.location}</dd></div>
          <div><dt>Coordinates</dt><dd>{complaint.coordinates.latitude}, {complaint.coordinates.longitude}</dd></div>
          <div><dt>Severity</dt><dd>{complaint.severity}</dd></div>
          <div><dt>Priority score</dt><dd>{complaint.priorityScore} / 100</dd></div>
          <div><dt>Assigned team</dt><dd>{complaint.assignedTeam || 'Not assigned'}</dd></div>
        </dl>
        <div className="detail-section"><h3>Priority explanation</h3><p>{complaint.priorityExplanation}</p>
          <ul>{complaint.priorityFactors.map((factor) => <li key={factor}>{factor}</li>)}</ul>
        </div>
        <div className="detail-section"><h3>Recommended action</h3><p>{complaint.recommendedAction}</p></div>
        <div className="detail-section"><h3>Related reports</h3>
          {relatedComplaints.length > 0 ? <ul>{relatedComplaints.map((item) => <li key={item.id}>{item.id} · {item.title}</li>)}</ul> : <p>No linked reports in the demonstration data.</p>}
        </div>
        {complaint.imageFileName && <p className="demo-note">Local attachment: {complaint.imageFileName}</p>}
      </div>
      <aside className="panel detail-controls">
        <h3>Incident controls</h3>
        <label className="form-field"><span>Current status</span>
          <select value={complaint.status} onChange={(event) => onStatusChange(complaint.id, event.target.value)}>
            {complaintStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="form-field"><span>Assigned team</span>
          <select value={complaint.assignedTeam} onChange={(event) => onTeamChange(complaint.id, event.target.value)}>
            <option value="">Unassigned</option>
            {teams.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
        </label>
        <StatusBadge status={complaint.status} />
      </aside>
    </section>
  )
}

function IncidentClusters({ clusters, complaints, onViewDetails }) {
  return (
    <section className="page-section">
      <div className="section-intro"><h2>Incident clusters</h2><p>Predefined demonstration groups; automated clustering is not implemented.</p></div>
      <div className="cluster-grid">
        {clusters.map((cluster) => {
          const linkedComplaints = complaints.filter((item) => cluster.complaintIds.includes(item.id))
          return (
            <article className="panel cluster-card" key={cluster.id}>
              <div className="cluster-header"><span className="cluster-icon"><Icon name="layers" /></span><span className="eyebrow">{cluster.id}</span><PriorityBadge score={cluster.priorityScore} /></div>
              <h3>{cluster.title}</h3><p>{cluster.category} <span>·</span> {cluster.location}</p>
              <p className="cluster-count">{linkedComplaints.length} related complaints</p>
              <div className="linked-ids">{linkedComplaints.map((item) => <button type="button" key={item.id} onClick={() => onViewDetails(item.id)}>{item.id}</button>)}</div>
              <p><strong>Suggested action</strong><br />{cluster.suggestedAction}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function IssueMap({ complaints, onViewDetails }) {
  return (
    <section className="page-section">
      <div className="section-intro"><h2>Issue hotspots</h2><p>Sample coordinates are illustrative and do not represent verified real-world locations.</p></div>
      <div className="map-layout">
        <div className="panel map-placeholder">
          <div className="map-placeholder-title"><Icon name="map" /><span>Interactive issue map</span></div>
          <div className="map-streets" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="map-pins">
            {complaints.slice(0, 4).map((complaint, index) => (
              <button
                key={complaint.id}
                className={`map-pin map-pin-${index + 1}`}
                type="button"
                onClick={() => onViewDetails(complaint.id)}
                aria-label={`Open ${complaint.title}`}
              >{index + 1}</button>
            ))}
          </div>
          <p className="map-caption">Map integration placeholder · no map service connected</p>
          <div className="map-legend"><span><i className="legend-high" />High priority</span><span><i className="legend-medium" />Medium</span><span><i className="legend-low" />Low</span></div>
        </div>
        <aside className="panel hotspots-panel"><SectionHeading title="Recurring hotspots" />
          <ul className="hotspot-list">{recurringHotspots.map((hotspot) => (
            <li key={hotspot.location}><span className="hotspot-marker"><Icon name="pin" size={16} /></span><span><strong>{hotspot.location}</strong><small>Demonstration area</small></span><b>{hotspot.reports}<small> reports</small></b></li>
          ))}</ul>
        </aside>
      </div>
      <section className="panel coordinates-panel"><SectionHeading title="Sample incident locations" />
        <ul className="coordinate-list">{complaints.map((complaint) => (
          <li key={complaint.id}><button type="button" onClick={() => onViewDetails(complaint.id)}>{complaint.id}</button><span className={`category-label category-${categoryColors[complaint.category] || 'slate'}`}>{complaint.category}</span><span>{complaint.location}</span><code>{complaint.coordinates.latitude}, {complaint.coordinates.longitude}</code></li>
        ))}</ul>
      </section>
    </section>
  )
}

function ResourceAllocation({ recommendations, onAssign, onTeamSelect }) {
  return (
    <section className="page-section">
      <div className="section-intro"><h2>Resource allocation</h2><p>Review suggested teams and assign available resources to priority issues.</p></div>
      <div className="recommendation-list">
        {recommendations.map((recommendation) => (
          <article className="panel recommendation-card" key={recommendation.incidentId}>
            <div className="recommendation-main">
              <p className="eyebrow">INCIDENT {recommendation.incidentId}</p><h3>{recommendation.title}</h3>
              <p>{recommendation.reason}</p><div className="resource-line"><strong>Suggested resources</strong><span>{recommendation.resources}</span></div>
            </div>
            <div className="recommendation-controls">
              <label className="form-field"><span>Recommended team</span>
                <select value={recommendation.recommendedTeam} onChange={(event) => onTeamSelect(recommendation.incidentId, event.target.value)}>
                  {teams.map((team) => <option key={team} value={team}>{team}</option>)}
                </select>
              </label>
              <span className={`assignment-status ${recommendation.assignmentStatus === 'Assigned' ? 'assignment-done' : ''}`}>{recommendation.assignmentStatus}</span>
              <button className="button button-primary" type="button" onClick={() => onAssign(recommendation.incidentId)} disabled={recommendation.assignmentStatus === 'Assigned'}>
                {recommendation.assignmentStatus === 'Assigned' ? 'Team assigned' : 'Assign team'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Analytics({ complaints }) {
  const countBy = (getKey) => complaints.reduce((counts, complaint) => {
    const key = getKey(complaint)
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
  const categoryCounts = countBy((complaint) => complaint.category)
  const statusCounts = countBy((complaint) => complaint.status)
  const priorityCounts = {
    High: complaints.filter((item) => item.priorityScore >= 80).length,
    'Medium / Low': complaints.filter((item) => item.priorityScore < 80).length,
  }
  const resolvedCount = statusCounts.Resolved || 0
  const resolutionRate = complaints.length ? Math.round((resolvedCount / complaints.length) * 100) : 0
  const trendCounts = countBy((complaint) => complaint.submittedAt.slice(0, 7))
  const recurringLocations = Object.entries(countBy((complaint) => complaint.location)).filter(([, count]) => count > 1)

  return (
    <section className="page-section analytics-page">
      <div className="section-intro"><h2>Analytics</h2><p>Statistics are calculated from the current sample complaints and are illustrative only.</p></div>
      <div className="analytics-highlight panel"><span className="metric-icon icon-teal"><Icon name="chart" /></span><div><small>Resolution rate</small><strong>{resolutionRate}%</strong><p>{resolvedCount} of {complaints.length} complaints resolved</p></div></div>
      <div className="analytics-grid">
        <AnalyticsCard title="Complaints by category" counts={categoryCounts} />
        <AnalyticsCard title="Complaints by status" counts={statusCounts} />
        <AnalyticsCard title="Priority distribution" counts={priorityCounts} />
        <AnalyticsCard title="Reports over time" counts={trendCounts} />
        <article className="panel analytics-card"><h3>Recurring hotspots</h3>
          {recurringLocations.length ? <CountList counts={Object.fromEntries(recurringLocations)} /> : <p className="muted">No repeated locations in current complaints.</p>}
          <p className="muted">Additional hotspot figures are predefined demonstration data.</p>
        </article>
      </div>
    </section>
  )
}

function AnalyticsCard({ title, counts }) {
  return <article className="panel analytics-card"><h3>{title}</h3><CountList counts={counts} /></article>
}

function CountList({ counts }) {
  const entries = Object.entries(counts)
  const maxCount = Math.max(1, ...entries.map(([, count]) => count))
  return entries.length ? (
    <ul className="analytics-counts">{entries.map(([label, count]) => (
      <li key={label}><div className="analytics-count-label"><span>{label}</span><strong>{count}</strong></div><span className="analytics-track"><span style={{ width: `${(count / maxCount) * 100}%` }} /></span></li>
    ))}</ul>
  ) : <p className="muted">No complaints to summarize.</p>
}

function Insights({ onReview }) {
  return (
    <section className="panel insights-panel">
      <SectionHeading eyebrow="DEMONSTRATION INSIGHTS" title="Civic intelligence insights" action="Review insights" onAction={onReview} />
      <div className="insight-list">{sampleInsights.map((insight) => (
        <article className="insight-item" key={insight.title}>
          <span className={`insight-icon insight-${insight.tone}`}><Icon name={insight.icon} /></span>
          <div><h3>{insight.title}</h3><p>{insight.description}</p></div>
          <button className="text-button" type="button" onClick={onReview}>Review<Icon name="arrow" size={14} /></button>
        </article>
      ))}</div>
      <p className="demo-note">These sample insights are not produced by an AI service.</p>
    </section>
  )
}

function Settings() {
  return <section className="panel settings-panel"><span className="metric-icon icon-teal"><Icon name="settings" /></span><h2>Settings</h2><p>Administrative preferences can be added here in a future iteration.</p></section>
}

function HomePage() {
  const [complaints, setComplaints] = useState(initialComplaints)
  const [recommendations, setRecommendations] = useState(initialResourceRecommendations)
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ category: '', priority: '', status: '' })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedComplaintId, setSelectedComplaintId] = useState('')
  const [previousSection, setPreviousSection] = useState('Dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const clusters = initialClusters

  const selectedComplaint = complaints.find((complaint) => complaint.id === selectedComplaintId)
  const notificationCount = complaints.filter((complaint) => complaint.status === 'Reported' || complaint.status === 'Under Review').length
  const today = new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date())
  const descriptions = useMemo(() => ({
    Dashboard: 'Monitor civic issues, understand priorities, and coordinate resolutions.',
    'All Complaints': 'Review, search, and manage reports submitted by your community.',
    'Incident Clusters': 'Explore predefined groups of related reports and suggested actions.',
    'Issue Map': 'Explore sample incident locations and recurring hotspots.',
    'Resource Allocation': 'Coordinate recommended field teams and equipment.',
    Analytics: 'Understand complaint volume, priority, and resolution progress.',
    Settings: 'Manage dashboard preferences.',
  }), [])

  function openDetails(complaintId) {
    setPreviousSection(activeSection)
    setSelectedComplaintId(complaintId)
    setActiveSection('Incident Details')
    setSuccessMessage('')
  }

  function openComplaints(nextFilters = {}) {
    setFilters({ category: '', priority: '', status: '', ...nextFilters })
    setActiveSection('All Complaints')
    setSuccessMessage('')
  }

  function addComplaint(values) {
    const highestId = complaints.reduce((highest, complaint) => {
      const match = complaint.id.match(/^CS-(\d+)$/)
      return match ? Math.max(highest, Number(match[1])) : highest
    }, 1000)
    const priorityScore = severityPriorityScores[values.severity]
    const newComplaint = {
      id: `CS-${highestId + 1}`,
      title: values.title,
      description: values.description,
      category: values.category,
      location: values.location,
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      severity: values.severity,
      priorityScore,
      status: 'Reported',
      submittedAt: new Date().toISOString().slice(0, 10),
      priorityExplanation: `${values.severity} severity selected in the report form; this priority is illustrative.`,
      priorityFactors: [`${values.severity} severity`, 'Newly submitted report'],
      recommendedAction: 'Review the report and confirm an appropriate field response.',
      assignedTeam: '',
      imageFileName: values.imageFileName,
    }
    setComplaints((current) => [...current, newComplaint])
    setShowComplaintForm(false)
    setSuccessMessage(`${newComplaint.id} was submitted successfully.`)
  }

  function updateStatus(complaintId, status) {
    setComplaints((current) => current.map((complaint) => complaint.id === complaintId ? { ...complaint, status } : complaint))
  }

  function updateAssignedTeam(complaintId, team) {
    setComplaints((current) => current.map((complaint) => complaint.id === complaintId ? { ...complaint, assignedTeam: team } : complaint))
    setRecommendations((current) => current.map((item) => item.incidentId === complaintId
      ? { ...item, recommendedTeam: team, assignmentStatus: team ? 'Assigned' : 'Suggested' }
      : item))
  }

  function selectRecommendationTeam(incidentId, team) {
    setRecommendations((current) => current.map((item) => item.incidentId === incidentId
      ? { ...item, recommendedTeam: team, assignmentStatus: 'Suggested' }
      : item))
  }

  function assignTeam(incidentId) {
    const recommendation = recommendations.find((item) => item.incidentId === incidentId)
    if (recommendation) updateAssignedTeam(incidentId, recommendation.recommendedTeam)
  }

  function navigate(section) {
    setActiveSection(section)
    setShowComplaintForm(false)
    setSuccessMessage('')
  }

  function renderSection() {
    if (activeSection === 'Incident Details') {
      return <IncidentDetails
        complaint={selectedComplaint}
        complaints={complaints}
        clusters={clusters}
        onStatusChange={updateStatus}
        onTeamChange={updateAssignedTeam}
        onBack={() => setActiveSection(previousSection)}
      />
    }
    if (activeSection === 'All Complaints') {
      return <ComplaintsTable
        complaints={complaints}
        searchQuery={searchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onViewDetails={openDetails}
        onViewAll={() => setFilters({ category: '', priority: '', status: '' })}
      />
    }
    if (activeSection === 'Incident Clusters') {
      return <IncidentClusters clusters={clusters} complaints={complaints} onViewDetails={openDetails} />
    }
    if (activeSection === 'Issue Map') return <IssueMap complaints={complaints} onViewDetails={openDetails} />
    if (activeSection === 'Resource Allocation') {
      return <ResourceAllocation recommendations={recommendations} onAssign={assignTeam} onTeamSelect={selectRecommendationTeam} />
    }
    if (activeSection === 'Analytics') return <Analytics complaints={complaints} />
    if (activeSection === 'Settings') return <Settings />

    return (
      <>
        <SummaryCards complaints={complaints} onMetricClick={openComplaints} />
        <div className="dashboard-columns">
          <PriorityIssues complaints={complaints} onViewDetails={openDetails} onViewAll={() => openComplaints()} />
          <Insights onReview={() => navigate('Analytics')} />
        </div>
        <IssueMap complaints={complaints} onViewDetails={openDetails} />
        <ComplaintsTable
          complaints={complaints}
          searchQuery={searchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          onViewDetails={openDetails}
          onViewAll={() => openComplaints()}
        />
      </>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onNavigate={navigate} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <div className="workspace">
        <Header
          activeSection={activeSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReport={() => { setSuccessMessage(''); setShowComplaintForm(true) }}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((value) => !value)}
          notificationCount={notificationCount}
        />
        <main className="main-content">
          <div className="page-heading">
            <div><p className="eyebrow">CIVIC OPERATIONS / OVERVIEW</p><h1>{activeSection === 'Dashboard' ? 'Civic Intelligence Dashboard' : activeSection}</h1>
              <p>{descriptions[activeSection] || 'Review incident information and coordinate the response.'}</p></div>
            <span className="date-label"><Icon name="clock" size={16} />{today}</span>
          </div>
          {successMessage && <div className="success-banner" role="status"><Icon name="check" />{successMessage}<button type="button" onClick={() => setSuccessMessage('')} aria-label="Dismiss success message"><Icon name="close" size={16} /></button></div>}
          {renderSection()}
        </main>
      </div>
      {showComplaintForm && <ComplaintForm onSubmit={addComplaint} onCancel={() => setShowComplaintForm(false)} />}
    </div>
  )
}

export default HomePage
