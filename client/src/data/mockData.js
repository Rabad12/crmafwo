/**
 * AFWO Hair Design CRM — In-memory Mock Database (API-Ready)
 * ---------------------------------------------------------------------------
 * Faithful reproduction of every mock/demo dataset found in the legacy
 * `scripts/*.js` (dashboard, absensi, add-appointment, add-transaction,
 * appointment, clients, edit-{layanan,pelanggan,produk,worker}, laporan,
 * login, pelanggan-aktif, pendapatan-karyawan, profil-pelanggan, produk,
 * profil, rekap-komisi, riwayat, services, worker).
 *
 * Every export is an async function returning a Promise (mimics a REST API).
 * Raw seed arrays live at module top; a mutable working copy is deep-cloned
 * on first access so CRUD operations persist for the whole session.
 *
 * Business rules preserved from the original code:
 *   - Uang makan Rp25.000/hari, HANYA untuk karyawan skema per-layanan
 *     (% omset harian tidak mendapat uang makan).  -> absensi.js
 *   - Komisi per layanan umumnya 10% dari harga varian. -> edit-layanan.js
 *   - Saran komisi add-transaction: 15% dari subtotal layanan.
 *   - Skema gaji:
 *       "% Omset Harian"            -> komisi = rate% x omset harian
 *       "50% dari harga jasa"       -> komisi per layanan = 50% dari jasa
 *       "Rp1.000.000 + 5% jasa"     -> gaji pokok tetap + 5% jasa
 *   - Disclaimer pendapatan-karyawan.html: gaji pokok dibayar utuh per bulan
 *     (tidak di-pro-rata); komisi dihitung dari transaksi berstatus selesai.
 *
 * TODO BACKEND: ganti seluruh fungsi berikut dengan fetch('/api/...') dan
 * hapus file ini begitu backend API tersedia.
 */

// ===========================================================================
// HELPERS (bukan API — internal saja)
// ===========================================================================

const clone = (obj) =>
  typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj))

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const README_URL = ''

// ===========================================================================
// RAW SEED ARRAYS  (data EXACT — disalin dari scripts/*.js)
// ===========================================================================

// ---------------------------------------------------------------- dashboard.js
const seedDashboard = {
  userGreeting: 'Ayu',
  dateFormatted: 'Rabu, 26 Agustus 2026',
  todayIncome: 3450000,
  incomeGrowth: '+18% dari kemarin',
  newClientsCount: 6,
  todayTransactionsCount: 14,
  lowStockCount: 3,
  incomeTrend: [
    { day: 'Kam', income: 1200000 },
    { day: 'Jum', income: 1900000 },
    { day: 'Sab', income: 1600000 },
    { day: 'Min', income: 2300000 },
    { day: 'Sen', income: 2850000 },
    { day: 'Sel', income: 2600000 },
    { day: 'Rab', income: 3450000 }
  ],
  todayTransactions: [
    { id: 'TRX-0231', client: 'Sari Handayani', service: 'Creambath, Blow', time: '09:20', total: 180000 },
    { id: 'TRX-0232', client: 'Budi Santoso', service: 'Potong Rambut', time: '10:05', total: 75000 },
    { id: 'TRX-0233', client: 'Melati Putri', service: 'Coloring', time: '11:40', total: 650000 },
    { id: 'TRX-0234', client: 'Dewi Anggraini', service: 'Smoothing', time: '13:15', total: 850000 }
  ],
  lowStockProducts: [
    { code: 'SH', name: 'Shampoo Keratin', brand: "L'Oreal", category: 'Perawatan', stock: 2 },
    { code: 'HG', name: 'Hair Gel', brand: 'Gatsby', category: 'Styling', stock: 3 },
    { code: 'MW', name: 'Masker Wajah', brand: 'Perawatan', category: 'Perawatan', stock: 1 }
  ],
  popularServices: [
    { name: 'Potong Rambut', count: '32x' },
    { name: 'Creambath', count: '21x' },
    { name: 'Coloring', count: '14x' },
    { name: 'Smoothing', count: '9x' }
  ]
}

// ------------------- clients.js + edit-pelanggan.js + profil-pelanggan.js
// (status/memberSince/lastVisit/totalSpend/visitsCount di-dekorasi saat hydrate
//  dari transaksi master, persis seperti aggregasi pelanggan-aktif.js)
const seedClients = [
  {
    id: 'eleanor-vance',
    name: 'Eleanor Vance',
    phone: '+62 8112233445',
    countryCode: '+62',
    instagram: '@eleanor.vance',
    gender: 'Perempuan',
    hairType: 'Gelombang',
    hairCondition: 'Agak Rusak',
    address: 'Jl. Senopati No. 45, Jakarta Selatan',
    domicile: 'Kebayoran Baru, Jakarta Selatan',
    specialNotes: 'Kulit kepala sensitif, hindari air terlalu panas. Suka aroma floral.',
    notes: 'Sensitif terhadap amonia, lebih suka pewarnaan organik balayage.',
    email: 'eleanor.v@example.com',
    preferredProducts: 'Olaplex No. 4 & 5, Kerastase Elixir Ultime.',
    stylingInstructions: 'Prefers loose waves, extra volume at roots. Sensitive scalp, avoid harsh tugging during blowout.',
    avatar: 'EV',
    segment: 'VIP Active',
    status: 'Aktif',
    memberSince: '2023-02-10',
    birthDate: '1992-04-18',
    favoriteService: 'Balayage Color Treatment'
  },
  {
    id: 'sari-handayani',
    name: 'Sari Handayani',
    phone: '+62 81298765432',
    countryCode: '+62',
    instagram: '@sari_handayani',
    gender: 'Perempuan',
    hairType: 'Lurus',
    hairCondition: 'Sehat',
    address: 'Jl. Tebet Timur Dalam IV No. 8, Jakarta Selatan',
    domicile: 'Tebet Timur, Jakarta Selatan',
    specialNotes: 'Rutin creambath 2 minggu sekali, lebih nyaman dengan Stylist Rina.',
    notes: 'Menengah atas, senang paket perawatan rambut + scalp massage.',
    email: 'sari.handayani@example.com',
    preferredProducts: 'L\'Oreal Serie Expert, Biolage Smoothproof.',
    stylingInstructions: 'Smooth straight blowout, volume ringan di akar.',
    avatar: 'SH',
    segment: 'Loyal',
    status: 'Aktif',
    memberSince: '2023-04-22',
    birthDate: '1988-09-02',
    favoriteService: 'Creambath & Blow Dry'
  },
  {
    id: 'budi-santoso',
    name: 'Budi Santoso',
    phone: '+62 81345678901',
    countryCode: '+62',
    instagram: '@budisantoso.re',
    gender: 'Laki-laki',
    hairType: 'Lurus',
    hairCondition: 'Sehat',
    address: 'Kelapa Gading Barat Raya, Jakarta Utara',
    domicile: 'Kelapa Gading, Jakarta Utara',
    specialNotes: 'Pembersihan ketombe berkala.',
    notes: 'Rapi, datang tiap 2 minggu untuk potongan rambut.',
    email: 'budi.santoso@example.com',
    preferredProducts: 'Reuzel Matte Pomade, Hair Tonic Ginseng.',
    stylingInstructions: 'Short crop of 9mm sisi, tekstur natural di atas.',
    avatar: 'BS',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2023-06-05',
    birthDate: '1995-01-28',
    favoriteService: 'Signature Grooming & Cut'
  },
  {
    id: 'melati-putri',
    name: 'Melati Putri',
    phone: '+62 81711223344',
    countryCode: '+62',
    instagram: '@melati.hair',
    gender: 'Perempuan',
    hairType: 'Gelombang',
    hairCondition: 'Agak Rusak',
    address: 'Bintaro Jaya Sektor 9, Tangerang Selatan',
    domicile: 'Bintaro Jaya Sektor 9, Tangerang Selatan',
    specialNotes: 'Riwayat bleaching 2x, butuh ekstra serum sebelum blow dry.',
    notes: 'Hobi ganti warna rambut; selalu minta color correction + spa.',
    email: 'melati.putri@example.com',
    preferredProducts: 'Olaplex No. 7 Bonding Oil, Kerastase Elixir Ultime.',
    stylingInstructions: 'Gelombang lembut medium, diffuse drying.',
    avatar: 'MP',
    segment: 'VIP Active',
    status: 'Aktif',
    memberSince: '2023-08-14',
    birthDate: '1999-11-30',
    favoriteService: 'Color Correction & Spa'
  },
  {
    id: 'marcus-sterling',
    name: 'Marcus Sterling',
    phone: '+62 81899001122',
    countryCode: '+62',
    instagram: '@m.sterling_id',
    gender: 'Laki-laki',
    hairType: 'Ikal',
    hairCondition: 'Sehat',
    address: 'Pondok Indah, Jakarta Selatan',
    domicile: 'Pondok Indah, Jakarta Selatan',
    specialNotes: 'Potong fade tipis samping, styling gunakan matte clay.',
    notes: 'CEO tech, jadwal fleksibel, very punctual.',
    email: 'marcus.s@example.com',
    preferredProducts: 'Reuzel Matte Pomade, Uppercut Deluxe.',
    stylingInstructions: 'Skin fade samping, tekstur scissor cut atas, beard oil.',
    avatar: 'MS',
    segment: 'Loyal',
    status: 'Aktif',
    memberSince: '2023-09-01',
    birthDate: '1990-07-12',
    favoriteService: 'Executive Haircut & Styling'
  },
  {
    id: 'dewi-anggraini',
    name: 'Dewi Anggraini',
    phone: '+62 81233445566',
    countryCode: '+62',
    instagram: '@dewi_anggraini',
    gender: 'Perempuan',
    hairType: 'Keriting',
    hairCondition: 'Rusak',
    address: 'Serpong, BSD City, Tangerang',
    domicile: 'Serpong, BSD City, Tangerang',
    specialNotes: 'Ujung rambut bercabang parah, disarankan keratin treatment rutin.',
    notes: 'Pernah smoothing tahun lalu; butuh perawatan rutin.',
    email: 'dewi.anggraini@example.com',
    preferredProducts: 'Moroccanoil Treatment, Shea Moisture.',
    stylingInstructions: 'Reduced heat styling, deep conditioning mask.',
    avatar: 'DA',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2023-11-19',
    birthDate: '1985-03-25',
    favoriteService: 'Keratin Smooth Treatment'
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    phone: '+62 8198765432',
    countryCode: '+62',
    instagram: '@sarah.chen',
    gender: 'Perempuan',
    hairType: 'Lurus',
    hairCondition: 'Sehat',
    address: 'Menteng, Jakarta Pusat',
    domicile: 'Menteng, Jakarta Pusat',
    specialNotes: 'Potongan layer bob, treatment Olaplex rutin tiap 3 minggu.',
    notes: null,
    email: 'sarah.chen@example.com',
    preferredProducts: 'L\'Oreal Serie Expert, Moroccanoil Treatment.',
    stylingInstructions: 'Prefers blunt ends, light feathered face framing. Low heat blowouts.',
    avatar: 'SC',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2023-05-09',
    birthDate: '1997-12-06',
    favoriteService: 'Haircut & Styling'
  },
  {
    id: 'james-sterling',
    name: 'James Sterling',
    phone: '+62 81398765432',
    countryCode: '+62',
    instagram: '@james.s',
    gender: 'Laki-laki',
    hairType: 'Ikal',
    hairCondition: 'Sehat',
    address: 'Kebayoran Baru, Jakarta Selatan',
    domicile: 'Kebayoran Baru, Jakarta Selatan',
    specialNotes: 'Signature grooming, styling pomade matte finish.',
    notes: null,
    email: 'james.s@example.com',
    preferredProducts: 'Reuzel Matte Pomade, Uppercut Deluxe.',
    stylingInstructions: 'Skin fade on sides, textured scissor cut on top, beard oil application.',
    avatar: 'JS',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2024-01-20',
    birthDate: '1991-06-15',
    favoriteService: 'Signature Grooming & Cut'
  },
  {
    id: 'maya-wright',
    name: 'Maya Wright',
    phone: '+62 81811223344',
    countryCode: '+62',
    instagram: '@maya.w',
    gender: 'Perempuan',
    hairType: 'Keriting',
    hairCondition: 'Sehat',
    address: 'Kemang, Jakarta Selatan',
    domicile: 'Kemang, Jakarta Selatan',
    specialNotes: 'Diffuse drying only, selera warna bold.',
    notes: null,
    email: 'maya.w@example.com',
    preferredProducts: 'Shea Moisture Curl & Shine, Olaplex No. 7 Bonding Oil.',
    stylingInstructions: 'Diffuse drying only, apply leave-in conditioner liberally, no brushing while dry.',
    avatar: 'MW',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2024-03-08',
    birthDate: '2000-02-14',
    favoriteService: 'Keratin Smooth Treatment'
  },
  {
    id: 'jane-smith',
    name: 'Jane Smith',
    phone: '+62 81234567890',
    countryCode: '+62',
    instagram: '@jane.smith',
    gender: 'Perempuan',
    hairType: 'Lurus',
    hairCondition: 'Sehat',
    address: 'Jakarta Selatan',
    domicile: 'Jakarta Selatan',
    specialNotes: 'Warm blonde tones untuk balayage.',
    notes: 'Klien setia dari referral.',
    email: 'jane.smith@example.com',
    preferredProducts: 'Wella Color Charm, Olaplex No.3.',
    stylingInstructions: 'Warm blonde, soft waves.',
    avatar: 'JS',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2024-05-01',
    birthDate: '1994-08-22',
    favoriteService: 'Balayage Color Treatment'
  },
  {
    id: 'vivianne-westwood',
    name: 'Vivianne Westwood',
    phone: '+62 81299001122',
    countryCode: '+62',
    instagram: '@vivianne.w',
    gender: 'Perempuan',
    hairType: 'Lurus',
    hairCondition: 'Sehat',
    address: 'Kemang, Jakarta Selatan',
    domicile: 'Kemang, Jakarta Selatan',
    specialNotes: 'Fashion editor, senang trend warna baru.',
    notes: null,
    email: 'vivianne.w@example.com',
    preferredProducts: "L'Oréal Majirel, Kerastase Elixir Ultime.",
    stylingInstructions: 'Editorial look, glossy finish.',
    avatar: 'VW',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2024-07-11',
    birthDate: '1996-10-05',
    favoriteService: 'Color Correction & Spa'
  },
  {
    id: 'mia-wong',
    name: 'Mia Wong',
    phone: '+62 81733445566',
    countryCode: '+62',
    instagram: '@mia.wong',
    gender: 'Perempuan',
    hairType: 'Lurus',
    hairCondition: 'Sehat',
    address: 'Sunter, Jakarta Utara',
    domicile: 'Sunter, Jakarta Utara',
    specialNotes: 'Rambut tipis, hindari produk terlalu berat.',
    notes: null,
    email: 'mia.wong@example.com',
    preferredProducts: 'Lightweight volumizing shampoo.',
    stylingInstructions: 'Volume root lift, light texture.',
    avatar: 'MW',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2024-09-16',
    birthDate: '2002-05-30',
    favoriteService: 'Classic Hair Wash & Blow'
  },
  {
    id: 'elena-rossi',
    name: 'Elena Rossi',
    phone: '+62 81566778899',
    countryCode: '+62',
    instagram: '@elena.rossi',
    gender: 'Perempuan',
    hairType: 'Gelombang',
    hairCondition: 'Sehat',
    address: 'Gandaria City, Jakarta Selatan',
    domicile: 'Gandaria City, Jakarta Selatan',
    specialNotes: 'Expat Italia, bahasa utama Inggris.',
    notes: null,
    email: 'elena.rossi@example.com',
    preferredProducts: 'Moroccanoil Treatment.',
    stylingInstructions: 'Natural waves, air dry preferred.',
    avatar: 'ER',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2024-11-02',
    birthDate: '1989-12-19',
    favoriteService: 'Hair Tonic Treatment'
  },
  {
    id: 'nr',
    name: 'nr',
    phone: '+62 8123212113',
    countryCode: '+62',
    instagram: '@username',
    gender: 'Laki-laki',
    hairType: 'Ikal',
    hairCondition: 'Sehat',
    address: 'jw',
    domicile: 'jw',
    specialNotes: null,
    notes: 'po',
    email: null,
    preferredProducts: null,
    stylingInstructions: null,
    avatar: 'NR',
    segment: 'Reguler',
    status: 'Aktif',
    memberSince: '2026-08-01',
    birthDate: null,
    favoriteService: null
  }
]

