/**
 * AFWO Hair Design - Worker Directory Script (Exact Form Match)
 * Columns strictly aligned with Form Tambah/Edit Karyawan:
 * Nama Lengkap, Kontak (No. WA/Telp), Gaji Pokok (per bulan), Skema Komisi, Persen Komisi Harian.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Comprehensive Worker Database matching Form fields
  const workersData = [
    {
      id: 'agus-pratama',
      name: 'Agus Pratama',
      countryCode: '+62',
      phone: '+62 81112202005',
      salary: 4000000,
      commissionScheme: 'daily_percentage',
      commissionSchemeLabel: 'Persen Omset Harian',
      commissionRate: '10%',
      avatar: 'AP',
      color: '#E5A93C',
      bg: '#FFFBEB'
    },
    {
      id: 'ada-wong',
      name: 'Ada Wong',
      countryCode: '+62',
      phone: '+62 81234567890',
      salary: 4500000,
      commissionScheme: 'daily_percentage',
      commissionSchemeLabel: 'Persen Omset Harian',
      commissionRate: '10%',
      avatar: 'AW',
      color: '#EC4899',
      bg: '#FCE7F3'
    },
    {
      id: 'budi',
      name: 'Budi',
      countryCode: '+62',
      phone: '+62 81398765432',
      salary: 4200000,
      commissionScheme: 'per_service',
      commissionSchemeLabel: 'Per Layanan (Flat Tarif)',
      commissionRate: 'Sesuai Tarif Layanan',
      avatar: 'BD',
      color: '#3B82F6',
      bg: '#DBEAFE'
    },
    {
      id: 'rina',
      name: 'Rina',
      countryCode: '+62',
      phone: '+62 81855543210',
      salary: 3800000,
      commissionScheme: 'daily_percentage',
      commissionSchemeLabel: 'Persen Omset Harian',
      commissionRate: '10%',
      avatar: 'RN',
      color: '#10B981',
      bg: '#D1FAE5'
    },
    {
      id: 'dimas',
      name: 'Dimas',
      countryCode: '+62',
      phone: '+62 81900112233',
      salary: 3800000,
      commissionScheme: 'per_service',
      commissionSchemeLabel: 'Per Layanan (Flat Tarif)',
      commissionRate: 'Sesuai Tarif Layanan',
      avatar: 'DM',
      color: '#8B5CF6',
      bg: '#EDE9FE'
    }
  ];

  // DOM Elements
  const searchInput = document.getElementById('worker-search');
  const sortSelect = document.getElementById('worker-sort-select');
  const filterTabs = document.querySelectorAll('.worker-filter-tab');
  const tableBody = document.getElementById('worker-table-body');
  const emptyState = document.getElementById('worker-empty-state');
  const totalBadge = document.getElementById('worker-total-badge');

  let activeScheme = 'all';

  function formatIDR(val) {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID') + ',00';
  }

  function renderWorkers() {
    const query = (searchInput ? searchInput.value.toLowerCase().trim() : '');
    const sortBy = (sortSelect ? sortSelect.value : 'name-asc');

    // Filter
    let filtered = workersData.filter(w => {
      // Scheme Filter
      if (activeScheme !== 'all' && w.commissionScheme !== activeScheme) return false;

      // Search Query
      if (query) {
        const matchName = w.name.toLowerCase().includes(query);
        const matchPhone = w.phone.includes(query);
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'salary-desc') {
      filtered.sort((a, b) => b.salary - a.salary);
    }

    if (totalBadge) totalBadge.textContent = `${filtered.length} Karyawan`;

    // Render Table or Empty State
    if (filtered.length === 0) {
      if (tableBody) tableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (tableBody) {
      tableBody.innerHTML = filtered.map((worker, index) => {
        let schemeBadgeClass = worker.commissionScheme === 'daily_percentage' ? 'badge-loyal' : 'badge-vip';

        return `
          <tr>
            <td style="font-weight: 700; color: var(--text-muted);">${index + 1}</td>
            <td>
              <div class="worker-avatar-cell">
                <div class="worker-avatar-box" style="background-color: ${worker.bg}; color: ${worker.color};">${worker.avatar}</div>
                <div>
                  <a href="edit-worker.html?mode=edit&id=${worker.id}" class="worker-name-title">${worker.name}</a>
                </div>
              </div>
            </td>
            <td>
              <span class="worker-phone-num">${worker.phone}</span>
            </td>
            <td>
              <strong style="color: var(--text-primary); font-size: 0.88rem;">${formatIDR(worker.salary)}</strong>
            </td>
            <td>
              <span class="client-segment-badge ${schemeBadgeClass}">${worker.commissionSchemeLabel}</span>
            </td>
            <td>
              <span style="font-weight: 700; color: var(--text-primary); font-size: 0.85rem;">${worker.commissionRate}</span>
            </td>
            <td style="text-align: right;">
              <div class="worker-actions-cell">
                <a href="edit-worker.html?mode=edit&id=${worker.id}" class="btn-worker-action btn-worker-edit">Edit</a>
                <a href="add-appointment.html?workerId=${worker.id}" class="btn-worker-action btn-worker-schedule">+ Janji Temu</a>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', renderWorkers);
  if (sortSelect) sortSelect.addEventListener('change', renderWorkers);

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeScheme = tab.getAttribute('data-scheme') || 'all';
      renderWorkers();
    });
  });

  // Initial Render
  renderWorkers();

});
