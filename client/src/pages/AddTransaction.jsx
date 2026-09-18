import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addTransaction, getClients, getProducts, getServices, getWorkers } from '../data/mockData'
import { formatNumber, formatRupiah, initials, todayISO } from '../utils/format'
import '../styles/add-transaction.css'

/*
  TODO BACKEND:
  - Form Tambah Transaksi (semua data-field="..." termasuk hair-length,
    product-brand, product-amount-ml, hair-thickness, worker-commission)
    -> submit ke endpoint POST /api/transactions (support multi service item & multi worker per item)
  - id="client-list" (clients.html) -> GET /api/clients, filter search client-side sementara,
    idealnya diganti query ke backend
  - id="service-list" (services.html) -> GET /api/services
  - id="product-list" (produk.html) -> GET /api/products
  - id="worker-list" (worker.html) -> GET /api/workers
*/

const TAX_RATE = 0.11
const COMMISSION_RATE = 0.15

const HAIR_LENGTH_SURCHARGE = { S: 0, M: 50000, L: 100000, XL: 150000 }

const STYLIST_IDS = ['agus-pratama', 'ada-wong', 'budi', 'rina', 'dimas']

// Produk yang dipakai saat layanan (konsisten dengan add-transaction.html)
const SERVICE_PRODUCT_IDS = ['olaplex-no3', 'kerastase-elixir', 'wella-color-charm', 'loreal-majirel']

const PAYMENT_LABELS = { qris: 'QRIS', card: 'Credit Card', cash: 'Cash' }

const PAYMENT_OPTIONS = [
  {
    value: 'qris',
    title: 'QRIS',
    subtitle: 'Scan to pay instantly',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="3" height="3"></rect>
        <rect x="18" y="18" width="3" height="3"></rect>
        <rect x="14" y="18" width="3" height="3"></rect>
        <rect x="18" y="14" width="3" height="3"></rect>
      </svg>
    )
  },
  {
    value: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Terminal or Manual Entry',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    )
  },
  {
    value: 'cash',
    title: 'Cash',
    subtitle: 'Pay at front desk',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        <circle cx="12" cy="12" r="2"></circle>
        <path d="M6 12h.01M18 12h.01"></path>
      </svg>
    )
  }
]

const PERSON_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const PHONE_ICON = (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
)

