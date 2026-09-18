import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClients } from '../data/mockData'
import '../styles/clients.css'

const CONDITION_CLASS = (condition) => {
  if (condition === 'Agak Rusak') return 'condition-agak-rusak'
  if (condition === 'Rusak') return 'condition-rusak'
  return 'condition-sehat'
}

const FILTER_TABS = [
  { value: 'all', label: 'Semua Pelanggan' },
  { value: 'sehat', label: 'Rambut Sehat' },
  { value: 'agak-rusak', label: 'Agak Rusak' },
  { value: 'rusak', label: 'Rusak' }
]

export default function Clients() {
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [sortVal, setSortVal] = useState('name-asc')
  const [condition, setCondition] = useState('all')
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    getClients().then(setData)
  }, [])

  if (!data) return null

  const query = search.trim().toLowerCase()

  let filtered = [...data]

  if (condition !== 'all') {
    filtered = filtered.filter((c) => {
      const condSlug = c.hairCondition.toLowerCase().replace(/\s+/g, '-')
      return condSlug === condition
    })
  }

  if (query) {
    filtered = filtered.filter((c) => {
      return (
        (c.name || '').toLowerCase().includes(query) ||
        (c.phone || '').toLowerCase().includes(query) ||
        (c.instagram || '').toLowerCase().includes(query) ||
        (c.domicile || '').toLowerCase().includes(query) ||
        (c.hairType || '').toLowerCase().includes(query) ||
        (c.specialNotes || '').toLowerCase().includes(query)
      )
    })
  }

  if (sortVal === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortVal === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name))
  else if (sortVal === 'hair-type') filtered.sort((a, b) => a.hairType.localeCompare(b.hairType))
  else if (sortVal === 'condition') filtered.sort((a, b) => a.hairCondition.localeCompare(b.hairCondition))

  const closeModal = () => setSelectedClient(null)

  return (
    <>
      <div className="clients-page-stack">

        {/* Header Row with "+ Tambah Pelanggan" Action */}
        <div className="clients-header-row">
          <div className="clients-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="clients-title">Data Pelanggan</h1>
              <span className="clients-count-badge" id="client-total-badge">{data.length} Pelanggan</span>
            </div>
            <p className="clients-subtitle">Database riwayat profil, jenis &amp; kondisi rambut, preferensi formula, dan alamat pelanggan.</p>
          </div>

          <Link to="/pelanggan/new/edit?mode=add" className="btn-primary-gold btn-add-client-gold" id="btn-add-client" data-field="btn-add-client">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Pelanggan</span>
          </Link>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="clients-toolbar-card">

          {/* Mode Desktop: Condition Tabs Button */}
          <div className="clients-tabs-row">
            {FILTER_TABS.map((tab) => (
              <button
                type="button"
                key={tab.value}
                className={`client-filter-tab${condition === tab.value ? ' active' : ''}`}
                data-filter={tab.value}
                onClick={() => setCondition(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="clients-controls-right">

            {/* Search Bar */}
            <div className="client-search-box">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="client-search"
                className="search-input"
                placeholder="Cari nama, WhatsApp, IG, alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Mode Desktop: Sort Control */}
            <div className="client-sort-box">
              <span className="sort-prefix-label">Urutkan:</span>
              <select id="client-sort-select" className="sort-select-control" value={sortVal} onChange={(e) => setSortVal(e.target.value)}>
                <option value="name-asc">Nama (A - Z)</option>
                <option value="name-desc">Nama (Z - A)</option>
                <option value="hair-type">Jenis Rambut</option>
                <option value="condition">Kondisi Rambut</option>
              </select>
            </div>

            {/* Mode Mobile: 2 Dropdown (Kondisi Rambut & Urutkan) */}
            <div className="mobile-filter-dropdown-wrap">
              <select id="client-mobile-condition-select" className="sort-select-control" aria-label="Filter Kondisi Rambut" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="all">Semua Kondisi</option>
                <option value="sehat">Rambut Sehat</option>
                <option value="agak-rusak">Agak Rusak</option>
                <option value="rusak">Rusak</option>
              </select>
              <select id="client-mobile-sort-select" className="sort-select-control" aria-label="Urutkan Pelanggan" value={sortVal} onChange={(e) => setSortVal(e.target.value)}>
                <option value="name-asc">Nama (A - Z)</option>
                <option value="name-desc">Nama (Z - A)</option>
                <option value="hair-type">Jenis Rambut</option>
                <option value="condition">Kondisi Rambut</option>
              </select>
            </div>

          </div>

        </div>

        {/* Customer Directory Card & Responsive Table */}
        <div className="clients-directory-card" id="clients-directory-card">

          <div className="table-responsive-wrapper">
            <table className="clients-detail-table" id="clients-table">
              <thead>
                <tr>
                  <th>NAMA PELANGGAN</th>
                  <th className="col-phone">NO. WHATSAPP</th>
                  <th className="col-gender">JENIS KELAMIN</th>
                  <th className="col-hair-type">JENIS RAMBUT</th>
                  <th className="col-condition">KONDISI RAMBUT</th>
                  <th className="col-notes">CATATAN</th>
                  <th style={{ textAlign: 'right', width: 140 }}>AKSI</th>
                </tr>
              </thead>
              <tbody id="client-table-body" data-field="client-list">
                {filtered.map((client) => (
                  <tr key={client.id} data-client-id={client.id} className="js-client-row" onClick={() => setSelectedClient(client)}>
                    <td>
                      <span className="client-name-title">{client.name}</span>
                    </td>
                    <td className="col-phone">
                      <span className="client-phone-num">{client.phone}</span>
                    </td>
                    <td className="col-gender">
                      <span className="gender-tag">{client.gender}</span>
                    </td>
                    <td className="col-hair-type">
                      <span className="hair-type-badge">{client.hairType}</span>
                    </td>
                    <td className="col-condition">
                      <span className={`condition-badge ${CONDITION_CLASS(client.hairCondition)}`}>{client.hairCondition}</span>
                    </td>
                    <td className="col-notes">
                      <span className="client-notes-ellipsis" title={client.specialNotes || ''}>{client.specialNotes || '-'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div className="client-actions-cell">
                        <Link to={`/pelanggan/${client.id}/edit`} className="btn-client-action btn-client-edit">Edit</Link>
                        <Link to={`/appointment/baru?clientId=${client.id}&from=clients`} className="btn-client-action btn-client-schedule">+ Janji</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          <div id="clients-empty-state" className="empty-state-card" style={{ display: filtered.length === 0 ? 'block' : 'none' }}>
            <div className="empty-state-content">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="empty-state-text">Tidak ada data pelanggan yang cocok dengan pencarian.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Pop Up Modal Detail Pelanggan */}
      <div className={`client-modal-overlay${selectedClient ? ' is-open' : ''}`} id="client-detail-modal" role="dialog" aria-hidden={selectedClient ? 'false' : 'true'} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="client-modal-card">
          <div className="client-modal-header">
            <h3 className="client-modal-title">Detail Pelanggan</h3>
            <button type="button" className="btn-close-modal" id="btn-close-client-modal" aria-label="Tutup Modal" onClick={closeModal}>✕</button>
          </div>

          <div className="client-modal-body">
            <div className="modal-detail-row">
              <span className="modal-detail-label">Nama Lengkap</span>
              <span className="modal-detail-val" id="mdl-client-name">{selectedClient ? selectedClient.name : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">No. WhatsApp</span>
              <span className="modal-detail-val" id="mdl-client-phone">{selectedClient ? selectedClient.phone : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Instagram</span>
              <span className="modal-detail-val" id="mdl-client-instagram">{selectedClient ? (selectedClient.instagram || '-') : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Jenis Kelamin</span>
              <span className="modal-detail-val" id="mdl-client-gender">{selectedClient ? selectedClient.gender : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Jenis Rambut</span>
              <span className="modal-detail-val" id="mdl-client-hair-type">{selectedClient ? selectedClient.hairType : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Kondisi Rambut</span>
              <span className="modal-detail-val" id="mdl-client-hair-condition">{selectedClient ? selectedClient.hairCondition : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Alamat Domisili</span>
              <span className="modal-detail-val" id="mdl-client-domicile">{selectedClient ? (selectedClient.domicile || '-') : '-'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Catatan Khusus</span>
              <span className="modal-detail-val" id="mdl-client-notes">{selectedClient ? (selectedClient.specialNotes || 'Tidak ada catatan khusus.') : '-'}</span>
            </div>
          </div>

          {selectedClient && (
            <div className="client-modal-footer">
              <Link to={`/pelanggan/${selectedClient.id}/edit`} className="btn-modal-edit" id="mdl-btn-edit" onClick={closeModal}>Edit Data</Link>
              <Link to={`/appointment/baru?clientId=${selectedClient.id}&from=clients`} className="btn-modal-appointment" id="mdl-btn-appointment" onClick={closeModal}>+ Janji Temu</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}