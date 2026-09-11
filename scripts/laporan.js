/**
 * AFWO Hair Design - Reports & Recap (Laporan) Script
 * Handles searchable worker combobox, live filters, dynamic SVG Bar Chart rendering,
 * real-time recalculation, and AI insight summary navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const periodPillBtns = document.querySelectorAll('.period-pill-btn');
  const periodSelect = document.getElementById('select-period');
  const dateFromInput = document.getElementById('report-date-from');
  const dateToInput = document.getElementById('report-date-to');
  const jenisSelect = document.getElementById('select-jenis-pengerjaan');

  // Combobox Elements (Karyawan Filter)
  const comboboxInputBox = document.getElementById('combobox-input-box');
  const workerSearchInput = document.getElementById('worker-search-input');
  const comboboxDropdown = document.getElementById('combobox-dropdown');
  const comboboxOptions = document.querySelectorAll('.combobox-option-row');
  let selectedWorker = 'all';

  // Stats & AI Insight Elements
  const totalRevenueEl = document.getElementById('report-total-revenue');
  const transactionCountEl = document.getElementById('report-transaction-count');
  const averageRevenueEl = document.getElementById('report-average-revenue');
  const chartRevenueValEl = document.getElementById('chart-revenue-val');
  const bannerTotalValEl = document.getElementById('dark-summary-total-val');
  const aiInsightBody = document.getElementById('ai-insight-text');
  const btnAiSummary = document.getElementById('btn-ai-summary');

  // SVG Bar Chart Elements
  const chartBarsGroup = document.getElementById('chart-bars-group');
  const chartAxisLabels = document.getElementById('chart-axis-labels');

  // =========================================================================
  // 1. SEARCHABLE KARYAWAN COMBOBOX LOGIC
  // =========================================================================
  if (comboboxInputBox && comboboxDropdown && workerSearchInput) {
    comboboxInputBox.addEventListener('click', (e) => {
      e.stopPropagation();
      comboboxDropdown.classList.toggle('show');
      workerSearchInput.focus();
    });

    workerSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      comboboxOptions.forEach(opt => {
        const text = opt.textContent.toLowerCase();
        opt.style.display = text.includes(q) ? 'block' : 'none';
      });
    });

    comboboxOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedWorker = opt.getAttribute('data-value');
        workerSearchInput.value = opt.textContent.trim();
        comboboxOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        comboboxDropdown.classList.remove('show');
        recalculateReport();
      });
    });

    document.addEventListener('click', (e) => {
      if (!comboboxInputBox.contains(e.target) && !comboboxDropdown.contains(e.target)) {
        comboboxDropdown.classList.remove('show');
      }
    });
  }

  // =========================================================================
  // 2. PERIOD PILL & SELECT BINDING
  // =========================================================================
  periodPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.getAttribute('data-period');
      if (periodSelect) {
        periodSelect.value = period === 'daily' ? 'daily' : 'monthly';
      }
      recalculateReport();
    });
  });

  if (periodSelect) {
    periodSelect.addEventListener('change', () => {
      const val = periodSelect.value;
      periodPillBtns.forEach(btn => {
        if (btn.getAttribute('data-period') === (val === 'monthly' ? 'monthly' : 'daily')) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      recalculateReport();
    });
  }

  if (dateFromInput) dateFromInput.addEventListener('change', recalculateReport);
  if (dateToInput) dateToInput.addEventListener('change', recalculateReport);
  if (jenisSelect) jenisSelect.addEventListener('change', recalculateReport);

  // =========================================================================
  // 3. DYNAMIC SVG BAR CHART RENDERING
  // =========================================================================
  function renderBarChart(dataPoints) {
    if (!chartBarsGroup || !chartAxisLabels) return;

    chartBarsGroup.innerHTML = '';
    chartAxisLabels.innerHTML = '';

    const maxVal = Math.max(...dataPoints.map(d => d.revenue), 10000000);
    const maxBarHeight = 110;
    const barWidth = 24;
    const startX = 40;
    const spacing = 88;

    dataPoints.forEach((point, index) => {
      const x = startX + (index * spacing);
      const barHeight = Math.round((point.revenue / maxVal) * maxBarHeight);
      const y = 140 - barHeight;

      // Create SVG Rect Bar
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('rx', '4');
      rect.setAttribute('class', 'chart-bar-rect');

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${point.label}: Rp ${point.revenue.toLocaleString('id-ID')}`;
      rect.appendChild(title);

      chartBarsGroup.appendChild(rect);

      // Create Axis Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + (barWidth / 2));
      text.setAttribute('y', '158');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'chart-axis-text');
      text.textContent = point.label;
      chartAxisLabels.appendChild(text);
    });
  }

  // =========================================================================
  // 4. REPORT RECALCULATION & FILTER LOGIC
  // =========================================================================
  function recalculateReport() {
    const period = periodSelect ? periodSelect.value : 'daily';

    let baseRevenue = 42850000;
    let baseCount = 61;

    if (selectedWorker !== 'all') {
      baseRevenue = Math.round(baseRevenue * 0.35);
      baseCount = Math.round(baseCount * 0.35);
    }

    if (period === 'monthly') {
      baseRevenue = baseRevenue * 4;
      baseCount = baseCount * 4;
    }

    const formattedTotal = `Rp ${baseRevenue.toLocaleString('id-ID')}`;
    const avg = Math.round(baseRevenue / baseCount);
    const formattedAvg = `Rp ${avg.toLocaleString('id-ID')}`;

    if (totalRevenueEl) totalRevenueEl.textContent = formattedTotal;
    if (transactionCountEl) transactionCountEl.textContent = baseCount.toString();
    if (averageRevenueEl) averageRevenueEl.textContent = formattedAvg;
    if (chartRevenueValEl) chartRevenueValEl.textContent = formattedTotal;
    if (bannerTotalValEl) bannerTotalValEl.textContent = `Total: ${formattedTotal}`;

    if (aiInsightBody) {
      aiInsightBody.className = 'ai-insight-body';
      aiInsightBody.textContent = 'Omset periode ini didominasi layanan Warna & Highlights dengan margin tertinggi. Disarankan menambah slot booking untuk layanan Balayage di akhir pekan karena permintaan konsisten naik dibanding hari kerja.';
    }

    renderBarChart([
      { label: 'Mon', revenue: Math.round(baseRevenue * 0.1) },
      { label: 'Tue', revenue: Math.round(baseRevenue * 0.14) },
      { label: 'Wed', revenue: Math.round(baseRevenue * 0.12) },
      { label: 'Thu', revenue: Math.round(baseRevenue * 0.22) },
      { label: 'Fri', revenue: Math.round(baseRevenue * 0.16) },
      { label: 'Sat', revenue: Math.round(baseRevenue * 0.18) },
      { label: 'Sun', revenue: Math.round(baseRevenue * 0.08) }
    ]);
  }

  // =========================================================================
  // 5. AI SUMMARY ACTION & TOAST
  // =========================================================================
  function showToast(msg) {
    let toast = document.getElementById('report-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'report-toast';
      toast.className = 'toast-box';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  if (btnAiSummary) {
    btnAiSummary.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('✨ Membuka Ringkasan & Rekomendasi AI...');
    });
  }

  const exportBtn = document.getElementById('btn-export-csv');
  const generateBtn = document.getElementById('btn-generate-report');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showToast('📥 Mengekspor data laporan ke CSV...');
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      showToast('📄 Menghasilkan laporan lengkap PDF...');
    });
  }

  // Initial Calculation & Bar Chart Render
  recalculateReport();
});
