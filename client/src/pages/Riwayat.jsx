import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTransactions } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/riwayat.css'

/*
  TODO BACKEND:
  - GET /api/transactions (Daftar transaksi dengan filter status, tanggal, dan pencarian)
  - GET /api/transactions/kpi (Ringkasan metrik transaksi)
  - POST /api/transactions (Tambah transaksi baru)
*/

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const STATUS_META = {
  paid: { className: 'status-pill status-paid', label: 'Selesai (Paid)' },
  pending: { className: 'status-pill status-pending', label: 'Menunggu (Pending)' },
  cancelled: { className: 'status-pill status-cancelled', label: 'Dibatalkan' }
}

function getDayHeading(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const dayName = DAYS[d.getDay()]
  const dayNum = d.getDate()
  const monthName = MONTHS[d.getMonth()]
  const year = d.getFullYear()

  if (dateStr === '2026-08-26') return `Hari Ini — ${dayName}, ${dayNum} ${monthName} ${year}`
  if (dateStr === '2026-08-25') return `Kemarin — ${dayName}, ${dayNum} ${monthName} ${year}`
  return `${dayName}, ${dayNum} ${monthName} ${year}`
}

function methodMeta(paymentMethod) {
  const method = String(paymentMethod || '').toLowerCase()
  if (method.includes('cash') || method.includes('tunai')) {
    return { className: 'payment-method-badge badge-cash', label: 'Tunai' }
  }
  if (method.includes('transfer')) {
    return { className: 'payment-method-badge badge-transfer', label: 'Transfer' }
  }
  return { className: 'payment-method-badge badge-qris', label: 'QRIS' }
}

function firstServiceName(trx) {
  if (trx.services && trx.services.length) return trx.services[0].name
  if (trx.service) return trx.service
  if (trx.items && trx.items.length) return trx.items[0].name
  return '-'
}

