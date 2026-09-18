import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  addAppointment,
  getAppointment,
  getClients,
  getServices,
  getWorkers,
  updateAppointment
} from '../data/mockData'
import '../styles/edit-pelanggan.css'
import '../styles/add-appointment.css'

/* TODO BACKEND:
   - POST /api/appointments (Buat janji temu baru)
   - PUT /api/appointments/:id (Update janji temu yang ada)
   - GET /api/clients (List pelanggan terdaftar)
   - GET /api/services (List katalog layanan)
   - GET /api/workers (List stylist aktif)
*/

const CLIENT_ORDER = ['eleanor-vance', 'sari-handayani', 'budi-santoso', 'melati-putri', 'marcus-sterling', 'dewi-anggraini']
const WORKER_ORDER = ['agus-pratama', 'ada-wong', 'budi', 'rina', 'dimas']
const SERVICE_ORDER = [
  'Balayage Color Treatment',
  'Signature Grooming & Cut',
  'Creambath & Blow Dry',
  'Color Correction & Spa',
  'Executive Haircut & Styling',
  'Keratin Smooth Treatment',
  'Olaplex Hair Repair Spa'
]
const TIME_SLOTS = ['09:00', '10:00', '10:30', '13:00', '14:30', '16:00', '17:30', '19:00']

function priceLabel(price) {
  return 'Rp' + Math.round(Number(price || 0)).toLocaleString('id-ID')
}

