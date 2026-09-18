import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteAppointment,
  getAppointments,
  getClients,
  getWorkers,
  updateAppointment
} from '../data/mockData'
import '../styles/appointment.css'

/* TODO BACKEND:
   - GET /api/appointments?from=...&to=...&clients=...&workers=...&view=...
   - POST /api/appointments (Buat janji temu baru)
   - PUT /api/appointments/:id (Update janji temu)
   - DELETE /api/appointments/:id (Batalkan janji temu)
*/

const TODAY_STR = '2026-08-26'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const DAY_NAMES_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DOW_3LETTER = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB']
const VIEW_LABELS = { month: 'Bulanan', week: 'Mingguan', day: 'Harian', year: 'Tahunan' }

const WEEK_HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const DAY_HOURS = [
  { label: '7 AM', timeKey: '07' },
  { label: '8 AM', timeKey: '08' },
  { label: '9 AM', timeKey: '09' },
  { label: '10 AM', timeKey: '10' },
  { label: '11 AM', timeKey: '11' },
  { label: '12 PM', timeKey: '12' },
  { label: '1 PM', timeKey: '13' },
  { label: '2 PM', timeKey: '14' },
  { label: '3 PM', timeKey: '15' },
  { label: '4 PM', timeKey: '16' },
  { label: '5 PM', timeKey: '17' },
  { label: '6 PM', timeKey: '18' },
  { label: '7 PM', timeKey: '19' },
  { label: '8 PM', timeKey: '20' },
  { label: '9 PM', timeKey: '21' }
]

const CLIENT_ORDER = ['eleanor-vance', 'sari-handayani', 'budi-santoso', 'melati-putri', 'marcus-sterling', 'dewi-anggraini']
const WORKER_ORDER = ['agus-pratama', 'ada-wong', 'budi', 'rina', 'dimas']

const CLIENT_PALETTE = {
  'eleanor-vance': { color: '#F59E0B', bg: '#FEF3C7' },
  'sari-handayani': { color: '#10B981', bg: '#D1FAE5' },
  'budi-santoso': { color: '#3B82F6', bg: '#DBEAFE' },
  'melati-putri': { color: '#8B5CF6', bg: '#EDE9FE' },
  'marcus-sterling': { color: '#EC4899', bg: '#FCE7F3' },
  'dewi-anggraini': { color: '#E5A93C', bg: '#FFFBEB' }
}
const CLIENT_DEFAULT = { color: '#6B7280', bg: '#F3F4F6' }
const WORKER_DEFAULT_COLOR = '#E5A93C'

function fmtDate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function formatIDR(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return 'Rp0'
  return 'Rp ' + Math.round(Number(val)).toLocaleString('id-ID')
}

function clientColors(id) {
  return CLIENT_PALETTE[id] || CLIENT_DEFAULT
}