export default function Riwayat() {
  const [transactions, setTransactions] = useState(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getTransactions().then(setTransactions)
  }, [])

  const kpi = useMemo(() => {
    let totalIncome = 0
    let completedCount = 0
    let pendingCount = 0
    ;(transactions || []).forEach((t) => {
      if (t.status === 'paid') {
        totalIncome += t.amount
        completedCount++
      } else if (t.status === 'pending') {
        pendingCount++
      }
    })
    return {
      totalOrders: transactions ? transactions.length : 0,
      completedCount,
      pendingCount,
      totalIncome
    }
  }, [transactions])

  const groups = useMemo(() => {
    if (!transactions) return []
    const query = search.toLowerCase().trim()

    const filtered = transactions.filter((trx) => {
      if (activeStatus !== 'all' && trx.status !== activeStatus) return false

      if (query) {
        const matchId = String(trx.id || '').toLowerCase().includes(query)
        const clientName = trx.clientName || (trx.client && trx.client.name) || ''
        const clientPhone = (trx.client && trx.client.phone) || ''
        const matchClient = clientName.toLowerCase().includes(query) || clientPhone.includes(query)
        const matchService = firstServiceName(trx).toLowerCase().includes(query)
        const matchWorker = String(trx.worker || '').toLowerCase().includes(query)
        if (!matchId && !matchClient && !matchService && !matchWorker) return false
      }

      if (dateFrom && trx.date < dateFrom) return false
      if (dateTo && trx.date > dateTo) return false

      return true
    })

    const grouped = {}
    filtered.forEach((trx) => {
      if (!grouped[trx.date]) grouped[trx.date] = []
      grouped[trx.date].push(trx)
    })

    return Object.keys(grouped)
      .sort()
      .reverse()
      .map((dateStr) => ({
        dateStr,
        dayTrxs: grouped[dateStr],
        dayTotal: grouped[dateStr].reduce((sum, t) => sum + (t.status === 'paid' ? t.amount : 0), 0)
      }))
  }, [transactions, search, dateFrom, dateTo, activeStatus])

  const resetDates = () => {
    setDateFrom('')
    setDateTo('')
  }

  if (!transactions) return null

  return (
    <>
      {/* Header Row with "+ Tambah Transaksi" Action */}
      <div className="trans-page-header-row">
        <div className="trans-header-title-group">
          <h1 className="trans-page-title">Daftar Transaksi</h1>
          <p className="trans-page-subtitle">Kelola dan tinjau seluruh riwayat penjualan salon per hari.</p>
        </div>

        <Link to="/transaksi/baru" className="btn-primary-gold btn-create-order" id="btn-add-transaction">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Tambah Transaksi</span>
        </Link>
      </div>

      {/* Mini KPI Sparkline Cards */}
      <div className="trans-kpi-summary-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-info">
            <span className="trans-kpi-label">Total Transaksi</span>
            <span className="trans-kpi-num" id="kpi-total-orders">{kpi.totalOrders}</span>
          </div>
          <div className="trans-kpi-chart">
            <svg viewBox="0 0 80 32" className="sparkline-svg sparkline-blue">
              <path d="M0 24 Q 15 10, 30 20 T 60 8 T 80 14" fill="none" stroke="#3B82F6" strokeWidth="2.4" />
              <path d="M0 24 Q 15 10, 30 20 T 60 8 T 80 14 L 80 32 L 0 32 Z" fill="rgba(59, 130, 246, 0.12)" />
            </svg>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-info">
            <span className="trans-kpi-label">Selesai (Paid)</span>
            <span className="trans-kpi-num" id="kpi-completed-orders">{kpi.completedCount}</span>
          </div>
          <div className="trans-kpi-chart">
            <svg viewBox="0 0 80 32" className="sparkline-svg sparkline-green">
              <path d="M0 20 Q 20 6, 40 16 T 70 8 T 80 6" fill="none" stroke="#10B981" strokeWidth="2.4" />
              <path d="M0 20 Q 20 6, 40 16 T 70 8 T 80 6 L 80 32 L 0 32 Z" fill="rgba(16, 185, 129, 0.12)" />
            </svg>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-info">
            <span className="trans-kpi-label">Menunggu</span>
            <span className="trans-kpi-num" id="kpi-pending-orders">{kpi.pendingCount}</span>
          </div>
          <div className="trans-kpi-chart">
            <svg viewBox="0 0 80 32" className="sparkline-svg sparkline-orange">
              <path d="M0 16 Q 25 24, 50 12 T 80 20" fill="none" stroke="#F59E0B" strokeWidth="2.4" />
              <path d="M0 16 Q 25 24, 50 12 T 80 20 L 80 32 L 0 32 Z" fill="rgba(245, 158, 11, 0.12)" />
            </svg>
          </div>
        </div>

        <div className="trans-kpi-card featured-revenue-card">
          <div className="trans-kpi-info">
            <span className="trans-kpi-label">Total Pemasukan</span>
            <span className="trans-kpi-num" id="kpi-total-income">{formatRupiah(kpi.totalIncome)}</span>
          </div>
          <div className="trans-kpi-chart">
            <svg viewBox="0 0 80 32" className="sparkline-svg sparkline-gold">
              <path d="M0 22 Q 20 18, 40 8 T 65 14 T 80 4" fill="none" stroke="#E5A93C" strokeWidth="2.4" />
              <path d="M0 22 Q 20 18, 40 8 T 65 14 T 80 4 L 80 32 L 0 32 Z" fill="rgba(229, 169, 60, 0.18)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="trans-toolbar-card">
        <div className="trans-tabs-row">
          {['all', 'paid', 'pending', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`trans-filter-tab${activeStatus === st ? ' active' : ''}`}
              data-status={st}
              onClick={() => setActiveStatus(st)}
            >
              {st === 'all' ? 'Semua Transaksi' : st === 'paid' ? 'Selesai' : st === 'pending' ? 'Menunggu' : 'Dibatalkan'}
            </button>
          ))}
        </div>

        <div className="trans-search-filter-controls">
          <div className="trans-search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="transaction-search"
              className="search-input"
              placeholder="Cari ID, nama pelanggan, layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="trans-date-filter-group">
            <input
              type="date"
              id="filter-date-from"
              className="date-input-inline"
              title="Dari Tanggal"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="date-separator">-</span>
            <input
              type="date"
              id="filter-date-to"
              className="date-input-inline"
              title="Sampai Tanggal"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <button type="button" className="btn-date-reset" id="btn-reset-dates" title="Reset Filter Tanggal" onClick={resetDates}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Transaction Container per Day */}
      <div className="trans-daily-groups-container" id="transaction-history-list" data-field="transaction-history-list">
        {groups.map((group) => (
          <div className="daily-group-card" key={group.dateStr}>
            <div className="daily-group-header">
              <div className="daily-group-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{getDayHeading(group.dateStr)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="daily-group-badge">{group.dayTrxs.length} Transaksi</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B45309' }}>{formatRupiah(group.dayTotal)}</span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="daily-trans-table">
                <thead>
                  <tr>
                    <th>ID / Waktu</th>
                    <th>Pelanggan</th>
                    <th>Layanan &amp; Stylist</th>
                    <th>Total Biaya</th>
                    <th>Metode Bayar</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {group.dayTrxs.map((trx) => {
                    const statusMeta = STATUS_META[trx.status] || STATUS_META.paid
                    const method = methodMeta(trx.paymentMethod)
                    const clientName = trx.clientName || (trx.client && trx.client.name) || '-'
                    const clientPhone = (trx.client && trx.client.phone) || '-'
                    return (
                      <tr data-trx-id={trx.id} key={trx.id}>
                        <td style={{ width: 110 }}>
                          <button
                            type="button"
                            className="trans-order-id-link js-open-receipt"
                            data-trx-id={trx.id}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            onClick={() => setSelected(trx)}
                          >
                            {trx.id}
                          </button>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{trx.time} WIB</div>
                        </td>
                        <td>
                          <div className="trans-client-meta">
                            <div>
                              <div className="trans-client-name">{clientName}</div>
                              <div className="trans-client-phone">{clientPhone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="trans-service-title">{firstServiceName(trx)}</div>
                          <div className="trans-worker-tag">
                            Stylist: <strong>{trx.worker}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="trans-amount-cell">{formatRupiah(trx.amount)}</div>
                        </td>
                        <td>
                          <span className={method.className}>{method.label}</span>
                        </td>
                        <td>
                          <span className={statusMeta.className}>{statusMeta.label}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="btn-detail-receipt js-open-receipt" data-trx-id={trx.id} onClick={() => setSelected(trx)}>
                            Detail Struk
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div id="history-empty-state" className="empty-state-card">
          <div className="empty-state-content">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="empty-state-text">Tidak ada transaksi yang cocok dengan filter yang dipilih.</p>
          </div>
        </div>
      )}

      {/* Detail Transaksi Modal Dialog */}
      {selected && (
        <div id="trans-detail-modal" className="modal-backdrop show" aria-hidden="true">
          <div className="modal-dialog-card">
            <div className="modal-header-row">
              <h3 className="modal-header-title">Detail Struk Transaksi</h3>
              <button type="button" className="btn-close-modal" id="btn-close-modal" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body-content" id="modal-receipt-body">
              <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: 12, marginBottom: 12 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>Afwo. Hair Design</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Official Salon Payment Receipt</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>No. Transaksi:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selected.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Waktu:</span>
                <strong>{selected.date} - {selected.time} WIB</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Pelanggan:</span>
                <strong>
                  {selected.clientName || (selected.client && selected.client.name)} ({selected.client ? selected.client.phone : '-'})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Stylist:</span>
                <strong>{selected.worker}</strong>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '10px 0', marginBottom: 12 }}>
                {(selected.services && selected.services.length ? selected.services : selected.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}
                  >
                    <span>{it.name}</span>
                    <span>{formatRupiah(it.price)}</span>
                  </div>
                ))}
              </div>

              {selected.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  <span>Diskon:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>- {formatRupiah(selected.discount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: '#B45309', marginBottom: 8 }}>
                <span>TOTAL:</span>
                <span>{formatRupiah(selected.total || selected.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Metode Pembayaran:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selected.paymentMethod}</span>
              </div>
            </div>

            <div className="modal-footer-row">
              <button type="button" className="btn-print-receipt" id="btn-print-receipt" onClick={() => window.print()}>
                🖨️ Cetak Struk
              </button>
              <button type="button" className="btn-modal-close-action" id="btn-modal-close-action" onClick={() => setSelected(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}