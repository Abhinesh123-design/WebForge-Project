import { useEffect, useMemo, useRef, useState } from 'react'
import './HomePage.css'
import Sidebar from "./Sidebar.jsx"
import Icon from "./Icon.jsx"
import Header from "./Header.jsx"
import ComplaintForm from "./ComplaintForm.jsx"
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

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replaceAll(' ', '-')
  return <span className={`status-badge status-${statusClass}`}>{status}</span>
}

function PriorityBadge({ score }) {
  const priorityClass = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
  const label = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'
  return <span className={`priority-badge priority-${priorityClass}`}>{label}</span>
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
    console.log("table got : " , searchQuery , complaints.length);
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

function ReportAccessPrompt({ onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    closeButtonRef.current?.focus()
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="access-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="access-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-access-title"
        aria-describedby="report-access-description"
      >
        <button
          className="icon-button access-modal-close"
          type="button"
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close login prompt"
        >
          <Icon name="close" />
        </button>
        <span className="access-modal-icon"><Icon name="users" size={22} /></span>
        <p className="eyebrow">COMMUNITY REPORTING</p>
        <h2 id="report-access-title">Sign in to report an issue</h2>
        <p id="report-access-description">Please log in or sign up to report a civic issue.</p>
        <div className="access-modal-actions">
          <a className="button button-secondary" href="/login">Log In</a>
          <a className="button button-primary" href="/signup">Sign Up</a>
        </div>
        <p className="access-modal-note">Authentication is not connected yet. Reporting remains unavailable until sign-in can be verified.</p>
      </section>
    </div>
  )
}

function HomePage() {
  const [complaints, setComplaints] = useState(initialComplaints)
  const [recommendations, setRecommendations] = useState(initialResourceRecommendations)
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ category: '', priority: '', status: '' })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [showReportAccessPrompt, setShowReportAccessPrompt] = useState(false)
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

  function navigate(section) {
    setActiveSection(section)
    setShowComplaintForm(false)
    setSuccessMessage('')
  }

  function requestReportForm() {
    setSuccessMessage('')
    setShowReportAccessPrompt(true)
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
      return null
    }
    if (activeSection === 'Issue Map') return null
    if (activeSection === 'Resource Allocation') {
      return null
    }
    if (activeSection === 'Analytics') return null
    if (activeSection === 'Settings') return <Settings />

    return (
      <>
        <SummaryCards complaints={complaints} onMetricClick={openComplaints} />
        <div className="dashboard-columns">
          <PriorityIssues complaints={complaints} onViewDetails={openDetails} onViewAll={() => openComplaints()} />
          <Insights onReview={() => navigate('Analytics')} />
        </div>
        
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
          onReport={requestReportForm}
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
      {showReportAccessPrompt && <ReportAccessPrompt onClose={() => setShowReportAccessPrompt(false)} />}
    </div>
  )
}

export default HomePage
