/**
 * AFWO Hair Design - Laporan Penjualan (Sales Report) Engine
 * Manages Date Presets, KPI Computations, Category Breakdown,
 * Dynamic SVG Geometry Peak-Highlighted Chart, and Transaction Records.
 */

// =========================================================================
// 1. MOCK DATABASE & REST API INTEGRATION BRIDGE (ReportDatabaseAPI)
// =========================================================================

// Daftar karyawan yang dipakai pada kedua combobox filter laporan.
const REPORT_WORKERS = [
  { name: 'Agus Pratama', role: 'Senior Stylist' },
  { name: 'Ada Wong', role: '' },
  { name: 'Budi', role: 'Color Specialist' },
  { name: 'Rina', role: '' },
  { name: 'Dimas', role: '' }
];

// Jumlah karyawan yang menangani sebuah transaksi. Field `workers` (array) adalah
// sumber utama; `workType` menandai pengerjaan Berdua. `worker` (nama tunggal)
// tetap dibaca sebagai fallback agar data lama tetap kompatibel.
const crewCountOf = (t) => {
  const list = Array.isArray(t.workers) && t.workers.length
    ? t.workers
    : String(t.worker || '')
      .split(/,|&|\+|\/|\bdan\b/i)
      .map(s => s.trim())
      .filter(Boolean);
  return list.length || 1;
};

// Nama karyawan transaksi dalam bentuk array, tanpa duplikat.
const workerListOf = (t) => {
  const list = Array.isArray(t.workers) && t.workers.length
    ? t.workers.slice()
    : String(t.worker || '')
      .split(/,|&|\+|\/|\bdan\b/i)
      .map(s => s.trim())
      .filter(Boolean);
  return [...new Set(list)];
};

// workType 'multi' bila crew >= 2, selain itu 'single'. Field workType pada data
// mock actedua dipakai sebagai nilai eksplisit bila tersedia.
const workTypeOf = (t) => {
  if (t.workType === 'multi' || t.workType === 'single') return t.workType;
  return crewCountOf(t) >= 2 ? 'multi' : 'single';
};

