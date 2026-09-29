/**
 * AFWO Hair Design - Laporan Penjualan (Sales Report) Engine
 * Manages Date Presets, KPI Computations, Category Breakdown,
 * Dynamic SVG Geometry Peak-Highlighted Chart, and Transaction Records.
 */

// =========================================================================
// 1. MOCK DATABASE & REST API INTEGRATION BRIDGE (ReportDatabaseAPI)
// =========================================================================

// Jumlah karyawan yang menangani sebuah transaksi, diturunkan dari field
// worker (nama dipisah koma/&/+/slash atau "dan"). Data yang tidak menyebut
// karyawan dihitung sebagai satu orang.
const crewCountOf = (t) => {
  const names = String(t.worker || '')
    .split(/,|&|\+|\/|\bdan\b/i)
    .map(s => s.trim())
    .filter(Boolean);
  return names.length || 1;
};

const ReportDatabaseAPI = {
  transactions: [
    { id: 'TRX-121091', date: '2026-08-26', time: '10:00 WIB', client: 'Eleanor Vance', phone: '+62 8112233445', service: 'Balayage Color Treatment', worker: 'Agus Pratama', amount: 650000, category: 'Coloring', method: 'QRIS', status: 'Selesai (Paid)' },
    { id: 'TRX-121090', date: '2026-08-26', time: '13:30 WIB', client: 'Sari Handayani', phone: '+62 81298765432', service: 'Creambath & Blow Dry', worker: 'Rina', amount: 180000, category: 'Hair Spa & Treatment', method: 'Tunai', status: 'Selesai (Paid)' },
    { id: 'TRX-121089', date: '2026-08-26', time: '15:15 WIB', client: 'Budi Santoso', phone: '+62 81345678901', service: 'Haircut Premium', worker: 'Agus Pratama', amount: 75000, category: 'Potong Rambut', method: 'Transfer', status: 'Selesai (Paid)' },
    { id: 'TRX-121088', date: '2026-08-25', time: '11:00 WIB', client: 'Melati Putri', phone: '+62 81711223344', service: 'Keratin Smooth Treatment', worker: 'Budi', amount: 850000, category: 'Smoothing & Perm', method: 'QRIS', status: 'Selesai (Paid)' },
    { id: 'TRX-121087', date: '2026-08-25', time: '14:20 WIB', client: 'Marcus Sterling', phone: '+62 81899001122', service: 'Haircut & Styling', worker: 'Agus Pratama', amount: 120000, category: 'Potong Rambut', method: 'Tunai', status: 'Selesai (Paid)' },
    { id: 'TRX-121086', date: '2026-08-24', time: '09:45 WIB', client: 'Dewi Anggraini', phone: '+62 81233445566', service: 'Full Bleaching + Color', worker: 'Rina', amount: 950000, category: 'Coloring', method: 'Transfer', status: 'Selesai (Paid)' },
    { id: 'TRX-121085', date: '2026-08-24', time: '16:00 WIB', client: 'Sari Handayani', phone: '+62 81298765432', service: 'L\'Oreal Hair Masker', worker: 'Rina', amount: 150000, category: 'Hair Spa & Treatment', method: 'QRIS', status: 'Selesai (Paid)' }
  ],

  async fetchReportData(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...this.transactions];
        if (filters.dateFrom) list = list.filter(t => t.date >= filters.dateFrom);
        if (filters.dateTo) list = list.filter(t => t.date <= filters.dateTo);
        // Nilai "semua" pada markup adalah 'all'.
        if (filters.worker && filters.worker !== 'all') list = list.filter(t => t.worker === filters.worker);
        // "Jenis Pengerjaan" = jumlah karyawan yang menangani transaksi, bukan
        // kategori layanan. Jumlahnya diturunkan dari field worker yang sudah ada
        // (nama dipisah koma/&/+/slash) agar data mock tidak perlu ditambah field.
        if (filters.serviceType && filters.serviceType !== 'all') {
          list = list.filter(t => filters.serviceType === 'single'
            ? crewCountOf(t) < 2
            : crewCountOf(t) >= 2);
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

  // Karyawan memakai combobox, jadi nilainya dibaca dari opsi yang terpilih.
  const workerFilterSelect = workerFilterBox
    ? { get value() { const sel = workerFilterBox.querySelector('.combobox-option-row.selected');
        return sel ? sel.dataset.value : 'all'; } }
    : null;


  function formatIDR(val) {
    return 'Rp' + Math.round(val).toLocaleString('id-ID');
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
      if (workerFilterBox) {
        const first = workerFilterBox.querySelector('.combobox-option-row');
        workerFilterBox.querySelectorAll('.combobox-option-row').forEach(o => o.classList.remove('selected'));
        if (first) first.classList.add('selected');
        const input = workerFilterBox.querySelector('.combobox-search-field');
        if (input) input.value = '';
      }
      if (serviceTypeSelect) serviceTypeSelect.value = 'all';
      periodSwitchItems.forEach((el, i) => {
        const on = i === 0;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', String(on));
      });
      setDatePreset('daily');
      loadReport();
    });
  }

  // Combobox karyawan: buka/tutup dan pilih opsi.
  if (workerFilterBox) {
    const searchField = workerFilterBox.querySelector('.combobox-search-field');
    const rows = [...workerFilterBox.querySelectorAll('.combobox-option-row')];

    const openPanel = () => { workerFilterBox.classList.add('open'); };
    const closePanel = () => { workerFilterBox.classList.remove('open'); };

    rows.forEach(row => {
      row.addEventListener('click', () => {
        rows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        if (searchField) searchField.value = row.dataset.value === 'all' ? '' : row.dataset.value;
        closePanel();
        loadReport();
      });
    });

    if (searchField) {
      searchField.addEventListener('focus', openPanel);
      searchField.addEventListener('input', () => {
        openPanel();
        const q = searchField.value.trim().toLowerCase();
        rows.forEach(r => {
          r.style.display = !q || r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (!workerFilterBox.contains(e.target)) closePanel();
    });
  }


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
    const filters = {
      dateFrom: dateFromInput ? dateFromInput.value : '',
      dateTo: dateToInput ? dateToInput.value : '',
      worker: workerFilterSelect ? workerFilterSelect.value : '',
      serviceType: serviceTypeSelect ? serviceTypeSelect.value : ''
    };

    const data = await ReportDatabaseAPI.fetchReportData(filters);

    let totalRev = 0;
    data.forEach(t => totalRev += t.amount);
    const count = data.length;
    const avg = count > 0 ? totalRev / count : 0;

    if (totalRevenueEl) totalRevenueEl.textContent = formatIDR(totalRev);
    if (transactionCountEl) transactionCountEl.textContent = count + ' Transaksi';
    if (averageRevenueEl) averageRevenueEl.textContent = formatIDR(avg);

    const dailyMap = [
      { day: 'Kam', date: '2026-08-20', revenue: 1200000, count: 5 },
      { day: 'Jum', date: '2026-08-21', revenue: 1900000, count: 7 },
      { day: 'Sab', date: '2026-08-22', revenue: 1600000, count: 6 },
      { day: 'Min', date: '2026-08-23', revenue: 2300000, count: 8 },
      { day: 'Sen', date: '2026-08-24', revenue: 2850000, count: 11 },
      { day: 'Sel', date: '2026-08-25', revenue: 2600000, count: 10 },
      { day: 'Rab', date: '2026-08-26', revenue: 3450000, count: 14 }
    ];

    renderResponsiveBarChart(dailyMap);
  }

  // Terapkan preset periode bawaan agar rentang tanggal dan data selalu sinkron.
  if (periodPresetSelect) setDatePreset(periodPresetSelect.value);

  loadReport();
});
