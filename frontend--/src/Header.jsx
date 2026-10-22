import Icon from "./Icon.jsx"
import "./Header.css"
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

export default function Header({ activeSection, searchQuery, onSearchChange, onReport, notificationsOpen, onToggleNotifications, notificationCount }) {
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
            onChange={(event) => {console.log("typed : " , event.target.value); onSearchChange(event.target.value)}}
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