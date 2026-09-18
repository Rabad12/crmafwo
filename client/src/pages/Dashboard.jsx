import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/dashboard.css'

function buildTrendChart(trendData) {
  if (!trendData || trendData.length === 0) return { line: '', area: '', points: [], days: [] }

  const svgWidth = 600
  const paddingX = 20
  const chartHeight = 95
  const groundY = 142
  const topY = 25

  const maxIncome = Math.max(...trendData.map((d) => d.income), 1)
  const minIncome = Math.min(...trendData.map((d) => d.income), 0)
  const range = maxIncome - minIncome * 0.5 || 1

  const numPoints = trendData.length
  const stepX = (svgWidth - paddingX * 2) / (numPoints - 1)

  const points = trendData.map((d, idx) => {
    const x = paddingX + idx * stepX
    const normalized = (d.income - minIncome * 0.5) / range
    const y = groundY - normalized * chartHeight
    return { x, y, day: d.day, income: d.income }
  })

  function buildSmoothPath(pts) {
    if (pts.length === 0) return ''
    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      const cpX1 = p0.x + (p1.x - p0.x) * 0.5
      const cpY1 = p0.y
      const cpX2 = p0.x + (p1.x - p0.x) * 0.5
      const cpY2 = p1.y
      d += ` C ${cpX1.toFixed(1)},${cpY1.toFixed(1)} ${cpX2.toFixed(1)},${cpY2.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
    }
    return d
  }

  const linePathD = buildSmoothPath(points)
  const firstX = points[0].x.toFixed(1)
  const lastX = points[points.length - 1].x.toFixed(1)
  const areaPathD = `${linePathD} L ${lastX},${groundY} L ${firstX},${groundY} Z`

  return {
    line: linePathD,
    area: areaPathD,
    points,
    days: trendData.map((d) => d.day)
  }
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboardSummary().then(setData)
  }, [])

  if (!data) return null

  const chart = buildTrendChart(data.incomeTrend)

  return (
    <>
      <div className="dashboard-welcome-header">
        <h1 className="welcome-title" data-field="welcome-title">
          Selamat datang kembali, {data.userGreeting}
        </h1>
        <p className="welcome-subtitle" data-field="welcome-subtitle">
          Ringkasan aktivitas hari ini, {data.dateFormatted}.
        </p>
      </div>

      <div className="stats-cards-grid">
        <div className="stat-kpi-card featured-dark-card" data-field="card-today-income">
          <div className="stat-card-top">
            <span className="stat-card-label">Pemasukan Hari Ini</span>
            <div className="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value" data-field="today-income">{formatRupiah(data.todayIncome)}</div>
          <span className="badge-growth-pill" data-field="today-growth">{data.incomeGrowth}</span>
        </div>

        <Link to="/pelanggan" className="stat-kpi-card" data-field="card-new-clients" title="Lihat Data Pelanggan">
          <div className="stat-card-top">
            <span className="stat-card-label">Pelanggan Baru</span>
            <div className="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value" data-field="new-clients-count">{data.newClientsCount}</div>
          <span className="stat-card-subtext">pelanggan baru hari ini</span>
        </Link>

        <Link to="/riwayat" className="stat-kpi-card" data-field="card-today-transactions" title="Lihat Transaksi">
          <div className="stat-card-top">
            <span className="stat-card-label">Transaksi Hari Ini</span>
            <div className="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="8" x2="18" y2="8" />
                <line x1="6" y1="12" x2="14" y2="12" />
                <line x1="6" y1="16" x2="10" y2="16" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value" data-field="today-transactions-count">{data.todayTransactionsCount}</div>
          <span className="stat-card-subtext">transaksi selesai</span>
        </Link>

        <Link to="/produk" className="stat-kpi-card" data-field="card-low-stock" title="Lihat Stok Produk">
          <div className="stat-card-top">
            <span className="stat-card-label">Stok Menipis</span>
            <div className="stat-card-icon warning-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value danger-value" data-field="low-stock-count">{data.lowStockCount}</div>
          <span className="stat-card-subtext">produk perlu direstock</span>
        </Link>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-col-left">
          <div className="dash-card" data-field="card-income-trend">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Tren Pemasukan</h2>
              <span className="dash-card-meta">7 hari terakhir</span>
            </div>

            <div className="chart-container-box">
              <svg viewBox="0 0 600 160" className="chart-svg-responsive" aria-label="Grafik Tren Pemasukan">
                <defs>
                  <linearGradient id="areaGradientGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.25" />
                    <stop offset="85%" stopColor="#FBF8F2" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <g className="chart-gridlines" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3">
                  <line x1="0" y1="30" x2="600" y2="30" />
                  <line x1="0" y1="80" x2="600" y2="80" />
                  <line x1="0" y1="130" x2="600" y2="130" />
                </g>
                <path fill="url(#areaGradientGold)" d={chart.area} />
                <path fill="none" stroke="#C5932D" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" d={chart.line} />
                <g>
                  {chart.points.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x.toFixed(1)}
                      cy={pt.y.toFixed(1)}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#C5932D"
                      strokeWidth="2.5"
                      className="chart-interactive-point"
                    >
                      <title>{`${pt.day}: ${formatRupiah(pt.income)}`}</title>
                    </circle>
                  ))}
                </g>
              </svg>

              <div className="chart-x-axis-labels">
                {chart.days.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-card" data-field="card-today-transactions-table">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Transaksi Hari Ini</h2>
              <Link to="/riwayat" className="dash-card-link">Lihat semua</Link>
            </div>

            <div className="table-responsive-wrapper">
              <table className="today-trans-table">
                <thead>
                  <tr>
                    <th>NO STRUK</th>
                    <th>PELANGGAN</th>
                    <th>LAYANAN</th>
                    <th>WAKTU</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {data.todayTransactions.map((t) => (
                    <tr key={t.id}>
                      <td><span className="trans-no-badge">{t.id}</span></td>
                      <td><span className="trans-client-name">{t.client}</span></td>
                      <td><span className="trans-service-text">{t.service}</span></td>
                      <td><span className="trans-time-text">{t.time}</span></td>
                      <td><span className="trans-total-bold">{formatRupiah(t.total)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-col-right">
          <div className="dash-card" data-field="card-low-stock-list">
            <div className="dash-card-header" style={{ marginBottom: 12 }}>
              <div className="dash-card-title-group">
                <h2 className="dash-card-title">Stok Produk Menipis</h2>
                <span className="dash-card-subtitle">Di bawah batas minimum</span>
              </div>
            </div>

            <div className="low-stock-list" data-field="low-stock-list-container">
              {data.lowStockProducts.map((p) => (
                <div className="low-stock-item" key={p.code}>
                  <div className="low-stock-left">
                    <div className="stock-initial-badge">{p.code}</div>
                    <div className="stock-item-info">
                      <span className="stock-item-name">{p.name}</span>
                      <span className="stock-item-category">
                        {p.brand ? `${p.brand} • ` : ''}{p.category}
                      </span>
                    </div>
                  </div>
                  <span className="badge-stock-danger">{p.stock} pcs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card" data-field="card-popular-services">
            <div className="dash-card-header" style={{ marginBottom: 12 }}>
              <div className="dash-card-title-group">
                <h2 className="dash-card-title">Layanan Terpopuler</h2>
                <span className="dash-card-subtitle">Minggu ini</span>
              </div>
            </div>

            <div className="popular-services-list" data-field="popular-services-container">
              {data.popularServices.map((s, i) => (
                <div className="popular-service-row" key={i}>
                  <span className="service-row-name">{s.name}</span>
                  <span className="service-row-count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}