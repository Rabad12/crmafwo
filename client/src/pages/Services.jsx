import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getServices, deleteService } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/services.css'

const CATEGORY_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'potong', label: 'Potong' },
  { value: 'styling', label: 'Styling' },
  { value: 'warna', label: 'Warna & Highlights' },
  { value: 'spa', label: 'Spa' }
]

const CATEGORY_LABELS = {
  potong: 'HAIR CUT',
  warna: 'COLOR',
  spa: 'SPA',
  styling: 'STYLING'
}

export default function Services() {
  const [services, setServices] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getServices().then(setServices)
  }, [])

  if (!services) return null

  const visible = filter === 'all' ? services : services.filter((s) => s.category === filter)

  const handleDelete = async (service) => {
    if (!window.confirm(`Hapus layanan "${service.name}"?`)) return
    const ok = await deleteService(service.id)
    if (ok) setServices((list) => list.filter((x) => x.id !== service.id))
  }

  return (
    <>
      <div className="services-intro-section">
        <h1 className="services-title">Service Management</h1>
        <p className="services-subtitle">Organize and update your premium salon offerings.</p>
      </div>

      <Link to="/layanan/baru/edit" className="btn-add-full" id="add-service-btn" data-field="add-service-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Add New Service</span>
      </Link>

      <div className="pill-filter-container" id="service-category-filter">
        {CATEGORY_FILTERS.map((f) => (
          <button
            type="button"
            key={f.value}
            className={`pill-tab-btn${filter === f.value ? ' active' : ''}`}
            data-filter={f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="services-list-grid" id="service-list" data-field="service-list">
        {visible.map((s) => (
          <article className="service-card" data-category={s.category} key={s.id}>
            <div className="service-card-top">
              <span className={`category-tag ${s.category}`}>{CATEGORY_LABELS[s.category] || (s.category || '').toUpperCase()}</span>
              <div className="service-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link to={`/layanan/${s.id}/edit`} className="btn-edit-icon" aria-label={`Edit ${s.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Link>
                <button type="button" className="btn-edit-icon" style={{ color: '#DC2626' }} aria-label={`Hapus ${s.name}`} onClick={() => handleDelete(s)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
            <h2 className="service-card-name" data-field="service-name">{s.name}</h2>
            <p className="service-card-desc" data-field="service-description">{s.description}</p>
            <div className="service-card-bottom">
              <div className="service-duration-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span data-field="duration">{s.duration} Min</span>
              </div>
              <span className="service-price-val" data-field="price">{formatRupiah(s.price)}</span>
            </div>
          </article>
        ))}
      </div>

      <div id="services-empty-state" className={`empty-filter-state${visible.length === 0 ? ' show' : ''}`}>
        <p>Tidak ada layanan pada kategori ini.</p>
      </div>
    </>
  )
}