import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWorkers } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/worker.css'

const SCHEME_TABS = [
  { value: 'all', label: 'Semua Skema' },
  { value: 'daily_percentage', label: 'Persen Omset Harian' },
  { value: 'per_service', label: 'Per Layanan' }
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nama (A - Z)' },
  { value: 'name-desc', label: 'Nama (Z - A)' },
  { value: 'salary-desc', label: 'Gaji Tertinggi' },
  { value: 'salary-asc', label: 'Gaji Terendah' },
  { value: 'scheme', label: 'Skema Komisi' }
]

function rateLabel(worker) {
  if (!worker.commissionRate) return '-'
  return /^\d/.test(String(worker.commissionRate)) ? `${worker.commissionRate}%` : String(worker.commissionRate)
}

export default function Workers() {
  const [workers, setWorkers] = useState(null)
  const [schemeFilter, setSchemeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [selectedWorker, setSelectedWorker] = useState(null)

  useEffect(() => {
    getWorkers().then(setWorkers)
  }, [])

  if (!workers) return null

  let filtered = [...workers]

  if (schemeFilter !== 'all') {
    filtered = filtered.filter((w) => w.commissionScheme === schemeFilter)
  }

  const query = search.trim().toLowerCase()
  if (query) {
    filtered = filtered.filter((w) => {
      return (
        w.name.toLowerCase().includes(query) ||
        (w.phone || '').toLowerCase().includes(query) ||
        (w.commissionSchemeLabel || '').toLowerCase().includes(query)
      )
    })
  }

  if (sort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sort === 'salary-desc') {
    filtered.sort((a, b) => b.salary - a.salary)
  } else if (sort === 'salary-asc') {
    filtered.sort((a, b) => a.salary - b.salary)
  } else if (sort === 'scheme') {
    filtered.sort((a, b) => (a.commissionSchemeLabel || '').localeCompare(String(b.commissionSchemeLabel || '')))
  }

  return (
    <>
      <div className="worker-page-header-row">
        <div className="worker-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="worker-page-title">Data Karyawan</h1>
            <span className="worker-count-badge" id="worker-total-badge">{workers.length} Karyawan</span>
          </div>
          <p className="worker-page-subtitle">Kelola tim karyawan, kontak telepon, gaji pokok bulanan, dan pengaturan skema komisi.</p>
        </div>

        <Link to="/karyawan/baru/edit" className="btn-primary-gold btn-add-worker-gold" id="btn-add-worker" data-field="btn-add-worker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Karyawan</span>
        </Link>
      </div>

      <div className="worker-toolbar-card">
        <div className="worker-tabs-row">
          {SCHEME_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`worker-filter-tab${schemeFilter === tab.value ? ' active' : ''}`}
              data-scheme={tab.value}
              onClick={() => setSchemeFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="worker-controls-right">
          <div className="worker-search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="worker-search"
              className="search-input"
              placeholder="Cari nama atau no. telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="worker-sort-box">
            <span className="sort-prefix-label">Urutkan:</span>
            <select
              id="worker-sort-select"
              className="sort-select-control"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mobile-filter-dropdown-wrap">
            <select
              id="worker-mobile-scheme-select"
              className="sort-select-control"
              aria-label="Filter Skema Komisi"
              value={schemeFilter}
              onChange={(e) => setSchemeFilter(e.target.value)}
            >
              {SCHEME_TABS.map((tab) => (
                <option key={tab.value} value={tab.value}>{tab.label}</option>
              ))}
            </select>
            <select
              id="worker-mobile-sort-select"
              className="sort-select-control"
              aria-label="Urutkan Karyawan"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="worker-directory-card" id="worker-directory-card">
        <div className="table-responsive-wrapper">
          <table className="worker-detail-table" id="worker-table">
            <thead>
              <tr>
                <th>NAMA LENGKAP KARYAWAN</th>
                <th className="col-phone">KONTAK (NO. WA)</th>
                <th className="col-salary">GAJI POKOK (BULAN)</th>
                <th className="col-scheme">SKEMA KOMISI</th>
                <th className="col-rate">RATE / KOMISI</th>
                <th style={{ textAlign: 'right', width: 80 }}>AKSI</th>
              </tr>
            </thead>
            <tbody id="worker-table-body" data-field="worker-list">
              {filtered.map((worker) => {
                const schemeBadgeClass = worker.commissionScheme === 'daily_percentage' ? 'badge-loyal' : 'badge-vip'
                return (
                  <tr key={worker.id} data-worker-id={worker.id} className="js-worker-row" onClick={() => setSelectedWorker(worker)}>
                    <td>
                      <span className="worker-name-title">{worker.name}</span>
                    </td>
                    <td className="col-phone">
                      <span className="worker-phone-num">{worker.phone}</span>
                    </td>
                    <td className="col-salary">
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{formatRupiah(worker.salary)}</strong>
                    </td>
                    <td className="col-scheme">
                      <span className={`client-segment-badge ${schemeBadgeClass}`}>{worker.commissionSchemeLabel}</span>
                    </td>
                    <td className="col-rate">
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.84rem' }}>{rateLabel(worker)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div className="worker-actions-cell">
                        <Link to={`/karyawan/${worker.id}/edit`} className="btn-worker-action btn-worker-edit">Edit</Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div id="worker-empty-state" className="empty-state-card" style={{ display: filtered.length === 0 ? 'block' : 'none' }}>
          <div className="empty-state-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="empty-state-text">Tidak ada data karyawan yang cocok dengan pencarian.</p>
          </div>
        </div>
      </div>

      {selectedWorker && (
        <div className={`worker-modal-overlay${selectedWorker ? ' is-open' : ''}`} id="worker-detail-modal" role="dialog" aria-hidden="false" onClick={(e) => { if (e.target === e.currentTarget) setSelectedWorker(null) }}>
          <div className="worker-modal-card">
            <div className="worker-modal-header">
              <h3 className="worker-modal-title">Detail Karyawan</h3>
              <button type="button" className="btn-close-modal" id="btn-close-worker-modal" aria-label="Tutup Modal" onClick={() => setSelectedWorker(null)}>✕</button>
            </div>

            <div className="worker-modal-body">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Nama Lengkap</span>
                <span className="modal-detail-val" id="mdl-worker-name">{selectedWorker.name}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">No. Telepon / WA</span>
                <span className="modal-detail-val" id="mdl-worker-phone">{selectedWorker.phone}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Gaji Pokok</span>
                <span className="modal-detail-val" id="mdl-worker-salary">{formatRupiah(selectedWorker.salary)}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Skema Komisi</span>
                <span className="modal-detail-val" id="mdl-worker-scheme">{selectedWorker.commissionSchemeLabel}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Besaran Komisi</span>
                <span className="modal-detail-val" id="mdl-worker-rate">{rateLabel(selectedWorker)}</span>
              </div>
            </div>

            <div className="worker-modal-footer">
              <Link to={`/karyawan/${selectedWorker.id}/edit`} className="btn-modal-edit" id="mdl-btn-worker-edit">Edit Data</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}