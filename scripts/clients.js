/**
 * AFWO Hair Design - Client Directory Script
 * Data, filtering, search, sorting, and detail popup modal for Pelanggan module.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Comprehensive mock client data matching all fields
  const clientsData = [
    {
      id: 'budi-santoso',
      name: 'Budi Santoso',
      phone: '+62 81345678901',
      instagram: '@budisantoso.re',
      gender: 'Laki-laki',
      hairType: 'Lurus',
      hairCondition: 'Sehat',
      domicile: 'Kelapa Gading, Jakarta Utara',
      specialNotes: 'Pembersihan ketombe berkala.'
    },
    {
      id: 'dewi-anggraini',
      name: 'Dewi Anggraini',
      phone: '+62 81233445566',
      instagram: '@dewi_anggraini',
      gender: 'Perempuan',
      hairType: 'Keriting',
      hairCondition: 'Rusak',
      domicile: 'Serpong, BSD City, Tangerang',
      specialNotes: 'Ujung rambut bercabang parah, disarankan keratin treatment rutin.'
    },
    {
      id: 'eleanor-vance',
      name: 'Eleanor Vance',
      phone: '+62 8112233445',
      instagram: '@eleanor.v',
      gender: 'Perempuan',
      hairType: 'Lurus',
      hairCondition: 'Sehat',
      domicile: 'Kebayoran Baru, Jakarta Selatan',
      specialNotes: 'Kulit kepala sensitif, hindari air terlalu panas. Suka aroma floral.'
    },
    {
      id: 'marcus-sterling',
      name: 'Marcus Sterling',
      phone: '+62 81899001122',
      instagram: '@m.sterling_id',
      gender: 'Laki-laki',
      hairType: 'Ikal',
      hairCondition: 'Sehat',
      domicile: 'Pondok Indah, Jakarta Selatan',
      specialNotes: 'Potong fade tipis samping, styling gunakan matte clay.'
    },
    {
      id: 'melati-putri',
      name: 'Melati Putri',
      phone: '+62 81711223344',
      instagram: '@melati.hair',
      gender: 'Perempuan',
      hairType: 'Gelombang',
      hairCondition: 'Agak Rusak',
      domicile: 'Bintaro Jaya Sektor 9, Tangerang Selatan',
      specialNotes: 'Riwayat bleaching 2x, butuh ekstra serum sebelum blow dry.'
    },
    {
      id: 'sari-handayani',
      name: 'Sari Handayani',
      phone: '+62 81298765432',
      instagram: '@sari_handayani',
      gender: 'Perempuan',
      hairType: 'Lurus',
      hairCondition: 'Sehat',
      domicile: 'Tebet Timur, Jakarta Selatan',
      specialNotes: 'Rutin creambath 2 minggu sekali, lebih nyaman dengan Stylist Rina.'
    }
  ];

  // DOM Elements
  const searchInput = document.getElementById('client-search');
  const sortSelect = document.getElementById('client-sort-select');
  const mobileSortSelect = document.getElementById('client-mobile-sort-select');
  const mobileConditionSelect = document.getElementById('client-mobile-condition-select');
  const filterTabs = document.querySelectorAll('.client-filter-tab');
  const tableBody = document.getElementById('client-table-body');
  const emptyState = document.getElementById('clients-empty-state');

  // Modal Elements
  const detailModal = document.getElementById('client-detail-modal');
  const btnCloseModal = document.getElementById('btn-close-client-modal');
  const mdlName = document.getElementById('mdl-client-name');
  const mdlPhone = document.getElementById('mdl-client-phone');
  const mdlInstagram = document.getElementById('mdl-client-instagram');
  const mdlGender = document.getElementById('mdl-client-gender');
  const mdlHairType = document.getElementById('mdl-client-hair-type');
  const mdlHairCondition = document.getElementById('mdl-client-hair-condition');
  const mdlDomicile = document.getElementById('mdl-client-domicile');
  const mdlNotes = document.getElementById('mdl-client-notes');
  const mdlBtnEdit = document.getElementById('mdl-btn-edit');
  const mdlBtnAppointment = document.getElementById('mdl-btn-appointment');

  let activeConditionFilter = 'all';

  function openDetailModal(client) {
    if (!detailModal) return;
    if (mdlName) mdlName.textContent = client.name;
    if (mdlPhone) mdlPhone.textContent = client.phone;
    if (mdlInstagram) mdlInstagram.textContent = client.instagram || '-';
    if (mdlGender) mdlGender.textContent = client.gender;
    if (mdlHairType) mdlHairType.textContent = client.hairType;
    if (mdlHairCondition) mdlHairCondition.textContent = client.hairCondition;
    if (mdlDomicile) mdlDomicile.textContent = client.domicile || '-';
    if (mdlNotes) mdlNotes.textContent = client.specialNotes || 'Tidak ada catatan khusus.';

    if (mdlBtnEdit) mdlBtnEdit.href = `edit-pelanggan.html?mode=edit&id=${client.id}`;
    if (mdlBtnAppointment) mdlBtnAppointment.href = `add-appointment.html?clientId=${client.id}&from=clients`;

    detailModal.classList.add('is-open');
  }

  function closeDetailModal() {
    if (detailModal) detailModal.classList.remove('is-open');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeDetailModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  // Render Table Rows (Focused strictly on important columns)
  function renderClients() {
    let filtered = [...clientsData];
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Condition Filter
    if (activeConditionFilter !== 'all') {
      filtered = filtered.filter(c => {
        const condSlug = c.hairCondition.toLowerCase().replace(/\s+/g, '-');
        return condSlug === activeConditionFilter;
      });
    }

    // Search Query Filter
    if (query) {
      filtered = filtered.filter(c => {
        return c.name.toLowerCase().includes(query) ||
               c.phone.toLowerCase().includes(query) ||
               c.instagram.toLowerCase().includes(query) ||
               c.domicile.toLowerCase().includes(query) ||
               c.hairType.toLowerCase().includes(query) ||
               c.specialNotes.toLowerCase().includes(query);
      });
    }

    // Sorting
    const sortVal = sortSelect ? sortSelect.value : (mobileSortSelect ? mobileSortSelect.value : 'name-asc');
    if (sortVal === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'hair-type') {
      filtered.sort((a, b) => a.hairType.localeCompare(b.hairType));
    } else if (sortVal === 'condition') {
      filtered.sort((a, b) => a.hairCondition.localeCompare(b.hairCondition));
    }

    // Handle Empty State
    if (filtered.length === 0) {
      if (tableBody) tableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (tableBody) {
      tableBody.innerHTML = filtered.map((client, index) => {
        let conditionClass = 'condition-sehat';
        if (client.hairCondition === 'Agak Rusak') conditionClass = 'condition-agak-rusak';
        else if (client.hairCondition === 'Rusak') conditionClass = 'condition-rusak';

        return `
          <tr data-client-id="${client.id}" class="js-client-row">
            <td>
              <span class="client-name-title">${client.name}</span>
            </td>
            <td class="col-phone">
              <span class="client-phone-num">${client.phone}</span>
            </td>
            <td class="col-gender">
              <span class="gender-tag">${client.gender}</span>
            </td>
            <td class="col-hair-type">
              <span class="hair-type-badge">${client.hairType}</span>
            </td>
            <td class="col-condition">
              <span class="condition-badge ${conditionClass}">${client.hairCondition}</span>
            </td>
            <td class="col-notes">
              <span class="client-notes-ellipsis" title="${client.specialNotes}">${client.specialNotes}</span>
            </td>
            <td style="text-align: right;" onclick="event.stopPropagation();">
              <div class="client-actions-cell">
                <a href="edit-pelanggan.html?mode=edit&id=${client.id}" class="btn-client-action btn-client-edit">Edit</a>
                <a href="add-appointment.html?clientId=${client.id}&from=clients" class="btn-client-action btn-client-schedule">+ Janji</a>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Attach row click listeners for detail modal
      tableBody.querySelectorAll('.js-client-row').forEach(row => {
        row.addEventListener('click', () => {
          const clientId = row.getAttribute('data-client-id');
          const found = clientsData.find(c => c.id === clientId);
          if (found) openDetailModal(found);
        });
      });
    }
  }

  // Desktop Filter Tabs Event
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeConditionFilter = tab.getAttribute('data-filter') || 'all';
      if (mobileConditionSelect) mobileConditionSelect.value = activeConditionFilter;
      renderClients();
    });
  });

  // Mobile Condition Select Event
  if (mobileConditionSelect) {
    mobileConditionSelect.addEventListener('change', (e) => {
      activeConditionFilter = e.target.value;
      filterTabs.forEach(t => {
        t.classList.toggle('active', (t.getAttribute('data-filter') || 'all') === activeConditionFilter);
      });
      renderClients();
    });
  }

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', renderClients);
  }

  // Desktop Sort Select Event
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      if (mobileSortSelect) mobileSortSelect.value = e.target.value;
      renderClients();
    });
  }

  // Mobile Sort Select Event
  if (mobileSortSelect) {
    mobileSortSelect.addEventListener('change', (e) => {
      if (sortSelect) sortSelect.value = e.target.value;
      renderClients();
    });
  }

  // Initial Render
  renderClients();
});
