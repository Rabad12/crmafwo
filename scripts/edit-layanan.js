/**
 * AFWO Hair Design - Add / Edit Service Script
 * Handles dual-mode (?mode=add vs ?mode=edit&id=...), form pre-fill, validation, and saving.
 */

document.addEventListener('DOMContentLoaded', () => {
  const servicesData = {
    'signature-master-cut': {
      name: 'Signature Master Cut',
      category: 'potong',
      duration: '60',
      description: 'Precision cutting tailored to your facial structure, includes a relaxing wash and signature blowout.',
      price: '450.000'
    },
    'balayage-toner': {
      name: 'Signature Balayage & Tone',
      category: 'warna',
      duration: '180',
      description: 'A premium balayage service tailored to your hair type, including a gloss toner and signature blowout. Achieves a natural, sun-kissed dimension.',
      price: '1.850.000'
    },
    'luxury-scalp-therapy': {
      name: 'Luxury Scalp Therapy',
      category: 'spa',
      duration: '90',
      description: 'Deep cleansing and exfoliation of the scalp, followed by a nourishing mask and extended massage.',
      price: '600.000'
    },
    'blowout-styling': {
      name: 'Blowout & Styling',
      category: 'styling',
      duration: '45',
      description: 'Professional wash and blowout styling for a polished, salon-fresh finish.',
      price: '250.000'
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'add';
  const serviceId = urlParams.get('id');

  const pageTitle = document.getElementById('edit-layanan-title');
  const nameInput = document.getElementById('input-service-name');
  const categorySelect = document.getElementById('select-category');
  const durationInput = document.getElementById('input-duration');
  const descTextarea = document.getElementById('textarea-desc');
  const priceInput = document.getElementById('input-base-price');
  const saveBtn = document.getElementById('btn-save-layanan');
  const toastBox = document.getElementById('toast-success');
  const toastMessage = document.getElementById('toast-message');

  if (mode === 'edit') {
    if (pageTitle) pageTitle.textContent = 'Edit Service';
    const data = (serviceId && servicesData[serviceId]) ? servicesData[serviceId] : servicesData['balayage-toner'];
    if (nameInput) nameInput.value = data.name;
    if (categorySelect) categorySelect.value = data.category;
    if (durationInput) durationInput.value = data.duration;
    if (descTextarea) descTextarea.value = data.description;
    if (priceInput) priceInput.value = data.price;
  } else {
    if (pageTitle) pageTitle.textContent = 'Add Service';
  }

  function showToast(message, duration = 2500) {
    if (!toastBox) return;
    if (toastMessage) toastMessage.textContent = message;
    toastBox.classList.add('show');
    setTimeout(() => {
      toastBox.classList.remove('show');
    }, duration);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const price = priceInput ? priceInput.value.trim() : '';

      if (!name) {
        showToast('⚠️ Nama layanan wajib diisi.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!price) {
        showToast('⚠️ Base price wajib diisi.');
        if (priceInput) priceInput.focus();
        return;
      }

      showToast('✅ Layanan berhasil disimpan! Mengalihkan...');
      saveBtn.style.pointerEvents = 'none';
      saveBtn.style.opacity = '0.7';

      setTimeout(() => {
        window.location.href = 'services.html';
      }, 1200);
    });
  }
});