import Icon from "./Icon.jsx"
import { useEffect, useMemo, useRef, useState } from 'react'
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

export default function ComplaintForm({ onSubmit, onCancel }) {
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
