import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct } from '../data/mockData'
import { formatRupiah } from '../utils/format'
import '../styles/services.css'
import '../styles/produk.css'

const CATEGORY_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'retail', label: 'Dijual per Pcs' },
  { value: 'produk-layanan', label: 'Produk Layanan' }
]

const PRODUCT_TAG_LABELS = {
  retail: 'RETAIL',
  'produk-layanan': 'PRODUK LAYANAN',
  perawatan: 'PERAWATAN',
  styling: 'STYLING',
  color: 'COLOR',
  oxidant: 'OXIDANT',
  bleaching: 'BLEACHING',
  keratin: 'KERATIN',
  hairtreatment: 'HAIRTREATMENT',
  smoothing: 'SMOOTHING',
  creambath: 'CREAMBATH',
  umum: 'PRODUK LAYANAN'
}

export default function Produk() {
  const [products, setProducts] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  if (!products) return null

  const visible = filter === 'all' ? products : products.filter((p) => p.category === filter)

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) return
    const ok = await deleteProduct(product.id)
    if (ok) setProducts((list) => list.filter((x) => x.id !== product.id))
  }

  return (
    <>
      <div className="products-intro-section">
        <h1 className="products-title">Product Management</h1>
        <p className="products-subtitle">Kelola stok produk retail dan produk pendukung layanan.</p>
      </div>

      <Link to="/produk/baru/edit" className="btn-add-full" id="add-product-btn" data-field="add-product-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Add New Product</span>
      </Link>

      <div className="pill-filter-container" id="product-category-filter">
        {CATEGORY_FILTERS.map((f) => (
          <button
            type="button"
            key={f.value}
            className={`pill-tab-btn${filter === f.value ? ' active' : ''}`}
            data-filter={f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="products-list-grid" id="product-list" data-field="product-list">
        {visible.map((p) => (
          <article className="product-card" data-category={p.category} key={p.id}>
            <div className="product-card-top">
              <span className={`product-tag ${p.category}`}>{PRODUCT_TAG_LABELS[p.category] || (p.category || '').toUpperCase()}</span>
              <div className="product-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link to={`/produk/${p.id}/edit`} className="btn-edit-icon" aria-label={`Edit ${p.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Link>
                <button type="button" className="btn-edit-icon" style={{ color: '#DC2626' }} aria-label={`Hapus ${p.name}`} onClick={() => handleDelete(p)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
            <h2 className="product-card-name" data-field="product-name">{p.name}</h2>
            <p className="product-card-desc" data-field="description">{p.description}</p>
            <div className="product-card-bottom">
              <div className="product-info-box">
                {p.category === 'retail' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                )}
                <span data-field="stock">
                  {p.category === 'retail' ? `Stok: ${p.stock ?? 0} pcs` : `Satuan: ${p.unit}`}
                </span>
              </div>
              <span className="product-price-val" data-field="price">
                {formatRupiah(p.price)}{p.category === 'retail' ? '' : p.unit}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div id="products-empty-state" className={`empty-filter-state${visible.length === 0 ? ' show' : ''}`}>
        <p>Tidak ada produk pada kategori ini.</p>
      </div>
    </>
  )
}