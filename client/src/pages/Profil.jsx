import { useEffect, useState } from 'react'
import { getLoggedInUser, getProfile, setLoggedInUser, updateProfile } from '../data/mockData'
import '../styles/profil.css'

{/* TODO BACKEND:
  - GET /api/user/profile
  - PUT /api/user/profile
  - PUT /api/user/password
*/}

export default function Profil() {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [infoAlert, setInfoAlert] = useState(null)
  const [isSavingInfo, setIsSavingInfo] = useState(false)

  const [passCurrent, setPassCurrent] = useState('')
  const [passNew, setPassNew] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [passwordAlert, setPasswordAlert] = useState(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    let live = true
    Promise.all([getProfile(), getLoggedInUser()]).then(([p, user]) => {
      if (!live) return
      const active = user || p
      const activeName = (user && user.name) || p.name
      const activeEmail = (user && user.email) || p.email
      setProfile(p)
      setName(activeName || active.name)
      setEmail(activeEmail || active.email)
    })
    return () => {
      live = false
    }
  }, [])

  if (!profile) return null

  const displayName = name.trim() || profile.name
  const displayEmail = email.trim() || profile.email
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    setInfoAlert(null)

    if (!name.trim() || !email.trim()) {
      setInfoAlert({ type: 'error', message: 'Nama dan Email wajib diisi!' })
      return
    }

    if (!currentPassword) {
      setInfoAlert({ type: 'error', message: 'Masukkan password Anda saat ini untuk menyimpan perubahan!' })
      return
    }

    setIsSavingInfo(true)
    const updated = await updateProfile({ name: name.trim(), email: email.trim() })
    await setLoggedInUser({ name: updated.name, email: updated.email, role: updated.role || 'Owner' })
    setProfile(updated)
    setIsSavingInfo(false)
    setCurrentPassword('')
    setInfoAlert({ type: 'success', message: 'Profil Anda berhasil diperbarui!' })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordAlert(null)

    if (!passCurrent) {
      setPasswordAlert({ type: 'error', message: 'Masukkan password saat ini!' })
      return
    }

    if (!passNew || passNew.length < 8) {
      setPasswordAlert({ type: 'error', message: 'Password baru minimal 8 karakter!' })
      return
    }

    if (passNew !== passConfirm) {
      setPasswordAlert({ type: 'error', message: 'Konfirmasi password baru tidak cocok!' })
      return
    }

    setIsSavingPassword(true)
    setTimeout(() => {
      setPassCurrent('')
      setPassNew('')
      setPassConfirm('')
      setIsSavingPassword(false)
      setPasswordAlert({ type: 'success', message: 'Password Anda berhasil diperbarui!' })
    }, 600)
  }

  return (
    <>
      <div className="profil-page-stack">

        <div className="profil-header-section">
          <h1 className="profil-page-title">Profil Saya</h1>
          <p className="profil-page-subtitle">Kelola informasi akun dan kata sandi Anda.</p>
        </div>

        <section className="profil-card">
          <div className="profil-user-header">
            <div className="profil-avatar-badge" id="profil-display-avatar">{avatarInitial}</div>
            <div className="profil-user-details">
              <div className="profil-user-fullname" id="profil-display-name">{displayName}</div>
              <div className="profil-user-email-text" id="profil-display-email">{displayEmail}</div>
              <span className="profil-role-pill">{profile.role}</span>
            </div>
          </div>

          {infoAlert && (
            <div id="alert-profil-info" className={`profil-form-alert is-${infoAlert.type}`} role="alert">{infoAlert.message}</div>
          )}

          <form id="form-profil-info" className="profil-form-grid" onSubmit={handleInfoSubmit}>
            <div className="profil-form-group">
              <label htmlFor="profil-input-name" className="profil-label">Nama <span className="req-star">*</span></label>
              <div className="profil-input-box">
                <input
                  type="text"
                  id="profil-input-name"
                  className="profil-input"
                  data-field="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profil-form-group">
              <label htmlFor="profil-input-email" className="profil-label">Email <span className="req-star">*</span></label>
              <div className="profil-input-box">
                <input
                  type="email"
                  id="profil-input-email"
                  className="profil-input"
                  data-field="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profil-notice-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Untuk mengubah nama atau email, masukkan password Anda saat ini.</span>
            </div>

            <div className="profil-form-group">
              <label htmlFor="profil-input-curr-password" className="profil-label">Password Saat Ini <span className="req-star">*</span></label>
              <div className="profil-input-box">
                <input
                  type="password"
                  id="profil-input-curr-password"
                  className="profil-input input-tinted"
                  data-field="current-password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profil-card-actions">
              <button type="submit" className="btn-profil-submit" disabled={isSavingInfo}>
                {isSavingInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </section>

        <section className="profil-card">
          <h2 className="profil-card-title">Ubah Password</h2>
          <p className="profil-card-subtitle">Pastikan password baru minimal 8 karakter.</p>

          {passwordAlert && (
            <div id="alert-profil-password" className={`profil-form-alert is-${passwordAlert.type}`} role="alert">{passwordAlert.message}</div>
          )}

          <form id="form-profil-password" className="profil-form-grid" onSubmit={handlePasswordSubmit}>
            <div className="profil-form-group">
              <label htmlFor="pass-current" className="profil-label">Password Saat Ini <span className="req-star">*</span></label>
              <div className="profil-input-box">
                <input
                  type="password"
                  id="pass-current"
                  className="profil-input"
                  data-field="current-password"
                  placeholder="Masukkan password saat ini"
                  value={passCurrent}
                  onChange={(e) => setPassCurrent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profil-form-group">
              <label htmlFor="pass-new" className="profil-label">Password Baru <span className="req-star">*</span></label>
              <div className="profil-input-box">
                <input
                  type="password"
                  id="pass-new"
                  className="profil-input"
                  data-field="new-password"
                  placeholder="Minimal 8 karakter"
                  minLength="8"
                  value={passNew}
                  onChange={(e) => setPassNew(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profil-form-group">
              <label htmlFor="pass-confirm" className="profil-label">Konfirmasi Password Baru <span className="req-star">*</span></label>
              <div className="profil-input-box">
                <input
                  type="password"
                  id="pass-confirm"
                  className="profil-input"
                  data-field="confirm-password"
                  placeholder="Ulangi password baru"
                  minLength="8"
                  value={passConfirm}
                  onChange={(e) => setPassConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profil-card-actions">
              <button type="submit" className="btn-profil-submit" disabled={isSavingPassword}>
                {isSavingPassword ? 'Memperbarui...' : 'Perbarui Password'}
              </button>
            </div>
          </form>
        </section>

      </div>
    </>
  )
}