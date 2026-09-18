import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveClients } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/pelanggan-aktif.css'

{/* TODO BACKEND:
  - GET /api/reports/active-clients?from=...&to=...&period=...
  - GET /api/clients/:id
*/}

const PERIOD_PRESETS = {
  'bulan-ini': { from: '2026-08-01', to: '2026-08-31' },
  'bulan-lalu': { from: '2026-07-01', to: '2026-07-31' },
  '30-hari': { from: '2026-07-27', to: '2026-08-26' },
  'tahun-ini': { from: '2026-01-01', to: '2026-12-31' }
}

function formatIDR(amount) {
  return formatRupiah(amount)
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

function badgeClassFor(segment) {
  if (segment.includes('VIP')) return 'badge-vip'
  if (segment.includes('Loyal')) return 'badge-loyal'
  return 'badge-reguler'
}

export default function PelangganAktif() {
  const [periodPreset, setPeriodPreset] = useState('bulan-ini')
  const [dateFrom, setDateFrom] = useState('2026-08-01')
  const [dateTo, setDateTo] = useState('2026-08-31')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('visits-desc')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let live = true
    getActiveClients({ dateFrom, dateTo, search, sortBy }).then((data) => {
      if (live) setResult(data)
    })
    return () => {
      live = false
    }
  }, [dateFrom, dateTo, search, sortBy])

  const handlePresetChange = (value) => {
    setPeriodPreset(value)
    if (value !== 'kustom') {
      const preset = PERIOD_PRESETS[value]
      if (preset) {
        setDateFrom(preset.from)
        setDateTo(preset.to)
      }
    }
  }

  const handleApplyFilter = () => {
    getActiveClients({ dateFrom, dateTo, search, sortBy }).then(setResult)
  }

  const handleReset = () => {
    setPeriodPreset('bulan-ini')
    setDateFrom('2026-08-01')
    setDateTo('2026-08-31')
    setSearch('')
    setSortBy('visits-desc')
  }

  if (!result) return null

  return (
    <>
      <div className="active-clients-header">
        <h1 className="active-clients-title">Data Pelanggan Aktif</h1>
        <p className="active-clients-subtitle">Pelanggan dengan minimal 1 transaksi dalam periode yang dipilih.</p>
      </div>

      <div className="active-clients-filter-card" data-field="filter-card">
        <div className="active-filter-grid">

          <div className="filter-item-col">
            <label className="filter-field-label" htmlFor="filter-periode-cepat">Periode Cepat</label>
            <div className="filter-input-box">
              <select
                id="filter-periode-cepat"
                className="filter-select-control"
                data-field="periode-cepat"
                value={periodPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <option value="bulan-ini">Bulan Ini</option>
                <option value="bulan-lalu">Bulan Lalu</option>
                <option value="30-hari">30 Hari Terakhir</option>
                <option value="tahun-ini">Tahun Ini (2026)</option>
                <option value="kustom">Kustom Tanggal</option>
              </select>
            </div>
          </div>

          <div className="filter-item-col">
            <label className="filter-field-label" htmlFor="filter-dari-tanggal">Dari Tanggal</label>
            <div className="filter-input-box">
              <input
                type="date"
                id="filter-dari-tanggal"
                className="filter-input-control"
                data-field="dari-tanggal"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-item-col">
            <label className="filter-field-label" htmlFor="filter-sampai-tanggal">Sampai Tanggal</label>
            <div className="filter-input-box">
              <input
                type="date"
                id="filter-sampai-tanggal"
                className="filter-input-control"
                data-field="sampai-tanggal"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions-group">
            <button type="button" className="btn-filter-dark" id="btn-apply-filter" data-field="btn-filter" onClick={handleApplyFilter}>Filter</button>
            <button type="button" className="btn-reset-light" id="btn-reset-filter" data-field="btn-reset" onClick={handleReset}>Reset</button>
          </div>

        </div>
      </div>

      <div className="active-clients-kpi-grid" id="active-kpi-summary">
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Total Pelanggan Aktif</span>
          <div className="kpi-mini-value" id="kpi-total-clients">{result.totalActiveCount.toLocaleString('id-ID')}</div>
          <span className="kpi-mini-sub">bertransaksi di periode ini</span>
        </div>

        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Total Kunjungan</span>
          <div className="kpi-mini-value" id="kpi-total-visits">{result.totalVisits.toLocaleString('id-ID')}</div>
          <span className="kpi-mini-sub">kunjungan salon selesai</span>
        </div>

        <div className="kpi-mini-card featured-gold-kpi">
          <span className="kpi-mini-label">Total Nilai Transaksi</span>
          <div className="kpi-mini-value" id="kpi-total-revenue">{formatIDR(result.totalRevenue)}</div>
          <span className="kpi-mini-sub">dari pelanggan aktif</span>
        </div>

        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Rata-rata Belanja (AOV)</span>
          <div className="kpi-mini-value" id="kpi-avg-spend">{formatIDR(result.avgSpend)}</div>
          <span className="kpi-mini-sub">per transaksi</span>
        </div>
      </div>

      <div className="active-clients-results-card" id="results-card-container">

        <div className="results-toolbar-header" id="results-toolbar">
          <div className="search-input-box" style={{ maxWidth: 320 }}>
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="active-client-search"
              className="search-input"
              placeholder="Cari nama atau telepon..."
              aria-label="Cari pelanggan aktif"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-select-wrapper">
            <span className="sort-label">Urutkan:</span>
            <select
              id="sort-active-clients"
              className="form-select-control"
              style={{ width: 'auto', fontSize: '0.84rem', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="visits-desc">Kunjungan Terbanyak</option>
              <option value="spend-desc">Total Belanja Tertinggi</option>
              <option value="recent-desc">Kunjungan Terbaru</option>
              <option value="name-asc">Nama (A - Z)</option>
            </select>
          </div>
        </div>

        <div className="table-responsive-wrapper" id="active-table-wrapper" style={{ display: result.totalActiveCount === 0 ? 'none' : 'block' }}>
          <table className="active-clients-table" id="active-clients-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>NO</th>
                <th>PELANGGAN</th>
                <th>NO. WHATSAPP</th>
                <th>KUNJUNGAN</th>
                <th>TOTAL TRANSAKSI</th>
                <th>TERAKHIR BERKUNJUNG</th>
                <th>LAYANAN FAVORIT</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody id="active-clients-tbody" data-field="active-clients-tbody">
              {result.clients.map((client, index) => (
                <tr key={client.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td>
                    <div className="client-meta-cell">
                      <div>
                        <Link to={`/pelanggan/${client.id}`} className="client-name-link">{client.name}</Link>
                        <div><span className={`client-segment-badge ${badgeClassFor(client.segment)}`}>{client.segment}</span></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{client.phone}</span>
                  </td>
                  <td>
                    <span className="visit-badge">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#B45309' }}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                      </svg>
                      {client.visits} Kunjungan
                    </span>
                  </td>
                  <td>
                    <span className="spend-amount-highlight">{formatIDR(client.totalSpend)}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{formatDisplayDate(client.lastVisit)}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{client.favService}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons-cell">
                      <Link to={`/pelanggan/${client.id}`} className="btn-table-action btn-view-profile">Profil</Link>
                      <Link to={`/appointment/baru?clientId=${client.id}`} className="btn-table-action btn-view-profile" style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}>+ Janji Temu</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="empty-state-card" id="empty-state-container" style={{ display: result.totalActiveCount === 0 ? 'block' : 'none' }}>
          <div className="empty-state-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="empty-state-text">Tidak ada pelanggan aktif untuk periode ini.</p>
          </div>
        </div>

      </div>
    </>
  )
}