import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addWorker, getWorker, updateWorker } from '../data/mockData'
import { formatNumber, initials, todayISO } from '../utils/format'
import '../styles/edit-worker.css'

const COUNTRY_CODES = ['+62', '+1', '+65', '+60']

export default function EditWorker() {
  const { id } = useParams()
  const navigate = useNavigate()
  const nameRef = useRef(null)

  const isAddRoute = !id || id === 'baru'

  const [loading, setLoading] = useState(!isAddRoute)
  const [mode, setMode] = useState(isAddRoute ? 'add' : 'edit')
  const [name, setName] = useState('')
  const [countryCode, setCountryCode] = useState('+62')
  const [phone, setPhone] = useState('')
  const [salary, setSalary] = useState('4000000,00')
  const [commissionScheme, setCommissionScheme] = useState('daily_percentage')
  const [commissionRate, setCommissionRate] = useState('10')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isAddRoute) {
      setLoading(false)
      return
    }
    let active = true
    getWorker(id).then((worker) => {
      if (!active) return
      if (worker) {
        setMode('edit')
        setName(worker.name || '')
        setCountryCode(worker.countryCode || '+62')
        setPhone(String(worker.phone || '').replace(worker.countryCode || '+62', '').trim())
        setSalary(worker.salary != null ? formatNumber(worker.salary) : '4000000,00')
        setCommissionScheme(worker.commissionScheme || 'daily_percentage')
        setCommissionRate(String(worker.commissionRate != null ? worker.commissionRate : '10').replace(',', '.'))
      } else {
        setMode('add')
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [id, isAddRoute])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSchemeChange(scheme) {
    setCommissionScheme(scheme)
    if (scheme === 'daily_percentage' && !commissionRate.trim()) {
      setCommissionRate('10')
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      showToast('⚠️ Nama karyawan wajib diisi.')
      if (nameRef.current) nameRef.current.focus()
      return
    }

    setSaving(true)

    const commissionSchemeLabel = commissionScheme === 'daily_percentage' ? 'Persen Omset Harian' : 'Komisi Per Layanan'
    const salaryNumber = parseInt(String(salary).replace(/[^\d]/g, ''), 10) || 0
    const trimmedPhone = phone.trim()

    // TODO BACKEND: ganti dengan POST /api/workers (mode add) atau PUT /api/workers/:id (mode edit)
    const payload = {
      name: trimmedName,
      countryCode,
      phone: trimmedPhone ? `${countryCode}${trimmedPhone}` : '',
      salary: salaryNumber,
      commissionScheme,
      commissionSchemeLabel,
      commissionRate: commissionRate.trim().replace('.', ',') || '10'
    }

    if (mode === 'edit') {
      await updateWorker(id, payload)
    } else {
      payload.avatar = initials(trimmedName)
      payload.position = 'Hair Stylist'
      payload.specialty = 'Hair Stylist'
      payload.gender = 'Laki-laki'
      payload.status = 'Aktif'
      payload.joinDate = todayISO()
      payload.cover = false
      payload.color = '#E5A93C'
      payload.bg = '#FFFBEB'
      payload.salaryScheme = commissionScheme === 'daily_percentage' ? '% Omset Harian' : '50% dari harga jasa'
      payload.salaryDetail =
        commissionScheme === 'daily_percentage'
          ? `Komisi ${commissionRate.trim()}% dari omset harian. Tidak menerima uang makan.`
          : 'Komisi per layanan sesuai ketentuan tiap layanan.'
      await addWorker(payload)
    }

    setSaving(false)

    const successMsg =
      mode === 'edit'
        ? `Data karyawan "${trimmedName}" berhasil diperbarui!`
        : `Karyawan baru "${trimmedName}" berhasil ditambahkan!`

    showToast(`✓ ${successMsg}`)
    setTimeout(() => navigate('/karyawan'), 1200)
  }

  if (loading) return null

  const isEdit = mode === 'edit'
  const isDaily = commissionScheme === 'daily_percentage'

  return (
    <>
      <div className="edit-header-wrapper">
        <Link to="/karyawan" id="btn-back-nav" className="back-arrow-link" aria-label="Kembali ke Data Karyawan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div className="edit-title-group">
          <h1 className="edit-page-title" id="page-title">{isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}</h1>
          <p className="edit-page-subtitle" id="page-subtitle">
            {isEdit ? `Perbarui data ${name}.` : 'Tambahkan karyawan baru ke sistem.'}
          </p>
        </div>
      </div>

      <form className="card edit-form-card" onSubmit={handleSave}>
        <div className="form-fields-stack">
          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="input-worker-name">Nama <span className="required-star">*</span></label>
              <div className="form-input-box">
                <input
                  type="text"
                  id="input-worker-name"
                  ref={nameRef}
                  className="form-input-field"
                  data-field="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Karyawan"
                  required
                />
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="input-worker-phone">Kontak (No. WA / Telepon)</label>
              <div className="phone-split-input">
                <div className="country-select-box">
                  <select
                    id="select-worker-code"
                    className="country-select"
                    data-field="country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {COUNTRY_CODES.map((code) => {
                      const labels = { '+62': 'ID Indonesia (+62)', '+1': 'US (+1)', '+65': 'SG (+65)', '+60': 'MY (+60)' }
                      return (
                        <option key={code} value={code}>{labels[code]}</option>
                      )
                    })}
                  </select>
                </div>
                <div className="phone-number-box">
                  <input
                    type="tel"
                    id="input-worker-phone"
                    className="form-input-field"
                    data-field="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="81112202005"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="input-worker-salary">Gaji Pokok (per bulan)</label>
            <div className="currency-input-box">
              <span className="currency-prefix">Rp</span>
              <input
                type="text"
                id="input-worker-salary"
                className="form-input-field"
                data-field="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="4000000,00"
              />
            </div>
            <p className="field-subtext">Gaji pokok bulanan, independen dari skema komisi.</p>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-item">
              <label className="form-label">Skema Komisi <span className="required-star">*</span></label>
              <div className="radio-group-vertical">
                <label className={`radio-card-option${!isDaily ? ' active' : ''}`} id="label-scheme-service">
                  <input
                    type="radio"
                    name="commission_scheme"
                    value="per_service"
                    id="scheme-per-service"
                    checked={!isDaily}
                    onChange={() => handleSchemeChange('per_service')}
                  />
                  <span>Per Layanan</span>
                </label>
                <label className={`radio-card-option${isDaily ? ' active' : ''}`} id="label-scheme-daily">
                  <input
                    type="radio"
                    name="commission_scheme"
                    value="daily_percentage"
                    id="scheme-daily-percentage"
                    checked={isDaily}
                    onChange={() => handleSchemeChange('daily_percentage')}
                  />
                  <span>Persen Omset Harian</span>
                </label>
              </div>
            </div>

            <div className="form-group-item" id="container-commission-rate">
              {isDaily && (
                <div id="box-daily-rate">
                  <label className="form-label" id="label-commission-rate">Persen Komisi Omset Harian (%) <span className="required-star">*</span></label>
                  <p className="field-subtext" id="subtext-commission-rate">Standar otomatis 10% (dapat diedit jika ada perubahan kebijakan).</p>
                  <div className="percent-input-box">
                    <input
                      type="number"
                      step="0.1"
                      id="input-worker-commission-rate"
                      className="form-input-field"
                      data-field="commission-rate"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      placeholder="10"
                    />
                    <span className="percent-suffix">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" id="btn-save-worker" className="btn-primary-gold" data-field="btn-save-worker" disabled={saving}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan Karyawan'}
            </button>
            <Link to="/karyawan" id="btn-cancel" className="btn-secondary-cancel" data-field="btn-cancel">Batal</Link>
          </div>
        </div>
      </form>

      <div className={`toast-box${toast ? ' show' : ''}`} role="status" aria-live="polite">
        <span>{toast}</span>
      </div>
    </>
  )
}