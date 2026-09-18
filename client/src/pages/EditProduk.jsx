import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addProduct, getProduct, updateProduct } from '../data/mockData'
import '../styles/edit-layanan.css'
import '../styles/edit-produk.css'

const SEED_BRANDS = ['Wella', "L'Oréal", 'Olaplex', 'Kerastase', 'Makarizo', 'Matrix', 'Schwarzkopf', 'Shiseido']

const CATEGORY_RADIOS = [
  [
    { value: 'retail', label: 'Dijual Per PCS', unit: '/pcs', help: 'Harga jual per pcs ke pelanggan.' },
    { value: 'bleaching', label: 'Bleaching', unit: '/10gr', help: 'Harga modal per 10gr bubuk bleaching yang digunakan saat layanan.' },
    { value: 'keratin', label: 'Keratin', unit: '/10ml', help: 'Harga modal per 10ml serum keratin yang digunakan saat layanan.' },
    { value: 'hairtreatment', label: 'Hairtreatment', unit: '/10ml', help: 'Harga modal per 10ml masker/treatment yang digunakan saat layanan.' },
    { value: 'umum', label: 'Dipakai Layanan (umum)', unit: '/10ml', help: 'Harga modal per 10ml bahan yang digunakan saat layanan.' }
  ],
  [
    { value: 'color', label: 'Color', unit: '/10ml', help: 'Harga modal per 10ml krim pewarna (color) yang digunakan saat layanan.' },
    { value: 'oxidant', label: 'Oxidant', unit: '/10ml', help: 'Harga modal per 10ml developer/oxidant yang digunakan saat layanan.' },
    { value: 'smoothing', label: 'Smoothing', unit: '/10ml', help: 'Harga modal per 10ml obat smoothing yang digunakan saat layanan.' },
    { value: 'creambath', label: 'Creambath', unit: '/10ml', help: 'Harga modal per 10ml krim creambath yang digunakan saat layanan.' }
  ]
]

function formatNumberRupiah(val) {
  const clean = String(val || '').replace(/[^0-9]/g, '')
  if (!clean) return ''
  return parseInt(clean, 10).toLocaleString('id-ID')
}