const ReportDatabaseAPI = {
  // Mock data: `workers` berisi seluruh karyawan yang menangani transaksi dan
  // `workType` menandai pengerjaan Sendiri (single) atau Berdua (multi).
  transactions: [
    { id: 'TRX-121091', date: '2026-08-26', time: '10:00 WIB', client: 'Eleanor Vance', phone: '+62 8112233445', service: 'Balayage Color Treatment', worker: 'Agus Pratama', workers: ['Agus Pratama', 'Rina'], workType: 'multi', amount: 650000, category: 'Coloring', method: 'QRIS', status: 'Selesai (Paid)' },
    { id: 'TRX-121090', date: '2026-08-26', time: '13:30 WIB', client: 'Sari Handayani', phone: '+62 81298765432', service: 'Creambath & Blow Dry', worker: 'Rina', workers: ['Rina'], workType: 'single', amount: 180000, category: 'Hair Spa & Treatment', method: 'Tunai', status: 'Selesai (Paid)' },
    { id: 'TRX-121089', date: '2026-08-26', time: '15:15 WIB', client: 'Budi Santoso', phone: '+62 81345678901', service: 'Haircut Premium', worker: 'Agus Pratama', workers: ['Agus Pratama'], workType: 'single', amount: 75000, category: 'Potong Rambut', method: 'Transfer', status: 'Selesai (Paid)' },
    { id: 'TRX-121088', date: '2026-08-25', time: '11:00 WIB', client: 'Melati Putri', phone: '+62 81711223344', service: 'Keratin Smooth Treatment', worker: 'Budi', workers: ['Budi', 'Dimas'], workType: 'multi', amount: 850000, category: 'Smoothing & Perm', method: 'QRIS', status: 'Selesai (Paid)' },
    { id: 'TRX-121087', date: '2026-08-25', time: '14:20 WIB', client: 'Marcus Sterling', phone: '+62 81899001122', service: 'Haircut & Styling', worker: 'Agus Pratama', workers: ['Agus Pratama'], workType: 'single', amount: 120000, category: 'Potong Rambut', method: 'Tunai', status: 'Selesai (Paid)' },
    { id: 'TRX-121086', date: '2026-08-24', time: '09:45 WIB', client: 'Dewi Anggraini', phone: '+62 81233445566', service: 'Full Bleaching + Color', worker: 'Rina', workers: ['Rina', 'Agus Pratama'], workType: 'multi', amount: 950000, category: 'Coloring', method: 'Transfer', status: 'Selesai (Paid)' },
    { id: 'TRX-121085', date: '2026-08-24', time: '16:00 WIB', client: 'Sari Handayani', phone: '+62 81298765432', service: 'L\'Oreal Hair Masker', worker: 'Rina', workers: ['Rina'], workType: 'single', amount: 150000, category: 'Hair Spa & Treatment', method: 'QRIS', status: 'Selesai (Paid)' }
  ],

  async fetchReportData(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...this.transactions];
        if (filters.dateFrom) list = list.filter(t => t.date >= filters.dateFrom);
        if (filters.dateTo) list = list.filter(t => t.date <= filters.dateTo);

        // "Jenis Pengerjaan" memakai workType, bukan kategori layanan.
        if (filters.serviceType && filters.serviceType !== 'all') {
          list = list.filter(t => workTypeOf(t) === filters.serviceType);
        }

        // Filter karyawan. Saat satu karyawan dipilih, transaksi harus memuat
        // dia di workers. Saat dua karyawan dipilih, transaksi harus memuat
        // keduanya (setiap nama yang dipilih).
        const wanted = [filters.worker, filters.worker2]
          .filter(v => v && v !== 'all');
        if (wanted.length) {
          list = list.filter(t => {
            const names = workerListOf(t);
            return wanted.every(w => names.includes(w));
          });
        }

        resolve(list);
      }, 100);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // ID yang dipakai markup laporan.html. Fallback ke nama lama dipakai supaya
  // skrip tetap aman bila markup berubah.
  const periodPresetSelect = document.getElementById('select-period')
    || document.getElementById('report-period-preset');
  const dateFromInput = document.getElementById('report-date-from');
  const dateToInput = document.getElementById('report-date-to');
  const workerFilterBox = document.getElementById('report-worker-filter');
  const workerFilterBox2 = document.getElementById('report-worker-filter-2');
  const workerFilterRow2 = document.getElementById('report-worker-filter-2-row');
  const workerFilterStatus = document.getElementById('report-worker-filter-status');
  const serviceTypeSelect = document.getElementById('select-jenis-pengerjaan')
    || document.getElementById('filter-service-type');
  const btnApplyFilter = document.getElementById('btn-apply-report-filter');
  const btnResetFilter = document.getElementById('btn-reset-report-filter');

  const totalRevenueEl = document.getElementById('report-total-revenue');
  const transactionCountEl = document.getElementById('report-transaction-count');
  const averageRevenueEl = document.getElementById('report-average-revenue');

  const barChartSvg = document.getElementById('svg-bar-chart')
    || document.getElementById('bar-chart-svg');
  const chartDaysAxis = document.getElementById('chart-axis-labels')
    || document.getElementById('chart-days-axis');
  const chartRevenueVal = document.getElementById('chart-revenue-val');
  const summaryTotalEl = document.getElementById('dark-summary-total-val');
  const categoryVisualGrid = document.getElementById('category-visual-grid');
  const categoryDetailList = document.getElementById('category-detail-list');
  const categoryEmptyNote = document.getElementById('category-empty-note');
  const historyGroups = document.getElementById('report-history-groups');
  const historyEmpty = document.getElementById('report-history-empty');
  const dailyGroupTpl = document.getElementById('tpl-daily-group');

  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnGenerateReport = document.getElementById('btn-generate-report');

  function formatIDR(val) {
    return 'Rp' + Math.round(val).toLocaleString('id-ID');
  }

  /* ---------------------------------------------------------------
     Combobox karyawan yang dapat dipakai ulang untuk kotak pertama
     maupun kedua. Mengembalikan objek dengan API reset() dan value().
     ---------------------------------------------------------------- */
  function initWorkerCombobox(box) {
    if (!box) return null;

    const input = box.querySelector('.combobox-search-field');
    const panel = box.querySelector('.combobox-dropdown-panel');
    const rows = [...box.querySelectorAll('.combobox-option-row')];

    const openPanel = () => {
      box.classList.add('open');
      if (input) input.setAttribute('aria-expanded', 'true');
    };
    const closePanel = () => {
      box.classList.remove('open');
      if (input) input.setAttribute('aria-expanded', 'false');
    };

    // Pilih satu opsi; "all" berarti tanpa filter karyawan.
    const selectRow = (row) => {
      rows.forEach(r => {
        const on = r === row;
        r.classList.toggle('selected', on);
        r.setAttribute('aria-selected', String(on));
      });
      if (input) input.value = row.dataset.value === 'all' ? '' : row.dataset.value;
      closePanel();
      syncDisabledOptions();
    };

    const value = () => {
      const sel = box.querySelector('.combobox-option-row.selected');
      return sel ? sel.dataset.value : 'all';
    };

    // Kembalikan combo ke "Semua Karyawan" tanpa memicu loadReport.
    const reset = () => {
      rows.forEach(r => {
        r.classList.remove('selected', 'is-disabled');
        r.style.display = '';
        r.setAttribute('aria-selected', 'false');
      });
      const first = rows.find(r => r.dataset.value === 'all') || rows[0];
      if (first) {
        first.classList.add('selected');
        first.setAttribute('aria-selected', 'true');
      }
      if (input) input.value = '';
      closePanel();
    };

    // Nonaktifkan nama yang sudah dipakai kotak lain supaya tidak terpilih dobel.
    const syncDisabledOptions = () => {
      const taken = new Set(
        [workerCombo1 && workerCombo1.value(), workerCombo2 && workerCombo2.value()]
          .filter(v => v && v !== 'all')
      );
      rows.forEach(r => {
        const v = r.dataset.value;
        if (v === 'all' || !taken.has(v)) {
          r.classList.remove('is-disabled');
          r.removeAttribute('aria-disabled');
        } else {
          r.classList.add('is-disabled');
          r.setAttribute('aria-disabled', 'true');
        }
      });
    };

    rows.forEach(row => {
      row.addEventListener('click', () => {
        if (row.classList.contains('is-disabled')) return;
        selectRow(row);
        syncDisabledOptions();
        loadReport();
      });
    });

    if (input) {
      input.addEventListener('focus', openPanel);
      input.addEventListener('input', () => {
        openPanel();
        const q = input.value.trim().toLowerCase();
        rows.forEach(r => {
          const match = !q || r.textContent.toLowerCase().includes(q);
          r.style.display = match ? '' : 'none';
        });
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closePanel(); return; }
        const active = rows.find(r => r.classList.contains('selected'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const usable = rows.filter(r => !r.classList.contains('is-disabled'));
          if (!usable.length) return;
          const idx = usable.indexOf(active);
          const next = e.key === 'ArrowDown'
            ? usable[(idx + 1) % usable.length]
            : usable[(idx - 1 + usable.length) % usable.length];
          selectRow(next);
          syncDisabledOptions();
          loadReport();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!box.contains(e.target)) closePanel();
    });

    return { box, rows, value, reset, syncDisabledOptions, openPanel, closePanel };
  }

  let workerCombo1 = null;
  let workerCombo2 = null;
  workerCombo1 = initWorkerCombobox(workerFilterBox);
  workerCombo2 = initWorkerCombobox(workerFilterBox2);

  // Tampilkan/sembunyikan kotak kedua hanya saat Jenis Pengerjaan = Berdua.
  function syncSecondWorkerVisibility() {
    if (!workerFilterBox2 || !workerFilterRow2) return;
    const isMulti = serviceTypeSelect && serviceTypeSelect.value === 'multi';
    workerFilterRow2.hidden = !isMulti;
    workerFilterRow2.setAttribute('aria-hidden', String(!isMulti));
    if (!isMulti && workerCombo2) {
      // Nilai kotak kedua tidak lagi dipakai, kembalikan ke "Semua Karyawan".
      if (workerCombo2.value() !== 'all') workerCombo2.reset();
      workerCombo2.closePanel();
    }
    if (workerCombo1) workerCombo1.syncDisabledOptions();
    if (workerCombo2) workerCombo2.syncDisabledOptions();
  }

  if (serviceTypeSelect) {
    serviceTypeSelect.addEventListener('change', () => {
      syncSecondWorkerVisibility();
      loadReport();
    });
  }

  // Pengumuman perubahan filter untuk pembaca layar.
  function announceFilter() {
    if (!workerFilterStatus) return;
    const w1 = workerCombo1 ? workerCombo1.value() : 'all';
    const w2 = workerCombo2 && !workerFilterRow2.hidden ? workerCombo2.value() : 'all';
    const jenis = serviceTypeSelect ? serviceTypeSelect.value : 'all';
    const jenisLabel = jenis === 'multi' ? 'Berdua' : jenis === 'single' ? 'Sendiri' : 'Semua jenis pengerjaan';
    const nama = [w1, w2]
      .filter(v => v && v !== 'all')
      .map(n => REPORT_WORKERS.find(w => w.name === n)?.name || n);
    const bagianKaryawan = nama.length
      ? 'Karyawan: ' + nama.join(' dan ')
      : 'Karyawan: semua';
    workerFilterStatus.textContent = jenisLabel + '. ' + bagianKaryawan + '.';
  }

  function setDatePreset(preset) {
    if (preset === 'daily' || preset === 'hari-ini') {
      dateFromInput.value = '2026-08-26';
      dateToInput.value = '2026-08-26';
    } else if (preset === 'weekly' || preset === 'minggu-ini' || preset === '7-hari') {
      dateFromInput.value = '2026-08-20';
      dateToInput.value = '2026-08-26';
    } else if (preset === 'monthly' || preset === 'bulan-ini' || preset === '30-hari') {
      dateFromInput.value = '2026-08-01';
      dateToInput.value = '2026-08-31';
    } else if (preset === 'tahun-ini') {
      dateFromInput.value = '2026-01-01';
      dateToInput.value = '2026-12-31';
    }
  }

  if (periodPresetSelect) {
    periodPresetSelect.addEventListener('change', () => {
      if (periodPresetSelect.value !== 'kustom') {
        setDatePreset(periodPresetSelect.value);
        loadReport();
      }
    });
  }

  // Sakelar periode Harian / Bulanan di atas, memakai komponen .segmented global.
  const periodSwitchItems = document.querySelectorAll('.segmented__item[data-period]');
  periodSwitchItems.forEach(item => {
    item.addEventListener('click', () => {
      periodSwitchItems.forEach(el => {
        const on = el === item;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', String(on));
      });
      const period = item.dataset.period;
      if (periodPresetSelect) periodPresetSelect.value = period;
      setDatePreset(period);
      loadReport();
    });
  });

  if (btnApplyFilter) btnApplyFilter.addEventListener('click', loadReport);
  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      if (periodPresetSelect) periodPresetSelect.value = 'daily';
      if (workerCombo1) workerCombo1.reset();
      if (workerCombo2) workerCombo2.reset();
      if (serviceTypeSelect) serviceTypeSelect.value = 'all';
      syncSecondWorkerVisibility();
      periodSwitchItems.forEach((el, i) => {
        const on = i === 0;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', String(on));
      });
      setDatePreset('daily');
      loadReport();
    });
  }

  syncSecondWorkerVisibility();


  function renderResponsiveBarChart(dailyStats) {
    if (!barChartSvg) return;
    // Gambar batang ditulis ke grup agar <defs> gradient tetap utuh.
    const barsTarget = barChartSvg.querySelector('#chart-bars-group') || barChartSvg;

    const svgWidth = 700;
    const svgHeight = 150;   // harus sama dengan viewBox pada laporan.html
    const paddingBottom = 25;
    const paddingTop = 20;
    const chartHeight = svgHeight - paddingBottom - paddingTop;

    const maxRevenue = Math.max(...dailyStats.map(d => d.revenue), 1000000);
    const count = dailyStats.length;
    const slotWidth = svgWidth / count;
    const barWidth = Math.min(46, slotWidth * 0.44);

    let maxRevValue = -1;
    let peakIndex = -1;
    dailyStats.forEach((d, i) => {
      if (d.revenue > maxRevValue) {
        maxRevValue = d.revenue;
        peakIndex = i;
      }
    });

    let gridLinesHtml = `
      <line x1="0" y1="${paddingTop}" x2="${svgWidth}" y2="${paddingTop}" stroke="var(--chart-grid)" stroke-dasharray="3 3" stroke-width="1.2" />
      <line x1="0" y1="${paddingTop + chartHeight * 0.5}" x2="${svgWidth}" y2="${paddingTop + chartHeight * 0.5}" stroke="var(--chart-grid)" stroke-dasharray="3 3" stroke-width="1.2" />
      <line x1="0" y1="${paddingTop + chartHeight}" x2="${svgWidth}" y2="${paddingTop + chartHeight}" stroke="var(--chart-axis)" stroke-width="1.5" />
    `;

    let barsHtml = '';
    dailyStats.forEach((day, index) => {
      const height = (day.revenue / maxRevenue) * chartHeight;
      const x = (index * slotWidth) + (slotWidth - barWidth) / 2;
      const y = paddingTop + chartHeight - height;
      const isPeak = index === peakIndex;
      const barColor = isPeak ? 'var(--accent)' : 'var(--surface-contrast)';
      const fillRef = isPeak ? 'url(#barGradientPeak)' : 'url(#barGradientPrimary)';

      barsHtml += `
        <g class="chart-bar-group" style="cursor: pointer;">
          <title>${day.day} (${day.date}): ${formatIDR(day.revenue)} (${day.count} trx)</title>
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" rx="6" fill="${fillRef}" data-bar-color="${barColor}" class="svg-bar" />
          <rect x="${(index * slotWidth).toFixed(1)}" y="${paddingTop}" width="${slotWidth.toFixed(1)}" height="${chartHeight}" fill="transparent" />
        </g>
      `;
    });

    barsTarget.innerHTML = gridLinesHtml + barsHtml;

    if (chartDaysAxis) {
      chartDaysAxis.innerHTML = dailyStats.map(d => `<span>${d.day}</span>`).join('');
    }
  }


  async function loadReport() {
    const useSecond = workerFilterRow2 && !workerFilterRow2.hidden;
    const filters = {
      dateFrom: dateFromInput ? dateFromInput.value : '',
      dateTo: dateToInput ? dateToInput.value : '',
      worker: workerCombo1 ? workerCombo1.value() : 'all',
      worker2: useSecond && workerCombo2 ? workerCombo2.value() : 'all',
      serviceType: serviceTypeSelect ? serviceTypeSelect.value : 'all'
    };

    announceFilter();

    const data = await ReportDatabaseAPI.fetchReportData(filters);

    let totalRev = 0;
    data.forEach(t => totalRev += t.amount);
    const count = data.length;
    const avg = count > 0 ? totalRev / count : 0;

    if (totalRevenueEl) totalRevenueEl.textContent = formatIDR(totalRev);
    if (transactionCountEl) transactionCountEl.textContent = count + ' Transaksi';
    if (averageRevenueEl) averageRevenueEl.textContent = formatIDR(avg);

    if (chartRevenueVal) chartRevenueVal.textContent = formatIDR(totalRev);
    if (summaryTotalEl) summaryTotalEl.textContent = 'Total: ' + formatIDR(totalRev);

    renderResponsiveBarChart(buildDailyStats(data, filters));
    renderCategoryBreakdown(data);
    renderTransactionHistory(data);
    lastFilteredData = data;
    lastFilteredBy = filters;
  }

  // Terakhir hasil filter dipakai tombol Ekspor CSV.
  let lastFilteredData = [];
  let lastFilteredBy = {};

  const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  function formatTanggalPanjang(iso) {
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return iso;
    return DAYS_ID[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
  }

  // Ringkasan kategori: tile persentase + daftar detail, keduanya dari data terfilter.
  function renderCategoryBreakdown(data) {
    if (!categoryVisualGrid && !categoryDetailList) return;

    const byCategory = new Map();
    data.forEach(t => {
      const key = t.category || 'Lainnya';
      const cur = byCategory.get(key) || { name: key, revenue: 0, count: 0 };
      cur.revenue += t.amount;
      cur.count += 1;
      byCategory.set(key, cur);
    });

    const rows = [...byCategory.values()].sort((a, b) => b.revenue - a.revenue);
    const total = rows.reduce((s, r) => s + r.revenue, 0);
    const empty = rows.length === 0;

    if (categoryEmptyNote) categoryEmptyNote.hidden = !empty;

    if (categoryVisualGrid) {
      // Empat tile teratas; sisa kategori tampil di daftar detail.
      const tiles = rows.slice(0, 4).map((r, i) => {
        const pct = total > 0 ? Math.round((r.revenue / total) * 100) : 0;
        return `
          <div class="cat-tile-box">
            <svg class="cat-tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              ${CATEGORY_TILE_ICONS[i % CATEGORY_TILE_ICONS.length]}
            </svg>
            <span class="cat-tile-percentage">${pct}%</span>
            <span class="cat-tile-name">${escapeHtml(r.name)}</span>
          </div>`;
      }).join('');
      categoryVisualGrid.innerHTML = tiles;
    }

    if (categoryDetailList) {
      categoryDetailList.innerHTML = rows.map(r => `
        <div class="cat-detail-row">
          <div class="cat-detail-left">
            <span class="cat-detail-name">${escapeHtml(r.name)}</span>
            <span class="cat-detail-count" data-field="category-count">${r.count} transaksi</span>
          </div>
          <span class="cat-detail-total" data-field="category-total">${formatIDR(r.revenue)}</span>
        </div>`).join('');
    }
  }

  const CATEGORY_TILE_ICONS = [
    '<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line>',
    '<path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11a9 9 0 0 1 9-9z"></path><path d="M12 7v5l3 3"></path>',
    '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
    '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>'
  ];

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  const STATUS_CLASS = {
    'Selesai (Paid)': 'selesai',
    'Dibatalkan': 'dibatalkan'
  };
  const METHOD_CLASS = {
    QRIS: 'qris',
    Tunai: 'tunai',
    Transfer: 'transfer'
  };

  // Riwayat transaksi dikelompokkan per tanggal dari data hasil filter.
  function renderTransactionHistory(data) {
    if (!historyGroups || !dailyGroupTpl) return;

    const byDate = new Map();
    data.forEach(t => {
      const list = byDate.get(t.date) || [];
      list.push(t);
      byDate.set(t.date, list);
    });

    const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
    if (historyEmpty) historyEmpty.hidden = dates.length > 0;

    historyGroups.innerHTML = dates.map(date => {
      const list = byDate.get(date);
      const total = list.reduce((s, t) => s + t.amount, 0);
      const node = dailyGroupTpl.content.firstElementChild.cloneNode(true);
      node.querySelector('[data-group="title"]').textContent = formatTanggalPanjang(date);
      node.querySelector('[data-group="count"]').textContent =
        list.length + (list.length === 1 ? ' Transaksi' : ' Transaksi');
      node.querySelector('[data-group="total"]').textContent = formatIDR(total);

      node.querySelector('[data-group="rows"]').innerHTML = list.map(t => {
        const crew = workerListOf(t);
        const crewText = crew.length > 1 ? crew.join(' &amp; ') : crew[0] || '-';
        return `
          <tr>
            <td>
              <span class="trans-id-link">${escapeHtml(t.id)}</span>
              <span class="trans-time-val">${escapeHtml(t.time)}</span>
            </td>
            <td>
              <div class="trx-customer-cell">
                <div>
                  <span class="trx-customer-name">${escapeHtml(t.client)}</span>
                  <span class="trx-customer-phone">${escapeHtml(t.phone)}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="service-name-text">${escapeHtml(t.service)}</span>
              <span class="stylist-worker-name">Stylist: <strong>${crewText}</strong></span>
            </td>
            <td>
              <span class="trx-total-amount">${formatIDR(t.amount)}</span>
            </td>
            <td>
              <span class="payment-method-badge ${METHOD_CLASS[t.method] || 'qris'}">${escapeHtml(t.method)}</span>
            </td>
            <td>
              <span class="trx-status-badge ${STATUS_CLASS[t.status] || 'selesai'}">${escapeHtml(t.status)}</span>
            </td>
            <td style="text-align: right;">
              <a href="riwayat.html" class="btn btn-sm btn-ghost">Detail Struk</a>
            </td>
          </tr>`;
      }).join('');

      return node.outerHTML;
    }).join('');
  }

  // Ekspor CSV memakai data hasil filter yang sedang tampil.
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (!lastFilteredData.length) return;
      const head = ['ID', 'Tanggal', 'Waktu', 'Pelanggan', 'Telepon', 'Layanan', 'Karyawan', 'Jenis Pengerjaan', 'Kategori', 'Total', 'Metode', 'Status'];
      const body = lastFilteredData.map(t => [
        t.id, t.date, t.time, t.client, t.phone, t.service,
        workerListOf(t).join(' & '),
        workTypeOf(t) === 'multi' ? 'Berdua' : 'Sendiri',
        t.category, t.amount, t.method, t.status
      ]);
      const csv = [head, ...body]
        .map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
        .join('\r\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-penjualan.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnGenerateReport) {
    btnGenerateReport.addEventListener('click', () => {
      const w1 = lastFilteredBy.worker && lastFilteredBy.worker !== 'all' ? lastFilteredBy.worker : 'semua';
      const w2 = lastFilteredBy.worker2 && lastFilteredBy.worker2 !== 'all' ? lastFilteredBy.worker2 : null;
      const bagian = w2 ? w1 + ' + ' + w2 : w1;
      console.log('Buat Laporan:', {
        periode: lastFilteredBy.dateFrom + ' s.d. ' + lastFilteredBy.dateTo,
        jenis: lastFilteredBy.serviceType,
        karyawan: bagian,
        jumlah: lastFilteredData.length
      });
    });
  }

  // Susun data harian dari transaksi hasil filter sehingga grafik ikut berubah
  // mengikuti filter tanggal, jenis pengerjaan, dan karyawan.
  function buildDailyStats(data, filters) {
    const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const from = filters.dateFrom;
    const to = filters.dateTo;

    const bucket = new Map();
    data.forEach(t => {
      const cur = bucket.get(t.date) || { date: t.date, revenue: 0, count: 0 };
      cur.revenue += t.amount;
      cur.count += 1;
      bucket.set(t.date, cur);
    });

    if (!bucket.size) return [];

    // Rentang tampilan dibatasi oleh filter tanggal agar grafik tidak melebihi
    // periode yang sedang dihitung.
    const dates = [...bucket.keys()].sort();
    const start = from && from >= dates[0] ? from : dates[0];
    const end = to && to <= dates[dates.length - 1] ? to : dates[dates.length - 1];

    const stats = [];
    const cursor = new Date(start + 'T00:00:00');
    const last = new Date(end + 'T00:00:00');
    // Batasi jumlah batang agar sumbu X tetap terbaca pada rentang panjang.
    const totalDays = Math.round((last - cursor) / 86400000) + 1;
    const maxBars = 31;
    const stepDays = totalDays > maxBars ? Math.ceil(totalDays / maxBars) : 1;

    while (cursor <= last) {
      const iso = cursor.toISOString().slice(0, 10);
      const hit = bucket.get(iso);
      stats.push({
        day: DAY_NAMES[cursor.getDay()],
        date: iso,
        revenue: hit ? hit.revenue : 0,
        count: hit ? hit.count : 0
      });
      cursor.setDate(cursor.getDate() + stepDays);
    }

    return stats;
  }

  // Terapkan preset periode bawaan agar rentang tanggal dan data selalu sinkron.
  if (periodPresetSelect) setDatePreset(periodPresetSelect.value);

  loadReport();
});
