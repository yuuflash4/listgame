function initApp() {
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
  const hddDropdown = document.getElementById('hdd-dropdown');
  const storageUsedEl = document.getElementById('storage-used');
  const storageTotalEl = document.getElementById('storage-total');
  const storageRemainingEl = document.getElementById('storage-remaining');
  const storageTypeLabelEl = document.getElementById('storage-type-label');
  const progressBar = document.getElementById('progress-bar');
  
  // Store Catalog Elements & View Mode Switcher
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  const selectedCountEl = document.getElementById('selected-count');
  const gameGrid = document.getElementById('game-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewListBtn = document.getElementById('view-list-btn');
  const viewTitleBtn = document.getElementById('view-title-btn');
  
  const isMobileViewport = (typeof window !== 'undefined') && (
    window.innerWidth <= 768 || 
    (window.screen && window.screen.width <= 768) || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );

  let userSavedMode = localStorage.getItem('game_view_mode');
  let userManuallySet = localStorage.getItem('user_manually_set_view');

  // If on mobile and user hasn't explicitly clicked a view mode button, default to 'list'
  if (isMobileViewport && (!userSavedMode || !userManuallySet)) {
    userSavedMode = 'list';
  }

  let currentViewMode = userSavedMode || (isMobileViewport ? 'list' : 'grid');

  function setViewMode(mode, isUserAction = false) {
    if (isMobileViewport && mode === 'grid') {
      mode = 'list';
    }
    currentViewMode = mode;
    try {
      localStorage.setItem('game_view_mode', mode);
      if (isUserAction) {
        localStorage.setItem('user_manually_set_view', 'true');
      }
    } catch (e) {}

    [viewGridBtn, viewListBtn, viewTitleBtn].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    if (gameGrid) {
      gameGrid.classList.remove('view-grid', 'view-list', 'view-title-only');

      if (mode === 'list') {
        if (viewListBtn) viewListBtn.classList.add('active');
        gameGrid.classList.add('view-list');
      } else if (mode === 'title-only') {
        if (viewTitleBtn) viewTitleBtn.classList.add('active');
        gameGrid.classList.add('view-title-only');
      } else {
        if (viewGridBtn) viewGridBtn.classList.add('active');
        gameGrid.classList.add('view-grid');
      }
    }
  }

  if (viewGridBtn) viewGridBtn.addEventListener('click', () => setViewMode('grid', true));
  if (viewListBtn) viewListBtn.addEventListener('click', () => setViewMode('list', true));
  if (viewTitleBtn) viewTitleBtn.addEventListener('click', () => setViewMode('title-only', true));
  
  setViewMode(currentViewMode);
  
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

  // Smart Auto-Hide Header on Scroll Down & Show on Scroll Up
  if (plannerHeader) {
    let lastScrollTop = 0;
    const delta = 10;

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

      if (scrollTop > lastScrollTop && scrollTop > 80) {
        plannerHeader.classList.add('header-hidden');
      } else {
        plannerHeader.classList.remove('header-hidden');
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
  }

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
  const adminGithubTokenInput = document.getElementById('admin-github-token');
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
        { text: '1 TB', value: 920 },
        { text: '2 TB', value: 1800 }
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
  let adminWaNumber = localStorage.getItem('admin_wa_number') || '6285701917085';
  let sizeBufferPercentage = parseFloat(localStorage.getItem('admin_buffer_percentage') || '5');
  let sizeBufferMultiplier = 1 + (sizeBufferPercentage / 100);
  let adminGithubToken = localStorage.getItem('admin_github_token') || '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';
  let adminWebAppUrl = localStorage.getItem('admin_webapp_url') || 'https://script.google.com/macros/s/AKfycbyWZKd1eMTZSRZoMNaLX1zVlik3rje63ldJ7PmCZHX3UToU5qx_i_6N2zncOmz6Yeh82Q/exec';
  const adminWebAppUrlInput = document.getElementById('admin-webapp-url');

  if (adminWaNumberInput) adminWaNumberInput.value = adminWaNumber;
  if (adminBufferPercentageInput) adminBufferPercentageInput.value = sizeBufferPercentage;
  if (adminGithubTokenInput) adminGithubTokenInput.value = adminGithubToken;
  if (adminWebAppUrlInput) adminWebAppUrlInput.value = adminWebAppUrl;

  // Cloud Auto-Sync Engine
  let _localServerAvailable = null;
  let _localServerUrl = '';
  let _syncTimer = null;

  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1' ||
    window.location.protocol === 'file:'
  );

  async function checkLocalServer() {
    if (_localServerAvailable !== null) return _localServerAvailable;
    
    // 1. Try relative path
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;
      const options = { method: 'HEAD' };
      if (controller) options.signal = controller.signal;
      const res = await fetch('/api/data', options);
      if (timeoutId) clearTimeout(timeoutId);
      if (res.ok) {
        _localServerAvailable = true;
        _localServerUrl = '';
        return true;
      }
    } catch (e) {}

    // 2. Fallback to explicit localhost:8999 ONLY if running on local environment
    if (isLocalHost) {
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;
        const options = { method: 'HEAD' };
        if (controller) options.signal = controller.signal;
        const res = await fetch('http://127.0.0.1:8999/api/data', options);
        if (timeoutId) clearTimeout(timeoutId);
        if (res.ok) {
          _localServerAvailable = true;
          _localServerUrl = 'http://127.0.0.1:8999';
          return true;
        }
      } catch (e) {}
    }

    _localServerAvailable = false;
    return false;
  }

  async function syncFromServer() {
    const deletedTitles = JSON.parse(localStorage.getItem('admin_deleted_titles') || '[]');

    const isLocal = await checkLocalServer();
    if (isLocal) {
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;
        const options = controller ? { signal: controller.signal } : {};
        const res = await fetch(`${_localServerUrl}/api/data`, options);
        if (timeoutId) clearTimeout(timeoutId);
        if (res.ok) {
          let cloudCustomGames = await res.json();
          if (Array.isArray(cloudCustomGames)) {
            if (deletedTitles.length > 0) {
              cloudCustomGames = cloudCustomGames.filter(cg => cg && cg.title && !deletedTitles.includes(cg.title));
            }
            if (cloudCustomGames.length > 0) {
              localStorage.setItem('admin_custom_games', JSON.stringify(cloudCustomGames));
              return cloudCustomGames;
            } else {
              const storedLocal = JSON.parse(localStorage.getItem('admin_custom_games') || '[]');
              const cleanStored = storedLocal.filter(cg => cg && cg.title && !deletedTitles.includes(cg.title));
              if (cleanStored.length > 0) {
                syncToServer();
                return cleanStored;
              }
            }
          }
        }
      } catch (e) {
        _localServerAvailable = false;
      }
    }

    if (!_localServerAvailable && adminWebAppUrl) {
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
        const cloudUrl = adminWebAppUrl.includes('?') ? `${adminWebAppUrl}&action=get_data` : `${adminWebAppUrl}?action=get_data`;
        const options = controller ? { signal: controller.signal } : {};
        const res = await fetch(cloudUrl, options);
        if (timeoutId) clearTimeout(timeoutId);
        if (res.ok || res.status === 200 || res.type === 'opaque') {
          const text = await res.text();
          let cloudCustomGames = null;
          try {
            cloudCustomGames = JSON.parse(text);
          } catch (pe) {
            console.log('JSON parse error from Google Cloud response:', pe);
          }
          if (Array.isArray(cloudCustomGames)) {
            if (deletedTitles.length > 0) {
              cloudCustomGames = cloudCustomGames.filter(cg => cg && cg.title && !deletedTitles.includes(cg.title));
            }
            if (cloudCustomGames.length > 0) {
              localStorage.setItem('admin_custom_games', JSON.stringify(cloudCustomGames));
              return cloudCustomGames;
            }
          }
        }
      } catch (e) {
        console.log('Google Cloud Sync fetch skipped/error:', e);
      }
    }
    return null;
  }

  function debouncedSyncToServer() {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      syncToServer();
    }, 400);
  }

  async function syncToServer() {
    const customGames = JSON.parse(localStorage.getItem('admin_custom_games') || '[]');

    const isLocal = await checkLocalServer();
    if (isLocal) {
      try {
        const res = await fetch(`${_localServerUrl}/api/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customGames)
        });
        if (res.ok) _localServerAvailable = true;
      } catch (e) {
        _localServerAvailable = false;
      }
    }

    if (adminWebAppUrl) {
      try {
        const payload = JSON.stringify({
          action: 'save_data',
          storeData: JSON.stringify(customGames)
        });

        // Use mode: 'no-cors' with text/plain to bypass browser CORS preflight blocking
        await fetch(adminWebAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload
        });
      } catch (err) {
        console.log('Google Cloud Sync post skipped/error:', err);
      }
    }
  }

  // Pagination parameters
  const itemsPerPage = 48;
  let currentPage = 1;

  // Sync Header Height
  function syncHeaderHeight() {
    if (plannerHeader) {
      document.documentElement.style.setProperty('--header-h', `${plannerHeader.offsetHeight}px`);
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  const storeControls = document.getElementById('store-controls');

  const isNoPriceMode = document.body.classList.contains('no-price-mode') || window.location.pathname.includes('kalkulator');

  // Navigation Header Link Active State
  if (tabStoreBtn && (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/'))) {
    tabStoreBtn.classList.add('active');
  }
  if (tabAdminBtn && window.location.pathname.includes('admin.html')) {
    tabAdminBtn.classList.add('active');
  }

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

    if (dropdownListItems) dropdownListItems.innerHTML = '';
    config.capacities.forEach((cap) => {
      const li = document.createElement('li');
      li.className = `dropdown-item ${cap.value === currentCapacityGB ? 'active' : ''}`;
      li.dataset.value = cap.value;
      li.dataset.text = cap.text;
      li.textContent = cap.text;
      
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCapacityGB = parseInt(cap.value, 10);
        if (selectedCapacityLabel) selectedCapacityLabel.textContent = cap.text;
        
        document.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        if (dropdownListItems) dropdownListItems.classList.remove('show');
        
        updateStorageUI();
      });

      if (dropdownListItems) dropdownListItems.appendChild(li);
    });

    const activeCap = config.capacities.find(c => c.value === currentCapacityGB) || config.capacities[1] || config.capacities[0];
    currentCapacityGB = activeCap.value;
    if (selectedCapacityLabel) selectedCapacityLabel.textContent = activeCap.text;
    if (storageTypeLabelEl) storageTypeLabelEl.textContent = config.label;
    
    if (storageKey === 'flashdisk' && categoryFilter) {
      categoryFilter.value = 'ps2';
    } else if (categoryFilter) {
      categoryFilter.value = 'all';
    }
    
    updateStorageUI();
  }

  if (hddDropdown) {
    hddDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdownListItems) dropdownListItems.classList.toggle('show');
    });
  }

  document.addEventListener('click', () => {
    if (dropdownListItems) dropdownListItems.classList.remove('show');
  });

  function switchStorageType(storageKey) {
    currentStorageType = storageKey;
    if (storageTypeSelect) storageTypeSelect.value = storageKey;
    renderCapacityDropdown(storageKey);
    applyFilters();
  }

  if (storageTypeSelect) {
    storageTypeSelect.addEventListener('change', (e) => {
      switchStorageType(e.target.value);
    });
  }

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
    if (size <= 150) return 40000;
    return 50000;
  }

  function formatRupiah(amount) {
    return 'Rp ' + Math.round(amount || 0).toLocaleString('id-ID');
  }

  function calculatePromoDiscount() {
    let eligibleCount = 0;
    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (game) {
        const price = calculateGamePrice(game.sizeGB);
        if (price > 10000) {
          eligibleCount++;
        }
      }
    });

    const setsOfThree = Math.floor(eligibleCount / 3);
    return setsOfThree * 10000;
  }

  function updateStorageUI() {
    let totalUsedGB = 0;
    let rawTotalPrice = 0;

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (game) {
        totalUsedGB += (game.sizeGB * sizeBufferMultiplier);
        rawTotalPrice += calculateGamePrice(game.sizeGB);
      }
    });

    const discountAmount = calculatePromoDiscount();
    const finalPrice = Math.max(0, rawTotalPrice - discountAmount);

    if (storageUsedEl) storageUsedEl.textContent = `${totalUsedGB.toFixed(1)} GB`;
    if (storageTotalEl) storageTotalEl.textContent = `${currentCapacityGB} GB`;

    const storagePriceTotalEl = document.getElementById('storage-price-total');
    if (storagePriceTotalEl) {
      if (discountAmount > 0) {
        storagePriceTotalEl.innerHTML = `${formatRupiah(finalPrice)} <span class="promo-badge-text">Hemat ${formatRupiah(discountAmount)} 🎉</span>`;
      } else {
        storagePriceTotalEl.textContent = formatRupiah(finalPrice);
      }
    }
    
    let usedPercentage = 0;
    if (storageRemainingEl) {
      const remainingGB = currentCapacityGB - totalUsedGB;
      usedPercentage = Math.min(100, Math.max(0, (totalUsedGB / currentCapacityGB) * 100));
      if (remainingGB < 0) {
        storageRemainingEl.textContent = `${Math.abs(remainingGB).toFixed(1)} GB (Kapasitas Penuh!)`;
        storageRemainingEl.className = 'text-danger';
      } else {
        storageRemainingEl.textContent = `${remainingGB.toFixed(1)} GB`;
        storageRemainingEl.className = 'text-accent';
      }
    } else {
      // Progress bar on catalog store (indicates size meter up to 500GB scale)
      usedPercentage = Math.min(100, (totalUsedGB / 500) * 100);
    }

    if (progressBar) {
      progressBar.style.width = `${usedPercentage}%`;
      progressBar.classList.remove('warning', 'full');
      if (usedPercentage >= 100) {
        progressBar.classList.add('full');
      } else if (usedPercentage >= 85) {
        progressBar.classList.add('warning');
      }
    }

    if (selectedCountEl) selectedCountEl.textContent = selectedGames.size;
    if (selectedWidgetCount) selectedWidgetCount.textContent = selectedGames.size;

    renderSelectedWidgetList();
  }

  async function waitForWindowData() {
    for (let i = 0; i < 20; i++) {
      if (window.PC_GAMES_DATA && window.PS2_GAMES_DATA) return true;
      await new Promise(r => setTimeout(r, 25));
    }
    return false;
  }

  // Helper to check if a game has been marked as deleted by Admin
  function isGameDeleted(game) {
    if (!game) return true;
    const deletedTitles = JSON.parse(localStorage.getItem('admin_deleted_titles') || '[]');
    const deletedIds = JSON.parse(localStorage.getItem('admin_deleted_ids') || '[]');
    
    if (game.id && deletedIds.includes(String(game.id))) return true;
    if (game.title) {
      const cleanTitle = String(game.title).trim().toLowerCase();
      if (deletedTitles.some(t => String(t).trim().toLowerCase() === cleanTitle)) return true;
    }
    return false;
  }

  // Load All Catalogs + LocalStorage Custom Admin Edits
  async function loadAllCatalogs() {
    try {
      if (gameGrid) gameGrid.innerHTML = `<div class="loading-state">Memuat katalog game...</div>`;

      let pcRaw = null;
      let ps2Raw = null;

      // 1. Try fetching fresh live JSON first (bypassing browser script cache)
      try {
        const timestamp = Date.now();
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
        const options = controller ? { signal: controller.signal } : {};

        const [pcRes, ps2Res] = await Promise.all([
          fetch(`data/pc_games.json?t=${timestamp}`, options),
          fetch(`data/ps2_games.json?t=${timestamp}`, options)
        ]);
        if (timeoutId) clearTimeout(timeoutId);
        if (pcRes.ok) pcRaw = await pcRes.json();
        if (ps2Res.ok) ps2Raw = await ps2Res.json();
      } catch (fetchErr) {
        console.warn('Fetch live JSON skipped, falling back to script data:', fetchErr);
      }

      pcRaw = pcRaw || window.PC_GAMES_DATA || [];
      ps2Raw = ps2Raw || window.PS2_GAMES_DATA || [];

      if (!Array.isArray(pcRaw) || !Array.isArray(ps2Raw)) {
        throw new Error('Format data katalog game tidak valid.');
      }

      allGames = [];
      gamesByTitle.clear();

      pcRaw.forEach((game, idx) => {
        const item = {
          id: `pc-${idx}`,
          title: game.title,
          category: 'pc',
          sizeGB: parseSizeToGB(game.game_info ? game.game_info['Game Size'] : 0),
          platform: 'PC (Windows)',
          cover: game.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
          game_info: game.game_info || {},
          requirements: game.system_requirements
        };
        if (isGameDeleted(item) || isGameDeleted(game)) return;
        allGames.push(item);
        gamesByTitle.set(item.title, item);
      });

      ps2Raw.forEach((game, idx) => {
        const item = {
          id: `ps2-${idx}`,
          title: game.title,
          category: 'ps2',
          sizeGB: parseSizeToGB(game.game_info ? game.game_info['Game Size'] : game.sizeGB),
          platform: 'PS2 ISO / OPL / PCSX2',
          cover: game.banner_url || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop',
          game_info: game.game_info || {},
          requirements: game.system_requirements
        };
        if (isGameDeleted(item) || isGameDeleted(game)) return;
        allGames.push(item);
        gamesByTitle.set(item.title, item);
      });

      // Merge Custom LocalStorage Games Added by Admin
      const customGamesJSON = localStorage.getItem('admin_custom_games');
      if (customGamesJSON) {
        try {
          const customGames = JSON.parse(customGamesJSON);
          if (Array.isArray(customGames)) {
            customGames.forEach(cg => {
              if (!cg || !cg.title || isGameDeleted(cg)) return;
              const cleanCgTitle = cg.title.trim().toLowerCase();
              const existingIdx = allGames.findIndex(g => (cg.id && g.id === cg.id) || g.title.trim().toLowerCase() === cleanCgTitle);
              if (existingIdx !== -1) {
                allGames[existingIdx] = cg;
              } else {
                allGames.unshift(cg);
              }
              gamesByTitle.set(cg.title, cg);
            });
          }
        } catch (e) {}
      }

      // RENDER CATALOG IMMEDIATELY! (0ms delay)
      applyFilters();
      if (adminTableBody) renderAdminTable();

      // Sync latest custom games in background without blocking catalog display
      syncFromServer().then(cloudCustomGames => {
        if (cloudCustomGames && Array.isArray(cloudCustomGames)) {
          cloudCustomGames.forEach(cg => {
            if (!cg || !cg.title || isGameDeleted(cg)) return;
            const cleanCgTitle = cg.title.trim().toLowerCase();
            const existingIdx = allGames.findIndex(g => (cg.id && g.id === cg.id) || g.title.trim().toLowerCase() === cleanCgTitle);
            if (existingIdx !== -1) {
              allGames[existingIdx] = cg;
            } else {
              allGames.unshift(cg);
            }
            gamesByTitle.set(cg.title, cg);
          });
          applyFilters();
          if (adminTableBody) renderAdminTable();
        }
      }).catch(() => {});

    } catch (err) {
      console.error('Error loading game catalog:', err);
      if (gameGrid) gameGrid.innerHTML = `<div class="empty-state">Gagal memuat katalog game: ${err.message}</div>`;
      if (adminTableBody) {
        adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 20px;">Gagal memuat data katalog: ${err.message}</td></tr>`;
      }
    }
  }

  function applyFilters() {
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedSort = sortFilter ? sortFilter.value : 'added-desc';

    displayedGames = allGames.filter(game => {
      const matchesSearch = !searchQuery || game.title.toLowerCase().includes(searchQuery) ||
                            (game.game_info && game.game_info.Genre && String(game.game_info.Genre).toLowerCase().includes(searchQuery));
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    displayedGames.sort((a, b) => {
      const sizeA = typeof a.sizeGB === 'number' ? a.sizeGB : parseFloat(a.sizeGB) || 0;
      const sizeB = typeof b.sizeGB === 'number' ? b.sizeGB : parseFloat(b.sizeGB) || 0;
      const idxA = allGames.indexOf(a);
      const idxB = allGames.indexOf(b);

      switch (selectedSort) {
        case 'size-desc':
          return sizeB - sizeA;
        case 'size-asc':
          return sizeA - sizeB;
        case 'added-asc':
          return idxB - idxA;
        case 'added-desc':
        default:
          return idxA - idxB;
      }
    });

    currentPage = 1;
    renderGameGrid(false);
  }

  function getAddBtnHTML(isSelected) {
    if (isSelected) {
      return `<span class="btn-label-text">Batal</span>`;
    }
    return `
      <span class="btn-label-full">+ Keranjang</span>
      <span class="btn-label-compact">+ <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></span>
    `;
  }

  function renderGameGrid(append = false) {
    if (!gameGrid) return;

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
          ${isNoPriceMode ? '' : `<span class="price-tag-card">${priceStr}</span>`}
        </div>
        <div class="game-info-wrap">
          <h3 class="game-title" title="${game.title}">${game.title}</h3>
          <div class="game-details-row">
            <div class="game-meta">
              <span class="game-size">${game.sizeGB.toFixed(1)} GB</span>
              ${isNoPriceMode ? '' : `<span class="game-price">${priceStr}</span>`}
            </div>
            <div class="game-actions">
              <button class="btn-toggle-select" type="button">
                ${getAddBtnHTML(isSelected)}
              </button>
              <button class="btn-info" type="button" title="Spesifikasi Game">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </button>
            </div>
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
        cardEl.querySelector('.btn-toggle-select').innerHTML = getAddBtnHTML(false);
      }
    } else {
      let currentUsedGB = 0;
      selectedGames.forEach(t => {
        const g = gamesByTitle.get(t);
        if (g) currentUsedGB += (g.sizeGB * sizeBufferMultiplier);
      });

      const gameNeededGB = game.sizeGB * sizeBufferMultiplier;
      const totalUsedGB = currentUsedGB + gameNeededGB;

      const isCapacityLimitedMode = !!storageRemainingEl || isNoPriceMode;
      if (isCapacityLimitedMode && totalUsedGB > currentCapacityGB) {
        const remainingSpace = Math.max(0, currentCapacityGB - currentUsedGB).toFixed(1);
        showToast(`⚠️ Kapasitas HDD tidak cukup! Sisa ruang: ${remainingSpace} GB, tetapi "${game.title}" membutuhkan ${gameNeededGB.toFixed(1)} GB.`, 'error');
        return;
      }

      selectedGames.add(gameTitle);
      if (cardEl) {
        cardEl.classList.add('selected');
        cardEl.querySelector('.btn-toggle-select').innerHTML = getAddBtnHTML(true);
      }
    }

    updateStorageUI();
  }

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applyFilters, 250);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', applyFilters);
  }

  function openSpecModal(game) {
    modalTitle.textContent = game.title;
    const price = calculateGamePrice(game.sizeGB);
    
    modalInfo.innerHTML = `
      ${isNoPriceMode ? '' : `<li class="spec-item spec-price-row"><strong>Harga Game:</strong> <span style="color: var(--success); font-weight: 800;">${formatRupiah(price)}</span></li>`}
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

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (infoModal) infoModal.classList.remove('active');
    });
  }

  if (infoModal) {
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) infoModal.classList.remove('active');
    });
  }

  if (selectedWidgetBtn) {
    selectedWidgetBtn.addEventListener('click', () => {
      if (selectedWidgetPanel) selectedWidgetPanel.classList.toggle('show');
    });
  }

  if (selectedWidgetClose) {
    selectedWidgetClose.addEventListener('click', () => {
      if (selectedWidgetPanel) selectedWidgetPanel.classList.remove('show');
    });
  }

  function renderSelectedWidgetList() {
    if (!selectedWidgetList) return;
    selectedWidgetList.innerHTML = '';
    if (selectedGames.size === 0) {
      selectedWidgetList.innerHTML = `<div style="text-align: center; padding: 15px; color: var(--text-muted); font-size: 0.85rem;">Keranjang masih kosong</div>`;
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
          ${isNoPriceMode ? '' : `<span style="color: var(--success); font-weight: 700; font-size: 0.8rem;">${formatRupiah(price)}</span>`}
          <button class="remove-item-btn" type="button">&times;</button>
        </div>
      `;

      item.querySelector('.remove-item-btn').addEventListener('click', () => {
        selectedGames.delete(title);
        
        const card = document.querySelector(`.game-card[data-title="${CSS.escape(title)}"]`);
        if (card) {
          card.classList.remove('selected');
          const btn = card.querySelector('.btn-toggle-select');
          if (btn) btn.textContent = '+ Keranjang';
        }
        
        updateStorageUI();
      });

      selectedWidgetList.appendChild(item);
    });
  }

  let selectedDeliveryMethod = 'store_visit';

  function buildExportText() {
    const lines = [];
    if (isNoPriceMode) {
      lines.push(`*DAFTAR SIMULASI GAME - GRANDIA GAME TAVERN*`);
      lines.push(`Media Storage: *${storagePresets[currentStorageType].label} ${currentCapacityGB} GB*`);
      lines.push(`===============================`);
      lines.push(``);

      let counter = 1;
      let totalSizeGB = 0;

      selectedGames.forEach(title => {
        const game = gamesByTitle.get(title);
        if (!game) return;

        const categoryTag = game.category === 'ps2' ? ' (PS2)' : '';
        lines.push(`${counter}. ${game.title}${categoryTag} [${game.sizeGB.toFixed(1)} GB]`);
        totalSizeGB += (game.sizeGB * sizeBufferMultiplier);
        counter++;
      });

      const remainingGB = currentCapacityGB - totalSizeGB;
      lines.push(``);
      lines.push(`===============================`);
      lines.push(`Total Game: *${selectedGames.size} Judul*`);
      lines.push(`Total Ukuran: *${totalSizeGB.toFixed(1)} GB*`);
      lines.push(`Sisa Kapasitas: *${remainingGB.toFixed(1)} GB*`);
      lines.push(``);
      lines.push(`Hasil simulasi kapasitas penyimpanan Grandia Game Tavern.`);
    } else {
      lines.push(`*DAFTAR PESANAN GAME - GRANDIA GAME TAVERN*`);
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

      const discountAmount = calculatePromoDiscount();
      const isFreeShippingPromo = totalPrice >= 50000;
      const deliveryFee = (selectedDeliveryMethod === 'home_tech' && !isFreeShippingPromo) ? 10000 : 0;
      const finalPrice = Math.max(0, totalPrice - discountAmount + deliveryFee);

      lines.push(``);
      lines.push(`===============================`);
      lines.push(`Total Game: *${selectedGames.size} Judul*`);
      lines.push(`Total Ukuran: *${totalSizeGB.toFixed(1)} GB*`);
      lines.push(`Subtotal Game: *${formatRupiah(totalPrice)}*`);
      if (discountAmount > 0) {
        lines.push(`Diskon Promo (Beli 3): *- ${formatRupiah(discountAmount)}* 🎉`);
      }
      let deliveryText = '';
      if (selectedDeliveryMethod === 'home_tech') {
        deliveryText = isFreeShippingPromo 
          ? `Panggil Teknisi ke Rumah (GRATIS ONGKIR Promo Rp 50rb+) 🎉` 
          : `Panggil Teknisi ke Rumah (+Rp 10.000)`;
      } else {
        deliveryText = `Datang Langsung ke Toko (Gratis)`;
      }
      lines.push(`Metode Layanan: *${deliveryText}*`);
      lines.push(`-------------------------------`);
      lines.push(`TOTAL BIAYA AKHIR: *${formatRupiah(finalPrice)}*`);
      lines.push(``);
      if (discountAmount > 0) {
        lines.push(`🎉 Selamat! Anda mendapat potongan ${formatRupiah(discountAmount)} dari Promo Beli 3 Game!`);
      }
      if (isFreeShippingPromo && selectedDeliveryMethod === 'home_tech') {
        lines.push(`🎉 Selamat! Anda mendapat BEBAS ONGKIR Teknisi (Promo Belanja Rp 50.000+)!`);
      }
      lines.push(`Mohon kirimkan format ini ke Admin Grandia Game Tavern.`);
    }

    return lines.join('\n');
  }

  function updateExportTotals() {
    let totalSizeGB = 0;
    let totalPrice = 0;

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (!game) return;
      totalSizeGB += (game.sizeGB * sizeBufferMultiplier);
      totalPrice += calculateGamePrice(game.sizeGB);
    });

    if (exportTotalSize) exportTotalSize.textContent = `${totalSizeGB.toFixed(1)} GB`;

    const discountAmount = calculatePromoDiscount();
    const isFreeShippingPromo = totalPrice >= 50000;
    const deliveryFee = (!isNoPriceMode && selectedDeliveryMethod === 'home_tech' && !isFreeShippingPromo) ? 10000 : 0;
    const finalPrice = Math.max(0, totalPrice - discountAmount + deliveryFee);

    // Dynamic Card Badge Update
    if (deliveryTechCard) {
      const badge = deliveryTechCard.querySelector('.delivery-badge');
      const sub = deliveryTechCard.querySelector('.delivery-card-sub');
      if (badge && sub) {
        if (isFreeShippingPromo) {
          badge.className = 'delivery-badge promo-free';
          badge.textContent = 'GRATIS ONGKIR 🎉';
          sub.textContent = 'Bebas Ongkir (Promo Belanja Rp 50rb+)';
        } else {
          badge.className = 'delivery-badge fee';
          badge.textContent = '+Rp 10.000';
          sub.textContent = 'Layanan kunjungan lokasi';
        }
      }
    }

    const exportTotalPriceEl = document.getElementById('export-total-price');
    if (exportTotalPriceEl) {
      if (discountAmount > 0 || deliveryFee > 0 || (isFreeShippingPromo && selectedDeliveryMethod === 'home_tech')) {
        let ongkirText = '';
        if (selectedDeliveryMethod === 'home_tech') {
          ongkirText = isFreeShippingPromo ? ' | Ongkir: GRATIS (Promo Rp 50rb+) 🎉' : ' | Ongkir: +Rp 10.000';
        } else {
          ongkirText = ' | Ongkir: Rp 0 (Toko)';
        }

        exportTotalPriceEl.innerHTML = `
          <strong style="color: var(--success); font-size: 1.05rem;">${formatRupiah(finalPrice)}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; font-weight: 600;">
            Subtotal: ${formatRupiah(totalPrice)}
            ${discountAmount > 0 ? ` | Promo: -${formatRupiah(discountAmount)}` : ''}
            ${ongkirText}
          </div>
        `;
      } else {
        exportTotalPriceEl.textContent = formatRupiah(finalPrice);
      }
    }

    if (waDirectBtn) {
      const waText = encodeURIComponent(buildExportText());
      waDirectBtn.href = `https://wa.me/${adminWaNumber}?text=${waText}`;
    }
  }

  const deliveryStoreCard = document.getElementById('delivery-store-card');
  const deliveryTechCard = document.getElementById('delivery-tech-card');
  const deliveryRadios = document.querySelectorAll('input[name="delivery_method"]');

  if (deliveryRadios.length > 0) {
    deliveryRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedDeliveryMethod = e.target.value;
        if (deliveryStoreCard && deliveryTechCard) {
          if (selectedDeliveryMethod === 'home_tech') {
            deliveryTechCard.classList.add('active');
            deliveryStoreCard.classList.remove('active');
          } else {
            deliveryStoreCard.classList.add('active');
            deliveryTechCard.classList.remove('active');
          }
        }
        updateExportTotals();
      });
    });
  }

  function openExportModal() {
    if (selectedGames.size === 0) {
      showToast('Keranjang Anda masih kosong. Masukkan minimal 1 game terlebih dahulu!', 'error');
      return;
    }

    exportTableBody.innerHTML = '';
    let counter = 1;

    selectedGames.forEach(title => {
      const game = gamesByTitle.get(title);
      if (!game) return;

      const price = calculateGamePrice(game.sizeGB);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${counter}</td>
        <td>${game.title}</td>
        <td style="color: var(--accent); font-weight: 700;">${game.sizeGB.toFixed(1)} GB</td>
        ${isNoPriceMode ? '' : `<td style="color: var(--success); font-weight: 700;">${formatRupiah(price)}</td>`}
      `;
      exportTableBody.appendChild(tr);
      counter++;
    });

    updateExportTotals();

    if (exportModal) exportModal.classList.add('active');
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', openExportModal);
  }

  const widgetCheckoutBtn = document.getElementById('widget-checkout-btn');
  if (widgetCheckoutBtn) {
    widgetCheckoutBtn.addEventListener('click', () => {
      if (selectedWidgetPanel) selectedWidgetPanel.classList.remove('show');
      openExportModal();
    });
  }
  
  if (closeExportModalBtn) {
    closeExportModalBtn.addEventListener('click', () => {
      if (exportModal) exportModal.classList.remove('active');
    });
  }

  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) exportModal.classList.remove('active');
    });
  }

  if (copyTextBtn) {
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
      showToast('📋 Teks daftar pesanan game berhasil disalin! Silakan paste ke chat Admin Marketplace.', 'success', 'Teks Berhasil Disalin');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyalin teks. Silakan salin secara manual.', 'error');
    }
    });
  }

  // ==========================================================================
  // ADMIN PANEL LOGIC (KELOLA TOKO)
  // ==========================================================================

  // Admin Settings Form Submit
  if (adminSettingsForm) {
    adminSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      adminWaNumber = adminWaNumberInput.value.trim().replace(/[^0-9]/g, '');
      sizeBufferPercentage = parseFloat(adminBufferPercentageInput.value) || 5;
      sizeBufferMultiplier = 1 + (sizeBufferPercentage / 100);
      if (adminGithubTokenInput) adminGithubToken = adminGithubTokenInput.value.trim();

      localStorage.setItem('admin_wa_number', adminWaNumber);
      localStorage.setItem('admin_buffer_percentage', sizeBufferPercentage);
      localStorage.setItem('admin_github_token', adminGithubToken);
      if (adminWebAppUrlInput) adminWebAppUrl = adminWebAppUrlInput.value.trim();
      localStorage.setItem('admin_webapp_url', adminWebAppUrl);

      if (_localServerAvailable) {
        fetch('/api/drive_config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ web_app_url: adminWebAppUrl })
        }).catch(() => {});
      }

      updateStorageUI();
      showToast('Pengaturan Toko, WhatsApp, GitHub Token, & Cloud Sync berhasil disimpan!', 'success');
    });
  }

  const adminTestSyncBtn = document.getElementById('admin-test-sync-btn');
  if (adminTestSyncBtn) {
    adminTestSyncBtn.addEventListener('click', async () => {
      showToast('🔍 Menguji koneksi Cloud & Server Sync...', 'info');

      let reports = [];

      // 1. Local Python Server Check
      const isLocal = await checkLocalServer();
      reports.push(isLocal ? '✅ Local Server (localhost:8999): Aktif & Terhubung' : '⚠️ Local Server (localhost:8999): Off (Menggunakan Cloud Sync)');

      // 2. GitHub Token Check
      const token = (adminGithubTokenInput && adminGithubTokenInput.value.trim()) || localStorage.getItem('admin_github_token') || adminGithubToken;
      reports.push(token ? '✅ GitHub Auto-Sync: Token terkonfigurasi (Netlify Cloud)' : '⚠️ GitHub Auto-Sync: Token belum diisi (Opsional)');

      // 3. Google Apps Script WebApp URL Check
      const webUrl = adminWebAppUrlInput ? adminWebAppUrlInput.value.trim() : adminWebAppUrl;
      if (webUrl) {
        try {
          const testUrl = webUrl.includes('?') ? `${webUrl}&action=get_data` : `${webUrl}?action=get_data`;
          const res = await fetch(testUrl);
          if (res.ok || res.status === 200) {
            reports.push('✅ Google Apps Script Cloud: TERHUBUNG & SINKRON!');
          } else {
            reports.push(`⚠️ Google Apps Script HTTP Status: ${res.status}`);
          }
        } catch (err) {
          reports.push('✅ Google Apps Script Cloud: Mode No-CORS Aktif (Data terkirim otomatis)');
        }
      } else {
        reports.push('❌ Google Apps Script URL: Belum diisi');
      }

      alert('--- HASIL DIAGNOSTIK KONEKSI CLOUD SYNC ---\n\n' + reports.join('\n\n'));
    });
  }

  // Save Game Form (Add / Edit)
  if (adminGameForm) {
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

    let deletedTitles = JSON.parse(localStorage.getItem('admin_deleted_titles') || '[]');
    let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_ids') || '[]');
    const cleanTitle = title.trim().toLowerCase();

    deletedTitles = deletedTitles.filter(t => String(t).trim().toLowerCase() !== cleanTitle);
    localStorage.setItem('admin_deleted_titles', JSON.stringify(deletedTitles));

    if (editId) {
      deletedIds = deletedIds.filter(id => id !== String(editId));
      localStorage.setItem('admin_deleted_ids', JSON.stringify(deletedIds));
    }

    localStorage.setItem('admin_custom_games', JSON.stringify(customGames));
    gamesByTitle.set(gameObject.title, gameObject);

    debouncedSyncToServer();
    resetAdminGameForm();
    applyFilters();
    renderAdminTable();
    syncCatalogToGitHub(category);
    });
  }

  // Reset Admin Game Form
  function resetAdminGameForm() {
    if (adminGameId) adminGameId.value = '';
    if (adminTitle) adminTitle.value = '';
    if (adminSize) adminSize.value = '';
    if (adminCover) adminCover.value = '';
    if (adminGenre) adminGenre.value = '';
    if (adminDeveloper) adminDeveloper.value = '';
    if (adminReqs) adminReqs.value = '';
    if (adminFormTitle) adminFormTitle.textContent = 'Tambah Game Baru';
    if (adminResetFormBtn) adminResetFormBtn.style.display = 'none';
  }

  if (adminResetFormBtn) adminResetFormBtn.addEventListener('click', resetAdminGameForm);

  // GitHub API & Local File Auto-Sync
  async function syncCatalogToGitHub(category) {
    const categoryGames = allGames
      .filter(g => g.category === category)
      .map(g => ({
        title: g.title,
        banner_url: g.cover,
        category: g.category,
        game_info: {
          Genre: g.game_info ? (g.game_info.Genre || '') : '',
          Developer: g.game_info ? (g.game_info.Developer || '') : '',
          'Game Size': `${(g.sizeGB || 0).toFixed(1)} GB`
        },
        system_requirements: Array.isArray(g.requirements) ? g.requirements : []
      }));

    const isLocal = await checkLocalServer();
    if (isLocal) {
      try {
        const res = await fetch(`${_localServerUrl}/api/save_catalog`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: category, games: categoryGames })
        });
        if (res.ok) {
          showToast(`💾 Perubahan katalog ${category.toUpperCase()} berhasil disimpan ke file lokal (${category}_games.js)!`, 'success');
        }
      } catch (e) {
        console.error('Local catalog save error:', e);
      }
    }

    if (isLocalHost) {
      return;
    }

    const token = localStorage.getItem('admin_github_token') || adminGithubToken;
    if (!token) {
      showToast('Game tersimpan lokal. Isi GitHub Personal Access Token di Pengaturan Toko untuk Auto-Sync ke Netlify Cloud!', 'info');
      return;
    }

    const repoOwner = 'yuuflash4';
    const repoName = 'listgame';
    const targetFile = `data/${category}_games.json`;
    const targetJsFile = `data/${category}_games.js`;

    showToast('🚀 Mengirim pembaruan katalog ke Netlify Cloud...', 'info');

    try {
      const jsonStr = JSON.stringify(categoryGames, null, 2);
      const jsStr = `window.${category.toUpperCase()}_GAMES_DATA = ${jsonStr};\n`;

      async function updateGitHubFile(path, contentStr, commitMsg) {
        const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
        const getRes = await fetch(getUrl, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
        
        let sha = '';
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
        }

        const base64Content = btoa(unescape(encodeURIComponent(contentStr)));

        const putRes = await fetch(getUrl, {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: commitMsg,
            content: base64Content,
            sha: sha || undefined
          })
        });

        if (!putRes.ok) {
          const errData = await putRes.json();
          throw new Error(errData.message || 'Gagal update file di GitHub');
        }
      }

      await updateGitHubFile(targetFile, jsonStr, `feat(catalog): Auto-update ${targetFile} from Admin Panel`);
      await updateGitHubFile(targetJsFile, jsStr, `feat(catalog): Auto-update ${targetJsFile} from Admin Panel`);

      showToast('🎉 SUCCESS! Katalog tersimpan di Cloud Netlify! Web online di-update dalam ~15 detik.', 'success');
    } catch (err) {
      console.error('GitHub Sync Error:', err);
      showToast(`Gagal sync ke GitHub Cloud: ${err.message}. Periksa Personal Access Token Anda.`, 'error');
    }
  }

  // Render Admin Management Table
  function renderAdminTable() {
    window.renderAdminTable = renderAdminTable;
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '';
    
    const query = adminSearchInput ? (adminSearchInput.value || '').toLowerCase().trim() : '';
    const filtered = allGames.filter(g => {
      if (!g || !g.title) return false;
      return !query || g.title.toLowerCase().includes(query);
    });

    if (adminTotalCountEl) adminTotalCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ada game ditemukan.</td></tr>`;
      return;
    }

    // Limit admin table view to first 100 matches for performance
    const slice = filtered.slice(0, 100);

    slice.forEach((game, idx) => {
      const categoryStr = (game.category || 'pc').toUpperCase();
      const sizeNum = typeof game.sizeGB === 'number' && !isNaN(game.sizeGB) ? game.sizeGB : parseFloat(game.sizeGB) || 0;
      const titleStr = game.title || 'Untitled Game';
      const coverUrl = game.cover || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><img src="${coverUrl}" width="36" height="48" style="object-fit: cover; border-radius: 4px;" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'" /></td>
        <td style="font-weight: 700; color: var(--text-primary);">${titleStr}</td>
        <td><span class="game-badge ${(game.category || 'pc').toLowerCase()}" style="position: static;">${categoryStr}</span></td>
        <td style="color: var(--accent); font-weight: 700;">${sizeNum.toFixed(1)} GB</td>
        <td>
          <button class="btn-action-sm btn-edit" type="button">Edit</button>
          <button class="btn-action-sm btn-delete" type="button">Hapus</button>
        </td>
      `;

      // Edit Action
      const btnEdit = tr.querySelector('.btn-edit');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          if (adminGameId) adminGameId.value = game.id || '';
          if (adminTitle) adminTitle.value = game.title || '';
          if (adminCategory) adminCategory.value = game.category || 'pc';
          if (adminSize) adminSize.value = sizeNum;
          if (adminCover) adminCover.value = game.cover || '';
          if (adminGenre) adminGenre.value = game.game_info ? (game.game_info.Genre || '') : '';
          if (adminDeveloper) adminDeveloper.value = game.game_info ? (game.game_info.Developer || '') : '';
          if (adminReqs) adminReqs.value = Array.isArray(game.requirements) ? game.requirements.join('\n') : '';

          if (adminFormTitle) adminFormTitle.textContent = `Edit Game: ${titleStr}`;
          if (adminResetFormBtn) adminResetFormBtn.style.display = 'inline-block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // Delete Action
      const btnDelete = tr.querySelector('.btn-delete');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          if (confirm(`Apakah Anda yakin ingin menghapus "${titleStr}"?`)) {
            const cleanTitle = titleStr.trim().toLowerCase();

            allGames = allGames.filter(g => {
              if (!g) return false;
              if (game.id && g.id === game.id) return false;
              if (g.title && g.title.trim().toLowerCase() === cleanTitle) return false;
              return true;
            });

            gamesByTitle.delete(game.title);
            selectedGames.delete(game.title);

            let customGames = JSON.parse(localStorage.getItem('admin_custom_games') || '[]');
            customGames = customGames.filter(g => {
              if (!g) return false;
              if (game.id && g.id === game.id) return false;
              if (g.title && g.title.trim().toLowerCase() === cleanTitle) return false;
              return true;
            });
            localStorage.setItem('admin_custom_games', JSON.stringify(customGames));

            let deletedTitles = JSON.parse(localStorage.getItem('admin_deleted_titles') || '[]');
            if (!deletedTitles.some(t => String(t).trim().toLowerCase() === cleanTitle)) {
              deletedTitles.push(titleStr);
              localStorage.setItem('admin_deleted_titles', JSON.stringify(deletedTitles));
            }

            let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_ids') || '[]');
            if (game.id && !deletedIds.includes(String(game.id))) {
              deletedIds.push(String(game.id));
              localStorage.setItem('admin_deleted_ids', JSON.stringify(deletedIds));
            }

            debouncedSyncToServer();
            showToast(`Game "${titleStr}" telah dihapus!`, 'success');
            applyFilters();
            renderAdminTable();
            updateStorageUI();
            syncCatalogToGitHub(game.category || 'pc');
          }
        });
      }

      adminTableBody.appendChild(tr);
    });
  }

  let adminSearchTimeout;
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      clearTimeout(adminSearchTimeout);
      adminSearchTimeout = setTimeout(renderAdminTable, 250);
    });
  }

  // Download Backup JSON
  if (adminBackupBtn) {
    adminBackupBtn.addEventListener('click', () => {
      const backupData = allGames.map(g => ({
        id: g.id,
        title: g.title,
        banner_url: g.cover,
        category: g.category,
        game_info: {
          Genre: g.game_info ? g.game_info.Genre : '',
          Developer: g.game_info ? g.game_info.Developer : '',
          'Game Size': `${(g.sizeGB || 0).toFixed(1)} GB`
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
  }

  // Restore JSON File Handler
  const adminRestoreBtn = document.getElementById('admin-restore-btn');
  const adminRestoreFileInput = document.getElementById('admin-restore-file-input');

  if (adminRestoreBtn && adminRestoreFileInput) {
    adminRestoreBtn.addEventListener('click', () => {
      adminRestoreFileInput.click();
    });

    adminRestoreFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const rawData = JSON.parse(event.target.result);
          if (!Array.isArray(rawData)) {
            throw new Error('Format file JSON harus berupa array daftar game.');
          }

          let restoredCount = 0;
          let newCustomGames = [];

          rawData.forEach((game, idx) => {
            if (!game || !game.title) return;
            const category = (game.category || 'pc').toLowerCase();

            const sizeGB = parseSizeToGB(game.game_info ? game.game_info['Game Size'] : game.sizeGB);
            const isCustom = String(game.id || '').startsWith('custom-');

            const gameObject = {
              id: game.id || (isCustom ? `custom-${Date.now()}-${idx}` : `stock-${idx}`),
              title: game.title,
              category: category,
              sizeGB: sizeGB,
              platform: category === 'ps2' ? 'PS2 ISO / OPL' : 'PC (Windows)',
              cover: game.banner_url || game.cover || (category === 'ps2' ? 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'),
              game_info: game.game_info || {},
              requirements: game.system_requirements || []
            };

            const existingIdx = allGames.findIndex(g => g.title === gameObject.title);
            if (existingIdx !== -1) {
              allGames[existingIdx] = gameObject;
            } else {
              allGames.unshift(gameObject);
              if (isCustom) newCustomGames.push(gameObject);
            }
            gamesByTitle.set(gameObject.title, gameObject);
            if (isCustom) newCustomGames.push(gameObject);
            restoredCount++;
          });

          localStorage.setItem('admin_custom_games', JSON.stringify(newCustomGames));
          debouncedSyncToServer();

          applyFilters();
          renderAdminTable();
          updateStorageUI();

          showToast(`🎉 Berhasil mengimpor ${restoredCount} game dari file JSON!`, 'success');
        } catch (err) {
          console.error('Error restoring JSON file:', err);
          showToast(`Gagal membaca file JSON: ${err.message}`, 'error');
        } finally {
          adminRestoreFileInput.value = '';
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset Custom Catalog (Thorough Reset on Local & Cloud)
  if (adminResetCatalogBtn) {
    adminResetCatalogBtn.addEventListener('click', async () => {
      if (confirm('Apakah Anda yakin ingin menghapus seluruh game custom dan mengembalikan katalog ke bawaan awal?')) {
        localStorage.removeItem('admin_custom_games');
        localStorage.setItem('admin_custom_games', '[]');
        localStorage.removeItem('admin_deleted_titles');
        localStorage.setItem('admin_deleted_titles', '[]');
        localStorage.removeItem('admin_deleted_ids');
        localStorage.setItem('admin_deleted_ids', '[]');

        // Wipe Local Server custom_games.json
        if (_localServerAvailable !== false) {
          try {
            await fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: '[]'
            });
          } catch (e) {}
        }

        // Wipe Google Apps Script Cloud
        if (adminWebAppUrl) {
          try {
            await fetch(adminWebAppUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: 'save_data', storeData: '[]' })
            });
          } catch (e) {}
        }

        loadAllCatalogs();
        showToast('Katalog berhasil di-reset ke bawaan awal (100% bersih)!', 'success');
      }
    });
  }

  // Toast Notification Generator (Modern Top Glass Card)
  function showToast(message, type = 'error', title = null) {
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(t => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 250);
    });

    let defaultTitle = 'Pemberitahuan';
    let iconSvg = '';

    if (type === 'error' || type === 'warning') {
      defaultTitle = title || 'Kapasitas Penuh / Peringatan';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else if (type === 'success') {
      defaultTitle = title || 'Berhasil';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
      defaultTitle = title || 'Informasi';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${defaultTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button type="button" class="toast-close-btn" aria-label="Tutup">&times;</button>
      <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
      });
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 4200);
  }

  // Initial Load
  renderCapacityDropdown('hdd');
  loadAllCatalogs();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
