import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSalesReport } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/laporan.css'
import '../styles/riwayat.css'

{/* TODO BACKEND:
  - GET /api/report/sales?period=daily&month=2026-09&dateFrom=&dateTo=&workerId=&serviceType= -> data laporan pendapatan
  - GET /api/report/categories?dateFrom=&dateTo= -> breakdown kategori layanan
*/}

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const WORKERS = [
  { value: 'all', label: 'Semua Karyawan' },
  { value: 'Agus Pratama', label: 'Agus Pratama (Senior Stylist)' },
  { value: 'Ada Wong', label: 'Ada Wong' },
  { value: 'Budi', label: 'Budi (Color Specialist)' },
  { value: 'Rina', label: 'Rina' },
  { value: 'Dimas', label: 'Dimas' }
]

function formatLongDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

function statusClass(status) {
  if (status.includes('Selesai')) return 'selesai'
  if (status.includes('Menunggu')) return 'menunggu'
  if (status.includes('Dibatalkan')) return 'dibatalkan'
  return 'selesai'
}

function methodClass(method) {
  return String(method).toLowerCase()
}

function buildBarChart(dailyStats) {
  const svgWidth = 700
  const svgHeight = 220
  const paddingBottom = 25
  const paddingTop = 20
  const chartHeight = svgHeight - paddingBottom - paddingTop
  const maxRevenue = Math.max(...dailyStats.map((d) => d.revenue), 1000000)
  const count = dailyStats.length
  const slotWidth = svgWidth / count
  const barWidth = Math.min(46, slotWidth * 0.44)

  let peakIndex = 0
  let maxRev = -1
  dailyStats.forEach((d, i) => {
    if (d.revenue > maxRev) {
      maxRev = d.revenue
      peakIndex = i
    }
  })

  const gridLines = [
    { x1: 0, y1: paddingTop, x2: svgWidth, y2: paddingTop },
    { x1: 0, y1: paddingTop + chartHeight * 0.5, x2: svgWidth, y2: paddingTop + chartHeight * 0.5 },
    { x1: 0, y1: paddingTop + chartHeight, x2: svgWidth, y2: paddingTop + chartHeight }
  ]

  const bars = dailyStats.map((day, index) => {
    const height = (day.revenue / maxRevenue) * chartHeight
    const x = index * slotWidth + (slotWidth - barWidth) / 2
    const y = paddingTop + chartHeight - height
    return { x, y, width: barWidth, height, isPeak: index === peakIndex, day, slotX: index * slotWidth, slotWidth }
  })

  return { gridLines, bars, axisDays: dailyStats.map((d) => d.day) }
}

