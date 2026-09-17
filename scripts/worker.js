/**
 * AFWO Hair Design - Worker Directory Script
 * Handles Karyawan list view, filters, search, sorting, and detail popup modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Comprehensive mock data for workers matching the fields in edit-worker.html
  const workersData = [
    {
      id: 'agus-pratama',
      name: 'Agus Pratama',
      phone: '+62 81211112222',
      salary: 3500000,
      commissionScheme: 'per_service',
      commissionSchemeLabel: 'Komisi Per Layanan',
      commissionRate: 'Tiap Layanan Berbeda'
    },
    {
      id: 'rina-susanti',
      name: 'Rina Susanti',
      phone: '+62 81333334444',
      salary: 3200000,
      commissionScheme: 'daily_percentage',
      commissionSchemeLabel: 'Persen Omset Harian',
      commissionRate: '10%'
    },
    {
      id: 'budi-gunawan',
      name: 'Budi Gunawan',
      phone: '+62 81555556666',
      salary: 3000000,
      commissionScheme: 'per_service',
      commissionSchemeLabel: 'Komisi Per Layanan',
      commissionRate: 'Tiap Layanan Berbeda'
    },
    {
      id: 'siti-aminah',
      name: 'Siti Aminah',
      phone: '+62 81777778888',
      salary: 2800000,
      commissionScheme: 'daily_percentage',
      commissionSchemeLabel: 'Persen Omset Harian',
      commissionRate: '10%'
    },
    {
      id: 'joko-widodo',
      name: 'Joko Widodo',
      phone: '+62 81999990000',
      salary: 3000000,
      commissionScheme: 'per_service',
      commissionSchemeLabel: 'Komisi Per Layanan',
      commissionRate: 'Tiap Layanan Berbeda'
    }
  ];

  // DOM Elements
  const searchInput = document.getElementById('worker-search');
  const sortSelect = document.getElementById('worker-sort-select');
  const mobileSortSelect = document.getElementById('worker-mobile-sort-select');
  const mobileSchemeSelect = document.getElementById('worker-mobile-scheme-select');
  const filterTabs = document.querySelectorAll('.worker-filter-tab');
  const tableBody = document.getElementById('worker-table-body');
  const emptyState = document.getElementById('worker-empty-state');

  // Modal Elements
  const detailModal = document.getElementById('worker-detail-modal');
  const btnCloseModal = document.getElementById('btn-close-worker-modal');
  const mdlName = document.getElementById('mdl-worker-name');
  const mdlPhone = document.getElementById('mdl-worker-phone');
  const mdlSalary = document.getElementById('mdl-worker-salary');
  const mdlScheme = document.getElementById('mdl-worker-scheme');
  const mdlRate = document.getElementById('mdl-worker-rate');
  const mdlBtnEdit = document.getElementById('mdl-btn-worker-edit');

  let activeSchemeFilter = 'all';

  function formatIDR(amount) {
    return 'Rp' + Number(amount).toLocaleString('id-ID');
  }

  function openWorkerModal(worker) {
    if (!detailModal) return;
    if (mdlName) mdlName.textContent = worker.name;
    if (mdlPhone) mdlPhone.textContent = worker.phone;
    if (mdlSalary) mdlSalary.textContent = formatIDR(worker.salary);
    if (mdlScheme) mdlScheme.textContent = worker.commissionSchemeLabel;
    if (mdlRate) mdlRate.textContent = worker.commissionRate;

    if (mdlBtnEdit) mdlBtnEdit.href = `edit-worker.html?mode=edit&id=${worker.id}`;

    detailModal.classList.add('is-open');
  }

  function closeWorkerModal() {
    if (detailModal) detailModal.classList.remove('is-open');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeWorkerModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeWorkerModal();
    });
  }

  // Render Worker Table Rows
  function renderWorkers() {
    let filtered = [...workersData];
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Scheme Filter
    if (activeSchemeFilter !== 'all') {
      filtered = filtered.filter(w => w.commissionScheme === activeSchemeFilter);
    }

    // Search Query Filter
    if (query) {
      filtered = filtered.filter(w => {
        return w.name.toLowerCase().includes(query) ||
               w.phone.toLowerCase().includes(query) ||
               w.commissionSchemeLabel.toLowerCase().includes(query);
      });
    }

    // Sorting
    const sortVal = sortSelect ? sortSelect.value : (mobileSortSelect ? mobileSortSelect.value : 'name-asc');
    if (sortVal === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'salary-desc') {
      filtered.sort((a, b) => b.salary - a.salary);
    } else if (sortVal === 'salary-asc') {
      filtered.sort((a, b) => a.salary - b.salary);
    } else if (sortVal === 'scheme') {
      filtered.sort((a, b) => a.commissionSchemeLabel.localeCompare(b.commissionSchemeLabel));
    }

    // Handle Empty State
    if (filtered.length === 0) {
      if (tableBody) tableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (tableBody) {
      tableBody.innerHTML = filtered.map((worker) => {
        let schemeBadgeClass = worker.commissionScheme === 'daily_percentage' ? 'badge-loyal' : 'badge-vip';

        return `
          <tr data-worker-id="${worker.id}" class="js-worker-row">
            <td>
              <span class="worker-name-title">${worker.name}</span>
            </td>
            <td class="col-phone">
              <span class="worker-phone-num">${worker.phone}</span>
            </td>
            <td class="col-salary">
              <strong style="color: var(--text-primary); font-size: 0.88rem;">${formatIDR(worker.salary)}</strong>
            </td>
            <td class="col-scheme">
              <span class="client-segment-badge ${schemeBadgeClass}">${worker.commissionSchemeLabel}</span>
            </td>
            <td class="col-rate">
              <span style="font-weight: 700; color: var(--text-primary); font-size: 0.84rem;">${worker.commissionRate}</span>
            </td>
            <td style="text-align: right;" onclick="event.stopPropagation();">
              <div class="worker-actions-cell">
                <a href="edit-worker.html?mode=edit&id=${worker.id}" class="btn-worker-action btn-worker-edit">Edit</a>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Attach row click listeners for detail modal
      tableBody.querySelectorAll('.js-worker-row').forEach(row => {
        row.addEventListener('click', () => {
          const workerId = row.getAttribute('data-worker-id');
          const found = workersData.find(w => w.id === workerId);
          if (found) openWorkerModal(found);
        });
      });
    }
  }

  // Desktop Filter Tabs Event
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeSchemeFilter = tab.getAttribute('data-scheme') || tab.getAttribute('data-filter') || 'all';
      if (mobileSchemeSelect) mobileSchemeSelect.value = activeSchemeFilter;
      renderWorkers();
    });
  });

  // Mobile Scheme Select Event
  if (mobileSchemeSelect) {
    mobileSchemeSelect.addEventListener('change', (e) => {
      activeSchemeFilter = e.target.value;
      filterTabs.forEach(t => {
        t.classList.toggle('active', (t.getAttribute('data-scheme') || 'all') === activeSchemeFilter);
      });
      renderWorkers();
    });
  }

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', renderWorkers);
  }

  // Desktop Sort Select Events
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      if (mobileSortSelect) mobileSortSelect.value = e.target.value;
      renderWorkers();
    });
  }

  // Mobile Sort Select Events
  if (mobileSortSelect) {
    mobileSortSelect.addEventListener('change', (e) => {
      if (sortSelect) sortSelect.value = e.target.value;
      renderWorkers();
    });
  }

  // Initial Render
  renderWorkers();
});