const CHAT_BOX_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const CALENDAR_ICON = (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const CLOCK_ICON = (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const SCISSORS_ICON = (
  <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
    <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
    <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
  </svg>
)

const PLUS_CIRCLE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
)

export default function AddTransaction() {
  const navigate = useNavigate()

  const [clients, setClients] = useState(null)
  const [workers, setWorkers] = useState(null)
  const [catalogServices, setCatalogServices] = useState(null)
  const [catalogProducts, setCatalogProducts] = useState(null)

  const [customerName, setCustomerName] = useState('Jane Smith')
  const [customerPhone, setCustomerPhone] = useState('+62 812 3456 7890')

  const [nameOpen, setNameOpen] = useState(false)
  const [phoneOpen, setPhoneOpen] = useState(false)

  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('11:30')
  const [notes, setNotes] = useState('Client requested warm blonde tones for the balayage.')

  const [items, setItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('qris')
  const [discount, setDiscount] = useState(0)
  const [amountTendered, setAmountTendered] = useState('')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const uidRef = useRef(0)
  const toastTimer = useRef(null)
  const nameInputRef = useRef(null)
  const phoneInputRef = useRef(null)
  const nameWrapperRef = useRef(null)
  const phoneWrapperRef = useRef(null)

  useEffect(() => {
    Promise.all([getClients(), getWorkers(), getServices(), getProducts()]).then(
      ([cl, wk, sv, pd]) => {
        setClients(cl)
        setWorkers(wk)
        setCatalogServices(sv)
        setCatalogProducts(pd.filter((p) => SERVICE_PRODUCT_IDS.includes(p.id)))
      }
    )
  }, [])

  useEffect(() => {
    if (items.length === 0) setItems([makeServiceItem()])
  }, [])

  useEffect(() => {
    const onClickDocument = (e) => {
      if (nameWrapperRef.current && !nameWrapperRef.current.contains(e.target)) setNameOpen(false)
      if (phoneWrapperRef.current && !phoneWrapperRef.current.contains(e.target)) setPhoneOpen(false)
    }
    document.addEventListener('click', onClickDocument)
    return () => document.removeEventListener('click', onClickDocument)
  }, [])

  const ready = clients && workers && catalogServices && catalogProducts
  if (!ready) return null

  const stylistOptions = workers.filter((w) => STYLIST_IDS.includes(w.id))

  function makeServiceItem() {
    uidRef.current += 1
    return {
      id: `svc-${uidRef.current}`,
      serviceId: 'balayage-color',
      primaryWorkerId: 'agus-pratama',
      extraWorkers: [],
      hairLength: 'S',
      hairThickness: 'medium',
      workerCommission: '',
      products: [{ id: `prd-${uidRef.current}-1`, productId: 'olaplex-no3', amountMl: 30 }]
    }
  }

  const updateItem = (itemId, patch) =>
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)))

  const handleAddService = () => setItems((prev) => [...prev, makeServiceItem()])

  const handleDeleteService = (itemId) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== itemId) : prev))

  const handleAddWorker = (itemId) =>
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, extraWorkers: [...it.extraWorkers, 'ada-wong'] } : it))
    )

  const handleReplaceWorker = (itemId, oldWorkerId, newWorkerId) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, extraWorkers: it.extraWorkers.map((w) => (w === oldWorkerId ? newWorkerId : w)) }
          : it
      )
    )

  const handleRemoveWorker = (itemId, workerId) =>
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, extraWorkers: it.extraWorkers.filter((w) => w !== workerId) } : it))
    )

  const handleAddProduct = (itemId) => {
    uidRef.current += 1
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              products: [...it.products, { id: `prd-${uidRef.current}`, productId: 'kerastase-elixir', amountMl: 20 }]
            }
          : it
      )
    )
  }

  const handleReplaceProduct = (itemId, productId, newProductId) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, products: it.products.map((p) => (p.id === productId ? { ...p, productId: newProductId } : p)) }
          : it
      )
    )

  const handleRemoveProduct = (itemId, productId) =>
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, products: it.products.filter((p) => p.id !== productId) } : it))
    )

  const handleStep = (itemId, productId, delta) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              products: it.products.map((p) =>
                p.id === productId ? { ...p, amountMl: Math.max(10, (p.amountMl || 30) + delta) } : p
              )
            }
          : it
      )
    )

  const itemTotals = items.map((it) => {
    const svc = catalogServices.find((s) => s.id === it.serviceId)
    const basePrice = svc ? svc.price : 0
    const itemSubtotal = basePrice + (HAIR_LENGTH_SURCHARGE[it.hairLength] || 0)
    return { itemSubtotal, suggestedCommission: Math.round(itemSubtotal * COMMISSION_RATE) }
  })

  const subtotal = itemTotals.reduce((sum, t) => sum + t.itemSubtotal, 0)
  const disc = Number(discount) || 0
  const tax = Math.round(subtotal * TAX_RATE)
  const total = Math.max(subtotal - disc + tax, 0)
  const tendered = Number(amountTendered) || 0
  const change = total > 0 && tendered >= total ? tendered - total : 0

  const showToast = (message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  const filteredByName = (clients || []).filter((c) => {
    const q = customerName.toLowerCase().trim()
    const digitsQuery = q.replace(/[^0-9]/g, '')
    const cDigits = String(c.phone || '').replace(/[^0-9]/g, '')
    return (
      c.name.toLowerCase().includes(q) ||
      (digitsQuery && cDigits.includes(digitsQuery)) ||
      String(c.phone || '').toLowerCase().includes(q)
    )
  })

  const filteredByPhone = (clients || []).filter((c) => {
    const q = customerPhone.toLowerCase().trim()
    const digitsQuery = q.replace(/[^0-9]/g, '')
    const cDigits = String(c.phone || '').replace(/[^0-9]/g, '')
    return (
      (digitsQuery && cDigits.includes(digitsQuery)) ||
      String(c.phone || '').toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    )
  })

  const selectClient = (c) => {
    setCustomerName(c.name)
    setCustomerPhone(c.phone)
    setNameOpen(false)
    setPhoneOpen(false)
  }

  const resolveWorkerName = (workerId) => {
    const w = workers.find((x) => x.id === workerId)
    return w ? w.name : ''
  }

  const handleSave = async () => {
    if (!customerName.trim()) {
      showToast('⚠️ Mohon lengkapi nama pelanggan.')
      if (nameInputRef.current) nameInputRef.current.focus()
      return
    }
    if (!customerPhone.trim()) {
      showToast('⚠️ Mohon lengkapi nomor telepon.')
      if (phoneInputRef.current) phoneInputRef.current.focus()
      return
    }
    if (items.length === 0) {
      showToast('⚠️ Mohon tambahkan minimal satu layanan.')
      return
    }

    const servicesPayload = items.map((it, index) => {
      const svc = catalogServices.find((s) => s.id === it.serviceId)
      const itemBase = (svc ? svc.price : 0) + (HAIR_LENGTH_SURCHARGE[it.hairLength] || 0)
      return {
        name: svc ? svc.name : '',
        price: itemBase,
        qty: 1,
        category: svc ? svc.category : null,
        hairLength: it.hairLength,
        hairThickness: it.hairThickness,
        workerId: it.primaryWorkerId,
        workerName: resolveWorkerName(it.primaryWorkerId),
        workerCommission: it.workerCommission,
        workerShare: svc ? svc.workerShare : null
      }
    })

    const productsPayload = items.flatMap((it) =>
      it.products.map((p) => {
        const prod = catalogProducts.find((x) => x.id === p.productId)
        return {
          name: prod ? prod.name : '',
          brand: prod ? prod.brand : null,
          price: prod ? prod.price : 0,
          stock: prod ? prod.stock : 0,
          amountMl: p.amountMl,
          qty: 1
        }
      })
    )

    const transactionData = {
      client: { id: '', name: customerName.trim(), phone: customerPhone.trim(), avatar: initials(customerName) },
      clientName: customerName.trim(),
      date,
      time,
      services: servicesPayload,
      products: productsPayload,
      subtotal,
      discount: disc,
      tax,
      total,
      amount: total,
      status: 'paid',
      paymentMethod: PAYMENT_LABELS[paymentMethod] || 'QRIS',
      method: PAYMENT_LABELS[paymentMethod] || 'QRIS',
      category: servicesPayload[0] ? servicesPayload[0].category : null,
      notes: notes.trim(),
      worker: servicesPayload.length ? resolveWorkerName(servicesPayload[0].workerId) : ''
    }

    setSaving(true)
    showToast('✅ Perubahan reservasi berhasil disimpan! Mengalihkan...')
    await addTransaction(transactionData)
    setTimeout(() => navigate('/riwayat'), 900)
  }

  return (
    <>
      <form id="form-add-transaction" className="form-stack" onSubmit={(e) => e.preventDefault()}>
        {/* Card 1: Interconnected Searchable Combobox for Client & Phone Number */}
        <article className="card customer-combobox-card" data-field="customer-card">
          <div className="combobox-group-item">
            <label className="form-label" htmlFor="customer-name-input">CLIENT / CUSTOMER</label>
            <div className="combobox-wrapper" id="name-combobox-wrapper" ref={nameWrapperRef}>
              <div className="combobox-input-box">
                {PERSON_ICON}
                <input
                  type="text"
                  id="customer-name-input"
                  ref={nameInputRef}
                  className="combobox-input"
                  data-field="customer-name"
                  value={customerName}
                  placeholder="Ketik atau cari nama pelanggan..."
                  autoComplete="off"
                  required
                  onFocus={() => {
                    setNameOpen(true)
                    setPhoneOpen(false)
                  }}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    setNameOpen(true)
                    setPhoneOpen(false)
                  }}
                />
                <button
                  type="button"
                  id="btn-toggle-combobox"
                  className={`combobox-toggle-btn${nameOpen ? ' open' : ''}`}
                  aria-label="Buka pilihan pelanggan"
                  onClick={(e) => {
                    e.preventDefault()
                    if (nameOpen) {
                      setNameOpen(false)
                    } else {
                      setNameOpen(true)
                      setPhoneOpen(false)
                      if (nameInputRef.current) nameInputRef.current.focus()
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {nameOpen && (
                <div id="combobox-dropdown" className="combobox-dropdown show">
                  {filteredByName.length === 0 ? (
                    <div className="combobox-no-results">
                      <strong style={{ color: 'var(--text-primary)' }}>Pelanggan tidak ditemukan.</strong>
                      <span style={{ display: 'block', fontSize: '0.76rem', marginTop: 2, color: 'var(--text-muted)' }}>
                        Nomor telepon dapat diisi manual sebagai data klien baru.
                      </span>
                    </div>
                  ) : (
                    filteredByName.map((c) => (
                      <div className="combobox-option" key={c.id} data-name={c.name} data-phone={c.phone} onClick={() => selectClient(c)}>
                        <div className="combobox-option-left">
                          <div className="combobox-option-main">
                            <span className="combobox-option-name">{c.name}</span>
                            <span className="combobox-option-phone">ID Telp: {c.phone}</span>
                          </div>
                        </div>
                        <span className="combobox-badge-pill">{c.phone}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="combobox-group-item">
            <label className="form-label" htmlFor="customer-phone-input">
              PHONE NUMBER <span className="unique-key-hint">(ID Unik Database)</span>
            </label>
            <div className="combobox-wrapper" id="phone-combobox-wrapper" ref={phoneWrapperRef}>
              <div className="combobox-input-box">
                {PHONE_ICON}
                <input
                  type="tel"
                  id="customer-phone-input"
                  ref={phoneInputRef}
                  className="combobox-input"
                  data-field="customer-phone"
                  value={customerPhone}
                  placeholder="Ketik atau cari nomor telepon..."
                  autoComplete="off"
                  required
                  onFocus={() => {
                    setPhoneOpen(true)
                    setNameOpen(false)
                  }}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value)
                    setPhoneOpen(true)
                    setNameOpen(false)
                  }}
                />
                <button
                  type="button"
                  id="btn-toggle-phone-combobox"
                  className={`combobox-toggle-btn${phoneOpen ? ' open' : ''}`}
                  aria-label="Buka pilihan nomor telepon"
                  onClick={(e) => {
                    e.preventDefault()
                    if (phoneOpen) {
                      setPhoneOpen(false)
                    } else {
                      setPhoneOpen(true)
                      setNameOpen(false)
                      if (phoneInputRef.current) phoneInputRef.current.focus()
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {phoneOpen && (
                <div id="phone-combobox-dropdown" className="combobox-dropdown show">
                  {filteredByPhone.length === 0 ? (
                    <div className="combobox-no-results">
                      <strong style={{ color: 'var(--text-primary)' }}>Nomor belum terdaftar di database.</strong>
                      <span style={{ display: 'block', fontSize: '0.76rem', marginTop: 2, color: 'var(--text-muted)' }}>
                        Nomor ini akan tersimpan otomatis saat transaksi dibuat.
                      </span>
                    </div>
                  ) : (
                    filteredByPhone.map((c) => (
                      <div className="combobox-option" key={c.id} data-name={c.name} data-phone={c.phone} onClick={() => selectClient(c)}>
                        <div className="combobox-option-left">
                          <div className="combobox-option-main">
                            <span className="combobox-option-name">{c.phone}</span>
                            <span className="combobox-option-phone">Klien: {c.name}</span>
                          </div>
                        </div>
                        <span className="combobox-badge-pill">{c.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Native Date & Time Pickers Row */}
        <div className="date-time-grid">
          <div>
            <label className="form-label" htmlFor="input-date">DATE</label>
            <div className="input-container-icon">
              {CALENDAR_ICON}
              <input type="date" id="input-date" className="native-picker-input" data-field="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="input-time">TIME</label>
            <div className="input-container-icon">
              {CLOCK_ICON}
              <input type="time" id="input-time" className="native-picker-input" data-field="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Service Items Container (Multi-Service Support) */}
        <div id="service-items-container" className="service-items-container">
          {items.map((item, index) => (
            <article key={item.id} id={`service-item-${index + 1}`} className="card service-item-card" data-field="service-item-card">
              <div className="service-item-header">
                <span className="label-caps service-item-number">SERVICE ITEM #{index + 1}</span>
                <button
                  type="button"
                  className="btn-delete-service"
                  data-action="delete-service"
                  title="Hapus Service Item Ini"
                  style={{ display: items.length > 1 ? 'inline-flex' : 'none' }}
                  onClick={() => handleDeleteService(item.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>

              {/* Service Selection */}
              <div>
                <label className="form-label">SERVICE</label>
                <div className="input-container-icon">
                  {SCISSORS_ICON}
                  <select
                    className="select-dropdown-field service-select"
                    data-field="service-name"
                    data-price-field="service-price"
                    value={item.serviceId}
                    onChange={(e) => updateItem(item.id, { serviceId: e.target.value })}
                  >
                    {catalogServices.map((s) => (
                      <option key={s.id} value={s.id} data-price={s.price}>
                        {s.name} (Rp {formatNumber(s.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assigned Stylists (Multi-Karyawan Support) */}
              <div className="assigned-stylists-group">
                <label className="form-label">ASSIGNED STYLIST / KARYAWAN</label>
                <div className="input-container-icon">
                  {CHAT_BOX_ICON}
                  <select
                    className="select-dropdown-field"
                    data-field="stylist-name"
                    value={item.primaryWorkerId}
                    onChange={(e) => updateItem(item.id, { primaryWorkerId: e.target.value })}
                  >
                    {stylistOptions.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.position || w.specialty})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="extra-stylists-container">
                  {item.extraWorkers.map((wid) => (
                    <div className="sub-row-item" key={wid}>
                      <div className="input-container-icon" style={{ flex: 1 }}>
                        {CHAT_BOX_ICON}
                        <select
                          className="select-dropdown-field"
                          data-field="stylist-name"
                          value={wid}
                          onChange={(e) => handleReplaceWorker(item.id, wid, e.target.value)}
                        >
                          {stylistOptions.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name} ({w.position || w.specialty})
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="button" className="btn-remove-row" aria-label="Hapus Karyawan" onClick={() => handleRemoveWorker(item.id, wid)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-dashed-mini" data-action="add-worker" onClick={() => handleAddWorker(item.id)}>
                  {PLUS_CIRCLE_ICON}
                  <span>+ ADD KARYAWAN</span>
                </button>
              </div>

              {/* Hair Length Surcharge (S / M / L / XL) */}
              <div>
                <label className="form-label">HAIR LENGTH (PANJANG RAMBUT)</label>
                <div className="segmented-pill-group">
                  {['S', 'M', 'L', 'XL'].map((len) => (
                    <label key={len} className={`segmented-pill-label${item.hairLength === len ? ' active' : ''}`}>
                      <input
                        type="radio"
                        name={`hair-length-${item.id}`}
                        value={len}
                        data-field="hair-length"
                        data-surcharge={HAIR_LENGTH_SURCHARGE[len]}
                        checked={item.hairLength === len}
                        onChange={() => updateItem(item.id, { hairLength: len })}
                      />
                      <span>
                        {len === 'S' ? 'S (+Rp 0)' : len === 'M' ? 'M (+50rb)' : len === 'L' ? 'L (+100rb)' : 'XL (+150rb)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product / Brand & Dosage Stepper (ml) */}
              <div className="products-group">
                <label className="form-label">PRODUCT / BRAND (PRODUK YANG DIPAKAI)</label>
                <div className="product-row-flex">
                  <div className="input-container-icon" style={{ flex: 1, minWidth: 170 }}>
                    <select
                      className="select-dropdown-field"
                      data-field="product-brand"
                      value={item.products[0] ? item.products[0].productId : ''}
                      onChange={(e) => item.products[0] && handleReplaceProduct(item.id, item.products[0].id, e.target.value)}
                    >
                      {catalogProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dosage-stepper">
                    <button
                      type="button"
                      className="btn-step btn-step-minus"
                      aria-label="Kurang 10ml"
                      onClick={() => item.products[0] && handleStep(item.id, item.products[0].id, -10)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step="10"
                      min="10"
                      value={item.products[0] ? item.products[0].amountMl : 30}
                      className="stepper-input"
                      data-field="product-amount-ml"
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn-step btn-step-plus"
                      aria-label="Tambah 10ml"
                      onClick={() => item.products[0] && handleStep(item.id, item.products[0].id, 10)}
                    >
                      +
                    </button>
                    <span className="unit-label">ml</span>
                  </div>
                </div>
                <div className="extra-products-container">
                  {item.products.slice(1).map((p) => (
                    <div className="sub-row-item" key={p.id}>
                      <div className="input-container-icon" style={{ flex: 1 }}>
                        <select
                          className="select-dropdown-field"
                          data-field="product-brand"
                          value={p.productId}
                          onChange={(e) => handleReplaceProduct(item.id, p.id, e.target.value)}
                        >
                          {catalogProducts.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="dosage-stepper">
                        <button type="button" className="btn-step btn-step-minus" aria-label="Kurang 10ml" onClick={() => handleStep(item.id, p.id, -10)}>
                          −
                        </button>
                        <input type="number" step="10" min="10" value={p.amountMl} className="stepper-input" data-field="product-amount-ml" readOnly />
                        <button type="button" className="btn-step btn-step-plus" aria-label="Tambah 10ml" onClick={() => handleStep(item.id, p.id, 10)}>
                          +
                        </button>
                        <span className="unit-label">ml</span>
                      </div>
                      <button type="button" className="btn-remove-row" aria-label="Hapus Produk" onClick={() => handleRemoveProduct(item.id, p.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-dashed-mini" data-action="add-product" onClick={() => handleAddProduct(item.id)}>
                  {PLUS_CIRCLE_ICON}
                  <span>ADD PRODUCT</span>
                </button>
              </div>

              {/* Hair Thickness */}
              <div>
                <label className="form-label">HAIR THICKNESS (KETEBALAN RAMBUT)</label>
                <div className="segmented-pill-group">
                  {[
                    { value: 'thin', label: 'Tipis' },
                    { value: 'medium', label: 'Sedang' },
                    { value: 'thick', label: 'Tebal' }
                  ].map((opt) => (
                    <label key={opt.value} className={`segmented-pill-label${item.hairThickness === opt.value ? ' active' : ''}`}>
                      <input
                        type="radio"
                        name={`hair-thickness-${item.id}`}
                        value={opt.value}
                        data-field="hair-thickness"
                        checked={item.hairThickness === opt.value}
                        onChange={() => updateItem(item.id, { hairThickness: opt.value })}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Worker Commission & Hint */}
              <div>
                <label className="form-label">WORKER COMMISSION</label>
                <div className="input-container-icon">
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.88rem' }}>Rp</span>
                  <input
                    type="number"
                    className="text-input-field"
                    data-field="worker-commission"
                    placeholder="180000"
                    value={item.workerCommission}
                    onChange={(e) => updateItem(item.id, { workerCommission: e.target.value })}
                  />
                </div>
                <div className="commission-suggestion commission-hint" id="commission-suggestion">
                  Saran komisi untuk layanan ini: Rp {formatNumber(itemTotals[index].suggestedCommission)} (15% dari subtotal)
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Full-Width ADD SERVICE Button */}
        <button type="button" id="btn-add-service" className="btn-add-service-full" data-action="add-service" onClick={handleAddService}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>ADD SERVICE</span>
        </button>

        {/* Card: Special Notes (Editable Textarea) */}
        <article className="card" data-field="notes-card">
          <label className="form-label" htmlFor="notes-textarea">SPECIAL NOTES (OPTIONAL)</label>
          <textarea
            id="notes-textarea"
            className="notes-textarea"
            data-field="notes"
            placeholder="Client requested warm blonde tones for the balayage."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </article>

        {/* Card: Service Summary */}
        <article className="card" data-field="service-summary-card">
          <div className="card-section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2 className="card-section-title">Service Summary</h2>
          </div>

          <div className="summary-rows">
            <div className="summary-row summary-row-subtle">
              <span>Subtotal</span>
              <span id="summary-subtotal" className="summary-val" data-field="subtotal">{formatNumber(subtotal)}</span>
            </div>

            <div className="summary-row summary-row-subtle">
              <span>Diskon</span>
              <input
                type="number"
                min="0"
                id="summary-discount"
                className="text-input-field"
                data-field="discount"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                style={{
                  width: 110,
                  textAlign: 'right',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="summary-row summary-row-subtle">
              <span>Tax (11%)</span>
              <span id="summary-tax" className="summary-val" data-field="tax">{formatRupiah(tax)}</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-total-row">
              <span className="summary-total-label">Total</span>
              <span id="summary-total" className="summary-total-val" data-field="total">{formatNumber(total)}</span>
            </div>

            <div className="summary-row summary-row-subtle">
              <span>Bayar (Uang Diterima)</span>
              <input
                type="number"
                min="0"
                id="summary-amount-tendered"
                className="text-input-field"
                data-field="amount-tendered"
                placeholder="0"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                style={{
                  width: 110,
                  textAlign: 'right',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="summary-row summary-row-subtle">
              <span>Kembalian</span>
              <span id="summary-change" className="summary-val" data-field="change">{formatRupiah(change)}</span>
            </div>
          </div>
        </article>

        {/* Card: Payment Method */}
        <article className="card" data-field="payment-method-card">
          <div className="card-section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <h2 className="card-section-title">Payment Method</h2>
          </div>

          <div className="payment-methods-list" id="payment-methods-group">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`payment-option-item${paymentMethod === opt.value ? ' active' : ''}`}
                htmlFor={`pay-${opt.value}`}
              >
                <div className="payment-option-left">
                  <div className="payment-icon-box">{opt.icon}</div>
                  <div className="payment-texts">
                    <span className="payment-title">{opt.title}</span>
                    <span className="payment-subtitle">{opt.subtitle}</span>
                  </div>
                </div>
                <input
                  type="radio"
                  id={`pay-${opt.value}`}
                  name="payment-method"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  data-field="payment-method"
                />
                <div className="radio-indicator">
                  <div className="radio-indicator-dot"></div>
                </div>
              </label>
            ))}
          </div>
        </article>

        {/* Bottom Dual Actions: DISCARD & SAVE CHANGES */}
        <div className="dual-actions-container">
          <button
            type="button"
            id="btn-save-changes"
            className="btn-dark"
            data-field="btn-save-changes"
            onClick={handleSave}
            style={{ pointerEvents: saving ? 'none' : undefined, opacity: saving ? 0.7 : undefined }}
          >
            <span>SAVE CHANGES</span>
          </button>
          <button type="button" id="btn-discard" className="btn-outline" data-field="btn-discard" onClick={() => navigate('/riwayat')}>
            <span>DISCARD</span>
          </button>
        </div>
      </form>

      {/* Toast Notification Box */}
      {toast && (
        <div id="toast-success" className="toast-box show" role="status" aria-live="polite">
          <span id="toast-message">{toast}</span>
        </div>
      )}
    </>
  )
}