/**
 * AFWO Hair Design - Customer Directory Script (Exact Form Match)
 * Columns strictly aligned with Form Tambah/Edit Pelanggan:
 * Nama, No. WA, Username IG, Jenis Kelamin, Jenis Rambut, Kondisi Rambut, Alamat, Catatan Khusus.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Comprehensive Client Database matching the Form fields
  const clientsData = [
    {
      id: 'eleanor-vance',
      name: 'Eleanor Vance',
      countryCode: '+62',
      phone: '+62 8112233445',
      instagram: '@eleanor.vance',
      gender: 'Perempuan',
      hairType: 'Gelombang',
      hairCondition: 'Agak Rusak',
      address: 'Jl. Senopati No. 45, Surabaya Barat',
      notes: 'Sensitif terhadap amonia, lebih suka pewarnaan organik balayage.',
      avatar: 'EV'
    },
    {
      id: 'melati-putri',
      name: 'Melati Putri',
      countryCode: '+62',
      phone: '+62 81711223344',
      instagram: '@melati.putri',
      gender: 'Perempuan',
      hairType: 'Gelombang',
      hairCondition: 'Rusak',
      address: 'Graha Famili Blok C-12, Surabaya Barat',
      notes: 'Riwayat bleaching berulang, butuh masker keratin intensif.',
      avatar: 'MP'
    },
    {
      id: 'sari-handayani',
      name: 'Sari Handayani',
      countryCode: '+62',
      phone: '+62 81298765432',
      instagram: '@sari_handayani',
      gender: 'Perempuan',
      hairType: 'Lurus',
      hairCondition: 'Sehat',
      address: 'Tegalsari No. 88, Surabaya Pusat',
      notes: 'Potongan layer bob, creambath & blow dry rutin.',
      avatar: 'SH'
    },
    {
      id: 'marcus-sterling',
      name: 'Marcus Sterling',
      countryCode: '+62',
      phone: '+62 81899001122',
      instagram: '@marcus_sterling',
      gender: 'Laki-laki',
      hairType: 'Keriting',
      hairCondition: 'Sehat',
      address: 'Citraland Puri Golf, Surabaya Barat',
      notes: 'Signature executive grooming, styling pomade matte.',
      avatar: 'MS'
    },
    {
      id: 'budi-santoso',
      name: 'Budi Santoso',
      countryCode: '+62',
      phone: '+62 81345678901',
      instagram: '@budi_santoso99',
      gender: 'Laki-laki',
      hairType: 'Lurus',
      hairCondition: 'Sehat',
      address: 'Mulyorejo Timur No. 15, Surabaya Timur',
      notes: 'Grooming & cut rutin setiap 3 minggu.',
      avatar: 'BS'
    },
    {
      id: 'dewi-anggraini',
      name: 'Dewi Anggraini',
      countryCode: '+62',
      phone: '+62 81233445566',
      instagram: '@dewi.anggraini',
      gender: 'Perempuan',
      hairType: 'Ikal',
      hairCondition: 'Agak Rusak',
      address: 'Gayungan PTT No. 4, Surabaya Selatan',
      notes: 'Hair tonic treatment & anti hair-fall serum.',
      avatar: 'DA'
    }
  ];

  // DOM Elements
  const searchInput = document.getElementById('client-search');
  const sortSelect = document.getElementById('client-sort-select');
  const filterTabs = document.querySelectorAll('.client-filter-tab');
  const tableBody = document.getElementById('client-table-body');
  const emptyState = document.getElementById('clients-empty-state');
  const totalBadge = document.getElementById('client-total-badge');

  let activeFilter = 'all';

  function renderClients() {
    const query = (searchInput ? searchInput.value.toLowerCase().trim() : '');
    const sortBy = (sortSelect ? sortSelect.value : 'name-asc');

    // Filter
    let filtered = clientsData.filter(c => {
      // Condition Filter
      if (activeFilter === 'sehat' && c.hairCondition !== 'Sehat') return false;
      if (activeFilter === 'agak-rusak' && c.hairCondition !== 'Agak Rusak') return false;
      if (activeFilter === 'rusak' && c.hairCondition !== 'Rusak') return false;

      // Search Query
      if (query) {
        const matchName = c.name.toLowerCase().includes(query);
        const matchPhone = c.phone.includes(query);
        const matchIg = c.instagram.toLowerCase().includes(query);
        const matchHair = c.hairType.toLowerCase().includes(query);
        const matchCond = c.hairCondition.toLowerCase().includes(query);
        const matchAddress = c.address.toLowerCase().includes(query);
        const matchNotes = c.notes.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchIg && !matchHair && !matchCond && !matchAddress && !matchNotes) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'hair-type') {
      filtered.sort((a, b) => a.hairType.localeCompare(b.hairType));
    } else if (sortBy === 'condition') {
      filtered.sort((a, b) => a.hairCondition.localeCompare(b.hairCondition));
    }

    if (totalBadge) totalBadge.textContent = `${filtered.length} Pelanggan`;

    // Render Table or Empty State
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
          <tr>
            <td style="font-weight: 700; color: var(--text-muted);">${index + 1}</td>
            <td>
              <div class="client-avatar-cell">
                <div class="client-avatar-box">${client.avatar}</div>
                <div>
                  <a href="profil-pelanggan.html?id=${client.id}" class="client-name-title">${client.name}</a>
                </div>
              </div>
            </td>
            <td>
              <span class="client-phone-num">${client.phone}</span>
            </td>
            <td>
              <span style="font-size: 0.84rem; color: var(--text-secondary); font-weight: 600;">${client.instagram}</span>
            </td>
            <td>
              <span class="gender-tag">${client.gender}</span>
            </td>
            <td>
              <span class="hair-type-badge">${client.hairType}</span>
            </td>
            <td>
              <span class="condition-badge ${conditionClass}">${client.hairCondition}</span>
            </td>
            <td>
              <span style="font-size: 0.82rem; color: var(--text-primary); max-width: 220px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${client.address}">${client.address}</span>
            </td>
            <td>
              <span style="font-size: 0.8rem; color: var(--text-muted); max-width: 240px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${client.notes}">${client.notes}</span>
            </td>
            <td style="text-align: right;">
              <div class="client-actions-cell">
                <a href="profil-pelanggan.html?id=${client.id}" class="btn-client-action btn-profile-link">Profil</a>
                <a href="edit-pelanggan.html?mode=edit&id=${client.id}" class="btn-client-action btn-profile-link">Edit</a>
                <a href="add-appointment.html?clientId=${client.id}" class="btn-client-action btn-appointment-link">+ Janji Temu</a>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', renderClients);
  if (sortSelect) sortSelect.addEventListener('change', renderClients);

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      renderClients();
    });
  });

  // Initial Render
  renderClients();

});
