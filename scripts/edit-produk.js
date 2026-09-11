/**
 * AFWO Hair Design - Add / Edit Product Script
 * Handles dual-mode (?mode=add vs ?mode=edit&id=...), conditional fields toggle, steppers, validation, and saving.
 */

document.addEventListener('DOMContentLoaded', () => {
  const productsData = {
    'olaplex-no3': {
      name: 'Olaplex No.3 Hair Perfector',
      category: 'retail',
      brand: 'Olaplex',
      description: 'Perawatan rumahan untuk menjaga hasil bonding rambut.',
      price: '285.000',
      stockPcs: '24',
      unitMl: '10'
    },
    'kerastase-elixir': {
      name: 'Kerastase Elixir Ultime',
      category: 'retail',
      brand: 'Kerastase',
      description: 'Serum minyak finishing untuk kilau dan kelembutan rambut.',
      price: '420.000',
      stockPcs: '15',
      unitMl: '10'
    },
    'wella-color-charm': {
      name: 'Wella Color Charm (Bahan Pewarna)',
      category: 'produk-layanan',
      brand: 'Wella',
      description: 'Bahan pewarna profesional yang dipakai saat layanan coloring.',
      price: '15.000',
      stockPcs: '50',
      unitMl: '10'
    },
    'loreal-majirel': {
      name: 'L\'Oréal Majirel (Bahan Pewarna)',
      category: 'produk-layanan',
      brand: 'L\'Oréal',
      description: 'Cat rambut profesional untuk hasil warna tahan lama.',
      price: '18.000',
      stockPcs: '40',
      unitMl: '10'
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'add';
  const productId = urlParams.get('id');

  const pageTitle = document.getElementById('edit-produk-title');
  const nameInput = document.getElementById('input-product-name');
  const categorySelect = document.getElementById('select-product-category');
  const brandInput = document.getElementById('input-brand');
  const descTextarea = document.getElementById('textarea-desc');
  const priceInput = document.getElementById('input-price');
  
  const fieldStockPcs = document.getElementById('field-stock-pcs');
  const stockInput = document.getElementById('input-stock-pcs');
  
  const fieldUnitMl = document.getElementById('field-unit-ml');
  const unitMlInput = document.getElementById('input-unit-ml');
  const btnMinus = document.getElementById('btn-step-minus');
  const btnPlus = document.getElementById('btn-step-plus');

  const saveBtn = document.getElementById('btn-save-produk');
  const toastBox = document.getElementById('toast-success');
  const toastMessage = document.getElementById('toast-message');

  // Toggle Conditional Pricing Fields
  function updateCategoryFields() {
    if (!categorySelect) return;
    const cat = categorySelect.value;
    if (cat === 'retail') {
      if (fieldStockPcs) fieldStockPcs.style.display = 'flex';
      if (fieldUnitMl) fieldUnitMl.style.display = 'none';
    } else {
      if (fieldStockPcs) fieldStockPcs.style.display = 'none';
      if (fieldUnitMl) fieldUnitMl.style.display = 'flex';
    }
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', updateCategoryFields);
  }

  // Stepper Handlers for 10ml
  if (btnMinus && unitMlInput) {
    btnMinus.addEventListener('click', (e) => {
      e.preventDefault();
      let val = parseInt(unitMlInput.value || '10', 10);
      if (val > 10) val -= 10;
      unitMlInput.value = val;
    });
  }

  if (btnPlus && unitMlInput) {
    btnPlus.addEventListener('click', (e) => {
      e.preventDefault();
      let val = parseInt(unitMlInput.value || '10', 10);
      val += 10;
      unitMlInput.value = val;
    });
  }

  // Populate data in Edit mode
  if (mode === 'edit') {
    if (pageTitle) pageTitle.textContent = 'Edit Product';
    const data = (productId && productsData[productId]) ? productsData[productId] : productsData['wella-color-charm'];
    if (nameInput) nameInput.value = data.name;
    if (categorySelect) categorySelect.value = data.category;
    if (brandInput) brandInput.value = data.brand;
    if (descTextarea) descTextarea.value = data.description;
    if (priceInput) priceInput.value = data.price;
    if (stockInput) stockInput.value = data.stockPcs;
    if (unitMlInput) unitMlInput.value = data.unitMl;
  } else {
    if (pageTitle) pageTitle.textContent = 'Add Product';
  }

  updateCategoryFields();

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
        showToast('⚠️ Nama produk wajib diisi.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!price) {
        showToast('⚠️ Harga produk wajib diisi.');
        if (priceInput) priceInput.focus();
        return;
      }

      showToast('✅ Produk berhasil disimpan! Mengalihkan...');
      saveBtn.style.pointerEvents = 'none';
      saveBtn.style.opacity = '0.7';

      setTimeout(() => {
        window.location.href = 'produk.html';
      }, 1200);
    });
  }
});