export default function EditProduk() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAdd = id === 'baru'

  const [loaded, setLoaded] = useState(isAdd)
  const [name, setName] = useState('')
  const [brands, setBrands] = useState(SEED_BRANDS)
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('umum')
  const [unit, setUnit] = useState('/10ml')
  const [priceHelp, setPriceHelp] = useState('Harga modal per 10ml bahan yang digunakan saat layanan.')
  const [price, setPrice] = useState('')
  const [active, setActive] = useState(true)
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const toastTimer = useRef(null)

  useEffect(() => {
    if (isAdd) return
    let cancelled = false
    getProduct(id).then((prod) => {
      if (cancelled) return
      if (prod) {
        setName(prod.name)
        setBrand(prod.brand)
        if (prod.brand && !SEED_BRANDS.some((b) => b.toLowerCase() === prod.brand.toLowerCase())) {
          setBrands((list) => [prod.brand, ...list])
        }
        setCategory(prod.category || 'umum')
        setUnit(prod.unit || '/10ml')
        setPrice(formatNumberRupiah(String(prod.price)))
        setActive(prod.active !== false)
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

  const selectCategory = (opt) => {
    setCategory(opt.value)
    setUnit(opt.unit)
    setPriceHelp(opt.help)
  }

  const handleAddBrand = () => {
    const newBrand = window.prompt('Ketik nama merek baru:')
    if (newBrand && newBrand.trim()) {
      const cleanBrand = newBrand.trim()
      if (!brands.some((b) => b.toLowerCase() === cleanBrand.toLowerCase())) {
        setBrands((list) => [...list, cleanBrand])
      }
      setBrand(cleanBrand)
      showToast(`✓ Merek "${cleanBrand}" berhasil ditambahkan!`)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('⚠️ Nama produk wajib diisi.')
      return
    }
    if (!brand) {
      showToast('⚠️ Merek produk wajib dipilih.')
      return
    }
    if (!price.trim()) {
      showToast('⚠️ Harga per satuan wajib diisi.')
      return
    }

    setSaving(true)
    showToast('✅ Produk berhasil disimpan! Mengalihkan...')
    const payload = {
      name: name.trim(),
      brand,
      category,
      unit,
      price: Number(formatNumberRupiah(price).replace(/[^0-9]/g, '')) || 0,
      active
    }
    if (isAdd) await addProduct(payload)
    else await updateProduct(id, payload)
    setTimeout(() => navigate('/produk'), 1500)
  }

  if (!loaded) return null

  return (
    <>
      <div className="edit-produk-header">
        <h1 className="edit-produk-title" id="edit-produk-title">{isAdd ? 'Tambah Produk' : 'Edit Produk'}</h1>
        <p className="edit-produk-subtitle" id="edit-produk-subtitle">
          {isAdd ? 'Lengkapi data produk baru di bawah ini.' : 'Perbarui data dan tarif modal produk.'}
        </p>
      </div>

      <form id="form-edit-produk" className="edit-produk-stack" onSubmit={(e) => e.preventDefault()}>
        <article className="card form-section-card" data-field="product-form-card">
          <div className="form-row-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="input-product-name">Nama Produk *</label>
              <div className="form-input-box">
                <input
                  type="text"
                  id="input-product-name"
                  className="form-input-control"
                  data-field="product-name"
                  placeholder="Nama produk..."
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="select-product-brand">Merek *</label>
              <div className="brand-input-row">
                <div className="form-input-box brand-select-box">
                  <select
                    id="select-product-brand"
                    className="form-select-control"
                    data-field="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">-- Pilih Merek --</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <button type="button" className="btn-add-brand-gold" id="btn-add-brand" onClick={handleAddBrand}>+ Baru</button>
              </div>
              <span className="field-help-text">Butuh merek baru? Klik &quot;+ Baru&quot; lalu ketik namanya.</span>
            </div>
          </div>

          <div className="form-group-item">
            <label className="form-label">Kategori Produk *</label>
            <span className="field-help-text" style={{ marginTop: -2, marginBottom: 6 }}>Dijual per pcs ke pelanggan, atau dipakai staf saat treatment.</span>

            <div className="product-category-radio-grid">
              {CATEGORY_RADIOS.map((col, ci) => (
                <div className="radio-col" key={ci}>
                  {col.map((opt) => (
                    <label className={`category-radio-card${category === opt.value ? ' active' : ''}`} key={opt.value}>
                      <input
                        type="radio"
                        name="product-category"
                        value={opt.value}
                        data-unit={opt.unit}
                        data-help={opt.help}
                        checked={category === opt.value}
                        onChange={() => selectCategory(opt)}
                      />
                      <span className="radio-custom-dot"></span>
                      <span className="radio-card-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group-item">
              <label className="form-label" htmlFor="input-unit">Satuan *</label>
              <div className="form-input-box disabled-like">
                <input
                  type="text"
                  id="input-unit"
                  className="form-input-control"
                  data-field="unit"
                  value={unit}
                  placeholder="/10ml"
                  required
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
              <span className="field-help-text" id="unit-help-text">Satuan otomatis: {unit}</span>
            </div>

            <div className="form-group-item">
              <label className="form-label" htmlFor="input-price">Harga per Satuan (Rp) *</label>
              <div className="form-input-box">
                <input
                  type="text"
                  id="input-price"
                  className="form-input-control"
                  data-field="price"
                  placeholder="15.000"
                  value={price}
                  required
                  onChange={(e) => setPrice(formatNumberRupiah(e.target.value))}
                />
              </div>
              <span className="field-help-text" id="price-help-text">{priceHelp}</span>
            </div>
          </div>

          <div className="form-group-item checkbox-row">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                id="checkbox-active"
                data-field="is-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span className="checkbox-text">Aktif</span>
            </label>
          </div>

          <div className="form-bottom-actions">
            <button
              type="button"
              className="btn-dark-solid"
              id="btn-save-produk"
              data-field="btn-save-produk"
              onClick={handleSave}
              disabled={saving}
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              Simpan Produk
            </button>
            <Link to="/produk" className="btn-light-outline" id="btn-cancel-produk" data-field="btn-cancel">Batal</Link>
          </div>
        </article>
      </form>

      <div id="toast-success" className={`toast-box${toast ? ' show' : ''}`} role="status" aria-live="polite">
        <span id="toast-message">{toast || 'Produk berhasil disimpan!'}</span>
      </div>
    </>
  )
}