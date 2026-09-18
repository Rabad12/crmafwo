import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getRememberEmail, setRememberEmail, setLoggedInUser } from '../data/mockData'
import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('owner@afwo.com')
  const [password, setPassword] = useState('12345678')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRememberEmail().then((saved) => {
      if (saved) {
        setEmail(saved)
        setRemember(true)
      }
    })
  }, [])

  const showAlert = (message, type = 'error') => setAlert({ message, type })
  const hideAlert = () => setAlert(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    hideAlert()

    if (!email.trim() || !password) {
      showAlert('Email dan password wajib diisi!', 'error')
      return
    }

    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      if (!result.success) {
        showAlert('Email atau password salah.', 'error')
        setLoading(false)
        return
      }

      if (remember) setRememberEmail(email.trim())
      else setRememberEmail('')

      setLoggedInUser(result.user)
      showAlert('Login berhasil! Mengalihkan...', 'success')
      setTimeout(() => navigate('/'), 600)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-body">
      <div className="login-screen-container">
        <div className="login-brand-header">
          <h1 className="login-brand-title">
            Afwo<span className="login-brand-dot">.</span>
          </h1>
          <p className="login-brand-subtitle">Masuk ke akun Anda</p>
        </div>

        <div className="login-card">
          {alert && <div id="login-alert" className={`login-alert is-${alert.type}`} role="alert">{alert.message}</div>}

          <form id="form-login" className="login-form-stack" autocomplete="on" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="login-email" className="login-form-label">Email</label>
              <div className="login-input-wrapper">
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  className="login-input-control"
                  data-field="email"
                  placeholder="nama@afwo.com"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="login-password" className="login-form-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className="login-input-control with-toggle"
                  data-field="password"
                  placeholder="••••••••"
                  value={password}
                  required
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  aria-label="Tampilkan / Sembunyikan Password"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  id="login-remember"
                  data-field="remember"
                  className="login-checkbox-input"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Ingat saya</span>
              </label>
            </div>

            <button type="submit" className="btn-login-submit" id="btn-login-submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}