// --------------------------- riwayat.js (transaksi master, diperluas >= 20)
const seedTransactions = [
  {
    id: 'TRX-121091',
    date: '2026-08-26',
    time: '10:00',
    client: { id: 'eleanor-vance', name: 'Eleanor Vance', phone: '+62 8112233445', avatar: 'EV' },
    service: 'Balayage Color Treatment',
    worker: 'Agus Pratama',
    workerId: 'agus-pratama',
    amount: 650000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Coloring',
    items: [{ name: 'Balayage Color Treatment', price: 650000, qty: 1 }]
  },
  {
    id: 'TRX-121090',
    date: '2026-08-26',
    time: '13:30',
    client: { id: 'sari-handayani', name: 'Sari Handayani', phone: '+62 81298765432', avatar: 'SH' },
    service: 'Creambath & Blow Dry',
    worker: 'Rina',
    workerId: 'rina',
    amount: 180000,
    paymentMethod: 'Cash',
    status: 'paid',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Creambath & Blow Dry', price: 180000, qty: 1 }]
  },
  {
    id: 'TRX-121058',
    date: '2026-08-26',
    time: '15:00',
    client: { id: 'budi-santoso', name: 'Budi Santoso', phone: '+62 81345678901', avatar: 'BS' },
    service: 'Signature Grooming & Cut',
    worker: 'Dimas',
    workerId: 'dimas',
    amount: 75000,
    paymentMethod: 'QRIS',
    status: 'pending',
    category: 'Potong Rambut',
    items: [{ name: 'Signature Grooming & Cut', price: 75000, qty: 1 }]
  },
  {
    id: 'TRX-120999',
    date: '2026-08-25',
    time: '11:00',
    client: { id: 'melati-putri', name: 'Melati Putri', phone: '+62 81711223344', avatar: 'MP' },
    service: 'Color Correction & Spa',
    worker: 'Ada Wong',
    workerId: 'ada-wong',
    amount: 850000,
    paymentMethod: 'Transfer BCA',
    status: 'paid',
    category: 'Coloring',
    items: [{ name: 'Color Correction & Spa', price: 850000, qty: 1 }]
  },
  {
    id: 'TRX-121049',
    date: '2026-08-25',
    time: '14:30',
    client: { id: 'marcus-sterling', name: 'Marcus Sterling', phone: '+62 81899001122', avatar: 'MS' },
    service: 'Executive Haircut & Styling',
    worker: 'Dimas',
    workerId: 'dimas',
    amount: 120000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Potong Rambut',
    items: [{ name: 'Executive Haircut & Styling', price: 120000, qty: 1 }]
  },
  {
    id: 'TRX-121094',
    date: '2026-08-24',
    time: '16:00',
    client: { id: 'dewi-anggraini', name: 'Dewi Anggraini', phone: '+62 81233445566', avatar: 'DA' },
    service: 'Keratin Smooth Treatment',
    worker: 'Budi',
    workerId: 'budi',
    amount: 750000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Smoothing & Perm',
    items: [{ name: 'Keratin Smooth Treatment', price: 750000, qty: 1 }]
  },
  {
    id: 'TRX-121001',
    date: '2026-08-24',
    time: '17:30',
    client: { id: 'sari-handayani', name: 'Sari Handayani', phone: '+62 81298765432', avatar: 'SH' },
    service: 'Hair Tonic Treatment',
    worker: 'Rina',
    workerId: 'rina',
    amount: 95000,
    paymentMethod: 'Cash',
    status: 'cancelled',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Hair Tonic Treatment', price: 95000, qty: 1 }]
  },
  // ---- Ekstensi (konsisten dgn data di atas, tanggal Agustus 2026) ----
  {
    id: 'TRX-121098',
    date: '2026-08-26',
    time: '13:15',
    client: { id: 'dewi-anggraini', name: 'Dewi Anggraini', phone: '+62 81233445566', avatar: 'DA' },
    service: 'Smoothing',
    worker: 'Budi',
    workerId: 'budi',
    amount: 850000,
    paymentMethod: 'Transfer BCA',
    status: 'paid',
    category: 'Smoothing & Perm',
    items: [{ name: 'Smoothing', price: 850000, qty: 1 }]
  },
  {
    id: 'TRX-121097',
    date: '2026-08-26',
    time: '11:40',
    client: { id: 'melati-putri', name: 'Melati Putri', phone: '+62 81711223344', avatar: 'MP' },
    service: 'Coloring',
    worker: 'Budi',
    workerId: 'budi',
    amount: 650000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Coloring',
    items: [{ name: 'Coloring', price: 650000, qty: 1 }]
  },
  {
    id: 'TRX-121096',
    date: '2026-08-26',
    time: '10:05',
    client: { id: 'budi-santoso', name: 'Budi Santoso', phone: '+62 81345678901', avatar: 'BS' },
    service: 'Potong Rambut',
    worker: 'Agus Pratama',
    workerId: 'agus-pratama',
    amount: 75000,
    paymentMethod: 'Tunai',
    status: 'paid',
    category: 'Potong Rambut',
    items: [{ name: 'Potong Rambut', price: 75000, qty: 1 }]
  },
  {
    id: 'TRX-121095',
    date: '2026-08-26',
    time: '09:20',
    client: { id: 'sari-handayani', name: 'Sari Handayani', phone: '+62 81298765432', avatar: 'SH' },
    service: 'Creambath, Blow',
    worker: 'Rina',
    workerId: 'rina',
    amount: 180000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Creambath, Blow', price: 180000, qty: 1 }]
  },
  {
    id: 'TRX-120998',
    date: '2026-08-25',
    time: '16:00',
    client: { id: 'sarah-chen', name: 'Sarah Chen', phone: '+62 8198765432', avatar: 'SC' },
    service: 'Haircut & Styling',
    worker: 'Agus Pratama',
    workerId: 'agus-pratama',
    amount: 120000,
    paymentMethod: 'Tunai',
    status: 'paid',
    category: 'Potong Rambut',
    items: [{ name: 'Haircut & Styling', price: 120000, qty: 1 }]
  },
  {
    id: 'TRX-120997',
    date: '2026-08-24',
    time: '10:30',
    client: { id: 'maya-wright', name: 'Maya Wright', phone: '+62 81811223344', avatar: 'MW' },
    service: 'Keratin Smooth Treatment',
    worker: 'Rina',
    workerId: 'rina',
    amount: 750000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Smoothing & Perm',
    items: [{ name: 'Keratin Smooth Treatment', price: 750000, qty: 1 }]
  },
  {
    id: 'TRX-120996',
    date: '2026-08-23',
    time: '12:00',
    client: { id: 'james-sterling', name: 'James Sterling', phone: '+62 81398765432', avatar: 'JS' },
    service: 'Signature Grooming & Cut',
    worker: 'Dimas',
    workerId: 'dimas',
    amount: 85000,
    paymentMethod: 'Tunai',
    status: 'paid',
    category: 'Potong Rambut',
    items: [{ name: 'Signature Grooming & Cut', price: 85000, qty: 1 }]
  },
  {
    id: 'TRX-120995',
    date: '2026-08-23',
    time: '15:45',
    client: { id: 'jane-smith', name: 'Jane Smith', phone: '+62 81234567890', avatar: 'JS' },
    service: 'Balayage Color Treatment',
    worker: 'Ada Wong',
    workerId: 'ada-wong',
    amount: 650000,
    paymentMethod: 'Transfer BCA',
    status: 'paid',
    category: 'Coloring',
    items: [{ name: 'Balayage Color Treatment', price: 650000, qty: 1 }]
  },
  {
    id: 'TRX-120994',
    date: '2026-08-22',
    time: '11:20',
    client: { id: 'eleanor-vance', name: 'Eleanor Vance', phone: '+62 8112233445', avatar: 'EV' },
    service: 'Olaplex Hair Repair Spa',
    worker: 'Rina',
    workerId: 'rina',
    amount: 350000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Olaplex Hair Repair Spa', price: 350000, qty: 1 }]
  },
  {
    id: 'TRX-120993',
    date: '2026-08-22',
    time: '14:10',
    client: { id: 'marcus-sterling', name: 'Marcus Sterling', phone: '+62 81899001122', avatar: 'MS' },
    service: 'Executive Haircut & Styling',
    worker: 'Dimas',
    workerId: 'dimas',
    amount: 120000,
    paymentMethod: 'Tunai',
    status: 'paid',
    category: 'Potong Rambut',
    items: [{ name: 'Executive Haircut & Styling', price: 120000, qty: 1 }]
  },
  {
    id: 'TRX-120992',
    date: '2026-08-21',
    time: '13:40',
    client: { id: 'vivianne-westwood', name: 'Vivianne Westwood', phone: '+62 81299001122', avatar: 'VW' },
    service: 'Color Correction & Spa',
    worker: 'Budi',
    workerId: 'budi',
    amount: 850000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Coloring',
    items: [{ name: 'Color Correction & Spa', price: 850000, qty: 1 }]
  },
  {
    id: 'TRX-120991',
    date: '2026-08-21',
    time: '10:15',
    client: { id: 'mia-wong', name: 'Mia Wong', phone: '+62 81733445566', avatar: 'MW' },
    service: 'Classic Hair Wash & Blow',
    worker: 'Rina',
    workerId: 'rina',
    amount: 65000,
    paymentMethod: 'Tunai',
    status: 'paid',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Classic Hair Wash & Blow', price: 65000, qty: 1 }]
  },
  {
    id: 'TRX-120990',
    date: '2026-08-20',
    time: '16:30',
    client: { id: 'elena-rossi', name: 'Elena Rossi', phone: '+62 81566778899', avatar: 'ER' },
    service: 'Hair Tonic Treatment',
    worker: 'Rina',
    workerId: 'rina',
    amount: 95000,
    paymentMethod: 'Cash',
    status: 'paid',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Hair Tonic Treatment', price: 95000, qty: 1 }]
  },
  {
    id: 'TRX-120989',
    date: '2026-08-20',
    time: '09:50',
    client: { id: 'sari-handayani', name: 'Sari Handayani', phone: '+62 81298765432', avatar: 'SH' },
    service: 'Creambath & Blow Dry',
    worker: 'Rina',
    workerId: 'rina',
    amount: 180000,
    paymentMethod: 'QRIS',
    status: 'paid',
    category: 'Hair Spa & Treatment',
    items: [{ name: 'Creambath & Blow Dry', price: 180000, qty: 1 }]
  }
]