export default function Appointment() {
  const [appointments, setAppointments] = useState(null)
  const [clients, setClients] = useState([])
  const [workers, setWorkers] = useState([])

  const [currentView, setCurrentView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 26, 12))
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [activeClients, setActiveClients] = useState(null)
  const [activeWorkers, setActiveWorkers] = useState(null)

  const [dayScheduleDate, setDayScheduleDate] = useState(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)

  const [toastMsg, setToastMsg] = useState(null)
  const toastTimer = useRef(null)
  const viewMenuRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAppointments(), getClients(), getWorkers()]).then(([a, c, w]) => {
      if (cancelled) return
      setAppointments(a)
      setClients(c)
      setWorkers(w)
      setActiveClients(new Set(CLIENT_ORDER.filter((id) => c.some((x) => x.id === id))))
      setActiveWorkers(new Set(WORKER_ORDER.filter((id) => w.some((x) => x.id === id))))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshAppointments = () => {
    getAppointments().then(setAppointments)
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500)
  }

  useEffect(() => {
    return () => clearTimeout(toastTimer.current)
  }, [])

  useEffect(() => {
    if (!viewMenuOpen) return
    const onDown = (e) => {
      if (viewMenuRef.current && viewMenuRef.current.contains(e.target)) return
      setViewMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [viewMenuOpen])

  const clientList = useMemo(
    () => CLIENT_ORDER.map((id) => clients.find((c) => c.id === id)).filter(Boolean),
    [clients]
  )
  const workerList = useMemo(
    () => WORKER_ORDER.map((id) => workers.find((w) => w.id === id)).filter(Boolean),
    [workers]
  )

  const filteredApts = useMemo(() => {
    if (!appointments || !activeClients || !activeWorkers) return []
    const noClients = activeClients.size === 0
    const noWorkers = activeWorkers.size === 0
    if (noClients && noWorkers) return []
    const q = searchQuery.trim().toLowerCase()
    return appointments.filter((apt) => {
      const clientMatch = noClients ? true : activeClients.has(apt.clientId)
      const workerMatch = noWorkers ? true : activeWorkers.has(apt.workerId)
      if (!clientMatch || !workerMatch) return false
      if (q) {
        const clientName = (apt.clientName || '').toLowerCase()
        const serviceName = (apt.service || '').toLowerCase()
        const workerName = (apt.workerName || '').toLowerCase()
        if (!clientName.includes(q) && !serviceName.includes(q) && !workerName.includes(q)) {
          return false
        }
      }
      return true
    })
  }, [appointments, activeClients, activeWorkers, searchQuery])

  const toggleAllClients = () => {
    if (activeClients.size === clientList.length) setActiveClients(new Set())
    else setActiveClients(new Set(clientList.map((c) => c.id)))
  }

  const toggleAllWorkers = () => {
    if (activeWorkers.size === workerList.length) setActiveWorkers(new Set())
    else setActiveWorkers(new Set(workerList.map((w) => w.id)))
  }

  const toggleClient = (id) => {
    const next = new Set(activeClients)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setActiveClients(next)
  }

  const toggleWorker = (id) => {
    const next = new Set(activeWorkers)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setActiveWorkers(next)
  }

  const openDaySchedule = (dateStr) => {
    setDayScheduleDate(dateStr)
    setSelectedAppointmentId(null)
  }

  const closeDaySchedule = () => {
    setDayScheduleDate(null)
    setSelectedAppointmentId(null)
  }

  const switchView = (view) => {
    setCurrentView(view)
    setViewMenuOpen(false)
    if (view === 'day') {
      const d = currentDate
      setDayScheduleDate(fmtDate(d.getFullYear(), d.getMonth(), d.getDate()))
      setSelectedAppointmentId(null)
    } else {
      setDayScheduleDate(null)
    }
  }

  const navigatePeriod = (dir) => {
    const next = new Date(currentDate)
    if (currentView === 'year') next.setFullYear(next.getFullYear() + dir)
    else if (currentView === 'month') next.setMonth(next.getMonth() + dir)
    else if (currentView === 'week') next.setDate(next.getDate() + 7 * dir)
    else if (currentView === 'day') next.setDate(next.getDate() + dir)
    setCurrentDate(next)
    if (currentView === 'day') {
      setDayScheduleDate(fmtDate(next.getFullYear(), next.getMonth(), next.getDate()))
    }
  }

  const goToday = () => {
    setCurrentDate(new Date(2026, 7, 26, 12))
  }

  const changeMonth = (dir) => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + dir)
    setCurrentDate(next)
  }

  const handleComplete = async () => {
    const apt = appointments.find((a) => a.id === selectedAppointmentId)
    if (!apt) return
    await updateAppointment(apt.id, { status: 'done' })
    showToast(`✓ Appointment ${apt.clientName} diselesaikan!`)
    setSelectedAppointmentId(null)
    refreshAppointments()
  }

  const handleDelete = async () => {
    await deleteAppointment(selectedAppointmentId)
    showToast('Appointment berhasil dibatalkan.')
    setSelectedAppointmentId(null)
    refreshAppointments()
  }

  useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || ''
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      const key = e.key.toUpperCase()
      if (key === 'D') switchView('day')
      else if (key === 'W') switchView('week')
      else if (key === 'M') switchView('month')
      else if (key === 'Y') switchView('year')
      else if (e.key === 'Escape') {
        if (selectedAppointmentId) setSelectedAppointmentId(null)
        else if (dayScheduleDate) setDayScheduleDate(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const activeDateStr = fmtDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

  const miniCal = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1, 12).getDay()
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    const totalDays = new Date(y, m + 1, 0, 12).getDate()
    const prevTotalDays = new Date(y, m, 0, 12).getDate()
    const eventSet = new Set(filteredApts.map((a) => a.date))
    const prev = []
    for (let i = adjustedFirstDay - 1; i >= 0; i--) prev.push(prevTotalDays - i)
    const cur = []
    for (let d = 1; d <= totalDays; d++) {
      const dStr = fmtDate(y, m, d)
      cur.push({
        num: d,
        dateStr: dStr,
        isToday: dStr === TODAY_STR,
        isActive: dStr === activeDateStr,
        hasEvent: eventSet.has(dStr)
      })
    }
    return { prev, cur }
  }, [currentDate, filteredApts, activeDateStr])

  const weekInfo = useMemo(() => {
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      weekDays.push(d)
    }
    return { weekDays }
  }, [currentDate])

  const monthCells = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1, 12).getDay()
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    const daysInMonth = new Date(y, m + 1, 0, 12).getDate()
    const daysInPrev = new Date(y, m, 0, 12).getDate()
    const prev = []
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrev - i
      const prevM = m === 0 ? 11 : m - 1
      const prevY = m === 0 ? y - 1 : y
      prev.push({ dayNum, dateStr: fmtDate(prevY, prevM, dayNum) })
    }
    const cur = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = fmtDate(y, m, d)
      cur.push({
        dayNum: d,
        dateStr: dStr,
        isToday: dStr === TODAY_STR,
        dayApts: filteredApts.filter((a) => a.date === dStr)
      })
    }
    const total = adjustedFirstDay + daysInMonth
    const remaining = total <= 35 ? 35 - total : 42 - total
    const next = []
    for (let i = 1; i <= remaining; i++) {
      const nextM = m === 11 ? 0 : m + 1
      const nextY = m === 11 ? y + 1 : y
      next.push({ dayNum: i, dateStr: fmtDate(nextY, nextM, i) })
    }
    return { prev, cur, next }
  }, [currentDate, filteredApts])

  const yearCells = useMemo(() => {
    const y = currentDate.getFullYear()
    const eventSet = new Set(filteredApts.filter((a) => a.date.startsWith(`${y}-`)).map((a) => a.date))
    const months = []
    for (let m = 0; m < 12; m++) {
      const firstDay = new Date(y, m, 1, 12).getDay()
      const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
      const totalDays = new Date(y, m + 1, 0, 12).getDate()
      const prevTotalDays = new Date(y, m, 0, 12).getDate()
      const prev = []
      for (let i = adjustedFirstDay - 1; i >= 0; i--) prev.push(prevTotalDays - i)
      const cells = []
      for (let d = 1; d <= totalDays; d++) {
        const dStr = fmtDate(y, m, d)
        cells.push({
          num: d,
          dateStr: dStr,
          hasEvent: eventSet.has(dStr)
        })
      }
      months.push({ name: MONTH_NAMES[m], prev, cells })
    }
    return { months }
  }, [currentDate, filteredApts])

  const daySchedApts = useMemo(() => {
    if (!appointments || !dayScheduleDate || !activeClients || !activeWorkers) return []
    return appointments.filter(
      (a) =>
        a.date === dayScheduleDate &&
        activeClients.has(a.clientId) &&
        activeWorkers.has(a.workerId)
    )
  }, [appointments, dayScheduleDate, activeClients, activeWorkers])

  const detailApt = useMemo(
    () => (appointments && appointments.find((a) => a.id === selectedAppointmentId)) || null,
    [appointments, selectedAppointmentId]
  )

  const periodHeading = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    if (currentView === 'year') return `Tahun ${y}`
    if (currentView === 'month') return `${MONTH_NAMES[m]} ${y}`
    if (currentView === 'week') {
      const start = weekInfo.weekDays[0]
      const end = weekInfo.weekDays[6]
      const startMonth = MONTH_NAMES[start.getMonth()].substring(0, 3)
      const endMonth = MONTH_NAMES[end.getMonth()].substring(0, 3)
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${MONTH_NAMES[m]} ${y}`
      }
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${y}`
    }
    return `${DAY_NAMES_FULL[currentDate.getDay()]}, ${currentDate.getDate()} ${MONTH_NAMES[m]} ${y}`
  }, [currentView, currentDate, weekInfo])

  const dayScheduleData = useMemo(() => {
    if (!dayScheduleDate) return null
    const [y, m, d] = dayScheduleDate.split('-').map(Number)
    const target = new Date(y, m - 1, d, 12)
    const dowIndex = target.getDay()
    return {
      dowShort: DOW_3LETTER[dowIndex],
      dowFull: DAY_NAMES_FULL[dowIndex],
      dom: d,
      monthName: MONTH_NAMES[m - 1],
      year: y,
      title: `${DAY_NAMES_FULL[dowIndex]}, ${d} ${MONTH_NAMES[m - 1]} ${y}`
    }
  }, [dayScheduleDate])

  if (appointments === null || !activeClients || !activeWorkers) return null

  return (
    <>
      <div className="calendar-main-layout">
        <header className="calendar-top-toolbar" data-field="calendar-toolbar">
          <div className="toolbar-left-group">
            <button type="button" className="btn-cal-today" id="btn-cal-today" data-action="cal-today" onClick={goToday}>Hari Ini</button>
            <div className="cal-nav-arrows">
              <button type="button" className="cal-arrow-btn" id="btn-cal-prev" aria-label="Sebelumnya" data-action="cal-prev" onClick={() => navigatePeriod(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button type="button" className="cal-arrow-btn" id="btn-cal-next" aria-label="Selanjutnya" data-action="cal-next" onClick={() => navigatePeriod(1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <h1 className="cal-period-heading" id="cal-period-heading">{periodHeading}</h1>
          </div>

          <div className="toolbar-right-group">
            <div className="cal-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="cal-quick-search"
                placeholder="Cari appointment..."
                aria-label="Cari jadwal appointment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="cal-view-dropdown-wrapper" id="cal-view-dropdown-wrapper" ref={viewMenuRef}>
              <button
                type="button"
                className="btn-cal-view-select"
                id="btn-view-toggle"
                aria-haspopup="true"
                aria-expanded={viewMenuOpen}
                onClick={(e) => {
                  e.stopPropagation()
                  setViewMenuOpen((o) => !o)
                }}
              >
                <span id="current-view-label">{VIEW_LABELS[currentView]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {viewMenuOpen && (
                <div className="cal-view-menu-panel" id="cal-view-menu" role="menu">
                  <button type="button" className={`cal-view-option${currentView === 'day' ? ' active' : ''}`} data-view="day" role="menuitem" onClick={() => switchView('day')}>
                    <span>Harian</span>
                    <kbd>D</kbd>
                  </button>
                  <button type="button" className={`cal-view-option${currentView === 'week' ? ' active' : ''}`} data-view="week" role="menuitem" onClick={() => switchView('week')}>
                    <span>Mingguan</span>
                    <kbd>W</kbd>
                  </button>
                  <button type="button" className={`cal-view-option${currentView === 'month' ? ' active' : ''}`} data-view="month" role="menuitem" onClick={() => switchView('month')}>
                    <span>Bulanan</span>
                    <kbd>M</kbd>
                  </button>
                  <button type="button" className={`cal-view-option${currentView === 'year' ? ' active' : ''}`} data-view="year" role="menuitem" onClick={() => switchView('year')}>
                    <span>Tahunan</span>
                    <kbd>Y</kbd>
                  </button>

                  <div className="cal-menu-divider" />

                  <label className="cal-menu-check-item">
                    <input type="checkbox" id="check-show-weekends" defaultChecked />
                    <span>Tampilkan Akhir Pekan</span>
                  </label>
                  <label className="cal-menu-check-item">
                    <input type="checkbox" id="check-show-declined" defaultChecked />
                    <span>Tampilkan Dibatalkan</span>
                  </label>
                  <label className="cal-menu-check-item">
                    <input type="checkbox" id="check-show-completed" defaultChecked />
                    <span>Tampilkan Selesai</span>
                  </label>
                </div>
              )}
            </div>

            <Link to="/appointment/baru" className="btn-primary-gold btn-schedule-action" id="btn-new-appointment" data-field="btn-new-appointment">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>+ Appointment</span>
            </Link>
          </div>
        </header>

        <div className="calendar-workspace-grid">
          <aside className="calendar-side-panel" id="calendar-side-panel">
            <div className="mini-calendar-card">
              <div className="mini-cal-header">
                <span className="mini-cal-month" id="mini-cal-title">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <div className="mini-cal-arrows">
                  <button type="button" id="btn-mini-prev" className="mini-arrow-btn" onClick={() => changeMonth(-1)}>‹</button>
                  <button type="button" id="btn-mini-next" className="mini-arrow-btn" onClick={() => changeMonth(1)}>›</button>
                </div>
              </div>
              <div className="mini-cal-grid" id="mini-cal-grid">
                {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => <span key={i} className="mini-cal-day-label">{d}</span>)}
                {miniCal.prev.map((n) => <span key={`p${n}`} className="mini-cal-cell other-month">{n}</span>)}
                {miniCal.cur.map((cell) => (
                  <span
                    key={cell.dateStr}
                    className={`mini-cal-cell${cell.isToday ? ' today' : ''}${cell.isActive ? ' active-selected' : ''}${cell.hasEvent ? ' has-event' : ''}`}
                    data-date={cell.dateStr}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openDaySchedule(cell.dateStr)}
                  >
                    {cell.num}
                  </span>
                ))}
              </div>
            </div>

            <div className="filter-section-card">
              <div className="filter-section-header">
                <span className="filter-section-title">Klien &amp; Jadwal</span>
                <button type="button" className="btn-select-all" id="btn-toggle-all-clients" data-field="btn-toggle-all-clients" onClick={toggleAllClients}>Hapus Semua</button>
              </div>
              <div className="client-checkbox-list" id="client-checkbox-list" data-field="client-filter-list">
                {clientList.map((c) => (
                  <label key={c.id} className="client-check-row">
                    <input
                      type="checkbox"
                      value={c.id}
                      data-client-id={c.id}
                      checked={activeClients.has(c.id)}
                      onChange={() => toggleClient(c.id)}
                    />
                    <span className="client-color-dot" style={{ backgroundColor: CLIENT_PALETTE[c.id] ? CLIENT_PALETTE[c.id].color : CLIENT_DEFAULT.color }} />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section-card">
              <div className="filter-section-header">
                <span className="filter-section-title">Stylist / Karyawan</span>
                <button type="button" className="btn-select-all" id="btn-toggle-all-workers" data-field="btn-toggle-all-workers" onClick={toggleAllWorkers}>Hapus Semua</button>
              </div>
              <div className="client-checkbox-list" id="worker-checkbox-list" data-field="worker-filter-list">
                {workerList.map((w) => (
                  <label key={w.id} className="client-check-row">
                    <input
                      type="checkbox"
                      value={w.id}
                      data-worker-id={w.id}
                      checked={activeWorkers.has(w.id)}
                      onChange={() => toggleWorker(w.id)}
                    />
                    <span className="client-color-dot" style={{ backgroundColor: w.color || WORKER_DEFAULT_COLOR }} />
                    <span>{w.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section-card status-legend-card">
              <span className="filter-section-title">Status Appointment</span>
              <div className="status-legend-list">
                <div className="legend-item"><span className="status-dot dot-confirmed"></span> Terkonfirmasi</div>
                <div className="legend-item"><span className="status-dot dot-pending"></span> Menunggu</div>
                <div className="legend-item"><span className="status-dot dot-done"></span> Selesai</div>
              </div>
            </div>
          </aside>

          <div className="calendar-viewport-card" id="calendar-viewport-card" data-field="calendar-viewport">
            {currentView === 'month' && (
              <div className="calendar-view-panel active" id="view-month" data-view="month">
                <div className="month-days-header">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span>Sab</span>
                  <span>Min</span>
                </div>
                <div className="month-cells-grid" id="month-cells-grid">
                  {monthCells.prev.map((c) => (
                    <div key={c.dateStr} className="month-day-cell other-month" data-date={c.dateStr} onClick={() => openDaySchedule(c.dateStr)}>
                      <div className="cell-top-bar">
                        <span className="cell-day-num">{c.dayNum}</span>
                      </div>
                    </div>
                  ))}
                  {monthCells.cur.map((c) => (
                    <div key={c.dateStr} className={`month-day-cell${c.isToday ? ' is-today' : ''}`} data-date={c.dateStr} onClick={() => openDaySchedule(c.dateStr)}>
                      <div className="cell-top-bar">
                        <span className="cell-day-num">{c.dayNum}</span>
                      </div>
                      {c.dayApts.slice(0, 3).map((apt) => {
                        const pc = clientColors(apt.clientId)
                        return (
                          <div
                            key={apt.id}
                            className="apt-chip-item"
                            style={{ backgroundColor: pc.bg, color: '#111827', borderLeftColor: pc.color }}
                            title={`${apt.time} ${apt.clientName} - ${apt.service}`}
                          >
                            <span className="apt-chip-time" style={{ color: pc.color }}>{apt.time}</span>
                            <span className="apt-chip-client">{apt.clientName}</span>
                          </div>
                        )
                      })}
                      {c.dayApts.length > 3 && (
                        <div className="apt-more-badge">+{c.dayApts.length - 3} lainnya</div>
                      )}
                    </div>
                  ))}
                  {monthCells.next.map((c) => (
                    <div key={c.dateStr} className="month-day-cell other-month" data-date={c.dateStr} onClick={() => openDaySchedule(c.dateStr)}>
                      <div className="cell-top-bar">
                        <span className="cell-day-num">{c.dayNum}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'week' && (
              <div className="calendar-view-panel active" id="view-week" data-view="week">
                <div className="week-time-grid-container" id="week-grid-container">
                  <div className="week-grid-header-row">
                    <div className="week-head-cell" style={{ color: 'var(--text-muted)' }}>GMT+7</div>
                    {weekInfo.weekDays.map((d) => {
                      const dStr = fmtDate(d.getFullYear(), d.getMonth(), d.getDate())
                      const isToday = dStr === TODAY_STR
                      return (
                        <div key={dStr} className={`week-head-cell${isToday ? ' is-today' : ''}`} style={{ cursor: 'pointer' }} data-date={dStr} onClick={() => openDaySchedule(dStr)}>
                          <span>{DAY_NAMES_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]}</span>
                          <span className="head-day-num">{d.getDate()}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="week-time-grid-body">
                    <div className="time-axis-col">
                      {WEEK_HOURS.map((h) => <div key={h} className="time-axis-slot">{h}</div>)}
                    </div>
                    {weekInfo.weekDays.map((d) => {
                      const dStr = fmtDate(d.getFullYear(), d.getMonth(), d.getDate())
                      const dayApts = filteredApts.filter((a) => a.date === dStr)
                      return (
                        <div key={dStr} className="week-day-col" style={{ cursor: 'pointer' }} data-date={dStr} onClick={() => openDaySchedule(dStr)}>
                          {WEEK_HOURS.map((h) => <div key={h} className="week-hour-slot" />)}
                          {dayApts.map((apt) => {
                            const pc = clientColors(apt.clientId)
                            const [hh, mm] = apt.time.split(':').map(Number)
                            const topPx = Math.max(0, (hh - 8 + mm / 60) * 52)
                            const heightPx = Math.max(42, (apt.duration / 60) * 52 - 4)
                            return (
                              <div
                                key={apt.id}
                                className="week-apt-block"
                                style={{ top: `${topPx}px`, height: `${heightPx}px`, backgroundColor: pc.bg, borderLeftColor: pc.color, color: '#111827', pointerEvents: 'none' }}
                              >
                                <div className="week-apt-time" style={{ color: pc.color }}>{apt.time}</div>
                                <div className="week-apt-title">{apt.clientName}</div>
                                <div className="week-apt-stylist">{apt.workerName}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentView === 'day' && (
              <div className="calendar-view-panel active" id="view-day" data-view="day">
                <div className="day-time-grid-container" id="day-grid-container" data-view-date={activeDateStr} />
              </div>
            )}

            {currentView === 'year' && (
              <div className="calendar-view-panel active" id="view-year" data-view="year">
                <div className="year-months-grid" id="year-months-grid">
                  {yearCells.months.map((month) => (
                    <div key={month.name} className="year-month-box">
                      <span className="year-month-title">{month.name}</span>
                      <div className="year-mini-grid">
                        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => <span key={i} className="year-mini-day-label">{d}</span>)}
                        {month.prev.map((n) => <span key={`p${n}`} className="year-mini-cell other-month" />)}
                        {month.cells.map((cell) => (
                          <span
                            key={cell.dateStr}
                            className={`year-mini-cell${cell.hasEvent ? ' has-event' : ''}`}
                            data-date={cell.dateStr}
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openDaySchedule(cell.dateStr)
                            }}
                          >
                            {cell.num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {dayScheduleDate && !selectedAppointmentId && dayScheduleData && (
        <div id="day-schedule-modal" className="day-schedule-modal-overlay" style={{ display: 'flex' }} role="dialog" aria-modal="true" aria-labelledby="day-schedule-title" onClick={(e) => { if (e.target === e.currentTarget) closeDaySchedule() }}>
          <div className="day-schedule-dialog">
            <div className="day-schedule-header">
              <div className="day-schedule-header-left">
                <div className="day-schedule-date-badge">
                  <span className="day-schedule-dow" id="day-schedule-dow">{dayScheduleData.dowShort}</span>
                  <span className="day-schedule-dom" id="day-schedule-dom">{dayScheduleData.dom}</span>
                </div>
                <div className="day-schedule-title-box">
                  <h2 className="day-schedule-title" id="day-schedule-title">{dayScheduleData.title}</h2>
                  <div className="day-schedule-meta">
                    <span className="day-schedule-count" id="day-schedule-count">{daySchedApts.length} Reservasi Terjadwal</span>
                    <span className="day-schedule-tz">GMT+07 (WIB)</span>
                  </div>
                </div>
              </div>

              <div className="day-schedule-actions">
                <Link to={`/appointment/baru?date=${dayScheduleDate}`} id="btn-add-for-day" className="btn-schedule-add-action">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>+ Tambah Appointment</span>
                </Link>
                <button type="button" id="btn-close-day-schedule" className="btn-close-schedule" aria-label="Tutup Jadwal Harian" onClick={closeDaySchedule}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="day-schedule-body">
              <div className="gcal-timeline-container" id="gcal-timeline-container">
                {DAY_HOURS.map((h) => {
                  const hourApts = daySchedApts.filter((a) => a.time.startsWith(h.timeKey))
                  return (
                    <div className="gcal-hour-row" key={h.timeKey}>
                      <div className="gcal-hour-time">{h.label}</div>
                      <div className="gcal-hour-slot">
                        {hourApts.map((apt) => {
                          const pc = clientColors(apt.clientId)
                          return (
                            <div
                              key={apt.id}
                              className="gcal-event-card js-gcal-card"
                              data-apt-id={apt.id}
                              style={{ borderLeftColor: pc.color }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAppointmentId(apt.id)
                              }}
                            >
                              <div className="gcal-card-left">
                                <div className="gcal-avatar-box" style={{ backgroundColor: pc.bg, color: pc.color }}>
                                  {apt.client && apt.client.avatar ? apt.client.avatar : (apt.clientName || 'K').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="gcal-meta-text">
                                  <span className="gcal-client-title">{apt.clientName}</span>
                                  <span className="gcal-service-name">{apt.service}</span>
                                  <span className="gcal-stylist-tag">Stylist: <strong>{apt.workerName}</strong> • {apt.duration} mnt</span>
                                </div>
                              </div>
                              <div className="gcal-card-right">
                                <span className="gcal-time-badge">{apt.time} WIB</span>
                                <span className={`gcal-status-pill ${apt.status}`}>{apt.statusLabel}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {daySchedApts.length === 0 && (
                  <div className="gcal-empty-notice">
                    <span>Tidak ada reservasi pada tanggal ini. Klik <strong>+ Tambah Appointment</strong> untuk membuat jadwal baru.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="day-schedule-footer">
              <span className="schedule-hint-text">💡 <strong>Petunjuk:</strong> Klik salah satu kartu reservasi di atas untuk membuka rincian detail klien dan layanan.</span>
            </div>
          </div>
        </div>
      )}

      {selectedAppointmentId && detailApt && (
        <div className="appointment-popover-modal show" id="appointment-detail-modal" role="dialog" aria-hidden="false" onClick={(e) => { if (e.target === e.currentTarget) setSelectedAppointmentId(null) }}>
          <div className="popover-content card">
            <div className="popover-header">
              <div className="popover-client-meta">
                <div>
                  <h3 className="popover-client-name" id="pop-client-name">{detailApt.clientName}</h3>
                  <span className="popover-service-name" id="pop-service-name">{detailApt.service}</span>
                </div>
              </div>
              <button type="button" className="popover-close-btn" id="btn-close-popover" aria-label="Tutup Detail" onClick={() => setSelectedAppointmentId(null)}>✕</button>
            </div>

            <div className="popover-body">
              <div className="pop-info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span id="pop-time-range">{detailApt.time} WIB ({detailApt.duration} mnt)</span>
              </div>
              <div className="pop-info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span id="pop-stylist-name">Stylist: {detailApt.workerName}</span>
              </div>
              <div className="pop-info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span id="pop-phone">{detailApt.client && detailApt.client.phone ? detailApt.client.phone : ''}</span>
              </div>
              <div className="pop-info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                <span id="pop-price-val">Estimasi Biaya: {formatIDR(detailApt.price)}</span>
              </div>
              <div className="pop-notes-box" id="pop-notes">{detailApt.notes || 'Tidak ada catatan khusus.'}</div>
            </div>

            <div className="popover-footer">
              <button type="button" className="btn-pop-action btn-pop-complete" id="btn-pop-complete" onClick={handleComplete}>✓ Selesaikan</button>
              <Link to={`/appointment/baru?mode=edit&id=${detailApt.id}`} className="btn-pop-action btn-pop-edit" id="btn-pop-edit">Edit</Link>
              <button type="button" className="btn-pop-action btn-pop-delete" id="btn-pop-delete" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div id="toast-success" className="toast-box show" role="status" aria-live="polite">
          <span id="toast-message">{toastMsg}</span>
        </div>
      )}
    </>
  )
}