/**
 * AFWO Hair Design - CRM Dashboard Script
 * Handles real-time KPI card hydration, dynamic SVG income trend area chart rendering,
 * today's transactions table rendering, low stock alerts, and popular services rankings.
 * 
 * TODO INTEGRASI DATABASE BACKEND:
 * Ganti data mock di `dashboardStore` dengan pemanggilan API:
 *   const response = await fetch('/api/dashboard/summary');
 *   const data = await response.json();
 *   renderDashboard(data);
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================================
  // 1. DATABASE STORE / MOCK SUMMARY PAYLOAD
  // =========================================================================
  const dashboardStore = {
    dateFormatted: "Rabu, 26 Agustus 2026",
    todayIncome: 3450000,
    incomeGrowth: "+18% dari kemarin",
    newClientsCount: 6,
    todayTransactionsCount: 14,
    lowStockCount: 3,
    incomeTrend: [
      { day: "Kam", income: 1200000 },
      { day: "Jum", income: 1900000 },
      { day: "Sab", income: 1600000 },
      { day: "Min", income: 2300000 },
      { day: "Sen", income: 2850000 },
      { day: "Sel", income: 2600000 },
      { day: "Rab", income: 3450000 }
    ],
    todayTransactions: [
      { id: "TRX-0231", client: "Sari Handayani", service: "Creambath, Blow", time: "09:20", total: 180000 },
      { id: "TRX-0232", client: "Budi Santoso", service: "Potong Rambut", time: "10:05", total: 75000 },
      { id: "TRX-0233", client: "Melati Putri", service: "Coloring", time: "11:40", total: 650000 },
      { id: "TRX-0234", client: "Dewi Anggraini", service: "Smoothing", time: "13:15", total: 850000 }
    ],
    lowStockProducts: [
      { code: "SH", name: "Shampoo Keratin", brand: "L'Oreal", category: "Perawatan", stock: 2 },
      { code: "HG", name: "Hair Gel", brand: "Gatsby", category: "Styling", stock: 3 },
      { code: "MW", name: "Masker Wajah", brand: "Perawatan", category: "Perawatan", stock: 1 }
    ],
    popularServices: [
      { name: "Potong Rambut", count: "32x" },
      { name: "Creambath", count: "21x" },
      { name: "Coloring", count: "14x" },
      { name: "Smoothing", count: "9x" }
    ]
  };

  // =========================================================================
  // 2. RENDER FUNCTIONS
  // =========================================================================

  function formatRupiah(num) {
    return `Rp${num.toLocaleString('id-ID')}`;
  }

  /**
   * Render Top KPI Cards & Greeting
   */
  function renderKPICards(data) {
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeSubtitle = document.getElementById('welcome-subtitle');
    const todayIncomeEl = document.getElementById('today-income');
    const todayGrowthEl = document.getElementById('today-growth');
    const newClientsEl = document.getElementById('new-clients-count');
    const todayTransEl = document.getElementById('today-transactions-count');
    const lowStockEl = document.getElementById('low-stock-count');

    if (welcomeTitle) {
      welcomeTitle.textContent = 'Selamat datang kembali';
    }
    if (welcomeSubtitle && data.dateFormatted) {
      welcomeSubtitle.textContent = `Ringkasan aktivitas hari ini, ${data.dateFormatted}.`;
    }
    if (todayIncomeEl) {
      todayIncomeEl.textContent = formatRupiah(data.todayIncome);
    }
    if (todayGrowthEl && data.incomeGrowth) {
      todayGrowthEl.textContent = data.incomeGrowth;
    }
    if (newClientsEl) {
      newClientsEl.textContent = data.newClientsCount.toString();
    }
    if (todayTransEl) {
      todayTransEl.textContent = data.todayTransactionsCount.toString();
    }
    if (lowStockEl) {
      lowStockEl.textContent = data.lowStockCount.toString();
    }
  }

  /**
   * Dynamic SVG Area & Line Chart Generator (Smooth Curve)
   */
  function renderIncomeTrendChart(trendData) {
    const areaPath = document.getElementById('chart-area-path');
    const linePath = document.getElementById('chart-line-path');
    const pointsGroup = document.getElementById('chart-points-group');
    const axisDays = document.getElementById('chart-axis-days');

    if (!trendData || trendData.length === 0) return;

    const svgWidth = 600;
    const paddingX = 20;
    const chartHeight = 95; // max amplitude
    const groundY = 142;     // baseline bottom Y
    const topY = 25;         // highest top Y

    const maxIncome = Math.max(...trendData.map(d => d.income), 1);
    const minIncome = Math.min(...trendData.map(d => d.income), 0);
    const range = maxIncome - (minIncome * 0.5) || 1;

    const numPoints = trendData.length;
    const stepX = (svgWidth - paddingX * 2) / (numPoints - 1);

    const points = trendData.map((d, idx) => {
      const x = paddingX + idx * stepX;
      const normalized = (d.income - minIncome * 0.5) / range;
      const y = groundY - normalized * chartHeight;
      return { x, y, day: d.day, income: d.income };
    });

    // Build smooth cubic bezier curve
    function buildSmoothPath(pts) {
      if (pts.length === 0) return '';
      let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) * 0.5;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) * 0.5;
        const cpY2 = p1.y;
        d += ` C ${cpX1.toFixed(1)},${cpY1.toFixed(1)} ${cpX2.toFixed(1)},${cpY2.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
      }
      return d;
    }

    const linePathD = buildSmoothPath(points);
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const areaPathD = `${linePathD} L ${lastX},${groundY} L ${firstX},${groundY} Z`;

    if (linePath) linePath.setAttribute('d', linePathD);
    if (areaPath) areaPath.setAttribute('d', areaPathD);

    // Render interactive data points
    if (pointsGroup) {
      pointsGroup.innerHTML = '';
      points.forEach(pt => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x.toFixed(1));
        circle.setAttribute('cy', pt.y.toFixed(1));
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', 'var(--surface)');
        circle.setAttribute('stroke', 'var(--chart-series-1)');
        circle.setAttribute('stroke-width', '2.5');
        circle.setAttribute('class', 'chart-interactive-point');

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${pt.day}: ${formatRupiah(pt.income)}`;
        circle.appendChild(title);

        pointsGroup.appendChild(circle);
      });
    }

    // Update X-Axis Days
    if (axisDays) {
      axisDays.innerHTML = trendData.map(d => `<span>${d.day}</span>`).join('');
    }
  }

  /**
   * Render Today's Transactions Table
   */
  function renderTodayTransactions(transactions) {
    const tbody = document.getElementById('today-transactions-body');
    if (!tbody || !transactions) return;

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td><span class="trans-no-badge">${t.id}</span></td>
        <td><span class="trans-client-name">${t.client}</span></td>
        <td><span class="trans-service-text">${t.service}</span></td>
        <td><span class="trans-time-text">${t.time}</span></td>
        <td><span class="trans-total-bold">${formatRupiah(t.total)}</span></td>
      </tr>
    `).join('');
  }

  /**
   * Render Low Stock Products
   */
  function renderLowStockProducts(products) {
    const container = document.getElementById('low-stock-list-container');
    if (!container || !products) return;

    container.innerHTML = products.map(p => `
      <div class="low-stock-item">
        <div class="low-stock-left">
          <div class="stock-initial-badge">${p.code}</div>
          <div class="stock-item-info">
            <span class="stock-item-name">${p.name}</span>
            <span class="stock-item-category">${p.brand ? `${p.brand} • ` : ''}${p.category}</span>
          </div>
        </div>
        <span class="badge-stock-danger">${p.stock} pcs</span>
      </div>
    `).join('');
  }

  /**
   * Render Popular Services
   */
  function renderPopularServices(services) {
    const container = document.getElementById('popular-services-container');
    if (!container || !services) return;

    container.innerHTML = services.map(s => `
      <div class="popular-service-row">
        <span class="service-row-name">${s.name}</span>
        <span class="service-row-count">${s.count}</span>
      </div>
    `).join('');
  }

  /**
   * Master Initializer
   */
  function initDashboard() {
    renderKPICards(dashboardStore);
    renderIncomeTrendChart(dashboardStore.incomeTrend);
    renderTodayTransactions(dashboardStore.todayTransactions);
    renderLowStockProducts(dashboardStore.lowStockProducts);
    renderPopularServices(dashboardStore.popularServices);

    console.log('[AFWO CRM] Dashboard hydrated successfully with Database Ready Architecture.');
  }

  initDashboard();
});