// --------------------- services.html + edit-layanan.js (>= 8 layanan)
const seedServices = [
  {
    id: 'signature-master-cut',
    code: 'SMC',
    name: 'Signature Master Cut',
    category: 'potong',
    price: 450000,
    duration: 60,
    description: 'Precision cutting tailored to your facial structure, includes a relaxing wash and signature blowout.',
    workerShare: 10,
    commissionRate: 10,
    active: true,
    includeCut: true,
    variants: [
      { name: 'Default', priceMin: '450.000', priceMax: '', commMin: '45.000', commMax: '' }
    ]
  },
  {
    id: 'balayage-toner',
    code: 'BLT',
    name: 'Balayage & Toner',
    category: 'warna',
    price: 1200000,
    duration: 180,
    description: 'Hand-painted highlights for a natural, sun-kissed look. Includes custom toner and bonding treatment.',
    workerShare: 10,
    commissionRate: 10,
    active: true,
    includeCut: false,
    variants: [
      { name: 'Short (S)', priceMin: '1.450.000', priceMax: '1.650.000', commMin: '145.000', commMax: '165.000' },
      { name: 'Medium (M)', priceMin: '1.850.000', priceMax: '2.100.000', commMin: '185.000', commMax: '210.000' },
      { name: 'Long (L)', priceMin: '2.350.000', priceMax: '2.700.000', commMin: '235.000', commMax: '270.000' }
    ]
  },
  {
    id: 'luxury-scalp-therapy',
    code: 'LST',
    name: 'Luxury Scalp Therapy',
    category: 'spa',
    price: 600000,
    duration: 90,
    description: 'Deep cleansing and exfoliation of the scalp, followed by a nourishing mask and extended massage.',
    workerShare: 10,
    commissionRate: 10,
    active: true,
    includeCut: false,
    variants: [
      { name: 'Default', priceMin: '600.000', priceMax: '', commMin: '60.000', commMax: '' }
    ]
  },
  {
    id: 'blowout-styling',
    code: 'BOS',
    name: 'Blowout & Styling',
    category: 'styling',
    price: 250000,
    duration: 45,
    description: 'Professional wash and blowout styling for a polished, salon-fresh finish.',
    workerShare: 10,
    commissionRate: 10,
    active: true,
    includeCut: false,
    variants: [
      { name: 'Short', priceMin: '250.000', priceMax: '', commMin: '25.000', commMax: '' },
      { name: 'Long', priceMin: '350.000', priceMax: '', commMin: '35.000', commMax: '' }
    ]
  },
  {
    id: 'potong-rambut',
    code: 'PR',
    name: 'Potong Rambut',
    category: 'potong',
    price: 75000,
    duration: 45,
    description: 'Potongan rambut rapi pria/wanita sesuai model dan bentuk wajah.',
    workerShare: 50,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '75.000', priceMax: '', commMin: '7.500', commMax: '' }]
  },
  {
    id: 'grooming',
    code: 'GR',
    name: 'Signature Grooming & Cut',
    category: 'potong',
    price: 85000,
    duration: 45,
    description: 'Grooming lengkap: potongan, fade, styling pomade.',
    workerShare: 50,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '85.000', priceMax: '', commMin: '8.500', commMax: '' }]
  },
  {
    id: 'creambath',
    code: 'CB',
    name: 'Creambath & Blow Dry',
    category: 'spa',
    price: 180000,
    duration: 60,
    description: 'Creambath menutrisi kulit kepala + blow dry.',
    workerShare: 50,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '180.000', priceMax: '', commMin: '18.000', commMax: '' }]
  },
  {
    id: 'balayage-color',
    code: 'BLC',
    name: 'Balayage Color Treatment',
    category: 'warna',
    price: 650000,
    duration: 180,
    description: 'Balayage hand-painted + toner + bonding treatment.',
    workerShare: 15,
    commissionRate: 15,
    active: true,
    variants: [
      { name: 'Short (S)', priceMin: '650.000', priceMax: '750.000', commMin: '65.000', commMax: '75.000' },
      { name: 'Medium (M)', priceMin: '850.000', priceMax: '1.000.000', commMin: '85.000', commMax: '100.000' }
    ]
  },
  {
    id: 'coloring',
    code: 'COL',
    name: 'Coloring',
    category: 'warna',
    price: 650000,
    duration: 120,
    description: 'Pewarnaan rambut full color profesional.',
    workerShare: 15,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '650.000', priceMax: '850.000', commMin: '65.000', commMax: '85.000' }]
  },
  {
    id: 'smoothing',
    code: 'SMO',
    name: 'Smoothing',
    category: 'warna',
    price: 850000,
    duration: 150,
    description: 'Smoothing treatment untuk rambut halus dan mudah diatur.',
    workerShare: 15,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '850.000', priceMax: '', commMin: '85.000', commMax: '' }]
  },
  {
    id: 'keratin',
    code: 'KRT',
    name: 'Keratin Smooth Treatment',
    category: 'warna',
    price: 750000,
    duration: 150,
    description: 'Keratin smoothing + bonding untuk rambut mengembang.',
    workerShare: 15,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '750.000', priceMax: '', commMin: '75.000', commMax: '' }]
  },
  {
    id: 'color-correction',
    code: 'CCS',
    name: 'Color Correction & Spa',
    category: 'warna',
    price: 850000,
    duration: 150,
    description: 'Neutralisasi undertone + deep conditioning spa.',
    workerShare: 15,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '850.000', priceMax: '', commMin: '85.000', commMax: '' }]
  },
  {
    id: 'executive-haircut',
    code: 'EXC',
    name: 'Executive Haircut & Styling',
    category: 'potong',
    price: 120000,
    duration: 60,
    description: 'Potongan eksekutif + styling, mencakup grooming jenggot.',
    workerShare: 50,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '120.000', priceMax: '', commMin: '12.000', commMax: '' }]
  },
  {
    id: 'hair-wash-blow',
    code: 'HWB',
    name: 'Classic Hair Wash & Blow',
    category: 'styling',
    price: 65000,
    duration: 30,
    description: 'Keramas relaksasi + blow dry cepat.',
    workerShare: 50,
    commissionRate: 10,
    active: true,
    variants: [{ name: 'Default', priceMin: '65.000', priceMax: '', commMin: '6.500', commMax: '' }]
  },
  {
    id: 'olaplex-spa',
    code: 'OLX',
    name: 'Olaplex Hair Repair Spa',
    category: 'spa',
    price: 350000,
    duration: 90,
    description: 'Treatment Olaplex No. 1 & 2 untuk memperbaiki struktur rambut.',
    workerShare: 15,
    commissionRate: 15,
    active: true,
    variants: [{ name: 'Default', priceMin: '350.000', priceMax: '', commMin: '35.000', commMax: '' }]
  },
  {
    id: 'hair-tonic',
    code: 'HT',
    name: 'Hair Tonic Treatment',
    category: 'spa',
    price: 95000,
    duration: 30,
    description: 'Tonic ginseng untuk merangsang pertumbuhan rambut.',
    workerShare: 50,
    commissionRate: 10,
    active: true,
    variants: [{ name: 'Default', priceMin: '95.000', priceMax: '', commMin: '9.500', commMax: '' }]
  }
]

