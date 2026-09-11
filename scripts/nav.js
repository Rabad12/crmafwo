/**
 * AFWO Hair Design - Admin Sidebar & Responsive Navigation Script
 * Manages vertical sidebar interactions, mobile drawer open/close transitions,
 * backdrop blur, and highlights the active route across all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
  const menuToggles = document.querySelectorAll('.js-menu-toggle');
  const adminSidebar = document.getElementById('admin-sidebar');
  const navOverlay = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('nav-close-btn');

  function openMenu() {
    if (adminSidebar && navOverlay) {
      adminSidebar.classList.add('is-active');
      navOverlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMenu() {
    if (adminSidebar && navOverlay) {
      adminSidebar.classList.remove('is-active');
      navOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  // Bind toggle buttons (mobile header hamburger icon)
  menuToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openMenu();
    });
  });

  // Close button in sidebar
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
    });
  }

  // Click on backdrop to close
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Keyboard Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // =========================================================================
  // DYNAMIC ACTIVE MENU RESOLUTION (VERTICAL ADMIN SIDEBAR)
  // =========================================================================
  function updateActiveNavLink() {
    const currentPath = window.location.pathname.toLowerCase();
    
    // Clear existing active states
    document.querySelectorAll('.sidebar-nav-link, .nav-link').forEach(link => {
      link.classList.remove('active');
    });

    let activeKey = 'dashboard';

    if (currentPath.includes('appointment.html') || currentPath.includes('add-appointment.html')) {
      activeKey = 'appointment';
    } else if (currentPath.includes('clients.html') || currentPath.includes('profil-pelanggan.html') || currentPath.includes('edit-pelanggan.html')) {
      activeKey = 'customers';
    } else if (currentPath.includes('worker.html') || currentPath.includes('edit-worker.html')) {
      activeKey = 'workers';
    } else if (currentPath.includes('services.html') || currentPath.includes('edit-layanan.html')) {
      activeKey = 'services';
    } else if (currentPath.includes('produk.html') || currentPath.includes('edit-produk.html')) {
      activeKey = 'products';
    } else if (currentPath.includes('riwayat.html') || currentPath.includes('add-transaction.html')) {
      activeKey = 'history';
    } else if (currentPath.includes('pelanggan-aktif.html')) {
      activeKey = 'reports-active-clients';
    } else if (currentPath.includes('rekap-komisi.html')) {
      activeKey = 'reports-commission';
    } else if (currentPath.includes('pendapatan-karyawan.html')) {
      activeKey = 'reports-income';
    } else if (currentPath.includes('laporan.html')) {
      activeKey = 'reports-sales';
    } else {
      activeKey = 'dashboard';
    }

    const activeLink = document.getElementById(`nav-${activeKey}`);
    if (activeLink) activeLink.classList.add('active');
  }

  updateActiveNavLink();
});
