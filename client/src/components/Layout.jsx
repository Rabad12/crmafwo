import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  DashboardIcon,
  UsersIcon,
  WorkerIcon,
  ServiceIcon,
  BoxIcon,
  ClockIcon,
  CalendarIcon,
  CheckIcon,
  ReportIcon,
  BadgeCheckIcon,
  MoneyIcon,
  WalletIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon
} from './icons'

const MENU_LINKS = [
  {
    to: '/',
    end: true,
    icon: DashboardIcon,
    label: 'Dashboard'
  },
  {
    to: '/pelanggan',
    icon: UsersIcon,
    label: 'Pelanggan'
  },
  {
    to: '/karyawan',
    icon: WorkerIcon,
    label: 'Karyawan'
  },
  {
    to: '/layanan',
    icon: ServiceIcon,
    label: 'Layanan'
  },
  {
    to: '/produk',
    icon: BoxIcon,
    label: 'Produk'
  },
  {
    to: '/riwayat',
    icon: ClockIcon,
    label: 'Transaksi'
  },
  {
    to: '/appointment',
    icon: CalendarIcon,
    label: 'Appointment'
  },
  {
    to: '/absensi',
    icon: CheckIcon,
    label: 'Absensi'
  }
]

const REPORT_LINKS = [
  {
    to: '/laporan',
    icon: ReportIcon,
    label: 'Laporan Penjualan'
  },
  {
    to: '/pelanggan-aktif',
    icon: BadgeCheckIcon,
    label: 'Pelanggan Aktif'
  },
  {
    to: '/rekap-komisi',
    icon: MoneyIcon,
    label: 'Rekap Komisi & Slip'
  },
  {
    to: '/karyawan/pendapatan',
    icon: WalletIcon,
    label: 'Pendapatan Karyawan'
  }
]

export default function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState({ name: 'Owner Afwo', role: 'Administrator' })
  const navigate = useNavigate()

  useEffect(() => {
    const saved = sessionStorage.getItem('afwo_logged_in_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.name) setUser({ name: parsed.name, role: parsed.role || 'Administrator' })
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleLogout = (e) => {
    e.preventDefault()
    sessionStorage.removeItem('afwo_logged_in_user')
    navigate('/login')
  }

  const renderLink = (link) => {
    const Icon = link.icon
    return (
      <li className="sidebar-nav-item" key={link.to}>
        <NavLink
          to={link.to}
          end={link.end}
          className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          <Icon />
          <span>{link.label}</span>
        </NavLink>
      </li>
    )
  }

  return (
    <div className="app-layout">
      <div
        id="nav-overlay"
        className={`nav-overlay${isMenuOpen ? ' is-active' : ''}`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        id="admin-sidebar"
        className={`admin-sidebar${isMenuOpen ? ' is-active' : ''}`}
        aria-label="Menu Navigasi Admin"
      >
        <div className="sidebar-brand-header">
          <div className="brand-text-group">
            <NavLink to="/" className="sidebar-brand-title">
              Afwo.
            </NavLink>
            <span className="sidebar-brand-badge">Hair Design CRM</span>
          </div>
          <button
            type="button"
            className="nav-close-btn mobile-only"
            aria-label="Tutup Menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-nav-container">
          <div className="sidebar-section-label">MENU</div>
          <ul className="sidebar-menu-list">{MENU_LINKS.map(renderLink)}</ul>

          <div className="sidebar-section-label" style={{ marginTop: 14 }}>
            LAPORAN
          </div>
          <ul className="sidebar-menu-list">{REPORT_LINKS.map(renderLink)}</ul>
        </nav>

        <div className="sidebar-user-footer">
          <NavLink to="/profil" className="sidebar-user-card" style={{ textDecoration: 'none', color: 'inherit' }} title="Lihat Profil Saya">
            <div className="user-avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </NavLink>
          <a href="#" className="sidebar-logout-btn" id="nav-logout-link" title="Keluar" onClick={handleLogout}>
            <LogoutIcon />
            <span>Keluar</span>
          </a>
        </div>
      </aside>

      <div className="app-main-content">
        <header className="mobile-top-header">
          <NavLink to="/" className="brand-logo">
            Afwo.
          </NavLink>
          <button
            type="button"
            className="icon-btn js-menu-toggle"
            aria-label="Buka Menu Navigasi"
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}