import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClient, getTransactions } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/profil-pelanggan.css'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']

function formatVisitDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const month = MONTHS[Number(m) - 1] || m
  return `${month} ${Number(d) || d}, ${y}`
}

export default function ProfilPelanggan() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    let cancelled = false
    getClient(id).then((c) => {
      if (cancelled) return
      if (!c) {
        setNotFound(true)
        return
      }
      setClient(c)
    })
    getTransactions().then((rows) => {
      if (!cancelled) setTransactions(rows)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (notFound) {
    return (
      <div className="profile-hero">
        <h1 className="profile-name">Pelanggan tidak ditemukan</h1>
        <p className="profile-meta-line">Data pelanggan yang dicari tidak tersedia.</p>
        <Link to="/pelanggan" className="btn-outline btn-profile-action">KEMBALI KE DATA PELANGGAN</Link>
      </div>
    )
  }

  if (!client) return null

  const visits = transactions
    .filter((t) => t.client && t.client.id === id)
    .map((t) => ({ date: t.date, service: t.service, amount: t.amount }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <>
      {/* Identity Hero Section */}
      <section className="profile-hero">
        <h1 id="client-name" className="profile-name" data-field="client-name">{client.name}</h1>
        <p id="client-phone" className="profile-meta-line" data-field="client-phone">Phone: {client.phone}</p>
        <p id="client-email" className="profile-meta-line" data-field="client-email">Email: {client.email || '-'}</p>
      </section>

      {/* Action Buttons */}
      <div className="profile-actions">
        <Link to={`/pelanggan/${client.id}/edit`} id="btn-edit-profile" className="btn-outline btn-profile-action" data-field="btn-edit-profile">
          <span>EDIT PROFILE</span>
        </Link>
        <Link to={`/transaksi/baru?clientId=${client.id}`} id="btn-book-appointment" className="btn-dark btn-profile-action" data-field="btn-book-appointment">
          <span>BOOK APPOINTMENT</span>
        </Link>
      </div>

      {/* Profile Cards Grid */}
      <div className="profile-cards-grid">

        {/* Card 1: Visit History */}
        <article className="card visit-history-card" data-field="visit-history-card">
          <h2 className="visit-history-title">Visit History</h2>

          <div id="visit-history-list" className="visit-list" data-field="visit-history-list">
            {visits.length === 0 && (
              <div className="visit-item" data-field="visit-item">
                <div className="visit-item-left">
                  <div className="visit-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="visit-date" data-field="visit-date">BELUM ADA</div>
                    <div className="visit-service" data-field="visit-service">Belum ada kunjungan tercatat.</div>
                  </div>
                </div>
              </div>
            )}

            {visits.map((visit, i) => (
              <div className="visit-item" data-field="visit-item" key={i}>
                <div className="visit-item-left">
                  <div className="visit-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="visit-date" data-field="visit-date">{formatVisitDate(visit.date)}</div>
                    <div className="visit-service" data-field="visit-service">{visit.service}</div>
                  </div>
                </div>
                <div className="visit-amount" data-field="visit-amount">{formatRupiah(visit.amount)}</div>
              </div>
            ))}
          </div>

          <Link to="/riwayat" className="visit-view-all" data-field="view-all-history">VIEW ALL HISTORY</Link>
        </article>

        {/* Card 2: Client Preferences */}
        <article className="card-cream preferences-card" data-field="preferences-card">
          <div className="preferences-header">
            <svg className="preferences-heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className="preferences-title">Client Preferences</h2>
          </div>

          <div className="preference-field-group">
            <span className="label-caps">HAIR TYPE</span>
            <div id="pref-hair-type" className="preference-box" data-field="hair-type">
              {client.hairType || '-'}
            </div>
          </div>

          <div className="preference-field-group">
            <span className="label-caps">PREFERRED PRODUCTS</span>
            <div id="pref-products" className="preference-box" data-field="preferred-products">
              {client.preferredProducts || '-'}
            </div>
          </div>

          <div className="preference-field-group">
            <span className="label-caps">STYLING INSTRUCTIONS</span>
            <div id="pref-styling" className="preference-box" data-field="styling-instructions">
              {client.stylingInstructions || '-'}
            </div>
          </div>
        </article>

      </div>
    </>
  )
}