// ------------------------- produk.html + edit-produk.js (>= 8 produk)
const seedProducts = [
  {
    id: 'olaplex-no3',
    code: 'OLP-001',
    name: 'Olaplex No.3 Hair Perfector',
    brand: 'Olaplex',
    category: 'retail',
    price: 285000,
    purchasePrice: 170000,
    stock: 24,
    minStock: 5,
    supplier: 'PT Distributor Kecantikan Nusantara',
    unit: '/pcs',
    active: true,
    description: 'Perawatan rumahan untuk menjaga hasil bonding rambut.'
  },
  {
    id: 'kerastase-elixir',
    code: 'KRS-002',
    name: 'Kerastase Elixir Ultime',
    brand: 'Kerastase',
    category: 'retail',
    price: 420000,
    purchasePrice: 250000,
    stock: 15,
    minStock: 5,
    supplier: 'PT Distributor Kecantikan Nusantara',
    unit: '/pcs',
    active: true,
    description: 'Serum minyak finishing untuk kilau dan kelembutan rambut.'
  },
  {
    id: 'wella-color-charm',
    code: 'WEL-003',
    name: 'Wella Color Charm',
    brand: 'Wella',
    category: 'produk-layanan',
    price: 15000,
    purchasePrice: 9000,
    stock: 48,
    minStock: 20,
    supplier: 'PT Wella Indonesia',
    unit: '/10ml',
    active: true,
    description: 'Bahan pewarna profesional yang dipakai saat layanan coloring.'
  },
  {
    id: 'loreal-majirel',
    code: 'LOR-004',
    name: "L'Oréal Majirel",
    brand: "L'Oréal",
    category: 'produk-layanan',
    price: 18000,
    purchasePrice: 11000,
    stock: 36,
    minStock: 20,
    supplier: "PT L'Oréal Indonesia",
    unit: '/10ml',
    active: true,
    description: 'Cat rambut profesional untuk hasil warna tahan lama.'
  },
  {
    id: 'shampoo-keratin',
    code: 'SH',
    name: 'Shampoo Keratin',
    brand: "L'Oreal",
    category: 'perawatan',
    price: 85000,
    purchasePrice: 45000,
    stock: 2,
    minStock: 5,
    supplier: 'PT Beauty Care',
    unit: '/pcs',
    active: true,
    description: 'Shampoo keratin untuk rambut halus dan kuat.'
  },
  {
    id: 'hair-gel',
    code: 'HG',
    name: 'Hair Gel',
    brand: 'Gatsby',
    category: 'styling',
    price: 45000,
    purchasePrice: 25000,
    stock: 3,
    minStock: 5,
    supplier: 'PT Mandom Indonesia',
    unit: '/pcs',
    active: true,
    description: 'Hair gel untuk styling rambut pria.'
  },
  {
    id: 'masker-wajah',
    code: 'MW',
    name: 'Masker Wajah',
    brand: 'Sensatia',
    category: 'perawatan',
    price: 65000,
    purchasePrice: 38000,
    stock: 1,
    minStock: 5,
    supplier: 'PT Sensatia Botanicals',
    unit: '/pcs',
    active: true,
    description: 'Masker wajah pencerah alami.'
  },
  {
    id: 'shampoo-biolage',
    code: 'BIO-008',
    name: 'Shampoo Biolage Smoothproof',
    brand: 'Biolage',
    category: 'retail',
    price: 225000,
    purchasePrice: 130000,
    stock: 12,
    minStock: 5,
    supplier: 'PT Distributor Kecantikan Nusantara',
    unit: '/pcs',
    active: true,
    description: 'Shampoo anti-frizz untuk rambut halus.'
  },
  {
    id: 'serum-moroccanoil',
    code: 'MOR-009',
    name: 'Moroccanoil Treatment',
    brand: 'Moroccanoil',
    category: 'retail',
    price: 385000,
    purchasePrice: 240000,
    stock: 8,
    minStock: 4,
    supplier: 'PT Distributor Kecantikan Nusantara',
    unit: '/pcs',
    active: true,
    description: 'Argan oil treatment untuk kilau rambut.'
  },
  {
    id: 'pomade-reuzel',
    code: 'REZ-010',
    name: 'Reuzel Matte Pomade',
    brand: 'Reuzel',
    category: 'styling',
    price: 145000,
    purchasePrice: 85000,
    stock: 6,
    minStock: 4,
    supplier: 'PT Grooming Store',
    unit: '/pcs',
    active: true,
    description: 'Matte pomade untuk tekstur dan hold sedang.'
  },
  {
    id: 'hair-tonic-ginseng',
    code: 'TON-011',
    name: 'Hair Tonic Ginseng',
    brand: 'Mandom',
    category: 'perawatan',
    price: 75000,
    purchasePrice: 40000,
    stock: 18,
    minStock: 6,
    supplier: 'PT Mandom Indonesia',
    unit: '/pcs',
    active: true,
    description: 'Tonic ginseng perangsang pertumbuhan rambut.'
  }
]

// ------ worker.js + edit-worker.js + absensi.js + add-transaction.html
// (roster karyawan digabung; skema gaji mengikuti ketentuan bisnis salon)
const seedWorkers = [
  {
    id: 'agus-pratama',
    name: 'Agus Pratama',
    position: 'Senior Stylist',
    specialty: 'Senior Stylist',
    phone: '+62 81112202005',
    countryCode: '+62',
    address: 'Jl. Rawamangun Muka Raya No. 9, Jakarta Timur',
    gender: 'Laki-laki',
    joinDate: '2023-01-10',
    salaryScheme: '% Omset Harian',
    salaryDetail: 'Komisi 10% dari omset harian. Tidak menerima uang makan.',
    commissionScheme: 'daily_percentage',
    commissionSchemeLabel: 'Persen Omset Harian',
    commissionRate: '10',
    salary: 4000000,
    status: 'Aktif',
    cover: true,
    color: '#E5A93C',
    bg: '#FFFBEB',
    avatar: 'AP'
  },
  {
    id: 'ada-wong',
    name: 'Ada Wong',
    position: 'Lead Hair Stylist',
    specialty: 'Lead Hair Stylist',
    phone: '+62 81234567890',
    countryCode: '+62',
    address: 'Lebak Bulus, Jakarta Selatan',
    gender: 'Perempuan',
    joinDate: '2022-06-15',
    salaryScheme: '% Omset Harian',
    salaryDetail: 'Komisi 12,5% dari omset harian. Tidak menerima uang makan.',
    commissionScheme: 'daily_percentage',
    commissionSchemeLabel: 'Persen Omset Harian',
    commissionRate: '12,5',
    salary: 4500000,
    status: 'Aktif',
    cover: true,
    color: '#EC4899',
    bg: '#FCE7F3',
    avatar: 'AW'
  },
  {
    id: 'budi-santoso',
    name: 'Budi Santoso',
    position: 'Color Specialist',
    specialty: 'Color Specialist',
    phone: '+62 81398765432',
    countryCode: '+62',
    address: 'Cibubur, Jakarta Timur',
    gender: 'Laki-laki',
    joinDate: '2023-03-01',
    salaryScheme: '% Omset Harian',
    salaryDetail: 'Komisi 8% dari omset harian. Tidak menerima uang makan.',
    commissionScheme: 'daily_percentage',
    commissionSchemeLabel: 'Persen Omset Harian',
    commissionRate: '8',
    salary: 4200000,
    status: 'Aktif',
    cover: true,
    color: '#3B82F6',
    bg: '#DBEAFE',
    avatar: 'BS'
  },
  {
    id: 'budi',
    name: 'Budi',
    position: 'Color Specialist',
    specialty: 'Color Specialist',
    phone: '+62 81398765432',
    countryCode: '+62',
    address: 'Cibubur, Jakarta Timur',
    gender: 'Laki-laki',
    joinDate: '2023-03-15',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan warna sebesar 15% dari harga jasa layanan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '15',
    salary: 4200000,
    status: 'Aktif',
    cover: true,
    color: '#3B82F6',
    bg: '#DBEAFE',
    avatar: 'BD'
  },
  {
    id: 'rina',
    name: 'Rina',
    position: 'Hair Spa & Treatment',
    specialty: 'Hair Spa & Treatment',
    phone: '+62 81855543210',
    countryCode: '+62',
    address: 'Cilandak, Jakarta Selatan',
    gender: 'Perempuan',
    joinDate: '2023-05-20',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan spa & treatment sebesar 15% dari harga jasa layanan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '15',
    salary: 3800000,
    status: 'Aktif',
    cover: true,
    color: '#10B981',
    bg: '#D1FAE5',
    avatar: 'RN'
  },
  {
    id: 'dimas',
    name: 'Dimas',
    position: 'Barber & Grooming',
    specialty: 'Barber & Grooming',
    phone: '+62 81900112233',
    countryCode: '+62',
    address: 'Sunter, Jakarta Utara',
    gender: 'Laki-laki',
    joinDate: '2024-02-01',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan barber sebesar 10% dari harga jasa layanan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '10',
    salary: 3800000,
    status: 'Aktif',
    cover: true,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    avatar: 'DM'
  },
  {
    id: 'rina-kartika',
    name: 'Rina Kartika',
    position: 'Hair Spa Senior',
    specialty: 'Hair Spa & Treatment',
    phone: '+62 81788889999',
    countryCode: '+62',
    address: 'Bekasi Timur, Bekasi',
    gender: 'Perempuan',
    joinDate: '2022-11-01',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan sebesar 15% dari harga jasa layanan + uang makan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '15',
    salary: 3500000,
    status: 'Aktif',
    cover: true,
    color: '#10B981',
    bg: '#D1FAE5',
    avatar: 'RK'
  },
  {
    id: 'sari-melati',
    name: 'Sari Melati',
    position: 'Hair Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81677776666',
    countryCode: '+62',
    address: 'Depok, Jawa Barat',
    gender: 'Perempuan',
    joinDate: '2023-08-10',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan sebesar 10% dari harga jasa layanan + uang makan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '10',
    salary: 3000000,
    status: 'Aktif',
    cover: true,
    color: '#F59E0B',
    bg: '#FEF3C7',
    avatar: 'SM'
  },
  {
    id: 'dewi-anggraini',
    name: 'Dewi Anggraini',
    position: 'Hair Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81566665555',
    countryCode: '+62',
    address: 'Serpong, Tangerang Selatan',
    gender: 'Perempuan',
    joinDate: '2023-09-05',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan sebesar 12% dari harga jasa layanan + uang makan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '12',
    salary: 2750000,
    status: 'Aktif',
    cover: true,
    color: '#E5A93C',
    bg: '#FFFBEB',
    avatar: 'DA'
  },
  {
    id: 'nara',
    name: 'Nara',
    position: 'Junior Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81455554444',
    countryCode: '+62',
    address: 'Kuningan, Jakarta Selatan',
    gender: 'Perempuan',
    joinDate: '2024-05-01',
    salaryScheme: 'Rp1.000.000 + 5% jasa',
    salaryDetail: 'Gaji pokok Rp1.000.000/bulan + 5% dari total harga jasa layanan yang dikerjakan + uang makan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '5',
    salary: 2800000,
    status: 'Aktif',
    cover: true,
    color: '#A78BFA',
    bg: '#F5F3FF',
    avatar: 'NR'
  },
  {
    id: 'rafi',
    name: 'Rafi',
    position: 'Junior Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81344443333',
    countryCode: '+62',
    address: 'Pulo Gadung, Jakarta Timur',
    gender: 'Laki-laki',
    joinDate: '2024-06-01',
    salaryScheme: 'Rp1.000.000 + 5% jasa',
    salaryDetail: 'Gaji pokok Rp1.000.000/bulan + 5% dari total harga jasa layanan yang dikerjakan + uang makan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '5',
    salary: 3200000,
    status: 'Aktif',
    cover: true,
    color: '#A78BFA',
    bg: '#F5F3FF',
    avatar: 'RF'
  },
  {
    id: 'rangga',
    name: 'Rangga',
    position: 'Barber & Grooming',
    specialty: 'Barber & Grooming',
    phone: '+62 81233332222',
    countryCode: '+62',
    address: 'Kelapa Gading, Jakarta Utara',
    gender: 'Laki-laki',
    joinDate: '2023-04-18',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan sebesar 10% dari harga jasa layanan + uang makan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '10',
    salary: 3200000,
    status: 'Aktif',
    cover: true,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    avatar: 'RG'
  },
  {
    id: 'joko-widodo',
    name: 'Joko Widodo',
    position: 'Barber',
    specialty: 'Barber & Grooming',
    phone: '+62 81999990000',
    countryCode: '+62',
    address: 'Surakarta',
    gender: 'Laki-laki',
    joinDate: '2022-01-05',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan sebesar 10% dari harga jasa layanan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: '10',
    salary: 3000000,
    status: 'Aktif',
    cover: false,
    color: '#6B7280',
    bg: '#F3F4F6',
    avatar: 'JW'
  },
  {
    id: 'rina-susanti',
    name: 'Rina Susanti',
    position: 'Hair Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81333334444',
    countryCode: '+62',
    address: 'Jakarta Barat',
    gender: 'Perempuan',
    joinDate: '2023-02-20',
    salaryScheme: '% Omset Harian',
    salaryDetail: 'Komisi 10% dari omset harian. Tidak menerima uang makan.',
    commissionScheme: 'daily_percentage',
    commissionSchemeLabel: 'Persen Omset Harian',
    commissionRate: '10',
    salary: 3200000,
    status: 'Aktif',
    cover: false,
    color: '#10B981',
    bg: '#D1FAE5',
    avatar: 'RS'
  },
  {
    id: 'budi-gunawan',
    name: 'Budi Gunawan',
    position: 'Hair Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81555556666',
    countryCode: '+62',
    address: 'Jakarta Pusat',
    gender: 'Laki-laki',
    joinDate: '2023-07-11',
    salaryScheme: '50% dari harga jasa',
    salaryDetail: 'Komisi per layanan sesuai ketentuan tiap layanan.',
    commissionScheme: 'per_service',
    commissionSchemeLabel: 'Komisi Per Layanan',
    commissionRate: 'Tiap Layanan Berbeda',
    salary: 3000000,
    status: 'Aktif',
    cover: false,
    color: '#3B82F6',
    bg: '#DBEAFE',
    avatar: 'BG'
  },
  {
    id: 'siti-aminah',
    name: 'Siti Aminah',
    position: 'Hair Stylist',
    specialty: 'Hair Stylist',
    phone: '+62 81777778888',
    countryCode: '+62',
    address: 'Bekasi',
    gender: 'Perempuan',
    joinDate: '2023-10-30',
    salaryScheme: '% Omset Harian',
    salaryDetail: 'Komisi 10% dari omset harian. Tidak menerima uang makan.',
    commissionScheme: 'daily_percentage',
    commissionSchemeLabel: 'Persen Omset Harian',
    commissionRate: '10',
    salary: 2800000,
    status: 'Aktif',
    cover: false,
    color: '#F59E0B',
    bg: '#FEF3C7',
    avatar: 'SA'
  }
]

