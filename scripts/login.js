// Login Handler Script for AFWO Hair Design CRM
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('form-login');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('login-remember');
  const togglePasswordBtn = document.getElementById('btn-toggle-password');
  const alertBox = document.getElementById('login-alert');
  const submitBtn = document.getElementById('btn-login-submit');

  // Check saved remember me
  const savedEmail = localStorage.getItem('afwo_remember_email');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const eyeIcon = togglePasswordBtn.querySelector('svg');
      if (type === 'text') {
        // Eye off icon
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
      } else {
        // Normal eye icon
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }
    });
  }

  function showAlert(message, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `login-alert is-${type}`;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!email || !password) {
        showAlert('Email dan password wajib diisi!', 'error');
        return;
      }

      // Visual loading state on button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <span>Memproses...</span>
        `;
      }

      // Simulate backend authentication
      setTimeout(() => {
        // Save or clear remember email
        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem('afwo_remember_email', email);
        } else {
          localStorage.removeItem('afwo_remember_email');
        }

        // Set session user
        const userData = {
          name: email.includes('owner') ? 'Owner Afwo' : 'Admin Afwo',
          email: email,
          role: 'Owner'
        };
        sessionStorage.setItem('afwo_logged_in_user', JSON.stringify(userData));

        showAlert('Login berhasil! Mengalihkan...', 'success');

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 600);
      }, 700);
    });
  }
});