export default function AddAppointment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const mode = searchParams.get('mode') || 'add'
  const editId = searchParams.get('id')
  const fromParam = searchParams.get('from') || searchParams.get('returnUrl')
  const clientParam = searchParams.get('clientId')
  const dateParam = searchParams.get('date')

  const backTarget = fromParam === 'clients' ? '/pelanggan' : '/appointment'

  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editApt, setEditApt] = useState(null)

  const [appointmentId, setAppointmentId] = useState('')
  const [form, setForm] = useState({
    clientId: clientParam || '',
    service: '',
    workerId: '',
    date: dateParam || '2026-08-26',
    time: '10:00',
    duration: 120,
    status: 'confirmed',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getClients(), getServices(), getWorkers()])
      .then(async ([c, s, w]) => {
        if (cancelled) return
        setClients(c)
        setServices(s)
        setWorkers(w)
        if (mode === 'edit' && editId) {
          const apt = await getAppointment(editId)
          if (cancelled) return
          if (apt) {
            setAppointmentId(apt.id)
            setForm({
              clientId: apt.clientId || '',
              service: apt.service || '',
              workerId: apt.workerId || '',
              date: apt.date || dateParam || '2026-08-26',
              time: apt.time || '10:00',
              duration: apt.duration || 120,
              status: apt.status || 'confirmed',
              notes: apt.notes || ''
            })
            setEditApt(apt)
          }
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, editId, dateParam])

  useEffect(() => {
    return () => clearTimeout(toastTimer.current)
  }, [])

  const clientOptions = CLIENT_ORDER
    .map((id) => clients.find((c) => c.id === id))
    .filter(Boolean)

  const workerOptions = WORKER_ORDER
    .map((id) => workers.find((w) => w.id === id))
    .filter(Boolean)

  const serviceOptions = (() => {
    const canon = SERVICE_ORDER
      .map((name) => services.find((s) => s.name === name))
      .filter(Boolean)
    if (form.service && !canon.some((s) => s.name === form.service)) {
      const known = services.find((s) => s.name === form.service)
      if (known) {
        canon.push(known)
      } else if (editApt) {
        canon.push({ name: editApt.service, duration: editApt.duration || 60, price: editApt.price || 0 })
      }
    }
    return canon
  })()

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: false }))
  }

  const handleServiceChange = (e) => {
    const svc = serviceOptions.find((s) => s.name === e.target.value)
    const duration = svc && svc.duration ? svc.duration : 120
    setForm((f) => ({ ...f, service: e.target.value, duration }))
    setErrors((e) => ({ ...e, service: false }))
  }

  const pickTimeSlot = (t) => {
    setForm((f) => ({ ...f, time: t }))
    setErrors((e) => ({ ...e, time: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.clientId) errs.client = true
    if (!form.service) errs.service = true
    if (!form.workerId) errs.worker = true
    if (!form.date) errs.date = true
    if (!form.time) errs.time = true
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload = {
      clientId: form.clientId,
      service: form.service,
      workerId: form.workerId,
      date: form.date,
      time: form.time,
      duration: parseInt(form.duration, 10) || 60,
      status: form.status || 'confirmed',
      notes: (form.notes || '').trim()
    }

    setSaving(true)
    if (mode === 'edit' && appointmentId) {
      await updateAppointment(appointmentId, payload)
      setToastMsg('✓ Perubahan jadwal temu berhasil disimpan!')
    } else {
      await addAppointment(payload)
      setToastMsg('✓ Jadwal temu baru berhasil dibuat!')
    }
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => navigate('/appointment'), 1200)
  }

  if (loading || !clientOptions.length || !serviceOptions.length || !workerOptions.length) return null

  const isEdit = mode === 'edit' && !!appointmentId
  const title = isEdit ? 'Edit Jadwal Janji Temu' : 'Jadwalkan Kedatangan Klien'
  const subtitle = isEdit
    ? `Mengubah jadwal kunjungan untuk ID: ${appointmentId}`
    : 'Atur jadwal temu, layanan, stylist yang dikerahkan, serta waktu kedatangan.'

  return (
    <>
      <div className="edit-header-wrapper">
        <Link to={backTarget} id="btn-back-nav" className="back-arrow-link" aria-label="Kembali ke Kalender">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div className="edit-title-group">
          <h1 className="edit-page-title" id="appointment-form-title">{title}</h1>
          <p className="edit-page-subtitle" id="appointment-form-subtitle">{subtitle}</p>
        </div>
      </div>

      <form id="appointment-form" className="card edit-form-card" data-field="form-appointment" onSubmit={handleSubmit} noValidate>
        <input type="hidden" id="appointment-id" name="appointmentId" value={appointmentId} />

        <div className="form-fields-stack">
          <div className="form-group-item">
            <div className="label-with-action-row">
              <label className="form-label" htmlFor="appointment-client">Pilih Klien / Pelanggan <span className="required-star">*</span></label>
              <Link to="/pelanggan/new/edit?mode=add" className="form-inline-action-link">+ Tambah Pelanggan Baru</Link>
            </div>
            <div className="form-input-box">
              <select
                id="appointment-client"
                name="clientId"
                className="form-select-control"
                data-field="appointment-client"
                value={form.clientId}
                onChange={(e) => setField('clientId', e.target.value)}
                required
              >
                <option value="" disabled>-- Pilih Klien Terdaftar --</option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || ''})
                  </option>
                ))}
              </select>
            </div>
            <span className="field-error-msg" id="error-client" style={{ display: errors.client ? 'block' : 'none' }}>Silakan pilih klien terlebih dahulu.</span>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="appointment-service">Layanan yang Akan Digunakan <span className="required-star">*</span></label>
              <div className="form-input-box">
                <select
                  id="appointment-service"
                  name="service"
                  className="form-select-control"
                  data-field="appointment-service"
                  value={form.service}
                  onChange={handleServiceChange}
                  required
                >
                  <option value="" disabled>-- Pilih Layanan --</option>
                  {serviceOptions.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.duration || 0} mnt - {priceLabel(s.price)})
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-error-msg" id="error-service" style={{ display: errors.service ? 'block' : 'none' }}>Silakan pilih jenis layanan.</span>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="appointment-worker">Karyawan / Stylist Dikerahkan <span className="required-star">*</span></label>
              <div className="form-input-box">
                <select
                  id="appointment-worker"
                  name="workerId"
                  className="form-select-control"
                  data-field="appointment-worker"
                  value={form.workerId}
                  onChange={(e) => setField('workerId', e.target.value)}
                  required
                >
                  <option value="" disabled>-- Pilih Stylist --</option>
                  {workerOptions.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.position || w.specialty || ''})
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-error-msg" id="error-worker" style={{ display: errors.worker ? 'block' : 'none' }}>Silakan tentukan stylist untuk janji temu.</span>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="appointment-date">Tanggal Kehadiran <span className="required-star">*</span></label>
              <div className="form-input-box">
                <input
                  type="date"
                  id="appointment-date"
                  name="date"
                  className="form-input-field"
                  data-field="appointment-date"
                  value={form.date}
                  onChange={(e) => setField('date', e.target.value)}
                  required
                />
              </div>
              <span className="field-error-msg" id="error-date" style={{ display: errors.date ? 'block' : 'none' }}>Pilih tanggal kehadiran yang valid.</span>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="appointment-time">Jam Kedatangan <span className="required-star">*</span></label>
              <div className="form-input-box">
                <input
                  type="time"
                  id="appointment-time"
                  name="time"
                  className="form-input-field"
                  data-field="appointment-time"
                  value={form.time}
                  onChange={(e) => setField('time', e.target.value)}
                  required
                />
              </div>
              <span className="field-error-msg" id="error-time" style={{ display: errors.time ? 'block' : 'none' }}>Tentukan jam kedatangan.</span>
            </div>
          </div>

          <div className="form-group-item time-slot-quick-picker">
            <span className="quick-slot-label">Pilihan Slot Waktu Cepat:</span>
            <div className="slot-pills-row">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`slot-pill-btn${form.time === t ? ' active' : ''}`}
                  data-time={t}
                  onClick={() => pickTimeSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="appointment-duration">Estimasi Durasi Pengerjaan</label>
              <div className="form-input-box">
                <input
                  type="number"
                  id="appointment-duration"
                  name="duration"
                  className="form-input-field"
                  data-field="appointment-duration"
                  value={form.duration}
                  min="15"
                  step="15"
                  onChange={(e) => setField('duration', e.target.value)}
                />
                <span className="input-suffix-text">Menit</span>
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="appointment-status">Status Janji Temu</label>
              <div className="form-input-box">
                <select
                  id="appointment-status"
                  name="status"
                  className="form-select-control"
                  data-field="appointment-status"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="confirmed">Terkonfirmasi (Confirmed)</option>
                  <option value="pending">Menunggu Konfirmasi (Pending)</option>
                  <option value="done">Selesai (Completed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="appointment-notes">Catatan Khusus / Permintaan Klien</label>
            <div className="form-input-box">
              <textarea
                id="appointment-notes"
                name="notes"
                className="form-textarea"
                data-field="appointment-notes"
                rows="3"
                placeholder="Contoh: Klien minta formula non-amonia, alergi produk tertentu..."
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" id="btn-save-appointment" className="btn-primary-gold" data-field="btn-save-appointment" disabled={saving}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{saving ? 'Menyimpan...' : 'Simpan Jadwal Temu'}</span>
            </button>

            <Link to={backTarget} id="btn-cancel" className="btn-secondary-cancel" data-field="btn-cancel">Batal</Link>
          </div>
        </div>
      </form>

      {toastMsg && (
        <div id="toast-success" className="toast-box show" role="status" aria-live="polite">
          <span id="toast-message">{toastMsg}</span>
        </div>
      )}
    </>
  )
}