// ----------------- appointment.js + add-appointment.js (apt-1 .. apt-9)
const seedAppointments = [
  {
    id: 'apt-1',
    clientId: 'eleanor-vance',
    service: 'Balayage Color Treatment',
    workerId: 'agus-pratama',
    date: '2026-08-26',
    time: '10:00',
    duration: 120,
    status: 'confirmed',
    notes: 'Preferensi: Balayage nuansa ash blonde, formula bebas amonia.'
  },
  {
    id: 'apt-2',
    clientId: 'sari-handayani',
    service: 'Creambath & Blow Dry',
    workerId: 'rina',
    date: '2026-08-26',
    time: '13:30',
    duration: 60,
    status: 'confirmed',
    notes: 'Pijatan sedang, hair tonic ginseng.'
  },
  {
    id: 'apt-3',
    clientId: 'budi-santoso',
    service: 'Signature Grooming & Cut',
    workerId: 'dimas',
    date: '2026-08-27',
    time: '11:00',
    duration: 45,
    status: 'confirmed',
    notes: 'Taper fade samping, styling pomade matte.'
  },
  {
    id: 'apt-4',
    clientId: 'melati-putri',
    service: 'Color Correction & Spa',
    workerId: 'budi',
    date: '2026-08-28',
    time: '14:00',
    duration: 150,
    status: 'confirmed',
    notes: 'Neutralisasi undertone kemerahan, deep conditioning mask.'
  },
  {
    id: 'apt-5',
    clientId: 'marcus-sterling',
    service: 'Executive Haircut & Styling',
    workerId: 'ada-wong',
    date: '2026-08-28',
    time: '16:30',
    duration: 60,
    status: 'pending',
    notes: 'Konfirmasi ulang 2 jam sebelum jadwal.'
  },
  {
    id: 'apt-6',
    clientId: 'dewi-anggraini',
    service: 'Keratin Smooth Treatment',
    workerId: 'agus-pratama',
    date: '2026-08-29',
    time: '09:30',
    duration: 120,
    status: 'confirmed',
    notes: 'Perawatan rambut mengembang sehabis smoothing tahun lalu.'
  },
  {
    id: 'apt-7',
    clientId: 'eleanor-vance',
    service: 'Toner Touch-up & Blow',
    workerId: 'ada-wong',
    date: '2026-09-02',
    time: '15:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Sesi follow-up balayage 1 minggu kemudian.'
  },
  {
    id: 'apt-8',
    clientId: 'sari-handayani',
    service: 'Olaplex Hair Repair Spa',
    workerId: 'rina',
    date: '2026-09-05',
    time: '11:00',
    duration: 90,
    status: 'confirmed',
    notes: 'Treatment Olaplex No. 1 & 2 lengkap.'
  },
  {
    id: 'apt-9',
    clientId: 'budi-santoso',
    service: 'Head Massage & Hair Wash',
    workerId: 'rina',
    date: '2026-08-26',
    time: '16:00',
    duration: 45,
    status: 'confirmed',
    notes: 'Relaksasi sore.'
  }
]

// --------------------- absensi.js (data kehadiran + rekap bulanan)
const seedAttendanceWorkers = [
  { id: 'agus-pratama', name: 'Agus Pratama', scheme: 'daily_percentage', schemeLabel: '% Omset Harian' },
  { id: 'budi-santoso', name: 'Budi Santoso', scheme: 'daily_percentage', schemeLabel: '% Omset Harian' },
  { id: 'dewi-anggraini', name: 'Dewi Anggraini', scheme: 'per_service', schemeLabel: 'Per Layanan' },
  { id: 'rangga', name: 'rangga', scheme: 'per_service', schemeLabel: 'Per Layanan' },
  { id: 'rina-kartika', name: 'Rina Kartika', scheme: 'per_service', schemeLabel: 'Per Layanan' },
  { id: 'sari-melati', name: 'Sari Melati', scheme: 'per_service', schemeLabel: 'Per Layanan' }
]

const seedAttendanceRecords = {
  '2026-09-17': {
    'agus-pratama': true,
    'budi-santoso': true,
    'dewi-anggraini': true,
    'rangga': true,
    'rina-kartika': false,
    'sari-melati': false
  },
  '2026-08-26': {
    'agus-pratama': true,
    'budi-santoso': true,
    'dewi-anggraini': true,
    'rangga': false,
    'rina-kartika': true,
    'sari-melati': false
  }
}

// Rekap bulanan dari absensi.js (2026-09) + pelengkap (2026-08)
const seedAttendanceSummary = {
  '2026-09': {
    'agus-pratama': 11,
    'budi-santoso': 12,
    'dewi-anggraini': 9,
    'rangga': 1,
    'rina-kartika': 9,
    'sari-melati': 11
  },
  '2026-08': {
    'agus-pratama': 24,
    'budi-santoso': 22,
    'dewi-anggraini': 23,
    'rangga': 0,
    'rina-kartika': 22,
    'sari-melati': 18
  }
}

// ----------------- penelanggan-aktif.js (transaksi khusus aggregasi pelanggan)
const seedActiveClientTransactions = [
  { id: 'TRX-001', clientId: 'eleanor-vance', date: '2026-08-26T10:00:00', amount: 650000, service: 'Balayage Color Treatment' },
  { id: 'TRX-002', clientId: 'sari-handayani', date: '2026-08-26T13:30:00', amount: 180000, service: 'Creambath & Blow Dry' },
  { id: 'TRX-003', clientId: 'budi-santoso', date: '2026-08-26T15:00:00', amount: 75000, service: 'Signature Grooming & Cut' },
  { id: 'TRX-004', clientId: 'melati-putri', date: '2026-08-25T11:00:00', amount: 850000, service: 'Color Correction & Spa' },
  { id: 'TRX-005', clientId: 'marcus-sterling', date: '2026-08-25T14:30:00', amount: 120000, service: 'Executive Haircut' },
  { id: 'TRX-006', clientId: 'dewi-anggraini', date: '2026-08-24T16:00:00', amount: 750000, service: 'Keratin Smooth Treatment' },
  { id: 'TRX-007', clientId: 'eleanor-vance', date: '2026-08-12T11:30:00', amount: 350000, service: 'Olaplex Hair Repair Spa' },
  { id: 'TRX-008', clientId: 'sari-handayani', date: '2026-08-08T14:00:00', amount: 180000, service: 'Creambath & Blow Dry' },
  { id: 'TRX-009', clientId: 'eleanor-vance', date: '2026-08-02T10:00:00', amount: 650000, service: 'Balayage Color Treatment' },
  { id: 'TRX-010', clientId: 'melati-putri', date: '2026-08-04T15:30:00', amount: 450000, service: 'Hair Toner & Styling' },
  { id: 'TRX-011', clientId: 'budi-santoso', date: '2026-08-10T16:00:00', amount: 75000, service: 'Signature Grooming & Cut' },
  { id: 'TRX-012', clientId: 'marcus-sterling', date: '2026-08-11T13:00:00', amount: 120000, service: 'Executive Haircut' },
  { id: 'TRX-013', clientId: 'sari-handayani', date: '2026-07-28T14:00:00', amount: 180000, service: 'Creambath & Blow Dry' },
  { id: 'TRX-014', clientId: 'eleanor-vance', date: '2026-07-15T10:30:00', amount: 650000, service: 'Balayage Color Treatment' }
]

const seedActiveClientProfiles = [
  { id: 'eleanor-vance', name: 'Eleanor Vance', avatar: 'EV', phone: '+62 8112233445', segment: 'VIP Active', favService: 'Balayage Color Treatment' },
  { id: 'sari-handayani', name: 'Sari Handayani', avatar: 'SH', phone: '+62 81298765432', segment: 'Loyal', favService: 'Creambath & Blow Dry' },
  { id: 'budi-santoso', name: 'Budi Santoso', avatar: 'BS', phone: '+62 81345678901', segment: 'Reguler', favService: 'Signature Grooming & Cut' },
  { id: 'melati-putri', name: 'Melati Putri', avatar: 'MP', phone: '+62 81711223344', segment: 'VIP Active', favService: 'Color Correction & Spa' },
  { id: 'marcus-sterling', name: 'Marcus Sterling', avatar: 'MS', phone: '+62 81899001122', segment: 'Loyal', favService: 'Executive Haircut' },
  { id: 'dewi-anggraini', name: 'Dewi Anggraini', avatar: 'DA', phone: '+62 81233445566', segment: 'Reguler', favService: 'Keratin Smooth Treatment' }
]

// --------------- pendapatan-karyawan.js (rekap bulanan gaji + slip)
const seedMonthlyIncome = {
  '2026-09': {
    monthLabel: 'September 2026',
    records: [
      { id: 'agus-pratama', name: 'Agus Pratama', schemeType: 'daily', schemeLabel: '% Omset Harian (10.00%)', commService: 0, commDaily: 0, salary: 0, attendanceDays: 0, mealAllowance: 0 },
      { id: 'budi-santoso', name: 'Budi Santoso', schemeType: 'daily', schemeLabel: '% Omset Harian (8.00%)', commService: 0, commDaily: 0, salary: 0, attendanceDays: 1, mealAllowance: 0 },
      { id: 'dewi-anggraini', name: 'Dewi Anggraini', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 0, commDaily: 0, salary: 2750000, attendanceDays: 1, mealAllowance: 25000 },
      { id: 'nara', name: 'nara', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 0, commDaily: 0, salary: 2800000, attendanceDays: 0, mealAllowance: 0 },
      { id: 'rafi', name: 'rafi', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 0, commDaily: 0, salary: 3200000, attendanceDays: 0, mealAllowance: 0 },
      { id: 'rina-kartika', name: 'Rina Kartika', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 0, commDaily: 0, salary: 3500000, attendanceDays: 0, mealAllowance: 0 },
      { id: 'sari-melati', name: 'Sari Melati', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 0, commDaily: 0, salary: 3000000, attendanceDays: 0, mealAllowance: 0 }
    ]
  },
  '2026-08': {
    monthLabel: 'Agustus 2026',
    records: [
      { id: 'agus-pratama', name: 'Agus Pratama', schemeType: 'daily', schemeLabel: '% Omset Harian (10.00%)', commService: 0, commDaily: 3250000, salary: 4000000, attendanceDays: 24, mealAllowance: 0 },
      { id: 'budi-santoso', name: 'Budi Santoso', schemeType: 'daily', schemeLabel: '% Omset Harian (8.00%)', commService: 0, commDaily: 2400000, salary: 4200000, attendanceDays: 22, mealAllowance: 0 },
      { id: 'dewi-anggraini', name: 'Dewi Anggraini', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 1850000, commDaily: 0, salary: 2750000, attendanceDays: 23, mealAllowance: 575000 },
      { id: 'nara', name: 'nara', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 1600000, commDaily: 0, salary: 2800000, attendanceDays: 20, mealAllowance: 500000 },
      { id: 'rafi', name: 'rafi', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 1450000, commDaily: 0, salary: 3200000, attendanceDays: 21, mealAllowance: 525000 },
      { id: 'rina-kartika', name: 'Rina Kartika', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 1900000, commDaily: 0, salary: 3500000, attendanceDays: 22, mealAllowance: 550000 },
      { id: 'sari-melati', name: 'Sari Melati', schemeType: 'service', schemeLabel: 'Per Layanan', commService: 1100000, commDaily: 0, salary: 3000000, attendanceDays: 18, mealAllowance: 450000 }
    ]
  }
}

