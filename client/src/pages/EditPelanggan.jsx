import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getClient, addClient, updateClient } from '../data/mockData'
import '../styles/edit-pelanggan.css'

const EMPTY_FORM = {
  name: '',
  countryCode: '+62',
  phone: '',
  instagram: '',
  gender: 'Laki-laki',
  hairType: 'Ikal',
  hairCondition: 'Sehat',
  address: '',
  notes: ''
}

export default function EditPelanggan() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const mode = searchParams.get('mode') || 'edit'
  const isAdd = searchParams.get('mode') === 'add' || id === 'new'

  const [client, setClient] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState(null)

  const nameRef = useRef(null)
  const phoneRef = useRef(null)

  useEffect(() => {
    if (isAdd) return
    let cancelled = false
    getClient(id).then((c) => {
      if (cancelled) return
      if (!c) {
        setNotFound(true)
        return
      }
      setClient(c)
      setForm({
        name: c.name || '',
        countryCode: c.countryCode || '+62',
        phone: c.phone ? c.phone.replace(c.countryCode || '+62', '').trim() : '',
        instagram: c.instagram || '',
        gender: c.gender || 'Laki-laki',
        hairType: c.hairType || 'Ikal',
        hairCondition: c.hairCondition || 'Sehat',
        address: c.address || '',
        notes: c.notes || ''
      })
    })
    return () => {
      cancelled = true
    }
  }, [id, isAdd])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = (message) => setToast(message)

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleSave = (e) => {
    e.preventDefault()

    const name = form.name.trim()
    const phone = form.phone.trim()

    if (!name) {
      showToast('⚠️ Nama pelanggan wajib diisi.')
      if (nameRef.current) nameRef.current.focus()
      return
    }

    if (!phone) {
      showToast('⚠️ Nomor WhatsApp wajib diisi.')
      if (phoneRef.current) phoneRef.current.focus()
      return
    }

    const payload = {
      name,
      countryCode: form.countryCode,
      phone: `${form.countryCode} ${phone}`,
      instagram: form.instagram.trim(),
      gender: form.gender,
      hairType: form.hairType,
      hairCondition: form.hairCondition,
      address: form.address.trim(),
      notes: form.notes.trim()
    }

    const doSave = isAdd
      ? () => addClient(payload)
      : () => updateClient(id, payload)

    doSave().then(() => {
      showToast(isAdd ? `✓ Pelanggan baru "${name}" berhasil ditambahkan!` : `✓ Data pelanggan "${name}" berhasil diperbarui!`)
      setTimeout(() => navigate('/pelanggan'), 1200)
    })
  }

  if (notFound) {
    return (
      <div className="edit-header-wrapper">
        <div className="edit-title-group">
          <h1 className="edit-page-title">Pelanggan tidak ditemukan</h1>
          <p className="edit-page-subtitle">Data pelanggan yang dicari tidak tersedia.</p>
        </div>
        <Link to="/pelanggan" className="btn-primary-gold">Kembali ke Data Pelanggan</Link>
      </div>
    )
  }

  if (!isAdd && !client) return null

  const title = isAdd ? 'Tambah Pelanggan' : 'Edit Pelanggan'
  const subtitle = isAdd ? 'Tambahkan pelanggan baru ke sistem.' : `Perbarui data ${client.name}.`
  const saveLabel = isAdd ? 'Simpan Pelanggan' : 'Simpan Perubahan'

  return (
    <>
      {/* Back Link & Title Group */}
      <div className="edit-header-wrapper">
        <Link to="/pelanggan" id="btn-back-nav" className="back-arrow-link" aria-label="Kembali ke Data Pelanggan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div className="edit-title-group">
          <h1 className="edit-page-title" id="page-title">{title}</h1>
          <p className="edit-page-subtitle" id="page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Form Container Card */}
      <form id="form-edit-client" className="card edit-form-card" onSubmit={handleSave}>

        <div className="form-fields-stack">

          {/* Row 1: Nama & No WhatsApp (2 columns) */}
          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="input-customer-name">Nama <span className="required-star">*</span></label>
              <div className="form-input-box">
                <input type="text" id="input-customer-name" className="form-input-field" data-field="name" value={form.name} placeholder="Nama Lengkap" required ref={nameRef} onChange={handleChange('name')} />
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="input-customer-phone">No. WhatsApp <span className="required-star">*</span></label>
              <div className="phone-split-input">
                <div className="country-select-box">
                  <select id="select-country-code" className="country-select" data-field="country-code" value={form.countryCode} onChange={handleChange('countryCode')}>
                    <option value="+62">ID Indonesia (+62)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+65">SG (+65)</option>
                    <option value="+60">MY (+60)</option>
                  </select>
                </div>
                <div className="phone-number-box">
                  <input type="tel" id="input-customer-phone" className="form-input-field" data-field="phone" value={form.phone} placeholder="81234567890" required ref={phoneRef} onChange={handleChange('phone')} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Username Instagram & Jenis Kelamin (2 columns) */}
          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="input-customer-instagram">Username Instagram</label>
              <div className="form-input-box">
                <input type="text" id="input-customer-instagram" className="form-input-field" data-field="instagram" value={form.instagram} placeholder="@username" onChange={handleChange('instagram')} />
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="select-customer-gender">Jenis Kelamin</label>
              <div className="form-input-box">
                <select id="select-customer-gender" className="form-select-control" data-field="gender" value={form.gender} onChange={handleChange('gender')}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya / Tidak Disebutkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Jenis Rambut & Kondisi Rambut (2 columns) */}
          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="select-customer-hair-type">Jenis Rambut</label>
              <div className="form-input-box">
                <select id="select-customer-hair-type" className="form-select-control" data-field="hair-type" value={form.hairType} onChange={handleChange('hairType')}>
                  <option value="Ikal">Ikal</option>
                  <option value="Lurus">Lurus</option>
                  <option value="Gelombang">Gelombang</option>
                  <option value="Keriting">Keriting</option>
                </select>
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="select-customer-hair-condition">Kondisi Rambut</label>
              <div className="form-input-box">
                <select id="select-customer-hair-condition" className="form-select-control" data-field="hair-condition" value={form.hairCondition} onChange={handleChange('hairCondition')}>
                  <option value="Sehat">Sehat</option>
                  <option value="Agak Rusak">Agak Rusak</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Alamat (full width) */}
          <div className="form-group-item">
            <label className="form-label" htmlFor="input-customer-address">Alamat</label>
            <div className="form-input-box">
              <input type="text" id="input-customer-address" className="form-input-field" data-field="address" value={form.address} placeholder="Alamat Domisili" onChange={handleChange('address')} />
            </div>
          </div>

          {/* Row 5: Catatan Khusus (full width) */}
          <div className="form-group-item">
            <label className="form-label" htmlFor="input-customer-notes">Catatan Khusus</label>
            <div className="form-input-box">
              <textarea id="input-customer-notes" className="form-textarea" data-field="notes" rows="3" placeholder="Catatan preferensi, alergi, atau riwayat formula..." value={form.notes} onChange={handleChange('notes')} />
            </div>
          </div>

          {/* Action Buttons inside Card */}
          <div className="form-actions-row">
            <button type="submit" id="btn-save-customer" className="btn-primary-gold" data-field="btn-save-customer">{saveLabel}</button>
            <Link to="/pelanggan" id="btn-cancel" className="btn-secondary-cancel" data-field="btn-cancel">Batal</Link>
          </div>

        </div>

      </form>

      {/* Toast Notification Box */}
      <div id="toast-success" className={`toast-box${toast ? ' show' : ''}`} role="status" aria-live="polite">
        <span id="toast-message">{toast || 'Data pelanggan berhasil disimpan!'}</span>
      </div>
    </>
  )
}