export default function Laporan() {
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('daily')
  const [periode, setPeriode] = useState('daily')
  const [jenis, setJenis] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [worker, setWorker] = useState('all')
  const [comboboxOpen, setComboboxOpen] = useState(false)

  useEffect(() => {
    let live = true
    getSalesReport().then((report) => {
      if (live) setData(report)
    })
    return () => {
      live = false
    }
  }, [])

  if (!data) return null

  const chart = buildBarChart(data.dailyRevenue)
  const selectedWorkerText = worker === 'all' ? 'Semua Karyawan' : (WORKERS.find((w) => w.value === worker) || {}).label || worker

  const groups = {}
  data.transactions.forEach((t) => {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  })
  const groupDates = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1))

  return (
    <>
      <div className="report-page-stack">
        <div className="report-header-section">
          <h1 className="report-page-title">Laporan Pendapatan</h1>
          <p className="report-page-subtitle">Pantau pendapatan harian, performa layanan kunci, dan aktivitas transaksi salon Anda dalam satu dashboard rekap.</p>
        </div>

        <div className="report-period-switcher" data-field="report-period-switcher">
          <button
            type="button"
            className={`period-pill-btn${period === 'daily' ? ' active' : ''}`}
            data-period="daily"
            onClick={() => setPeriod('daily')}
          >
            Daily
          </button>
          <button
            type="button"
            className={`period-pill-btn${period === 'monthly' ? ' active' : ''}`}
            data-period="monthly"
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
        </div>

        <div className="report-filter-card">
          <div className="report-filter-inner">
            <div className="filter-field-wrap">
              <label className="filter-label">Periode</label>
              <select className="styled-select" id="select-period" data-field="report-period-filter" value={periode} onChange={(e) => setPeriode(e.target.value)}>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>

            <div className="filter-field-wrap">
              <label className="filter-label">Jenis Pengerjaan</label>
              <select className="styled-select" id="select-jenis-pengerjaan" data-field="report-service-filter" value={jenis} onChange={(e) => setJenis(e.target.value)}>
                <option value="all">Semua Jenis</option>
                <option value="single">Single Service</option>
                <option value="multi">Multi Service</option>
              </select>
            </div>

            <div className="filter-field-wrap">
              <label className="filter-label">Dari Tanggal</label>
              <input type="date" className="styled-input" id="input-date-from" data-field="report-date-from" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="filter-field-wrap">
              <label className="filter-label">Sampai Tanggal</label>
              <input type="date" className="styled-input" id="input-date-to" data-field="report-date-to" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="filter-field-wrap">
              <label className="filter-label">Karyawan</label>
              <div className="combobox-wrapper" id="report-worker-filter" data-field="report-worker-filter">
                <div className="combobox-input-box" id="combobox-input-box" onClick={() => setComboboxOpen((o) => !o)}>
                  <input
                    type="text"
                    id="worker-search-input"
                    className="combobox-search-field"
                    placeholder="Semua Karyawan"
                    autoComplete="off"
                    value={selectedWorkerText}
                    readOnly
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div className={`combobox-dropdown-panel${comboboxOpen ? ' show' : ''}`} id="combobox-dropdown">
                  {WORKERS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`combobox-option-row${worker === opt.value ? ' selected' : ''}`}
                      data-value={opt.value}
                      onClick={() => {
                        setWorker(opt.value)
                        setComboboxOpen(false)
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="filter-apply-row">
            <span className="filter-meta-note" id="report-filter-meta">Menampilkan data berdasarkan filter yang dipilih.</span>
            <div className="filter-actions-wrap">
              <button type="button" className="btn-combine " style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Batal</button>
              <button type="button" className="btn-combine btn-primary" data-field="btn-apply-report-filter">Terapkan Filter</button>
            </div>
          </div>
        </div>

        <div className="report-insight-card">
          <div className="insight-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#B45309' }}>
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="insight-text-wrap">
            <strong className="ai-insight-title">AI Insight</strong>
            <span className="ai-insight-text">Pendapatan service salon tumbuh <b>+18,6%</b> dibanding minggu lalu. Coba dorong penjualan <b>Hair Color</b> &amp; <b>Hair Treatment</b> sebagai kategori dengan margin terbaik.</span>
          </div>
          <button type="button" className="btn-generate-insight">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 3.79"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            <span>Generate AI Insight</span>
          </button>
        </div>

        <div className="report-stats-grid">
          <section className="report-stat-card">
            <div className="report-stat-metric">
              <h2 className="report-stat-title">Total Revenue</h2>
              <p className="report-stat-value" data-field="report-total-revenue">
                {formatRupiah(data.totalRevenue)}
              </p>
            </div>
            <div className="report-stat-meta">
              <span className="growth-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                +12,8%
              </span>
              <span className="report-stat-period">vs periode sebelumnya</span>
            </div>
          </section>

          <section className="report-stat-card">
            <div className="report-stat-metric">
              <h2 className="report-stat-title">Total Transaksi</h2>
              <p className="report-stat-value" data-field="report-transaction-count">{data.transactionCount.toLocaleString('id-ID')}</p>
            </div>
            <div className="report-stat-meta">
              <span className="report-stat-indicator positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                +8
              </span>
              <span className="report-stat-period">transaksi baru</span>
            </div>
          </section>

          <section className="report-stat-card">
            <div className="report-stat-metric">
              <h2 className="report-stat-title">Rata-Rata Transaksi</h2>
              <p className="report-stat-value">{formatRupiah(data.averageRevenue).replace(/Rp/, '')}</p>
            </div>
            <div className="report-stat-meta">
              <span className="report-stat-indicator negative">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 18 12.5 8.5 17.5 13.5 23 6"></polyline>
                  <polyline points="18 6 23 6 23 11"></polyline>
                </svg>
                -5,4%
              </span>
              <span className="report-stat-period">vs periode sebelumnya</span>
            </div>
          </section>

          <section className="report-stat-card">
            <div className="report-stat-metric">
              <h2 className="report-stat-title">Kategori Terlaris</h2>
              <p className="report-stat-value category-value">Hair Cut</p>
            </div>
            <div className="report-stat-meta">
              <span className="report-stat-indicator positive">Rp 2,4jt</span>
              <span className="report-stat-period">/ {data.dailyRevenue.length} hari terakhir</span>
            </div>
          </section>
        </div>

        <div className="report-chart-card">
          <div className="report-chart-header">
            <div>
              <h2 className="report-chart-title">Total Revenue</h2>
              <div className="report-chart-period-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span id="chart-revenue-period-label">1 - 7 September 2026</span>
              </div>
            </div>
            <div className="report-chart-revenue-wrap">
              <span className="report-chart-revenue-prefix">Rp.</span>
              <span className="report-chart-revenue-value" id="chart-revenue-val">{formatRupiah(data.totalRevenue).replace(/Rp/, '')}</span>
            </div>
          </div>

          <div className="svg-bar-chart-container">
            <div id="chart-floating-tooltip" className="chart-tooltip-floating"></div>
            <svg viewBox="0 0 700 220" preserveAspectRatio="none" id="svg-bar-chart">
              <defs>
                <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D2319" />
                  <stop offset="100%" stopColor="#1E2024" />
                </linearGradient>
                <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
              {chart.gridLines.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1.toFixed(1)}
                  y1={line.y1.toFixed(1)}
                  x2={line.x2.toFixed(1)}
                  y2={line.y2.toFixed(1)}
                  stroke={i === 2 ? '#E5E7EB' : '#F3F4F6'}
                  strokeWidth={i === 2 ? 1.5 : 1.2}
                  strokeDasharray={i === 2 ? undefined : '3 3'}
                />
              ))}
              {chart.bars.map((b) => (
                <g className="chart-bar-group" style={{ cursor: 'pointer' }} key={b.day.date + b.day.day}>
                  <title>{`${b.day.day} (${b.day.date}): ${formatRupiah(b.day.revenue)} (${b.day.count} trx)`}</title>
                  <rect
                    className="svg-bar"
                    x={b.x.toFixed(1)}
                    y={b.y.toFixed(1)}
                    width={b.width.toFixed(1)}
                    height={b.height.toFixed(1)}
                    rx="6"
                    fill={b.isPeak ? '#E5A93C' : '#1E2024'}
                  />
                  <rect x={b.slotX.toFixed(1)} y="20" width={b.slotWidth.toFixed(1)} height="175" fill="transparent" />
                </g>
              ))}
            </svg>
          </div>

          <div className="chart-axis-labels" id="chart-axis-labels">
            {chart.axisDays.map((dayLabel, i) => (
              <span key={i}>{dayLabel}</span>
            ))}
          </div>
        </div>

        <div className="report-highlight-banner">
          <div className="report-highlight-left">
            <div className="report-highlight-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a12.6 12.6 0 0 1-3.1 2.2 8.3 8.3 0 0 1-2.9 1.1c-.3-1.4-1-2.6-2.2-3.4L10.4 8.4l-1.3-0.8-2.3 1.5"></path>
                <path d="M9 15l2 3 5.5-5.5"></path>
                <path d="M3 3l18 18"></path>
              </svg>
            </div>
            <div>
              <h3 className="report-highlight-title">42,8% omset berasal dari kunjungan pertama</h3>
              <p className="report-highlight-sub">Strategi paket bundling &amp; promo new customer bisa membantu meningkatkan pendapatan bulanan.</p>
            </div>
          </div>
          <button type="button" className="btn-report-export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export CSV</span>
          </button>
          <button type="button" className="btn-report-download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Unduh PDF Laporan</span>
          </button>
        </div>

        <div className="report-kpi-grid">
          <div className="report-kpi-card">
            <div className="kpi-top-row">
              <span className="kpi-label">Active Customers</span>
              <span className="kpi-badge green">+12,5%</span>
            </div>
            <p className="kpi-value">842</p>
            <span className="kpi-comparison"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>786 bulan lalu</span>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-top-row">
              <span className="kpi-label">Retention Rate</span>
              <span className="kpi-badge green">+3,2%</span>
            </div>
            <p className="kpi-value">75%</p>
            <span className="kpi-comparison"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>72% bulan lalu</span>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-top-row">
              <span className="kpi-label">New Customers</span>
              <span className="kpi-badge green">18,2%</span>
            </div>
            <p className="kpi-value">128</p>
            <span className="kpi-comparison"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>+24 minggu ini</span>
          </div>
        </div>

        <div className="report-metadata-row">
          <span className="report-metadata-period" data-field="report-period-label">Periode Laporan: 1 - 7 September 2026</span>
          <span className="report-metadata-updated" id="report-updated-at">Diperbarui: 07 Sep 2026, 18:42 WIB</span>
        </div>

        <section className="category-breakdown-card">
          <div className="category-breakdown-header">
            <div>
              <h2 className="category-breakdown-title">Service Category Breakdown</h2>
              <p className="category-breakdown-subtitle">Distribusi pendapatan berdasarkan kategori layanan.</p>
            </div>
            <div className="category-breakdown-legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: '#E5A93C' }}></span>Hair Cut</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#6B7280' }}></span>Hair Color</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#9CA3AF' }}></span>Hair Treatment</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#E5E7EB' }}></span>Lainnya</div>
            </div>
          </div>

          <div className="category-breakdown-grid">
            <div className="category-tile hair-color">
              <div className="tile-top-row">
                <span className="tile-ring">28%</span>
                <span className="tile-count">84</span>
              </div>
              <span className="tile-label">Hair Color</span>
              <span className="tile-value">Rp 4,8jt</span>
            </div>

            <div className="category-tile hair-cut">
              <div className="tile-top-row">
                <span className="tile-ring">36%</span>
                <span className="tile-count">96</span>
              </div>
              <span className="tile-label">Hair Cut</span>
              <span className="tile-value">Rp 3,1jt</span>
            </div>

            <div className="category-tile hair-treatment">
              <div className="tile-top-row">
                <span className="tile-ring">22%</span>
                <span className="tile-count">41</span>
              </div>
              <span className="tile-label">Hair Treatment</span>
              <span className="tile-value">Rp 1,25jt</span>
            </div>

            <div className="category-tile lain-lain">
              <div className="tile-top-row">
                <span className="tile-ring">14%</span>
                <span className="tile-count">27</span>
              </div>
              <span className="tile-label">Lainnya</span>
              <span className="tile-value">Rp 820rb</span>
            </div>
          </div>

          <h2 className="category-breakdown-title" style={{ marginTop: 4 }}>Detail Per Kategori</h2>
          <div className="cat-detail-list" data-field="category-detail-list">
            {data.categoryBreakdown.map((c) => (
              <div className="cat-detail-row" key={c.category}>
                <div className="cat-detail-left">
                  <span className="cat-detail-name">{c.category}</span>
                  <span className="cat-detail-count">{c.count} transaksi</span>
                </div>
                <span className="cat-detail-total">{formatRupiah(c.revenue)}</span>
              </div>
            ))}
          </div>

          <h2 className="category-breakdown-title" style={{ marginTop: 24 }}>Layanan Terlaris</h2>
          <div className="cat-detail-list" data-field="best-services-list">
            {data.bestSellingServices.map((s) => (
              <div className="cat-detail-row" key={s.name}>
                <div className="cat-detail-left">
                  <span className="cat-detail-name">{s.name}</span>
                  <span className="cat-detail-count">{s.count} transaksi</span>
                </div>
                <span className="cat-detail-total">{formatRupiah(s.revenue)}</span>
              </div>
            ))}
          </div>

          <h2 className="category-breakdown-title" style={{ marginTop: 24 }}>Top Karyawan</h2>
          <div className="cat-detail-list" data-field="top-workers-list">
            {data.topWorkers.map((w) => (
              <div className="cat-detail-row" key={w.worker}>
                <div className="cat-detail-left">
                  <span className="cat-detail-name">{w.worker}</span>
                  <span className="cat-detail-count">{w.transactionCount} transaksi</span>
                </div>
                <span className="cat-detail-total">{formatRupiah(w.revenue)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="report-history-section" data-field="report-transaction-history">
          <div className="report-history-header">
            <div>
              <h2 className="report-history-title">Riwayat Transaksi</h2>
              <p className="report-history-subtitle">Detail semua transaksi pada periode laporan aktif.</p>
            </div>
            <div className="report-filter-badge-wrap">
              <span className="report-filter-badge">Semua Periode</span>
            </div>
          </div>

          {groupDates.map((d, idx) => {
            const dayTransactions = groups[d]
            const total = dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
            return (
              <div className="daily-group-card" key={d}>
                <div className="daily-date-info">
                  <div className="daily-calendar-date">
                    <span className="daily-calendar-day">{new Date(d + 'T00:00:00').getDate()}</span>
                    <span className="daily-calendar-month">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][new Date(d + 'T00:00:00').getMonth()]}</span>
                  </div>
                  <div className="daily-date-text">
                    <strong>{idx === 0 ? `Hari Ini — ${formatLongDate(d)}` : idx === 1 ? `Kemarin — ${formatLongDate(d)}` : formatLongDate(d)}</strong>
                    <span className="daily-summary-pills">
                      <span className="daily-count-badge">{dayTransactions.length} Transaksi</span>
                      <span className="daily-total-revenue">{formatRupiah(total)}</span>
                    </span>
                  </div>
                </div>

                <div className="table-responsive-wrapper">
                  <table className="daily-trans-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Waktu</th>
                        <th>Pelanggan</th>
                        <th>Service &amp; Stylist</th>
                        <th>Total</th>
                        <th>Metode Pembayaran</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayTransactions.map((t) => (
                        <tr key={t.id}>
                          <td><Link to="/riwayat" className="trans-id-link">#{t.id}</Link></td>
                          <td><span className="trans-time-val">{t.time}</span></td>
                          <td>
                            <div className="trx-customer-cell">
                              <span className="trx-customer-name">{t.client}</span>
                              <span className="trx-customer-phone">{t.phone}</span>
                            </div>
                          </td>
                          <td>
                            <div className="trx-service-cell">
                              <span className="service-name-text">{t.service}</span>
                              <span className="stylist-worker-name">Stylist: {t.worker}</span>
                            </div>
                          </td>
                          <td><span className="trx-total-amount">{formatRupiah(t.amount)}</span></td>
                          <td><span className={`payment-method-badge ${methodClass(t.method)}`}>{t.method}</span></td>
                          <td><span className={`trx-status-badge ${statusClass(t.status)}`}>{t.status}</span></td>
                          <td>
                            <Link to="/riwayat" className="btn-action-receipt">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                              </svg>
                              Detail Struk
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </>
  )
}