// ------------------------------ rekap-komisi.js (data komisi + slip)
const seedCommissionData = [
  { id: 'agus-pratama', name: 'Agus Pratama', avatar: 'AP', schemeType: 'daily', schemeLabel: '% Omset Harian (10.00%)', salary: 4000000, commission: 3250000, mealAllowance: 25000 },
  { id: 'budi-santoso', name: 'Budi Santoso', avatar: 'BS', schemeType: 'daily', schemeLabel: '% Omset Harian (8.00%)', salary: 4200000, commission: 2400000, mealAllowance: 0 },
  { id: 'dewi-anggraini', name: 'Dewi Anggraini', avatar: 'DA', schemeType: 'service', schemeLabel: 'Per Layanan', salary: 2750000, commission: 1850000, mealAllowance: 25000 },
  { id: 'nara', name: 'Nara', avatar: 'NR', schemeType: 'service', schemeLabel: 'Per Layanan', salary: 2800000, commission: 1600000, mealAllowance: 0 },
  { id: 'rafi', name: 'Rafi', avatar: 'RF', schemeType: 'service', schemeLabel: 'Per Layanan', salary: 3200000, commission: 1450000, mealAllowance: 0 },
  { id: 'rina-kartika', name: 'Rina Kartika', avatar: 'RK', schemeType: 'service', schemeLabel: 'Per Layanan', salary: 3500000, commission: 1900000, mealAllowance: 0 },
  { id: 'sari-melati', name: 'Sari Melati', avatar: 'SM', schemeType: 'service', schemeLabel: 'Per Layanan', salary: 3000000, commission: 0, mealAllowance: 0 }
]

// ------------------- laporan.js (dataset khusus laporan penjualan)
const seedReportTransactions = [
  { id: 'TRX-121091', date: '2026-08-26', time: '10:00 WIB', client: 'Eleanor Vance', phone: '+62 8112233445', service: 'Balayage Color Treatment', worker: 'Agus Pratama', amount: 650000, category: 'Coloring', method: 'QRIS', status: 'Selesai (Paid)' },
  { id: 'TRX-121090', date: '2026-08-26', time: '13:30 WIB', client: 'Sari Handayani', phone: '+62 81298765432', service: 'Creambath & Blow Dry', worker: 'Rina', amount: 180000, category: 'Hair Spa & Treatment', method: 'Tunai', status: 'Selesai (Paid)' },
  { id: 'TRX-121089', date: '2026-08-26', time: '15:15 WIB', client: 'Budi Santoso', phone: '+62 81345678901', service: 'Haircut Premium', worker: 'Agus Pratama', amount: 75000, category: 'Potong Rambut', method: 'Transfer', status: 'Selesai (Paid)' },
  { id: 'TRX-121088', date: '2026-08-25', time: '11:00 WIB', client: 'Melati Putri', phone: '+62 81711223344', service: 'Keratin Smooth Treatment', worker: 'Budi', amount: 850000, category: 'Smoothing & Perm', method: 'QRIS', status: 'Selesai (Paid)' },
  { id: 'TRX-121087', date: '2026-08-25', time: '14:20 WIB', client: 'Marcus Sterling', phone: '+62 81899001122', service: 'Haircut & Styling', worker: 'Agus Pratama', amount: 120000, category: 'Potong Rambut', method: 'Tunai', status: 'Selesai (Paid)' },
  { id: 'TRX-121086', date: '2026-08-24', time: '09:45 WIB', client: 'Dewi Anggraini', phone: '+62 81233445566', service: 'Full Bleaching + Color', worker: 'Rina', amount: 950000, category: 'Coloring', method: 'Transfer', status: 'Selesai (Paid)' },
  { id: 'TRX-121085', date: '2026-08-24', time: '16:00 WIB', client: 'Sari Handayani', phone: '+62 81298765432', service: "L'Oreal Hair Masker", worker: 'Rina', amount: 150000, category: 'Hair Spa & Treatment', method: 'QRIS', status: 'Selesai (Paid)' }
]

// dailyRevenue statis sesuai laporan.js renderResponsiveBarChart()
const seedDailyReport = [
  { day: 'Kam', date: '2026-08-20', revenue: 1200000, count: 5 },
  { day: 'Jum', date: '2026-08-21', revenue: 1900000, count: 7 },
  { day: 'Sab', date: '2026-08-22', revenue: 1600000, count: 6 },
  { day: 'Min', date: '2026-08-23', revenue: 2300000, count: 8 },
  { day: 'Sen', date: '2026-08-24', revenue: 2850000, count: 11 },
  { day: 'Sel', date: '2026-08-25', revenue: 2600000, count: 10 },
  { day: 'Rab', date: '2026-08-26', revenue: 3450000, count: 14 }
]

// ------------------------------ profil.js (profil pemilik)
const seedProfile = {
  id: 'owner-1',
  name: 'Owner Afwo',
  email: 'owner@afwo.com',
  role: 'Owner',
  phone: '+62 81200009999',
  address: 'Jl. Kelapa Gading Barat Raya No. 12, Jakarta Utara'
}

// ------------------------------ login.js (demo account)
const seedDemoAccounts = [
  { email: 'owner@afwo.com', password: '12345678', name: 'Owner Afwo', role: 'Owner' }
]

// ===========================================================================
// MUTABLE WORKING COPY (deep-clone sekali saat pertama diakses)
// ===========================================================================

let _db = null

function hydrate() {
  return {
    dashboard: clone(seedDashboard),
    clients: clone(seedClients),
    workers: clone(seedWorkers),
    services: clone(seedServices),
    products: clone(seedProducts),
    transactions: clone(seedTransactions),
    appointments: clone(seedAppointments),
    attendanceWorkers: clone(seedAttendanceWorkers),
    attendanceRecords: clone(seedAttendanceRecords),
    attendanceSummary: clone(seedAttendanceSummary),
    activeClientTransactions: clone(seedActiveClientTransactions),
    activeClientProfiles: clone(seedActiveClientProfiles),
    monthlyIncome: clone(seedMonthlyIncome),
    commissionData: clone(seedCommissionData),
    reportTransactions: clone(seedReportTransactions),
    reportDaily: clone(seedDailyReport),
    profile: clone(seedProfile),
    demoAccounts: clone(seedDemoAccounts)
  }
}

function store() {
  if (!_db) _db = hydrate()
  return _db
}

const UANG_MAKAN_PER_DAY = 25000

// ===========================================================================
// API: DASHBOARD
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/dashboard/summary')
export async function getDashboardSummary() {
  await delay()
  return clone(store().dashboard)
}

// ===========================================================================
// API: CLIENT (PELANGGAN)
// ===========================================================================

// Aggregasi statistik loyalitas tiap pelanggan dari transaksi master
// (meniru pola aggregasi pelanggan-aktif.js)
function decorateClientStats(client, transactions) {
  const rows = transactions.filter((t) => t.status !== 'cancelled' && t.client && t.client.id === client.id)
  let totalSpend = 0
  let lastVisit = null
  rows.forEach((t) => {
    totalSpend += t.amount
    if (!lastVisit || t.date > lastVisit) lastVisit = t.date
    else if (lastVisit && t.date === lastVisit && t.time > (t.time || '')) lastVisit = t.date
  })
  return {
    ...client,
    totalSpend,
    visitsCount: rows.length,
    lastVisit: lastVisit || client.memberSince || null
  }
}

// TODO BACKEND: ganti dengan fetch('/api/clients')
export async function getClients() {
  await delay()
  const db = store()
  return db.clients.map((c) => decorateClientStats(c, db.transactions))
}

// TODO BACKEND: ganti dengan fetch('/api/clients/{id}')
export async function getClient(id) {
  await delay()
  const db = store()
  const found = db.clients.find((c) => c.id === id)
  return found ? decorateClientStats(found, db.transactions) : null
}

// TODO BACKEND: ganti dengan POST /api/clients
export async function addClient(data) {
  await delay()
  const db = store()
  const payload = { ...data }
  if (!payload.id) {
    payload.id = String(payload.name || 'pelanggan').toLowerCase().replace(/\s+/g, '-')
  }
  if (!payload.countryCode) payload.countryCode = '+62'
  if (!payload.avatar) {
    payload.avatar = String(payload.name || 'PL').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  }
  if (!payload.status) payload.status = 'Aktif'
  if (!payload.segment) payload.segment = 'Reguler'
  if (!payload.memberSince) payload.memberSince = '2026-08-26'
  db.clients.push(payload)
  return clone(payload)
}

// TODO BACKEND: ganti dengan PUT /api/clients/{id}
export async function updateClient(id, patch) {
  await delay()
  const db = store()
  const found = db.clients.find((c) => c.id === id)
  if (!found) return null
  Object.assign(found, patch)
  return decorateClientStats(found, db.transactions)
}

// TODO BACKEND: ganti dengan DELETE /api/clients/{id}
export async function deleteClient(id) {
  await delay()
  const db = store()
  const idx = db.clients.findIndex((c) => c.id === id)
  if (idx === -1) return false
  db.clients.splice(idx, 1)
  return true
}

// ===========================================================================
// API: WORKER (KARYAWAN)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/workers')
export async function getWorkers() {
  await delay()
  return clone(store().workers)
}

// TODO BACKEND: ganti dengan fetch('/api/workers/{id}')
export async function getWorker(id) {
  await delay()
  const found = store().workers.find((w) => w.id === id)
  return found ? clone(found) : null
}

// TODO BACKEND: ganti dengan POST /api/workers
export async function addWorker(data) {
  await delay()
  const db = store()
  const payload = { ...data }
  if (!payload.id) {
    payload.id = String(payload.name || 'karyawan').toLowerCase().replace(/\s+/g, '-')
  }
  if (!payload.status) payload.status = 'Aktif'
  db.workers.push(payload)
  return clone(payload)
}

// TODO BACKEND: ganti dengan PUT /api/workers/{id}
export async function updateWorker(id, patch) {
  await delay()
  const db = store()
  const found = db.workers.find((w) => w.id === id)
  if (!found) return null
  Object.assign(found, patch)
  return clone(found)
}

// TODO BACKEND: ganti dengan DELETE /api/workers/{id}
export async function deleteWorker(id) {
  await delay()
  const db = store()
  const idx = db.workers.findIndex((w) => w.id === id)
  if (idx === -1) return false
  db.workers.splice(idx, 1)
  return true
}

// ===========================================================================
// API: PENDAPATAN BULANAN KARYAWAN (pendapatan-karyawan.js)
// ===========================================================================

const mapIncomeRecord = (r) => {
  const totalCommission = r.commService + r.commDaily
  return {
    id: r.id,
    name: r.name,
    schemeType: r.schemeType,
    scheme: r.schemeLabel,
    totalService: r.commService,
    totalDaily: r.commDaily,
    totalCommission,
    salary: r.salary,
    attendanceDays: r.attendanceDays,
    totalMealAllowance: r.mealAllowance,
    totalIncome: r.salary + totalCommission + r.mealAllowance
  }
}

