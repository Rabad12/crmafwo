/**
 * AFWO Hair Design - Admin Sidebar & Responsive Navigation Script
 * Manages vertical sidebar interactions, mobile drawer open/close transitions,
 * backdrop blur, dynamic session display, and highlights the active route across all pages.
 *
 * Perilaku yang dipertahankan dari versi sebelumnya:
 *  - open lewat .js-menu-toggle, close lewat #nav-close-btn, overlay, atau Escape
 *  - session user sync dari sessionStorage, logout, dan resolusi menu aktif
 * Penambahan (Fase 3 - hanya presentasi/aksesibilitas):
 *  - aria-expanded ikut berubah, focus dikembalikan ke tombol pemicu saat ditutup
 *  - body dikunci memakai class .is-locked
 */

document.addEventListener('DOMContentLoaded', () => {
  const menuToggles = document.querySelectorAll('.js-menu-toggle');
  const adminSidebar = document.getElementById('admin-sidebar');
  const navOverlay = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('nav-close-btn');

  // Tombol pemicu terakhir yang dipakai, untuk mengembalikan fokus saat drawer ditutup.
  let lastTrigger = null;
  let isOpen = false;

  function lockScroll(locked) {
    if (locked) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('is-locked');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('is-locked');
    }
  }

  // Sidebar jadi drawer di bawah 1024px (sama dengan breakpoint styles/nav.css).
  const drawerQuery = window.matchMedia('(max-width: 1023px)');
  const isDrawerMode = () => drawerQuery.matches;

  function syncAria(open) {
    menuToggles.forEach(btn => {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (adminSidebar) {
      // Di desktop sidebar selalu terlihat, jadi jangan pernah disembunyikan dari
      // accessibility tree. aria-hidden hanya relevan saat mode drawer tertutup.
      if (isDrawerMode()) {
        adminSidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
      } else {
        adminSidebar.setAttribute('aria-hidden', 'false');
      }
    }
  }

  // Ketika Leave/enter breakpoint, pastikan state DOM ikut menyesuaikan:
  // kembali ke desktop = drawer pasti tertutup; kembali ke mobile = tutup lagi.
  function handleBreakpointChange() {
    if (adminSidebar) adminSidebar.classList.remove('is-active');
    if (navOverlay) navOverlay.classList.remove('is-active');
    isOpen = false;
    lockScroll(false);
    lastTrigger = null;
    syncAria(false);
  }

  function openMenu(trigger) {
    if (!adminSidebar || !navOverlay) return;
    if (trigger) lastTrigger = trigger;
    adminSidebar.classList.add('is-active');
    navOverlay.classList.add('is-active');
    isOpen = true;
    lockScroll(true);
    syncAria(true);
    // Fokus ke tombol tutup supaya navigasi keyboard langsung masuk ke drawer.
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!adminSidebar || !navOverlay) return;
    adminSidebar.classList.remove('is-active');
    navOverlay.classList.remove('is-active');
    const wasOpen = isOpen;
    isOpen = false;
    lockScroll(false);
    syncAria(false);
    // Kembalikan fokus ke tombol hamburger bila drawer memang sedang terbuka.
    if (wasOpen && lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  // Bind toggle buttons (mobile header hamburger icon)
  menuToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openMenu(btn);
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

  // Kunci fokus di dalam drawer selama terbuka + restore saat ditutup.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isOpen || !adminSidebar) return;
    const focusables = adminSidebar.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Kondisi awal
  syncAria(false);

  if (typeof drawerQuery.addEventListener === 'function') {
    drawerQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof drawerQuery.addListener === 'function') {
    drawerQuery.addListener(handleBreakpointChange);
  }

  // Sync sidebar user info from sessionStorage
  const savedUserStr = sessionStorage.getItem('afwo_logged_in_user');
  if (savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      const sidebarName = document.getElementById('sidebar-user-name') || document.querySelector('.sidebar-user-meta .user-name');
      const sidebarAvatar = document.getElementById('sidebar-avatar') || document.querySelector('.user-avatar-circle');
      if (sidebarName && user.name) sidebarName.textContent = user.name;
      if (sidebarAvatar && user.name) sidebarAvatar.textContent = user.name.charAt(0).toUpperCase();
    } catch (e) {
      console.error(e);
    }
  }

  // Avatar di app bar ikut mengikuti nama user yang sama.
  const appBarAvatar = document.getElementById('app-bar-avatar');
  if (appBarAvatar && savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      if (user.name) appBarAvatar.textContent = user.name.charAt(0).toUpperCase();
    } catch (e) { /* diamkan, avatar tetap memakai inisial default */ }
  }

  // Handle logout links
  const logoutLinks = document.querySelectorAll('#nav-logout-link, .sidebar-logout-btn');
  logoutLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Allow navigation to login.html or redirect
      sessionStorage.removeItem('afwo_logged_in_user');
      window.location.href = 'login.html';
    });
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
    } else if (currentPath.includes('absensi.html')) {
      activeKey = 'absensi';
    } else if (currentPath.includes('profil.html')) {
      activeKey = 'profil';
    } else {
      activeKey = 'dashboard';
    }

    const activeLink = document.getElementById(`nav-${activeKey}`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  updateActiveNavLink();
});
