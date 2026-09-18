import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addService, getService, updateService } from '../data/mockData'
import '../styles/edit-layanan.css'

const CATEGORY_OPTIONS = [
  { value: 'potong', label: 'Potong Rambut' },
  { value: 'warna', label: 'Color & Highlights' },
  { value: 'spa', label: 'Hair Treatment & Spa' },
  { value: 'smoothing', label: 'Smoothing & Keratin' },
  { value: 'styling', label: 'Styling & Blowout' }
]

function formatNumberRupiah(val) {
  const clean = String(val || '').replace(/[^0-9]/g, '')
  if (!clean) return ''
  return parseInt(clean, 10).toLocaleString('id-ID')
}

const emptyVariant = () => ({ name: '', priceMin: '', priceMax: '', commMin: '', commMax: '' })

export default function EditLayanan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAdd = id === 'baru'

  const [loaded, setLoaded] = useState(isAdd)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [active, setActive] = useState(true)
  const [includeCut, setIncludeCut] = useState(false)
  const [variants, setVariants] = useState([emptyVariant()])
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const toastTimer = useRef(null)

  useEffect(() => {
    if (isAdd) return
    let cancelled = false
    getService(id).then((svc) => {
      if (cancelled) return
      if (svc) {
        setName(svc.name)
        setCategory(svc.category)
        setActive(svc.active !== false)
        setIncludeCut(!!svc.includeCut)
        setVariants(
          svc.variants && svc.variants.length
            ? svc.variants.map((v) => ({
                name: v.name || '',
                priceMin: v.priceMin || '',
                priceMax: v.priceMax || '',
                commMin: v.commMin || '',
                commMax: v.commMax || ''
              }))
            : [{ name: 'Default', priceMin: formatNumberRupiah(String(svc.price)), priceMax: '', commMin: '', commMax: '' }]
        )
      }
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, isAdd])

  const showToast = (message, duration = 2500) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), duration)
  }

  const addVariantRow = () => setVariants((rows) => [...rows, emptyVariant()])

  const updateVariant = (index, field, value) =>
    setVariants((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)))

  const removeVariantRow = (index) => {
    if (variants.length > 1) {
      setVariants((rows) => rows.filter((_, i) => i !== index))
    } else {
      setVariants([emptyVariant()])
      showToast('Baris varian dikosongkan.')
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('⚠️ Nama layanan wajib diisi.')
      return
    }
    if (!category) {
      showToast('⚠️ Kategori layanan wajib dipilih.')
      return
    }
    const firstPrice = variants.find((v) => (v.priceMin || '').trim())
    if (!firstPrice) {
      showToast('⚠️ Masukkan minimal satu harga pada varian.')
      return
    }

    setSaving(true)
    showToast('✅ Layanan berhasil disimpan! Mengalihkan...')
    const payload = {
      name: name.trim(),
      category,
      active,
      includeCut,
      variants: variants.map((v) => ({
        name: v.name,
        priceMin: formatNumberRupiah(v.priceMin),
        priceMax: formatNumberRupiah(v.priceMax),
        commMin: formatNumberRupiah(v.commMin),
        commMax: formatNumberRupiah(v.commMax)
      })),
      price: Number(formatNumberRupiah(firstPrice.priceMin).replace(/[^0-9]/g, '')) || 0
    }
    if (isAdd) await addService(payload)
    else await updateService(id, payload)
    setTimeout(() => navigate('/layanan'), 1500)
  }

  if (!loaded) return null

  return (
    <>
      <div className="edit-layanan-header">
        <h1 className="edit-layanan-title" id="edit-layanan-title">{isAdd ? 'Tambah Layanan' : 'Edit Layanan'}</h1>
        <p className="edit-layanan-subtitle" id="edit-layanan-subtitle">
          {isAdd ? 'Lengkapi layanan beserta varian harga & komisinya.' : 'Perbarui detail layanan, varian harga & skema komisi.'}
        </p>
      </div>

      <form id="form-edit-layanan" className="edit-layanan-stack" onSubmit={(e) => e.preventDefault()}>
        <article className="card form-section-card" data-field="service-form-card">
          <div className="form-row-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="input-service-name">Nama Layanan *</label>
              <div className="form-input-box">
                <input
                  type="text"
                  id="input-service-name"
                  className="form-input-control"
                  data-field="service-name"
                  placeholder="Nama layanan..."
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="select-category">Kategori *</label>
              <div className="form-input-box">
                <select
                  id="select-category"
                  className="form-select-control"
                  data-field="category"
                  value={category}
                  required
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-checkboxes-row">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                id="checkbox-service-active"
                data-field="is-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span className="checkbox-text">Aktif</span>
            </label>

            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                id="checkbox-include-cut"
                data-field="include-cut"
                checked={includeCut}
                onChange={(e) => setIncludeCut(e.target.checked)}
              />
              <span className="checkbox-text">
                Termasuk Potong <span className="muted-note">(exclude dari basis komisi persen_omset_harian)</span>
              </span>
            </label>
          </div>

          <div className="variants-section">
            <div className="variants-header-bar">
              <h2 className="variants-title">Varian Harga & Komisi</h2>
              <button type="button" className="btn-add-variant-row" id="btn-add-variant-row" onClick={addVariantRow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>+ Tambah Baris</span>
              </button>
            </div>

            <p className="variants-help-text">
              Harga Max boleh dikosongkan (artinya harga tetap = harga min). Isi &quot;Default Produk Varian&quot; hanya untuk varian berbasis produk; varian biasa kosongkan.
            </p>

            <div className="variants-table-wrapper">
              <div className="variants-grid-header">
                <div className="v-col">VARIAN</div>
                <div className="v-col">HARGA MIN (RP)</div>
                <div className="v-col">HARGA MAX (RP)</div>
                <div className="v-col">KOMISI MIN (RP)</div>
                <div className="v-col">KOMISI MAX (RP)</div>
                <div className="v-col"></div>
              </div>

              <div className="variants-rows-container" id="variants-rows-container">
                {variants.map((v, i) => (
                  <div className="variant-item-row" key={i}>
                    <div className="variant-input-box">
                      <input
                        type="text"
                        className="variant-input-field js-var-name"
                        placeholder="default / S / M / L / X"
                        value={v.name}
                        onChange={(e) => updateVariant(i, 'name', e.target.value)}
                      />
                    </div>
                    <div className="variant-input-box">
                      <input
                        type="text"
                        className="variant-input-field js-rupiah-input js-var-pmin"
                        placeholder="150.000"
                        value={v.priceMin}
                        onChange={(e) => updateVariant(i, 'priceMin', formatNumberRupiah(e.target.value))}
                      />
                    </div>
                    <div className="variant-input-box">
                      <input
                        type="text"
                        className="variant-input-field js-rupiah-input js-var-pmax"
                        placeholder="200.000"
                        value={v.priceMax}
                        onChange={(e) => updateVariant(i, 'priceMax', formatNumberRupiah(e.target.value))}
                      />
                    </div>
                    <div className="variant-input-box">
                      <input
                        type="text"
                        className="variant-input-field js-rupiah-input js-var-kmin"
                        placeholder="25.000"
                        value={v.commMin}
                        onChange={(e) => updateVariant(i, 'commMin', formatNumberRupiah(e.target.value))}
                      />
                    </div>
                    <div className="variant-input-box">
                      <input
                        type="text"
                        className="variant-input-field js-rupiah-input js-var-kmax"
                        placeholder="35.000"
                        value={v.commMax}
                        onChange={(e) => updateVariant(i, 'commMax', formatNumberRupiah(e.target.value))}
                      />
                    </div>
                    <button type="button" className="btn-delete-variant" title="Hapus Baris" onClick={() => removeVariantRow(i)}>Hapus</button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="default-product-variant-box"
              id="btn-default-product-variant"
              role="button"
              tabIndex="0"
              onClick={() => showToast('💡 Default Produk Varian siap digunakan saat input transaksi.')}
            >
              <div className="dpv-left">
                <span className="dpv-plus">+</span>
                <span className="dpv-text">Default Produk Varian</span>
              </div>
              <span className="dpv-subtext">opsional — baris produk otomatis terisi di form transaksi</span>
            </div>
          </div>

          <div className="form-bottom-actions">
            <button
              type="button"
              className="btn-dark-solid"
              id="btn-save-layanan"
              data-field="btn-save-layanan"
              onClick={handleSave}
              disabled={saving}
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              Simpan Layanan
            </button>
            <Link to="/layanan" className="btn-light-outline" id="btn-cancel-layanan" data-field="btn-cancel">Batal</Link>
          </div>
        </article>
      </form>

      <div id="toast-success" className={`toast-box${toast ? ' show' : ''}`} role="status" aria-live="polite">
        <span id="toast-message">{toast || 'Layanan berhasil disimpan!'}</span>
      </div>
    </>
  )
}