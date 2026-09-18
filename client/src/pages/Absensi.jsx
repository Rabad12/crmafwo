import { useEffect, useRef, useState } from 'react'
import { getAttendanceByDate, getAttendanceSummary, saveAttendance } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/absensi.css'

{/* TODO BACKEND:
  - GET /api/attendance?date=YYYY-MM-DD -> list status hadir karyawan di tanggal tersebut
  - POST /api/attendance (date, records: [{ workerId, isPresent }]) -> simpan kehadiran harian
  - GET /api/attendance/summary?month=YYYY-MM -> rekap total hadir dan total uang makan per karyawan
*/}

const MONTH_OPTIONS = [
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-07', label: 'Juli 2026' }
]

function formatIDR(amount) {
  if (!amount || amount === 0) return '-'
  return formatRupiah(amount)
}

export default function Absensi() {
  const [date, setDate] = useState('2026-09-17')
  const [rows, setRows] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [month, setMonth] = useState('2026-09')
  const [summary, setSummary] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    let live = true
    setRows(null)
    getAttendanceByDate(date).then((data) => {
      if (live) setRows(data)
    })
    return () => {
      live = false
    }
  }, [date])

  useEffect(() => {
    let live = true
    getAttendanceSummary('2026-09').then((data) => {
      if (live) setSummary(data)
    })
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  const togglePresent = (workerId) => {
    setRows((prev) => prev.map((r) => (r.workerId === workerId ? { ...r, isPresent: !r.isPresent } : r)))
  }

  const handleSave = async () => {
    if (!rows) return
    setIsSaving(true)
    await saveAttendance(
      date,
      rows.map((r) => ({ workerId: r.workerId, isPresent: r.isPresent }))
    )
    setIsSaving(false)
    showToast(`Kehadiran karyawan untuk tanggal ${date} berhasil disimpan!`)
  }

  const handleFilterRekap = async () => {
    const data = await getAttendanceSummary(month)
    setSummary(data)
  }

  if (!rows || !summary) return null

  return (
    <>
      <div className="absensi-page-stack">
        <div className="absensi-header-section">
          <h1 className="absensi-page-title">Absensi Karyawan</h1>
          <p className="absensi-page-subtitle">Catat kehadiran harian. Uang makan Rp25.000 dibayar per hari hadir untuk karyawan skema per layanan (karyawan % omset harian tidak mendapat uang makan).</p>
        </div>

        {toast && (
          <div id="attendance-toast" className="absensi-toast is-success" role="alert">{toast}</div>
        )}

        <section className="absensi-card" data-field="card-catat-kehadiran">
          <div className="absensi-card-header">
            <div className="absensi-card-title-group">
              <h2 className="absensi-card-title">Catat Kehadiran</h2>
              <p className="absensi-card-subtitle">Pilih tanggal, centang karyawan yang hadir, lalu simpan.</p>
            </div>

            <div className="absensi-date-picker-wrap">
              <span className="absensi-picker-label">Tanggal</span>
              <input
                type="date"
                id="input-attendance-date"
                className="absensi-date-input"
                value={date}
                data-field="attendance-date"
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="absensi-table-container">
            <table className="absensi-table" id="table-catat-kehadiran">
              <thead>
                <tr>
                  <th>KARYAWAN</th>
                  <th>SKEMA</th>
                  <th style={{ textAlign: 'center', width: 100 }}>HADIR</th>
                </tr>
              </thead>
              <tbody id="catat-kehadiran-tbody" data-field="daily-attendance-list">
                {rows.map((r) => {
                  const isOmset = r.scheme === 'daily_percentage'
                  const badgeClass = isOmset ? 'badge-skema-omset' : 'badge-skema-layanan'
                  return (
                    <tr data-worker-id={r.workerId} key={r.workerId}>
                      <td>
                        <span className="worker-name-bold">{r.name}</span>
                      </td>
                      <td>
                        <span className={badgeClass}>{r.schemeLabel}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="absensi-checkbox-wrap">
                          <input
                            type="checkbox"
                            className="absensi-checkbox js-attendance-check"
                            data-worker-id={r.workerId}
                            checked={r.isPresent}
                            onChange={() => togglePresent(r.workerId)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="absensi-card-footer">
            <span className="absensi-footer-note">Karyawan % Omset Harian tidak menerima uang makan.</span>
            <button
              type="button"
              className="btn-simpan-kehadiran"
              id="btn-save-attendance"
              data-field="btn-save-attendance"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Kehadiran'}
            </button>
          </div>
        </section>

        <section className="absensi-card" data-field="card-rekap-kehadiran">
          <div className="absensi-card-header">
            <div className="absensi-card-title-group">
              <h2 className="absensi-card-title">Rekap Kehadiran &amp; Uang Makan</h2>
              <p className="absensi-card-subtitle">Uang makan Rp25.000 per kehadiran, dijumlahkan per bulan dan ikut masuk ke laporan pendapatan karyawan.</p>
            </div>

            <div className="absensi-rekap-filter-wrap">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="absensi-picker-label">Bulan</span>
                <select
                  id="select-rekap-month"
                  className="absensi-select-month"
                  data-field="rekap-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option value={m.value} key={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn-absensi-filter"
                id="btn-filter-rekap"
                data-field="btn-filter-rekap"
                onClick={handleFilterRekap}
              >
                Tampilkan
              </button>
            </div>
          </div>

          <div className="absensi-table-container">
            <table className="absensi-table" id="table-rekap-kehadiran">
              <thead>
                <tr>
                  <th>KARYAWAN</th>
                  <th>SKEMA</th>
                  <th style={{ textAlign: 'center', width: 120 }}>TOTAL HADIR</th>
                  <th style={{ textAlign: 'right', width: 180 }}>UANG MAKAN</th>
                </tr>
              </thead>
              <tbody id="rekap-kehadiran-tbody" data-field="monthly-attendance-list">
                {summary.rows.map((r) => {
                  const isOmset = r.scheme === 'daily_percentage'
                  const badgeClass = isOmset ? 'badge-skema-omset' : 'badge-skema-layanan'
                  return (
                    <tr key={r.workerId}>
                      <td>
                        <span className="worker-name-bold">{r.name}</span>
                      </td>
                      <td>
                        <span className={badgeClass}>{r.schemeLabel}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {r.totalHadir}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isOmset ? '-' : formatIDR(r.uangMakan)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL</td>
                  <td></td>
                  <td style={{ textAlign: 'center' }} id="rekap-total-hadir">{summary.totalHadir}</td>
                  <td style={{ textAlign: 'right' }} id="rekap-total-uang-makan">{formatRupiah(summary.totalUangMakan)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}