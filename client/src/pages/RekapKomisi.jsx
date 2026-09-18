import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommissionReport } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/rekap-komisi.css'

{/* TODO BACKEND:
  - GET /api/reports/commission?month=YYYY-MM
*/}

const QUICK_PERIODS = {
  'bulan-ini': { from: '2026-09-01', to: '2026-09-30' },
  'bulan-lalu': { from: '2026-08-01', to: '2026-08-31' },
  '30-hari': { from: '2026-08-10', to: '2026-09-09' },
  'tahun-ini': { from: '2026-01-01', to: '2026-12-31' }
}

export default function RekapKomisi() {
  const [quickPeriod, setQuickPeriod] = useState('bulan-ini')
  const [dateFrom, setDateFrom] = useState('2026-09-01')
  const [dateTo, setDateTo] = useState('2026-09-30')
  const [report, setReport] = useState(null)
  const [activeSlip, setActiveSlip] = useState(null)

  useEffect(() => {
    let live = true
    getCommissionReport(dateFrom.slice(0, 7)).then((data) => {
      if (live) setReport(data)
    })
    return () => {
      live = false
    }
  }, [dateFrom, dateTo])

  const handleQuickPeriodChange = (value) => {
    setQuickPeriod(value)
    if (value !== 'kustom') {
      const preset = QUICK_PERIODS[value]
      if (preset) {
        setDateFrom(preset.from)
        setDateTo(preset.to)
      }
    }
  }

  const handleApplyFilter = () => {
    getCommissionReport(dateFrom.slice(0, 7)).then(setReport)
  }

  const handleReset = () => {
    setQuickPeriod('bulan-ini')
    setDateFrom('2026-09-01')
    setDateTo('2026-09-30')
  }

  if (!report) return null

  const slip = activeSlip ? activeSlip.slip : null

  return (
    <>
      <div className="rekap-header-row">
        <div className="rekap-title-group">
          <h1 className="rekap-title">Rekap Komisi Staf</h1>
          <p className="rekap-subtitle">Total komisi yang harus dibayarkan ke semua staf.</p>
        </div>
      </div>

      <div className="rekap-filter-card" data-field="rekap-filter-card">
        <div className="rekap-filter-grid">

          <div className="filter-col-item">
            <label className="filter-label" htmlFor="filter-quick-period">Periode Cepat</label>
            <div className="filter-input-wrapper">
              <select
                id="filter-quick-period"
                className="filter-select-field"
                data-field="filter-quick-period"
                value={quickPeriod}
                onChange={(e) => handleQuickPeriodChange(e.target.value)}
              >
                <option value="bulan-ini">Bulan Ini</option>
                <option value="bulan-lalu">Bulan Lalu</option>
                <option value="30-hari">30 Hari Terakhir</option>
                <option value="tahun-ini">Tahun Ini (2026)</option>
                <option value="kustom">Kustom Tanggal</option>
              </select>
            </div>
          </div>

          <div className="filter-col-item">
            <label className="filter-label" htmlFor="filter-date-from">Dari Tanggal</label>
            <div className="filter-input-wrapper">
              <input
                type="date"
                id="filter-date-from"
                className="filter-date-field"
                data-field="filter-date-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-col-item">
            <label className="filter-label" htmlFor="filter-date-to">Sampai Tanggal</label>
            <div className="filter-input-wrapper">
              <input
                type="date"
                id="filter-date-to"
                className="filter-date-field"
                data-field="filter-date-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-btn-group">
            <button type="button" id="btn-apply-filter" className="btn-filter-dark" data-field="btn-apply-filter" onClick={handleApplyFilter}>Filter</button>
            <button type="button" id="btn-reset-filter" className="btn-filter-reset" data-field="btn-reset-filter" onClick={handleReset}>Reset</button>
          </div>

        </div>
      </div>

      <div className="rekap-summary-banner" data-field="rekap-summary-banner">
        <span className="summary-banner-label">Total Komisi yang Harus Dibayar</span>
        <div className="summary-banner-amount" id="summary-total-commission">{formatRupiah(report.totals.totalCommission)}</div>
        <span className="summary-banner-period" id="summary-period-label">Periode: {dateFrom} s/d {dateTo}</span>
      </div>

      <div className="rekap-table-card" data-field="rekap-table-card">
        <div className="rekap-card-header">
          <h2 className="rekap-card-title">Pendapatan Karyawan</h2>
          <p className="rekap-card-desc">Gaji pokok + komisi per karyawan untuk periode yang sama. Klik salah satu staf untuk membuka slip pendapatannya, atau lihat ringkasan <Link to="/karyawan/pendapatan" className="inline-link-gold">pendapatan bulanan</Link>.</p>
        </div>

        <div className="table-responsive-wrapper">
          <table className="rekap-commission-table" id="commission-table">
            <thead>
              <tr>
                <th>KARYAWAN</th>
                <th>SKEMA</th>
                <th>GAJI POKOK (BULANAN)</th>
                <th>TOTAL KOMISI</th>
                <th>TOTAL PENDAPATAN</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody id="commission-table-body" data-field="commission-table-body">
              {report.rows.map((row) => {
                const badgeClass = row.schemeType === 'daily' ? 'scheme-badge-daily' : 'scheme-badge-service'
                return (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{row.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={badgeClass}>{row.scheme}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.salary > 0 ? formatRupiah(row.salary) : 'Rp0'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: row.commission > 0 ? '#B45309' : 'var(--text-muted)' }}>{formatRupiah(row.commission)}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{formatRupiah(row.totalIncome)}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn-view-slip js-open-slip" data-id={row.id} onClick={() => setActiveSlip(row)}>
                        <span>Lihat Slip</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div id="rekap-empty-box" className="rekap-empty-card" style={{ display: 'none' }}>
          <p className="rekap-empty-text">Belum ada data komisi untuk periode ini.</p>
        </div>
      </div>

      <div id="modal-slip-overlay" className="slip-modal-overlay" style={{ display: activeSlip ? 'flex' : 'none' }} onClick={(e) => { if (e.target === e.currentTarget) setActiveSlip(null) }}>
        <div className="slip-modal-dialog">
          <div className="slip-modal-header no-print">
            <h3 className="slip-modal-title">Slip Pendapatan &amp; Komisi</h3>
            <button type="button" id="btn-close-slip" className="btn-close-modal" aria-label="Tutup" onClick={() => setActiveSlip(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="slip-paper-content" id="slip-print-content">
            <div className="slip-brand-header">
              <div className="slip-brand-title">Afwo. HAIR DESIGN CRM</div>
              <span className="slip-doc-type">SLIP PENDAPATAN BULANAN STAF</span>
            </div>

            <div className="slip-meta-grid">
              <div className="slip-meta-col">
                <span className="slip-meta-label">Nama Karyawan:</span>
                <strong className="slip-meta-val" id="slip-worker-name">{slip ? slip.name : ''}</strong>
              </div>
              <div className="slip-meta-col">
                <span className="slip-meta-label">Periode Gaji:</span>
                <strong className="slip-meta-val" id="slip-period-val">{slip ? slip.period : ''}</strong>
              </div>
              <div className="slip-meta-col">
                <span className="slip-meta-label">Skema Komisi:</span>
                <span className="slip-meta-val" id="slip-scheme-val">{slip ? slip.schemeLabel : ''}</span>
              </div>
              <div className="slip-meta-col">
                <span className="slip-meta-label">Tanggal Cetak:</span>
                <span className="slip-meta-val" id="slip-print-date">09 Sep 2026, 14:30 WIB</span>
              </div>
            </div>

            <hr className="slip-divider" />

            <table className="slip-breakdown-table">
              <thead>
                <tr>
                  <th>KOMPONEN PENDAPATAN</th>
                  <th style={{ textAlign: 'right' }}>JUMLAH (IDR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gaji Pokok Bulanan</td>
                  <td style={{ textAlign: 'right' }} id="slip-salary-val">{slip ? formatRupiah(slip.salary) : ''}</td>
                </tr>
                <tr>
                  <td>Total Komisi Treatment &amp; Omset</td>
                  <td style={{ textAlign: 'right' }} id="slip-comm-val">{slip ? formatRupiah(slip.commission) : ''}</td>
                </tr>
                <tr>
                  <td>Uang Makan (Kehadiran Kerja)</td>
                  <td style={{ textAlign: 'right' }} id="slip-meal-val">{slip ? formatRupiah(slip.mealAllowance) : ''}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="slip-total-row">
                  <th>TOTAL PENDAPATAN BERSIH</th>
                  <th style={{ textAlign: 'right' }} id="slip-net-total">{slip ? formatRupiah(slip.netTotal) : ''}</th>
                </tr>
              </tfoot>
            </table>

            <div className="slip-signature-row">
              <div className="slip-sig-box">
                <span>Diterima Oleh,</span>
                <div className="sig-space"></div>
                <strong id="slip-sig-worker-name">{slip ? slip.name : ''}</strong>
              </div>
              <div className="slip-sig-box">
                <span>Disetujui Oleh,</span>
                <div className="sig-space"></div>
                <strong>Owner Afwo (Admin)</strong>
              </div>
            </div>
          </div>

          <div className="slip-modal-actions no-print">
            <button type="button" className="btn-print-slip" id="btn-print-slip-action" onClick={() => window.print()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Cetak Slip Pendapatan</span>
            </button>
            <button type="button" className="btn-cancel-modal" id="btn-cancel-slip" onClick={() => setActiveSlip(null)}>Tutup</button>
          </div>

        </div>
      </div>
    </>
  )
}