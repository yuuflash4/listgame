document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navigation & Core View
  const landingScreen = document.getElementById('landing-screen');
  const landingStorageActions = document.getElementById('landing-storage-actions');
  const tabStoreBtn = document.getElementById('tab-store-btn');
  const tabAdminBtn = document.getElementById('tab-admin-btn');
  const mainContent = document.querySelector('.main-content');
  const adminView = document.getElementById('admin-view');

  // Header & Controls
  const storageTypeSelect = document.getElementById('storage-type-select');
  const selectedCapacityLabel = document.getElementById('selected-capacity-label');
  const dropdownListItems = document.getElementById('dropdown-list-items');
  const dropdownTrigger = document.getElementById('dropdown-selected-text');
  const storageUsedEl = document.getElementById('storage-used');
  const storageTotalEl = document.getElementById('storage-total');
  const storageRemainingEl = document.getElementById('storage-remaining');
  const storageTypeLabelEl = document.getElementById('storage-type-label');
  const progressBar = document.getElementById('progress-bar');
  
  // Store Catalog Elements
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const selectedCountEl = document.getElementById('selected-count');
  const gameGrid = document.getElementById('game-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  // Spec Modal Elements
  const infoModal = document.getElementById('info-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalInfo = document.getElementById('modal-info');
  const modalReqs = document.getElementById('modal-reqs');
  
  // Export Modal Elements
  const exportBtn = document.getElementById('export-btn');
  const exportModal = document.getElementById('export-modal');
  const closeExportModalBtn = document.getElementById('close-export-modal');
  const exportTableBody = document.getElementById('export-table-body');
  const exportTotalSize = document.getElementById('export-total-size');
  const copyTextBtn = document.getElementById('copy-text-btn');
  const waDirectBtn = document.getElementById('wa-direct-btn');
  
  // Floating Widget Elements
  const selectedWidgetBtn = document.getElementById('selected-widget-btn');
  const selectedWidgetPanel = document.getElementById('selected-widget-panel');
  const selectedWidgetClose = document.getElementById('selected-widget-close');
  const selectedWidgetCount = document.getElementById('selected-widget-count');
  const selectedWidgetList = document.getElementById('selected-widget-list');
  const plannerHeader = document.querySelector('.planner-header');

  // Admin Panel Form Elements
  const adminGameForm = document.getElementById('admin-game-form');
  const adminFormTitle = document.getElementById('admin-form-title');
  const adminGameId = document.getElementById('admin-game-id');
  const adminTitle = document.getElementById('admin-title');
  const adminCategory = document.getElementById('admin-category');
  const adminSize = document.getElementById('admin-size');
  const adminCover = document.getElementById('admin-cover');
  const adminGenre = document.getElementById('admin-genre');
  const adminDeveloper = document.getElementById('admin-developer');
  const adminReqs = document.getElementById('admin-reqs');
  const adminResetFormBtn = document.getElementById('admin-reset-form-btn');
  
  const adminSettingsForm = document.getElementById('admin-settings-form');
  const adminWaNumberInput = document.getElementById('admin-wa-number');
  const adminBufferPercentageInput = document.getElementById('admin-buffer-percentage');
  const adminBackupBtn = document.getElementById('admin-backup-btn');
  const adminResetCatalogBtn = document.getElementById('admin-reset-catalog-btn');
  
  const adminSearchInput = document.getElementById('admin-search-input');
  const adminTableBody = document.getElementById('admin-table-body');
  const adminTotalCountEl = document.getElementById('admin-total-count');

  // Storage Type & Capacity Presets Configuration
  const storagePresets = {
    hdd: {
      label: 'HDD',
      category: 'all',
      defaultCapacity: 455,
      capacities: [
        { text: '320 GB', value: 288 },
        { text: '500 GB', value: 455 },
        { text: '1 TB', value: 920 }
      ]
    }
  };

  // State Management
  let currentStorageType = 'hdd';
  let currentCapacityGB = 455;
  let allGames = [];
  let displayedGames = [];
  let selectedGames = new Set(); // Stores game titles
  let gamesByTitle = new Map();
  
  // Admin State from LocalStorage
  let adminWaNumber = localStorage.getItem('admin_wa_number') || '628123456789';
  let sizeBufferPercentage = parseFloat(localStorage.getItem('admin_buffer_percentage') || '5');
  let sizeBufferMultiplier = 1 + (sizeBufferPercentage / 100);

  if (adminWaNumberInput) adminWaNumberInput.value = adminWaNumber;
  if (adminBufferPercentageInput) adminBufferPercentageInput.value = sizeBufferPercentage;

  // Pagination parameters
  const itemsPerPage = 48;
  let currentPage = 1;

  // Sync Header Height
  function syncHeaderHeight() {
    if (plannerHeader) {
      document.documentElement.style.setProperty('--header-h', `${plannerHeader.offsetHeight + 10}px`);
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  // Tab View Switcher
  tabStoreBtn.addEventListener('click', () => {
    tabStoreBtn.classList.add('active');
    tabAdminBtn.classList.remove('active');
    mainContent.style.display = 'block';
    adminView.style.display = 'none';
    syncHeaderHeight();
  });

  tabAdminBtn.addEventListener('click', () => {
    tabAdminBtn.classList.add('active');
    tabStoreBtn.classList.remove('active');
    mainContent.style.display = 'none';
    adminView.style.display = 'block';
    syncHeaderHeight();
    renderAdminTable();
  });

  // Size Parser
  function parseSizeToGB(sizeVal) {
    if (!sizeVal) return 0;
    if (typeof sizeVal === 'number') return sizeVal;
    const s = String(sizeVal).replace(',', '.').toUpperCase();
    const match = s.match(/\d+(?:\.\d+)?/);
    const num = match ? parseFloat(match[0]) : NaN;
    if (isNaN(num)) return 0;
    if (s.includes('MB')) return num / 1024;
    if (s.includes('KB')) return num / (1024 * 1024);
    return num;
  }

  // Render Capacity Dropdown Presets
  function renderCapacityDropdown(storageKey) {
    const config = storagePresets[storageKey];
    if (!config) return;

    dropdownListItems.innerHTML = '';
    config.capacities.forEach((cap) => {
      const li = document.createElement('li');
      li.className = `dropdown-item ${cap.value === currentCapacityGB ? 'active' : ''}`;
      li.dataset.value = cap.value;
      li.dataset.text = cap.text;
      li.textContent = cap.text;
      
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCapacityGB = parseInt(cap.value, 10);
        selectedCapacityLabel.textContent = cap.text;
        
        document.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        dropdownListItems.classList.remove('show');
        
        updateStorageUI();
      });

      dropdownListItems.appendChild(li);
    });

    const activeCap = config.capacities.find(c => c.value === currentCapacityGB) || config.capacities[1] || config.capacities[0];
    currentCapacityGB = activeCap.value;
    selectedCapacityLabel.textContent = activeCap.text;
    storageTypeLabelEl.textContent = config.label;
    
    if (storageKey === 'flashdisk' && categoryFilter) {
      categoryFilter.value = 'ps2';
    } else if (categoryFilter) {
      categoryFilter.value = 'all';
    }
    
    updateStorageUI();
  }

  dropdownTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownListItems.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    dropdownListItems.classList.remove('show');
  });

  function switchStorageType(storageKey) {
    currentStorageType = storageKey;
    storageTypeSelect.value = storageKey;
    renderCapacityDropdown(storageKey);
    applyFilters();
  }

  storageTypeSelect.addEventListener('change', (e) => {
    switchStorageType(e.target.value);
  });

  if (landingStorageActions) {
    landingStorageActions.addEventListener('click', (e) => {
      const btn = e.target.closest('.landing-choice-card');
      if (!btn) return;
      const type = btn.dataset.storage;
      
      landingScreen.classList.add('hidden');
      document.body.classList.remove('landing-active');
      
      switchStorageType(type);
      syncHeaderHeight();
    });
  }

  // Dynamic Pricing Rule Function Based on Size
  function calculateGamePrice(sizeGB) {
    const size = Number.isFinite(sizeGB) ? sizeGB : 0;
    if (size <= 10) return 10000;
    if (size <= 50) return 20000;
    if (size <= 100) return 30000;
    return 40000;
  }

  function formatRupiah(amount) {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
  }

  function updateStorageUI() {
    let totalUsedGB = 0;
    let totalPrice = 0;

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (game) {
        totalUsedGB += (game.sizeGB * sizeBufferMultiplier);
        totalPrice += calculateGamePrice(game.sizeGB);
      }
    });

    const remainingGB = currentCapacityGB - totalUsedGB;
    const usedPercentage = Math.min(100, Math.max(0, (totalUsedGB / currentCapacityGB) * 100));

    storageUsedEl.textContent = `${totalUsedGB.toFixed(1)} GB`;
    storageTotalEl.textContent = `${currentCapacityGB} GB`;

    const storagePriceTotalEl = document.getElementById('storage-price-total');
    if (storagePriceTotalEl) storagePriceTotalEl.textContent = formatRupiah(totalPrice);
    
    if (remainingGB < 0) {
      storageRemainingEl.textContent = `${Math.abs(remainingGB).toFixed(1)} GB (Kapasitas Penuh!)`;
      storageRemainingEl.className = 'text-danger';
    } else {
      storageRemainingEl.textContent = `${remainingGB.toFixed(1)} GB`;
      storageRemainingEl.className = 'text-accent';
    }

    progressBar.style.width = `${usedPercentage}%`;
    progressBar.classList.remove('warning', 'full');
    if (usedPercentage >= 100) {
      progressBar.classList.add('full');
    } else if (usedPercentage >= 85) {
      progressBar.classList.add('warning');
    }

    selectedCountEl.textContent = selectedGames.size;
    selectedWidgetCount.textContent = selectedGames.size;

    renderSelectedWidgetList();
  }

  // Load All Catalogs + LocalStorage Custom Admin Edits
  async function loadAllCatalogs() {
    try {
      gameGrid.innerHTML = `<div class="loading-state">Memuat katalog lengkap (7,700+ game)...</div>`;
      
      const [pcRes, ps2Res] = await Promise.all([
        fetch('data/pc_games.json'),
        fetch('data/ps2_games.json')
      ]);

      const pcRaw = await pcRes.json();
      const ps2Raw = await ps2Res.json();

      allGames = [];
      gamesByTitle.clear();

      pcRaw.forEach((game, idx) => {
        const sizeGB = parseSizeToGB(game.game_info ? game.game_info['Game Size'] : 0);
        const item = {
          id: `pc-${idx}`,
          title: game.title,
          category: 'pc',
          sizeGB: sizeGB,
          platform: 'PC (Windows)',
          cover: game.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
          game_info: game.game_info || {},
          requirements: game.system_requirements
        };
        allGames.push(item);
        gamesByTitle.set(item.title, item);
      });

      ps2Raw.forEach((game, idx) => {
        const sizeGB = parseSizeToGB(game.game_info ? game.game_info['Game Size'] : game.sizeGB);
        const item = {
          id: `ps2-${idx}`,
          title: game.title,
          category: 'ps2',
          sizeGB: sizeGB,
          platform: 'PS2 ISO / OPL / PCSX2',
          cover: game.banner_url || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop',
          game_info: game.game_info || {},
          requirements: game.system_requirements
        };
        allGames.push(item);
        gamesByTitle.set(item.title, item);
      });

      // Merge Custom LocalStorage Games Added by Admin
      const customGamesJSON = localStorage.getItem('admin_custom_games');
      if (customGamesJSON) {
        const customGames = JSON.parse(customGamesJSON);
        customGames.forEach(cg => {
          allGames.unshift(cg); // Place admin custom games on top
          gamesByTitle.set(cg.title, cg);
        });
      }

      applyFilters();
    } catch (err) {
      console.error('Error loading game catalog:', err);
      gameGrid.innerHTML = `<div class="empty-state">Gagal memuat katalog game. Silakan periksa koneksi.</div>`;
    }
  }

  function applyFilters() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    displayedGames = allGames.filter(game => {
      const matchesSearch = !searchQuery || game.title.toLowerCase().includes(searchQuery) ||
                            (game.game_info && game.game_info.Genre && String(game.game_info.Genre).toLowerCase().includes(searchQuery));
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    currentPage = 1;
    renderGameGrid(false);
  }

  function renderGameGrid(append = false) {
    if (!append) {
      gameGrid.innerHTML = '';
    }

    if (displayedGames.length === 0) {
      gameGrid.innerHTML = `<div class="empty-state">Tidak ada game yang sesuai dengan pencarian atau filter Anda.</div>`;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = displayedGames.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();

    pageItems.forEach(game => {
      const isSelected = selectedGames.has(game.title);
      const card = document.createElement('div');
      card.className = `game-card ${isSelected ? 'selected' : ''}`;
      card.dataset.title = game.title;

      const price = calculateGamePrice(game.sizeGB);
      const priceStr = formatRupiah(price);

      card.innerHTML = `
        <div class="game-cover-wrap">
          <img src="${game.cover}" alt="${game.title}" class="game-cover" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'" />
          <span class="game-badge ${game.category}">${game.category === 'ps2' ? 'PS2 Emu' : 'Game PC'}</span>
          <span class="price-tag-card">${priceStr}</span>
        </div>
        <div class="game-info-wrap">
          <h3 class="game-title" title="${game.title}">${game.title}</h3>
          <div class="game-meta">
            <span class="game-size">${game.sizeGB.toFixed(1)} GB</span>
            <span class="game-price">${priceStr}</span>
          </div>
          <div class="game-actions">
            <button class="btn-toggle-select" type="button">
              ${isSelected ? 'Batal' : 'Pilih'}
            </button>
            <button class="btn-info" type="button" title="Spesifikasi Game">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>
          </div>
        </div>
      `;

      const toggleBtn = card.querySelector('.btn-toggle-select');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleGameSelection(game.title, card);
      });

      const infoBtn = card.querySelector('.btn-info');
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSpecModal(game);
      });

      fragment.appendChild(card);
    });

    gameGrid.appendChild(fragment);

    if (loadMoreBtn) {
      if (endIndex < displayedGames.length) {
        loadMoreBtn.style.display = 'inline-block';
        loadMoreBtn.textContent = `Tampilkan Lebih Banyak (${displayedGames.length - endIndex} tersisa)`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderGameGrid(true);
    });
  }

  // Automatic Infinite Scroll Listener
  let isScrollLoading = false;
  window.addEventListener('scroll', () => {
    if (isScrollLoading || mainContent.style.display === 'none') return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 700;

    if (scrollPosition >= threshold) {
      const currentEndIndex = currentPage * itemsPerPage;
      if (currentEndIndex < displayedGames.length) {
        isScrollLoading = true;
        currentPage++;
        renderGameGrid(true);
        setTimeout(() => {
          isScrollLoading = false;
        }, 150);
      }
    }
  }, { passive: true });

  function toggleGameSelection(gameTitle, cardEl) {
    const game = gamesByTitle.get(gameTitle);
    if (!game) return;

    if (selectedGames.has(gameTitle)) {
      selectedGames.delete(gameTitle);
      if (cardEl) {
        cardEl.classList.remove('selected');
        cardEl.querySelector('.btn-toggle-select').textContent = 'Pilih';
      }
    } else {
      let totalUsedGB = 0;
      selectedGames.forEach(t => {
        const g = gamesByTitle.get(t);
        if (g) totalUsedGB += (g.sizeGB * sizeBufferMultiplier);
      });
      totalUsedGB += (game.sizeGB * sizeBufferMultiplier);

      if (totalUsedGB > currentCapacityGB) {
        showToast(`Kapasitas storage (${currentCapacityGB} GB) tidak mencukupi untuk menambah ${game.title}!`, 'error');
      }

      selectedGames.add(gameTitle);
      if (cardEl) {
        cardEl.classList.add('selected');
        cardEl.querySelector('.btn-toggle-select').textContent = 'Batal';
      }
    }

    updateStorageUI();
  }

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 250);
  });

  categoryFilter.addEventListener('change', applyFilters);

  function openSpecModal(game) {
    modalTitle.textContent = game.title;
    const price = calculateGamePrice(game.sizeGB);
    
    modalInfo.innerHTML = `
      <li class="spec-item"><strong>Harga Game:</strong> <span style="color: var(--success); font-weight: 800;">${formatRupiah(price)}</span></li>
      <li class="spec-item"><strong>Platform:</strong> ${game.platform}</li>
      <li class="spec-item"><strong>Ukuran File:</strong> ${game.sizeGB.toFixed(1)} GB</li>
      <li class="spec-item"><strong>Genre:</strong> ${game.game_info ? (game.game_info.Genre || '-') : '-'}</li>
      <li class="spec-item"><strong>Developer:</strong> ${game.game_info ? (game.game_info.Developer || '-') : '-'}</li>
      <li class="spec-item"><strong>Versi:</strong> ${game.game_info ? (game.game_info.Version || 'Full Version') : 'Full Version'}</li>
    `;

    modalReqs.innerHTML = '';
    if (game.requirements && typeof game.requirements === 'object' && Object.keys(game.requirements).length > 0) {
      if (Array.isArray(game.requirements)) {
        game.requirements.forEach(req => {
          const li = document.createElement('li');
          li.className = 'spec-item';
          li.textContent = req;
          modalReqs.appendChild(li);
        });
      } else {
        Object.entries(game.requirements).forEach(([k, v]) => {
          const li = document.createElement('li');
          li.className = 'spec-item';
          li.innerHTML = `<strong>${k}:</strong> ${v}`;
          modalReqs.appendChild(li);
        });
      }
    } else {
      modalReqs.innerHTML = `<li class="spec-item">Dapat dijalankan langsung pada sistem yang mendukung (Plug & Play).</li>`;
    }

    infoModal.classList.add('active');
  }

  closeModalBtn.addEventListener('click', () => {
    infoModal.classList.remove('active');
  });

  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.remove('active');
  });

  selectedWidgetBtn.addEventListener('click', () => {
    selectedWidgetPanel.classList.toggle('show');
  });

  selectedWidgetClose.addEventListener('click', () => {
    selectedWidgetPanel.classList.remove('show');
  });

  function renderSelectedWidgetList() {
    selectedWidgetList.innerHTML = '';
    if (selectedGames.size === 0) {
      selectedWidgetList.innerHTML = `<div style="text-align: center; padding: 15px; color: var(--text-muted); font-size: 0.85rem;">Belum ada game dipilih</div>`;
      return;
    }

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (!game) return;

      const price = calculateGamePrice(game.sizeGB);
      const item = document.createElement('div');
      item.className = 'assistive-item';
      item.innerHTML = `
        <span class="assistive-item-title" title="${game.title}">${game.title}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent); font-weight: 700;">${game.sizeGB.toFixed(1)} GB</span>
          <span style="color: var(--success); font-weight: 700; font-size: 0.8rem;">${formatRupiah(price)}</span>
          <button class="remove-item-btn" type="button">&times;</button>
        </div>
      `;

      item.querySelector('.remove-item-btn').addEventListener('click', () => {
        selectedGames.delete(title);
        
        const card = document.querySelector(`.game-card[data-title="${CSS.escape(title)}"]`);
        if (card) {
          card.classList.remove('selected');
          const btn = card.querySelector('.btn-toggle-select');
          if (btn) btn.textContent = 'Pilih';
        }
        
        updateStorageUI();
      });

      selectedWidgetList.appendChild(item);
    });
  }

  function buildExportText() {
    const lines = [];
    lines.push(`*DAFTAR PESANAN GAME - WD GAMES*`);
    lines.push(`Media Storage: *${storagePresets[currentStorageType].label} ${currentCapacityGB} GB*`);
    lines.push(`===============================`);
    lines.push(``);

    let counter = 1;
    let totalSizeGB = 0;
    let totalPrice = 0;

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (!game) return;

      const price = calculateGamePrice(game.sizeGB);
      const categoryTag = game.category === 'ps2' ? ' (PS2)' : '';
      lines.push(`${counter}. ${game.title}${categoryTag} [${game.sizeGB.toFixed(1)} GB] - ${formatRupiah(price)}`);
      totalSizeGB += (game.sizeGB * sizeBufferMultiplier);
      totalPrice += price;
      counter++;
    });

    const remainingGB = currentCapacityGB - totalSizeGB;
    lines.push(``);
    lines.push(`===============================`);
    lines.push(`Total Game: *${selectedGames.size} Judul*`);
    lines.push(`Total Ukuran: *${totalSizeGB.toFixed(1)} GB*`);
    lines.push(`Sisa Kapasitas: *${remainingGB.toFixed(1)} GB*`);
    lines.push(`Total Biaya: *${formatRupiah(totalPrice)}*`);
    lines.push(``);
    lines.push(`Mohon kirimkan format ini ke Admin WD Games.`);

    return lines.join('\n');
  }

  function openExportModal() {
    if (selectedGames.size === 0) {
      showToast('Silakan pilih minimal 1 game terlebih dahulu!', 'error');
      return;
    }

    exportTableBody.innerHTML = '';
    let counter = 1;
    let totalSizeGB = 0;
    let totalPrice = 0;

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (!game) return;

      const price = calculateGamePrice(game.sizeGB);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${counter}</td>
        <td>${game.title}</td>
        <td style="color: var(--accent); font-weight: 700;">${game.sizeGB.toFixed(1)} GB</td>
        <td style="color: var(--success); font-weight: 700;">${formatRupiah(price)}</td>
      `;
      exportTableBody.appendChild(tr);

      totalSizeGB += (game.sizeGB * sizeBufferMultiplier);
      totalPrice += price;
      counter++;
    });

    exportTotalSize.textContent = `${totalSizeGB.toFixed(1)} GB`;
    const exportTotalPriceEl = document.getElementById('export-total-price');
    if (exportTotalPriceEl) exportTotalPriceEl.textContent = formatRupiah(totalPrice);
    
    // Update Direct WA Link
    if (waDirectBtn) {
      const waText = encodeURIComponent(buildExportText());
      waDirectBtn.href = `https://wa.me/${adminWaNumber}?text=${waText}`;
    }

    exportModal.classList.add('active');
  }

  exportBtn.addEventListener('click', openExportModal);
  closeExportModalBtn.addEventListener('click', () => {
    exportModal.classList.remove('active');
  });

  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) exportModal.classList.remove('active');
  });

  copyTextBtn.addEventListener('click', async () => {
    const text = buildExportText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Teks daftar game berhasil di-copy! Silakan paste ke chat WhatsApp Admin.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyalin teks. Silakan salin secara manual.', 'error');
    }
  });

  // ==========================================================================
  // ADMIN PANEL LOGIC (KELOLA TOKO)
  // ==========================================================================

  // Admin Settings Form Submit
  adminSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    adminWaNumber = adminWaNumberInput.value.trim().replace(/[^0-9]/g, '');
    sizeBufferPercentage = parseFloat(adminBufferPercentageInput.value) || 5;
    sizeBufferMultiplier = 1 + (sizeBufferPercentage / 100);

    localStorage.setItem('admin_wa_number', adminWaNumber);
    localStorage.setItem('admin_buffer_percentage', sizeBufferPercentage);

    updateStorageUI();
    showToast('Pengaturan Toko & WhatsApp berhasil disimpan!', 'success');
  });

  // Save Game Form (Add / Edit)
  adminGameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const editId = adminGameId.value;
    const title = adminTitle.value.trim();
    const category = adminCategory.value;
    const sizeGB = parseFloat(adminSize.value) || 0;
    const cover = adminCover.value.trim() || (category === 'ps2' ? 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop');
    const genre = adminGenre.value.trim() || 'Action';
    const developer = adminDeveloper.value.trim() || 'Unknown Developer';
    const reqsText = adminReqs.value.trim();
    const requirements = reqsText ? reqsText.split(/[\n,]+/).map(r => r.trim()).filter(Boolean) : [];

    const gameObject = {
      id: editId || `custom-${Date.now()}`,
      title: title,
      category: category,
      sizeGB: sizeGB,
      platform: category === 'ps2' ? 'PS2 ISO / OPL' : 'PC (Windows)',
      cover: cover,
      game_info: {
        Genre: genre,
        Developer: developer,
        Version: 'Full Version'
      },
      requirements: requirements
    };

    let customGames = JSON.parse(localStorage.getItem('admin_custom_games') || '[]');

    if (editId) {
      // Edit existing game
      const idx = customGames.findIndex(g => g.id === editId);
      if (idx !== -1) {
        customGames[idx] = gameObject;
      } else {
        // Edit existing stock game
        const stockIdx = allGames.findIndex(g => g.id === editId || g.title === title);
        if (stockIdx !== -1) {
          allGames[stockIdx] = gameObject;
        }
        customGames.unshift(gameObject);
      }
      showToast(`Game "${title}" berhasil diperbarui!`, 'success');
    } else {
      // Add new game
      customGames.unshift(gameObject);
      allGames.unshift(gameObject);
      showToast(`Game baru "${title}" berhasil ditambahkan!`, 'success');
    }

    localStorage.setItem('admin_custom_games', JSON.stringify(customGames));
    gamesByTitle.set(gameObject.title, gameObject);

    resetAdminGameForm();
    applyFilters();
    renderAdminTable();
  });

  // Reset Admin Game Form
  function resetAdminGameForm() {
    adminGameId.value = '';
    adminTitle.value = '';
    adminSize.value = '';
    adminCover.value = '';
    adminGenre.value = '';
    adminDeveloper.value = '';
    adminReqs.value = '';
    adminFormTitle.textContent = 'Tambah Game Baru';
    adminResetFormBtn.style.display = 'none';
  }

  adminResetFormBtn.addEventListener('click', resetAdminGameForm);

  // Render Admin Management Table
  function renderAdminTable() {
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '';
    
    const query = adminSearchInput.value.toLowerCase().trim();
    const filtered = allGames.filter(g => !query || g.title.toLowerCase().includes(query));

    adminTotalCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ada game ditemukan.</td></tr>`;
      return;
    }

    // Limit admin table view to first 100 matches for performance
    const slice = filtered.slice(0, 100);

    slice.forEach((game, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><img src="${game.cover}" width="36" height="48" style="object-fit: cover; border-radius: 4px;" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'" /></td>
        <td style="font-weight: 700; color: var(--text-primary);">${game.title}</td>
        <td><span class="game-badge ${game.category}" style="position: static;">${game.category.toUpperCase()}</span></td>
        <td style="color: var(--accent); font-weight: 700;">${game.sizeGB.toFixed(1)} GB</td>
        <td>
          <button class="btn-action-sm btn-edit" type="button">Edit</button>
          <button class="btn-action-sm btn-delete" type="button">Hapus</button>
        </td>
      `;

      // Edit Action
      tr.querySelector('.btn-edit').addEventListener('click', () => {
        adminGameId.value = game.id;
        adminTitle.value = game.title;
        adminCategory.value = game.category;
        adminSize.value = game.sizeGB;
        adminCover.value = game.cover;
        adminGenre.value = game.game_info ? (game.game_info.Genre || '') : '';
        adminDeveloper.value = game.game_info ? (game.game_info.Developer || '') : '';
        adminReqs.value = Array.isArray(game.requirements) ? game.requirements.join('\n') : '';

        adminFormTitle.textContent = `Edit Game: ${game.title}`;
        adminResetFormBtn.style.display = 'inline-block';
        window.scrollTo({ top: adminView.offsetTop, behavior: 'smooth' });
      });

      // Delete Action
      tr.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${game.title}"?`)) {
          allGames = allGames.filter(g => g.id !== game.id && g.title !== game.title);
          gamesByTitle.delete(game.title);
          selectedGames.delete(game.title);

          let customGames = JSON.parse(localStorage.getItem('admin_custom_games') || '[]');
          customGames = customGames.filter(g => g.id !== game.id && g.title !== game.title);
          localStorage.setItem('admin_custom_games', JSON.stringify(customGames));

          showToast(`Game "${game.title}" telah dihapus!`, 'success');
          applyFilters();
          renderAdminTable();
          updateStorageUI();
        }
      });

      adminTableBody.appendChild(tr);
    });
  }

  let adminSearchTimeout;
  adminSearchInput.addEventListener('input', () => {
    clearTimeout(adminSearchTimeout);
    adminSearchTimeout = setTimeout(renderAdminTable, 250);
  });

  // Download Backup JSON
  adminBackupBtn.addEventListener('click', () => {
    const backupData = allGames.map(g => ({
      title: g.title,
      banner_url: g.cover,
      category: g.category,
      game_info: {
        Genre: g.game_info ? g.game_info.Genre : '',
        Developer: g.game_info ? g.game_info.Developer : '',
        'Game Size': `${g.sizeGB.toFixed(1)} GB`
      },
      system_requirements: g.requirements
    }));

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_katalog_game_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('File backup database JSON berhasil diunduh!', 'success');
  });

  // Reset Custom Catalog
  adminResetCatalogBtn.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh game custom dan mengembalikan katalog ke bawaan awal?')) {
      localStorage.removeItem('admin_custom_games');
      loadAllCatalogs();
      showToast('Katalog berhasil di-reset ke bawaan awal!', 'success');
    }
  });

  // Toast Notification Generator
  function showToast(message, type = 'error') {
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initial Load
  loadAllCatalogs();
});