// TODO BACKEND: ganti dengan fetch('/api/reports/monthly-income?month=YYYY-MM')
export async function getWorkerIncomeReport(month) {
  await delay()
  const db = store()
  const monthKey = month || '2026-09'
  const monthData = db.monthlyIncome[monthKey] || db.monthlyIncome['2026-09']

  const rows = monthData.records.map(mapIncomeRecord)

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalService += r.totalService
      acc.totalDaily += r.totalDaily
      acc.totalCommission += r.totalCommission
      acc.totalSalary += r.salary
      acc.totalAttendance += r.attendanceDays
      acc.totalMealAllowance += r.totalMealAllowance
      acc.grandTotal += r.totalIncome
      return acc
    },
    { totalService: 0, totalDaily: 0, totalCommission: 0, totalSalary: 0, totalAttendance: 0, totalMealAllowance: 0, grandTotal: 0 }
  )

  return {
    month: monthKey,
    monthLabel: monthData.monthLabel,
    rows,
    totals,
    slips: rows.map((r) => ({
      id: r.id,
      name: r.name,
      monthLabel: monthData.monthLabel,
      scheme: r.scheme,
      attendanceDays: r.attendanceDays,
      salary: r.salary,
      commission: r.totalCommission,
      mealAllowance: r.totalMealAllowance,
      netTotal: r.totalIncome
    }))
  }
}

// ===========================================================================
// API: SERVICE (LAYANAN)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/services')
export async function getServices() {
  await delay()
  return clone(store().services)
}

// TODO BACKEND: ganti dengan fetch('/api/services/{id}')
export async function getService(id) {
  await delay()
  const found = store().services.find((s) => s.id === id)
  return found ? clone(found) : null
}

// TODO BACKEND: ganti dengan POST /api/services
export async function addService(data) {
  await delay()
  const db = store()
  const payload = { ...data }
  if (!payload.id) {
    payload.id = String(payload.name || 'layanan').toLowerCase().replace(/\s+/g, '-')
  }
  if (!payload.code) {
    payload.code = payload.name ? payload.name.slice(0, 3).toUpperCase() : 'SVC'
  }
  if (payload.active === undefined) payload.active = true
  db.services.push(payload)
  return clone(payload)
}

// TODO BACKEND: ganti dengan PUT /api/services/{id}
export async function updateService(id, patch) {
  await delay()
  const db = store()
  const found = db.services.find((s) => s.id === id)
  if (!found) return null
  Object.assign(found, patch)
  return clone(found)
}

// TODO BACKEND: ganti dengan DELETE /api/services/{id}
export async function deleteService(id) {
  await delay()
  const db = store()
  const idx = db.services.findIndex((s) => s.id === id)
  if (idx === -1) return false
  db.services.splice(idx, 1)
  return true
}

// ===========================================================================
// API: PRODUCT (PRODUK)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/products')
export async function getProducts() {
  await delay()
  return clone(store().products)
}

// TODO BACKEND: ganti dengan fetch('/api/products/{id}')
export async function getProduct(id) {
  await delay()
  const found = store().products.find((p) => p.id === id)
  return found ? clone(found) : null
}

// TODO BACKEND: ganti dengan POST /api/products
export async function addProduct(data) {
  await delay()
  const db = store()
  const payload = { ...data }
  if (!payload.id) {
    payload.id = String(payload.name || 'produk').toLowerCase().replace(/\s+/g, '-')
  }
  if (!payload.code) {
    payload.code = payload.name ? payload.name.slice(0, 3).toUpperCase() : 'PRD'
  }
  if (payload.active === undefined) payload.active = true
  db.products.push(payload)
  return clone(payload)
}

// TODO BACKEND: ganti dengan PUT /api/products/{id}
export async function updateProduct(id, patch) {
  await delay()
  const db = store()
  const found = db.products.find((p) => p.id === id)
  if (!found) return null
  Object.assign(found, patch)
  return clone(found)
}

// TODO BACKEND: ganti dengan DELETE /api/products/{id}
export async function deleteProduct(id) {
  await delay()
  const db = store()
  const idx = db.products.findIndex((p) => p.id === id)
  if (idx === -1) return false
  db.products.splice(idx, 1)
  return true
}

// ===========================================================================
// API: TRANSACTION (riwayat.js + add-transaction.js)
// ===========================================================================

// Normalisasi satu baris transaksi riwayat.js ke skema kaya untuk React
function normalizeTransaction(t) {
  const services = Array.isArray(t.services) && t.services.length
    ? t.services
    : [{ name: t.service, price: t.amount, qty: 1, category: t.category || null }]
  const products = Array.isArray(t.products) ? t.products : []
  const subtotal = typeof t.subtotal === 'number' ? t.subtotal : t.amount
  const tax = typeof t.tax === 'number' ? t.tax : 0
  const discount = typeof t.discount === 'number' ? t.discount : 0
  const total = typeof t.total === 'number' ? t.total : t.amount
  return {
    id: t.id,
    date: t.date,
    time: t.time,
    client: t.client,
    clientName: t.client ? (t.client.name || t.client.clientName) : (t.clientName || ''),
    services,
    products,
    subtotal,
    discount,
    tax,
    total,
    amount: t.amount,
    worker: t.worker,
    workerId: t.workerId || null,
    paymentMethod: t.paymentMethod || t.method || 'Tunai',
    status: t.status,
    category: t.category || null,
    items: Array.isArray(t.items) && t.items.length ? t.items : services,
    method: t.method || t.paymentMethod || 'Tunai',
    notes: t.notes || ''
  }
}

// TODO BACKEND: ganti dengan fetch('/api/transactions')
export async function getTransactions() {
  await delay()
  const db = store()
  return db.transactions.map(normalizeTransaction)
}

// TODO BACKEND: ganti dengan fetch('/api/transactions/{id}')
export async function getTransaction(id) {
  await delay()
  const db = store()
  const found = db.transactions.find((t) => t.id === id)
  return found ? normalizeTransaction(found) : null
}

// TODO BACKEND: ganti dengan POST /api/transactions
export async function addTransaction(data) {
  await delay()
  const db = store()
  const payload = { ...data }
  if (!payload.id) payload.id = db.transactions.length ? nextTransactionId(db.transactions) : 'TRX-000001'
  if (!payload.amount) payload.amount = payload.subtotal || payload.total || 0
  if (!payload.status) payload.status = 'paid'
  if (Array.isArray(payload.services) && !payload.service) {
    payload.service = payload.services.map((s) => s.name).join(', ')
    payload.items = payload.services
  }
  if (payload.client && typeof payload.client === 'object') {
    payload.clientName = payload.clientName || payload.client.name
  }
  db.transactions.push(payload)
  return clone(payload)
}

const nextTransactionId = (transactions) => {
  let maxNum = 0
  transactions.forEach((t) => {
    const parts = String(t.id || '').split('-')
    const num = parseInt(parts[parts.length - 1], 10)
    if (!Number.isNaN(num) && num > maxNum) maxNum = num
  })
  return 'TRX-' + String(maxNum + 1).padStart(6, '0')
}

// TODO BACKEND: ganti dengan GET /api/transactions/next-id
export async function getNextTransactionId() {
  await delay(30)
  return nextTransactionId(store().transactions)
}

// ===========================================================================
// API: APPOINTMENT (appointment.js + add-appointment.js)
// ===========================================================================

const APPOINTMENT_STATUS_LABELS = {
  confirmed: 'Terkonfirmasi',
  confirmedLabel: 'Terjadwal',
  pending: 'Menunggu',
  done: 'Selesai',
  cancelled: 'Dibatalkan'
}

function decorateAppointment(apt, db) {
  const client = db.clients.find((c) => c.id === apt.clientId) || {
    id: apt.clientId,
    name: 'Klien',
    color: '#6B7280',
    bg: '#F3F4F6',
    avatar: 'KL',
    phone: ''
  }
  const worker = db.workers.find((w) => w.id === apt.workerId) || {
    id: apt.workerId,
    name: 'Stylist',
    specialty: ''
  }
  const service = db.services.find((s) => s.name === apt.service || s.id === apt.service)
  const price = typeof apt.price === 'number' ? apt.price : (service ? service.price : 0)
  const statusLabel =
    apt.status === 'confirmed' ? 'Terkonfirmasi'
    : apt.status === 'pending' ? 'Menunggu'
    : apt.status === 'done' ? 'Selesai'
    : apt.status === 'cancelled' ? 'Dibatalkan'
    : apt.status

  return {
    ...apt,
    client: {
      id: client.id,
      name: client.name,
      avatar: client.avatar || 'KL',
      color: client.color || '#6B7280',
      bg: client.bg || '#F3F4F6',
      phone: client.phone || ''
    },
    worker: {
      id: worker.id,
      name: worker.name,
      specialty: worker.specialty || worker.position || '',
      color: worker.color || '#E5A93C',
      bg: worker.bg || '#FFFBEB'
    },
    clientName: client.name,
    workerName: worker.name,
    statusLabel,
    price,
    commission: Math.round(price * 0.15)
  }
}

// TODO BACKEND: ganti dengan fetch('/api/appointments')
export async function getAppointments() {
  await delay()
  const db = store()
  return db.appointments.map((a) => decorateAppointment(a, db))
}

// TODO BACKEND: ganti dengan fetch('/api/appointments/{id}')
export async function getAppointment(id) {
  await delay()
  const db = store()
  const found = db.appointments.find((a) => a.id === id)
  return found ? decorateAppointment(found, db) : null
}

// TODO BACKEND: ganti dengan POST /api/appointments
export async function addAppointment(data) {
  await delay()
  const db = store()
  const payload = { ...data }
  if (!payload.id) payload.id = 'apt-' + (db.appointments.length + 1)
  if (!payload.status) payload.status = 'confirmed'
  if (!payload.duration) payload.duration = 60
  db.appointments.push(payload)
  return decorateAppointment(payload, db)
}

// TODO BACKEND: ganti dengan PUT /api/appointments/{id}
export async function updateAppointment(id, patch) {
  await delay()
  const db = store()
  const found = db.appointments.find((a) => a.id === id)
  if (!found) return null
  Object.assign(found, patch)
  return decorateAppointment(found, db)
}

// TODO BACKEND: ganti dengan DELETE /api/appointments/{id}
export async function deleteAppointment(id) {
  await delay()
  const db = store()
  const idx = db.appointments.findIndex((a) => a.id === id)
  if (idx === -1) return false
  db.appointments.splice(idx, 1)
  return true
}

// ===========================================================================
// API: ABSENSI (absensi.js)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/attendance/workers')
export async function getWorkersForAttendance() {
  await delay()
  return store().attendanceWorkers.map((w) => ({
    id: w.id,
    name: w.name,
    scheme: w.scheme,
    schemeLabel: w.schemeLabel,
    isGivenMealFlag: w.scheme !== 'daily_percentage'
  }))
}

// TODO BACKEND: ganti dengan fetch('/api/attendance?date=YYYY-MM-DD')
export async function getAttendanceByDate(date) {
  await delay()
  const db = store()
  const dateStr = date || '2026-09-17'
  const dayRecord = db.attendanceRecords[dateStr]
  // Meniru perilaku absensi.js: tanggal tanpa record -> default semua hadir
  const resolved = dayRecord || {}
  return db.attendanceWorkers.map((w) => ({
    workerId: w.id,
    name: w.name,
    scheme: w.scheme,
    schemeLabel: w.schemeLabel,
    isPresent: resolved[w.id] !== false
  }))
}

// TODO BACKEND: ganti dengan POST /api/attendance/save
export async function saveAttendance(date, records) {
  await delay()
  const db = store()
  const dateStr = date || '2026-09-17'
  if (!db.attendanceRecords[dateStr]) db.attendanceRecords[dateStr] = {}
  records.forEach((r) => {
    db.attendanceRecords[dateStr][r.workerId] = !!r.isPresent
  })
  return { success: true, date: dateStr, saved: db.attendanceRecords[dateStr] }
}

