import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>
      <p style={{ color: '#64748B', marginBottom: 20 }}>Halaman tidak ditemukan.</p>
      <Link to="/" className="btn-simpan-kehadiran" style={{ textDecoration: 'none' }}>
        Kembali ke Dashboard
      </Link>
    </div>
  )
}