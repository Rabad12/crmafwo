import { useEffect, useState } from 'react'
import { getWorkerIncomeReport } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/pendapatan-karyawan.css'

const MONTH_OPTIONS = [
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-07', label: 'Juli 2026' },
  { value: '2026-06', label: 'Juni 2026' },
  { value: '2026-05', label: 'Mei 2026' }
]

export default function PendapatanKaryawan() {
  const [report, setReport] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('2026-09')
  const [openSlipId, setOpenSlipId] = useState(null)

  useEffect(() => {
    getWorkerIncomeReport(selectedMonth).then(setReport)
  }, [selectedMonth])

  function handleShowMonth() {
    getWorkerIncomeReport(selectedMonth).then(setReport)
  }

  if (!report) return null

  const totals = report.totals
  const openSlip = openSlipId ? report.slips.find((s) => s.id === openSlipId) || report.slips[0] : null

  return (
    <>
      <div className="income-header-row">
        <div className="income-title-group">
          <h1 className="income-title">Pendapatan Bulanan Karyawan</h1>
          <p className="income-subtitle">Gaji pokok + komisi + uang makan yang diterima tiap karyawan dalam satu bulan.</p>
        </div>
      </div>

      <div className="income-filter-card" data-field="income-filter-card">
        <div className="income-filter-row">
          <div className="filter-month-item">
            <label className="month-label" htmlFor="select-month-picker">Bulan</label>
            <div className="month-select-wrapper">
              <select
                id="select-month-picker"
                className="month-select-field"
                data-field="select-month-picker"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" id="btn-show-month" className="btn-show-dark" data-field="btn-show-month" onClick={handleShowMonth}>Tampilkan</button>
        </div>
      </div>

      <div className="income-summary-banner" data-field="income-summary-banner">
        <span className="income-banner-label" id="summary-month-title">Total Pendapatan Semua Karyawan — {report.monthLabel}</span>
        <div className="income-banner-amount" id="summary-total-all-income">{formatRupiah(totals.grandTotal)}</div>
        <span className="income-banner-subtext" id="summary-breakdown-subtext">
          Komisi {formatRupiah(totals.totalCommission)} + Gaji Pokok {formatRupiah(totals.totalSalary)} + Uang Makan {formatRupiah(totals.totalMealAllowance)}
        </span>
      </div>

      <div className="income-table-card" data-field="income-table-card">
        <div className="table-responsive-wrapper">
          <table className="income-detail-table" id="monthly-income-table">
            <thead>
              <tr>
                <th>KARYAWAN</th>
                <th>SKEMA</th>
                <th>KOMISI PER LAYANAN</th>
                <th>KOMISI HARIAN (%)</th>
                <th>TOTAL KOMISI</th>
                <th>GAJI POKOK</th>
                <th>HADIR (HARI)</th>
                <th>UANG MAKAN</th>
                <th>TOTAL PENDAPATAN</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody id="monthly-income-body" data-field="monthly-income-body">
              {report.rows.map((r) => {
                const badgeClass = r.schemeType === 'daily' ? 'scheme-badge-daily' : 'scheme-badge-service'
                return (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{r.name}</strong>
                    </td>
                    <td>
                      <span className={badgeClass}>{r.scheme}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.totalService > 0 ? formatRupiah(r.totalService) : '-'}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.totalDaily > 0 ? formatRupiah(r.totalDaily) : '-'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: r.totalCommission > 0 ? '#B45309' : 'var(--text-muted)' }}>{formatRupiah(r.totalCommission)}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.salary > 0 ? formatRupiah(r.salary) : 'Rp0'}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)' }}>{r.attendanceDays > 0 ? r.attendanceDays : '-'}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.totalMealAllowance > 0 ? formatRupiah(r.totalMealAllowance) : '-'}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{formatRupiah(r.totalIncome)}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn-slip-detail js-open-monthly-slip" data-id={r.id} onClick={() => setOpenSlipId(r.id)}>
                        <span>Slip Detail</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot id="monthly-income-foot">
              <tr className="income-tfoot-row">
                <th>TOTAL</th>
                <th></th>
                <th id="foot-comm-service">{totals.totalService > 0 ? formatRupiah(totals.totalService) : 'Rp0'}</th>
                <th id="foot-comm-daily">{totals.totalDaily > 0 ? formatRupiah(totals.totalDaily) : 'Rp0'}</th>
                <th id="foot-total-comm">{formatRupiah(totals.totalCommission)}</th>
                <th id="foot-total-salary">{formatRupiah(totals.totalSalary)}</th>
                <th id="foot-total-attendance">{totals.totalAttendance}</th>
                <th id="foot-total-meal">{formatRupiah(totals.totalMealAllowance)}</th>
                <th id="foot-grand-total">{formatRupiah(totals.grandTotal)}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="income-table-footer-legend">
          <p className="legend-text">Gaji pokok dibayar utuh per bulan (tidak di-pro-rata). Komisi dihitung dari transaksi berstatus selesai pada bulan terpilih. Uang makan Rp25.000 per hari hadir dari absensi, hanya untuk karyawan skema per layanan.</p>
        </div>
      </div>

      <div id="modal-slip-overlay" className="slip-modal-overlay" style={{ display: openSlip ? 'flex' : 'none' }} onClick={(e) => { if (e.target === e.currentTarget) setOpenSlipId(null) }}>
        {openSlip && (
          <div className="slip-modal-dialog">
            <div className="slip-modal-header no-print">
              <h3 className="slip-modal-title">Slip Pendapatan &amp; Komisi</h3>
              <button type="button" id="btn-close-slip" className="btn-close-modal" aria-label="Tutup" onClick={() => setOpenSlipId(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="slip-paper-content" id="slip-print-content">
              <div className="slip-brand-header">
                <div className="slip-brand-title">Afwo. HAIR DESIGN CRM</div>
                <span className="slip-doc-type">SLIP GAJI &amp; PENDAPATAN BULANAN</span>
              </div>

              <div className="slip-meta-grid">
                <div className="slip-meta-col">
                  <span className="slip-meta-label">Nama Karyawan:</span>
                  <strong className="slip-meta-val" id="slip-worker-name">{openSlip.name}</strong>
                </div>
                <div className="slip-meta-col">
                  <span className="slip-meta-label">Bulan:</span>
                  <strong className="slip-meta-val" id="slip-month-val">{openSlip.monthLabel}</strong>
                </div>
                <div className="slip-meta-col">
                  <span className="slip-meta-label">Skema Komisi:</span>
                  <span className="slip-meta-val" id="slip-scheme-val">{openSlip.scheme}</span>
                </div>
                <div className="slip-meta-col">
                  <span className="slip-meta-label">Hari Hadir:</span>
                  <span className="slip-meta-val" id="slip-days-val">{openSlip.attendanceDays} Hari Hadir (Uang Makan {formatRupiah(openSlip.mealAllowance)})</span>
                </div>
              </div>

              <hr className="slip-divider" />

              <table className="slip-breakdown-table">
                <thead>
                  <tr>
                    <th>KOMPONEN GAJI &amp; PENDAPATAN</th>
                    <th style={{ textAlign: 'right' }}>JUMLAH (IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gaji Pokok Bulanan</td>
                    <td style={{ textAlign: 'right' }} id="slip-salary-val">{formatRupiah(openSlip.salary)}</td>
                  </tr>
                  <tr>
                    <td>Total Komisi Layanan &amp; Omset</td>
                    <td style={{ textAlign: 'right' }} id="slip-comm-val">{formatRupiah(openSlip.commission)}</td>
                  </tr>
                  <tr>
                    <td>Uang Makan Kehadiran</td>
                    <td style={{ textAlign: 'right' }} id="slip-meal-val">{formatRupiah(openSlip.mealAllowance)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="slip-total-row">
                    <th>TOTAL DITERIMA KARYAWAN</th>
                    <th style={{ textAlign: 'right' }} id="slip-net-total">{formatRupiah(openSlip.netTotal)}</th>
                  </tr>
                </tfoot>
              </table>

              <div className="slip-signature-row">
                <div className="slip-sig-box">
                  <span>Diterima Oleh,</span>
                  <div className="sig-space"></div>
                  <strong id="slip-sig-worker-name">{openSlip.name}</strong>
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
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Cetak Slip Gaji</span>
              </button>
              <button type="button" className="btn-cancel-modal" id="btn-cancel-slip" onClick={() => setOpenSlipId(null)}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}