// TODO BACKEND: ganti dengan fetch('/api/attendance/summary?month=YYYY-MM')
export async function getAttendanceSummary(month) {
  await delay()
  const db = store()
  const monthKey = month || '2026-09'
  const monthData = db.attendanceSummary[monthKey] || {}

  const rows = db.attendanceWorkers.map((w) => {
    const totalHadir = monthData[w.id] || 0
    const isOmset = w.scheme === 'daily_percentage'
    const uangMakan = isOmset ? 0 : totalHadir * UANG_MAKAN_PER_DAY
    return {
      workerId: w.id,
      name: w.name,
      scheme: w.scheme,
      schemeLabel: w.schemeLabel,
      totalHadir,
      uangMakan
    }
  })

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalHadir += r.totalHadir
      acc.totalUangMakan += r.uangMakan
      return acc
    },
    { totalHadir: 0, totalUangMakan: 0 }
  )

  return { month: monthKey, rows, ...totals }
}

// ===========================================================================
// API: LAPORAN PENJUALAN (laporan.js)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/reports/sales?from=...&to=...')
export async function getSalesReport(month) {
  await delay()
  const db = store()

  const dateFrom = '2026-08-01'
  const dateTo = '2026-08-31'

  let list = [...db.reportTransactions]
  list = list.filter((t) => t.date >= dateFrom && t.date <= dateTo)

  let totalRevenue = 0
  list.forEach((t) => (totalRevenue += t.amount))
  const transactionCount = list.length
  const averageRevenue = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0

  // Layanan terlaris (aggregasi kustom — mirror gaya pelanggan-aktif.js)
  const serviceMap = {}
  list.forEach((t) => {
    if (!serviceMap[t.service]) serviceMap[t.service] = { name: t.service, category: t.category, count: 0, revenue: 0 }
    serviceMap[t.service].count += 1
    serviceMap[t.service].revenue += t.amount
  })
  const bestSellingServices = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue || b.count - a.count)

  const workerMap = {}
  list.forEach((t) => {
    if (!workerMap[t.worker]) workerMap[t.worker] = { worker: t.worker, transactionCount: 0, revenue: 0 }
    workerMap[t.worker].transactionCount += 1
    workerMap[t.worker].revenue += t.amount
  })
  const topWorkers = Object.values(workerMap).sort((a, b) => b.revenue - a.revenue)

  const categoryMap = {}
  list.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { category: t.category, count: 0, revenue: 0 }
    categoryMap[t.category].count += 1
    categoryMap[t.category].revenue += t.amount
  })
  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue)

  const productsSold = [
    { name: 'Wella Color Charm', brand: 'Wella', qty: 40, unit: '10ml', revenue: 600000 },
    { name: "L'Oréal Majirel", brand: "L'Oréal", qty: 26, unit: '10ml', revenue: 468000 },
    { name: 'Olaplex No.3 Hair Perfector', brand: 'Olaplex', qty: 4, unit: 'pcs', revenue: 1140000 }
  ]

  return {
    period: { from: dateFrom, to: dateTo, month: month || '2026-08', label: 'Agustus 2026' },
    totalRevenue,
    transactionCount,
    averageRevenue,
    dailyRevenue: clone(db.reportDaily),
    bestSellingServices,
    topWorkers,
    categoryBreakdown,
    productsSold,
    transactions: clone(list)
  }
}

// ===========================================================================
// API: PELANGGAN AKTIF (pelanggan-aktif.js)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/reports/active-clients?from=...&to=...')
export async function getActiveClients(filters = {}) {
  await delay()
  const db = store()

  // Default: periode "bulan ini" (Agustus 2026) seperti initial load skrip
  const startStr = filters.dateFrom || '2026-08-01'
  const endStr = filters.dateTo || '2026-08-31'
  const query = (filters.search || '').toLowerCase().trim()
  const sortBy = filters.sortBy || 'visits-desc'

  const startDate = new Date(startStr + 'T00:00:00')
  const endDate = new Date(endStr + 'T23:59:59')

  const periodTx = db.activeClientTransactions.filter((trx) => {
    const d = new Date(trx.date)
    return d >= startDate && d <= endDate
  })

  const aggMap = {}
  periodTx.forEach((trx) => {
    if (!aggMap[trx.clientId]) {
      aggMap[trx.clientId] = { clientId: trx.clientId, visits: 0, totalSpend: 0, lastVisit: trx.date, services: [] }
    }
    aggMap[trx.clientId].visits += 1
    aggMap[trx.clientId].totalSpend += trx.amount
    aggMap[trx.clientId].services.push(trx.service)
    if (new Date(trx.date) > new Date(aggMap[trx.clientId].lastVisit)) {
      aggMap[trx.clientId].lastVisit = trx.date
    }
  })

  let result = Object.keys(aggMap).map((cId) => {
    const profile = db.activeClientProfiles.find((c) => c.id === cId) || {
      id: cId,
      name: 'Pelanggan',
      avatar: 'PL',
      phone: '-',
      segment: 'Reguler',
      favService: '-'
    }
    const agg = aggMap[cId]
    return { ...profile, visits: agg.visits, totalSpend: agg.totalSpend, lastVisit: agg.lastVisit, periodServices: agg.services }
  })

  if (query) {
    result = result.filter((c) => c.name.toLowerCase().includes(query) || c.phone.toLowerCase().includes(query))
  }

  if (sortBy === 'visits-desc') result.sort((a, b) => b.visits - a.visits || b.totalSpend - a.totalSpend)
  else if (sortBy === 'spend-desc') result.sort((a, b) => b.totalSpend - a.totalSpend || b.visits - a.visits)
  else if (sortBy === 'recent-desc') result.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
  else if (sortBy === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name))

  const totalVisits = result.reduce((s, c) => s + c.visits, 0)
  const totalRevenue = result.reduce((s, c) => s + c.totalSpend, 0)
  const avgSpend = totalVisits > 0 ? Math.round(totalRevenue / totalVisits) : 0

  return {
    period: { from: startStr, to: endStr },
    totalActiveCount: result.length,
    totalVisits,
    totalRevenue,
    avgSpend,
    clients: result
  }
}

// ===========================================================================
// API: REKAP KOMISI (rekap-komisi.js)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/reports/commission?month=YYYY-MM')
export async function getCommissionReport(month) {
  await delay()
  const db = store()
  const period = {
    month: month || '2026-09',
    label: 'September 2026',
    from: '2026-09-01',
    to: '2026-09-30'
  }
  if (period.month === '2026-08') {
    period.label = 'Agustus 2026'
    period.from = '2026-08-01'
    period.to = '2026-08-31'
  }

  const rows = db.commissionData.map((s) => {
    const totalIncome = s.salary + s.commission
    const totalNet = s.salary + s.commission + s.mealAllowance
    return {
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      schemeType: s.schemeType,
      scheme: s.schemeLabel,
      salary: s.salary,
      commission: s.commission,
      totalJasa: s.commission,
      mealAllowance: s.mealAllowance,
      totalIncome,
      totalNet,
      slip: {
        name: s.name,
        period: period.label,
        periodRange: `${period.from} s/d ${period.to}`,
        schemeLabel: s.schemeLabel,
        salary: s.salary,
        commission: s.commission,
        mealAllowance: s.mealAllowance,
        netTotal: totalNet
      }
    }
  })

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalJasa += r.totalJasa
      acc.totalCommission += r.commission
      acc.totalSalary += r.salary
      acc.totalMealAllowance += r.mealAllowance
      acc.totalIncome += r.totalIncome
      acc.grandTotal += r.totalNet
      return acc
    },
    { totalJasa: 0, totalCommission: 0, totalSalary: 0, totalMealAllowance: 0, totalIncome: 0, grandTotal: 0 }
  )

  return { period, rows, totals }
}

// ===========================================================================
// API: PROFIL OWNER (profil.js)
// ===========================================================================

// TODO BACKEND: ganti dengan fetch('/api/user/profile')
export async function getProfile() {
  await delay()
  return clone(store().profile)
}

// TODO BACKEND: ganti dengan PUT /api/user/profile
export async function updateProfile(patch) {
  await delay()
  const db = store()
  Object.assign(db.profile, patch)
  // Sinkronisasi session (sama seperti profil.js menyimpan ke sessionStorage)
  if (typeof sessionStorage !== 'undefined' && db.profile.name) {
    const user = { name: db.profile.name, email: db.profile.email, role: db.profile.role || 'Owner' }
    sessionStorage.setItem('afwo_logged_in_user', JSON.stringify(user))
  }
  return clone(db.profile)
}

// ===========================================================================
// API: AUTH (login.js + profil.js + nav.js)
// ===========================================================================

// TODO BACKEND: ganti dengan POST /api/auth/login
export async function login(email, password) {
  await delay(150)
  const db = store()
  const inputEmail = String(email || '').trim().toLowerCase()
  const inputPassword = String(password || '')

  const demo = db.demoAccounts.find((a) => a.email.toLowerCase() === inputEmail)
  // Aturan login.js: email berisi "owner" -> Owner Afwo, selainnya Admin Afwo
  if (demo) {
    if (demo.password === inputPassword) {
      const user = { id: '1', name: demo.name, email: demo.email, role: demo.role }
      syncLoggedInUser(user)
      return { success: true, user }
    }
  }

  if (inputEmail.endsWith('@afwo.com') && inputPassword === '12345678') {
    const name = inputEmail.includes('owner') ? 'Owner Afwo' : 'Admin Afwo'
    const role = inputEmail.includes('owner') ? 'Owner' : 'Admin'
    const user = { id: inputEmail.includes('owner') ? '1' : '2', name, email: inputEmail, role }
    syncLoggedInUser(user)
    return { success: true, user }
  }

  return { success: false, message: 'Email atau password salah.' }
}

function syncLoggedInUser(user) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('afwo_logged_in_user', JSON.stringify(user))
  }
}

// TODO BACKEND: ganti dengan GET /api/auth/me
export async function getLoggedInUser() {
  await delay(20)
  if (typeof sessionStorage !== 'undefined') {
    const saved = sessionStorage.getItem('afwo_logged_in_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return null
      }
    }
  }
  return null
}

// TODO BACKEND: ganti dengan POST /api/auth/logout
export async function clearLoggedInUser() {
  await delay(20)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('afwo_logged_in_user')
  }
  return true
}

// TODO BACKEND: ganti dengan POST /api/auth/set-session
export async function setLoggedInUser(user) {
  await delay(20)
  if (user && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('afwo_logged_in_user', JSON.stringify(user))
  }
  return clone(user)
}

// ---- Remember me (login.js memakai localStorage 'afwo_remember_email') ----

// TODO BACKEND: ganti dengan GET /api/auth/remember-email
export async function getRememberEmail() {
  await delay(20)
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('afwo_remember_email') || ''
  }
  return ''
}

// TODO BACKEND: ganti dengan POST /api/auth/remember-email
export async function setRememberEmail(email) {
  await delay(20)
  if (typeof localStorage !== 'undefined') {
    if (email) localStorage.setItem('afwo_remember_email', email)
    else localStorage.removeItem('afwo_remember_email')
  }
  return email || ''
}

// ===========================================================================
// EXPORT DIAGNOSTIK (opsional, tidak merusak API)
// ===========================================================================

// TODO BACKEND: hapus fungsi ini setelah backend real tersedia
export async function getMockMeta() {
  const db = store()
  return {
    version: '1.0.0',
    collections: {
      clients: db.clients.length,
      workers: db.workers.length,
      services: db.services.length,
      products: db.products.length,
      transactions: db.transactions.length,
      appointments: db.appointments.length,
      attendance: Object.keys(db.attendanceRecords).length,
      commissionStaff: db.commissionData.length
    },
    constants: {
      UANG_MAKAN_PER_DAY,
      demoAccount: { email: db.demoAccounts[0].email, password: db.demoAccounts[0].password }
    }
  }
}