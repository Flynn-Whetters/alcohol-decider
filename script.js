/* ============================================
   🎉 WACKY PARTY DRINK REGISTRY - LOGIC
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  let drinks = [];          // { name, claimedBy: [], max, emoji }
  let currentFilter = 'all';
  let selectedDrinkIndex = null;
  let isOfflineMode = false;

  // --- DOM refs ---
  const drinkGrid = document.getElementById('drink-grid');
  const loading = document.getElementById('loading');
  const errorBanner = document.getElementById('error-banner');
  const claimModal = document.getElementById('claim-modal');
  const claimForm = document.getElementById('claim-form');
  const claimNameInput = document.getElementById('claim-name');
  const claimQuantityInput = document.getElementById('claim-quantity');
  const modalDrinkName = document.getElementById('modal-drink-name');
  const modalEmoji = document.getElementById('modal-emoji');
  const modalError = document.getElementById('modal-error');
  const modalClose = document.getElementById('modal-close');
  const takenPopup = document.getElementById('taken-popup');
  const spinnerModal = document.getElementById('spinner-modal');
  const spinnerDisplay = document.getElementById('spinner-display');
  const spinBtn = document.getElementById('spin-btn');
  const spinnerClose = document.getElementById('spinner-close');
  const randomBtn = document.getElementById('random-btn');
  const statClaimed = document.getElementById('stat-claimed');
  const statAvailable = document.getElementById('stat-available');
  const statTotal = document.getElementById('stat-total');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const partyTitle = document.getElementById('party-title');
  const partyLocation = document.getElementById('party-location');

  // --- Emoji map for drinks ---
  const DRINK_EMOJIS = {
    'vodka': '🍸', 'tequila': '🌵', 'beer': '🍺', 'rum': '🏴‍☠️',
    'gin': '🫒', 'whiskey': '🥃', 'champagne': '🍾', 'cider': '🍏',
    'premix': '🥫', 'shots': '🔥', 'non-alcoholic': '🧃', 'non alcoholic': '🧃',
    'mixer': '🫧', 'lime': '🍋', 'cup': '🥤', 'straw': '🥤',
    'snack': '🍿', 'wine': '🍷', 'cocktail': '🍹', 'seltzer': '🫧',
    'water': '💧', 'soda': '🥤', 'cola': '🥤',
    'triple sec': '🍊', 'kahlúa': '☕', 'kahlua': '☕', 'peach schnapps': '🍑',
    'crème de mûre': '🫐', 'creme de mure': '🫐',
    'mango': '🥭', 'pineapple': '🍍', 'orange juice': '🍊',
    'cranberry': '🫐', 'ginger beer': '🍺', 'coke': '🥤',
    'sugar syrup': '🍯', 'espresso': '☕',
    'malibu': '🥥', 'blue curacao': '💙', 'curaçao': '💙',
    'juice': '🧃'
  };
  const FALLBACK_EMOJIS = ['🍹', '🥂', '🍻', '🎊', '🥳', '🍸', '🎉', '🧉'];

  // --- Init ---
  function init() {
    partyTitle.textContent = CONFIG.PARTY_NAME;
    partyLocation.textContent = CONFIG.PARTY_LOCATION;
    startCountdown();
    setupEventListeners();
    loadDrinks();
  }

  // --- Google Sheets API ---
  function getSheetsReadUrl() {
    return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(CONFIG.SPREADSHEET_ID)}/values/${encodeURIComponent(CONFIG.SHEET_NAME)}?key=${encodeURIComponent(CONFIG.API_KEY)}`;
  }

  function getSheetsUpdateUrl(range) {
    return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(CONFIG.SPREADSHEET_ID)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED&key=${encodeURIComponent(CONFIG.API_KEY)}`;
  }

  async function loadDrinks() {
    loading.style.display = '';
    drinkGrid.innerHTML = '';

    if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE' || CONFIG.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
      // No Sheets configured — use default drinks in offline mode
      loadOfflineDrinks();
      return;
    }

    try {
      const resp = await fetch(getSheetsReadUrl());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const rows = data.values || [];

      drinks = [];
      // Skip header row if present
      const startIndex = (rows.length > 0 && rows[0][0] && rows[0][0].toLowerCase().includes('drink')) ? 1 : 0;

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] || !row[0].trim()) continue;
        // Column B = comma-separated names, C = status, D = max (optional), E = comma-separated quantities
        var names = row[1] ? row[1].split(',').map(function(n) { return sanitize(n.trim()); }).filter(Boolean) : [];
        var quantities = row[4] ? row[4].split(',').map(function(q) { return q.trim(); }).filter(Boolean) : [];
        var max = (row[3] && parseInt(row[3], 10)) || CONFIG.DEFAULT_MAX_PER_DRINK;
        drinks.push({
          name: sanitize(row[0].trim()),
          claimedBy: names,
          quantities: quantities,
          max: max,
          emoji: getEmojiForDrink(row[0].trim()),
          rowIndex: i + 1  // 1-based for Sheets API
        });
      }

      isOfflineMode = false;
      loading.style.display = 'none';
      renderDrinks();
    } catch (err) {
      console.warn('Failed to load from Google Sheets:', err);
      loadOfflineDrinks();
    }
  }

  function loadOfflineDrinks() {
    isOfflineMode = true;
    errorBanner.style.display = '';

    // Try to load from localStorage
    const stored = localStorage.getItem('wacky-party-drinks');
    if (stored) {
      try {
        drinks = JSON.parse(stored);
        // Re-sanitize loaded data & migrate old format
        drinks = drinks.map(function(d) {
          var names = d.claimedBy;
          if (typeof names === 'string') {
            names = names ? [sanitize(names)] : [];
          } else if (Array.isArray(names)) {
            names = names.map(function(n) { return sanitize(n); });
          } else {
            names = [];
          }
          return {
            name: sanitize(d.name),
            claimedBy: names,
            quantities: d.quantities || [],
            max: d.max || CONFIG.DEFAULT_MAX_PER_DRINK,
            emoji: d.emoji || getEmojiForDrink(d.name)
          };
        });
      } catch (e) {
        drinks = [];
      }
    }

    if (!drinks.length) {
      drinks = CONFIG.DEFAULT_DRINKS.map(function (item) {
        var name = typeof item === 'string' ? item : item.name;
        var max = typeof item === 'object' && item.max ? item.max : CONFIG.DEFAULT_MAX_PER_DRINK;
        return {
          name: sanitize(name),
          claimedBy: [],
          quantities: [],
          max: max,
          emoji: getEmojiForDrink(name)
        };
      });
    }

    loading.style.display = 'none';
    renderDrinks();
  }

  function saveOffline() {
    localStorage.setItem('wacky-party-drinks', JSON.stringify(drinks));
  }

  // --- Sanitization ---
  function sanitize(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Emoji helpers ---
  function getEmojiForDrink(name) {
    var lower = name.toLowerCase();
    // Check for "ice" as a standalone word (not inside "juice")
    if (/\bice\b/.test(lower) && lower.indexOf('juice') === -1) return '🧊';
    for (var key in DRINK_EMOJIS) {
      if (lower.indexOf(key) !== -1) return DRINK_EMOJIS[key];
    }
    // Check if the name already contains an emoji
    var emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    if (emojiPattern.test(name)) return '';
    return FALLBACK_EMOJIS[Math.floor(Math.random() * FALLBACK_EMOJIS.length)];
  }

  // --- Helpers ---
  function isFull(drink) {
    return drink.claimedBy.length >= drink.max;
  }

  function slotsLeft(drink) {
    return Math.max(0, drink.max - drink.claimedBy.length);
  }

  // --- Render ---
  function renderDrinks() {
    drinkGrid.innerHTML = '';
    var fullCount = 0;
    var availableCount = 0;
    var totalSlotsClaimed = 0;

    drinks.forEach(function (drink, index) {
      var full = isFull(drink);
      if (full) fullCount++; else availableCount++;
      totalSlotsClaimed += drink.claimedBy.length;

      // Filter
      var hidden = false;
      if (currentFilter === 'available' && full) hidden = true;
      if (currentFilter === 'claimed' && !full) hidden = true;

      var card = document.createElement('div');
      var cardClass = 'drink-card ';
      if (full) {
        cardClass += 'claimed';
      } else if (drink.claimedBy.length > 0) {
        cardClass += 'partial';
      } else {
        cardClass += 'available';
      }
      cardClass += (hidden ? ' hidden' : '') + ' animate-in';
      card.className = cardClass;
      card.style.animationDelay = (index * 0.05) + 's';

      var html = '';
      if (drink.emoji) {
        html += '<span class="card-emoji">' + drink.emoji + '</span>';
      }
      html += '<div class="card-drink-name">' + drink.name + '</div>';

      // Capacity indicator
      html += '<div class="card-capacity">';
      for (var s = 0; s < drink.max; s++) {
        html += '<span class="slot ' + (s < drink.claimedBy.length ? 'slot-filled' : 'slot-empty') + '"></span>';
      }
      html += '</div>';
      html += '<div class="card-slots-text">' + drink.claimedBy.length + '/' + drink.max + ' spots taken</div>';

      // Names list
      if (drink.claimedBy.length > 0) {
        html += '<div class="card-names-list">';
        drink.claimedBy.forEach(function (name, idx) {
          var qty = drink.quantities && drink.quantities[idx] ? ' (' + drink.quantities[idx] + ')' : '';
          html += '<span class="card-name-tag">🙋 ' + name + qty + '</span>';
        });
        html += '</div>';
      }

      if (full) {
        html += '<span class="card-status claimed-status">🔒 Full</span>';
        html += '<div class="card-lock-icon">✅</div>';
      } else {
        html += '<span class="card-status available">✨ ' + slotsLeft(drink) + ' spot' + (slotsLeft(drink) !== 1 ? 's' : '') + ' left</span>';
        html += '<button class="card-grab-btn">🙋 I\'m Bringing This!</button>';
      }

      card.innerHTML = html;

      if (!full) {
        card.addEventListener('click', function () {
          openClaimModal(index);
        });
      } else {
        card.addEventListener('click', function () {
          showTakenPopup();
        });
      }

      drinkGrid.appendChild(card);
    });

    statClaimed.textContent = totalSlotsClaimed;
    statAvailable.textContent = availableCount;
    statTotal.textContent = drinks.length;
  }

  // --- Claim Modal ---
  function openClaimModal(index) {
    if (isFull(drinks[index])) {
      showTakenPopup();
      return;
    }
    selectedDrinkIndex = index;
    var drink = drinks[index];
    modalDrinkName.textContent = drink.name;
    modalEmoji.textContent = drink.emoji || '🍹';
    // Show slots info in modal
    var slotsInfo = document.getElementById('modal-slots');
    if (slotsInfo) slotsInfo.textContent = slotsLeft(drink) + ' of ' + drink.max + ' spots remaining';
    modalError.style.display = 'none';
    claimNameInput.value = '';
    claimQuantityInput.value = '';
    claimModal.style.display = '';
    setTimeout(function () { claimNameInput.focus(); }, 100);
  }

  function closeClaimModal() {
    claimModal.style.display = 'none';
    selectedDrinkIndex = null;
  }

  async function handleClaim(e) {
    e.preventDefault();
    if (selectedDrinkIndex === null) return;

    var name = claimNameInput.value.trim();
    if (!name) {
      showModalError('Please enter your name! 🤨');
      return;
    }
    if (name.length > 50) {
      showModalError('Name too long! Keep it under 50 chars 😅');
      return;
    }

    var quantity = claimQuantityInput.value.trim();
    if (!quantity) {
      showModalError('Please enter how much you\'re bringing! 📏');
      return;
    }
    // Validate quantity: must be a number followed by L, ml, or bottles
    var qtyPattern = /^\d+(\.\d+)?\s*(L|l|ml|ML|Ml|bottles?|BOTTLES?)$/;
    if (!qtyPattern.test(quantity)) {
      showModalError('Enter a valid amount, e.g. 1L, 500ml, or 2 bottles 📏');
      return;
    }

    var drink = drinks[selectedDrinkIndex];
    if (isFull(drink)) {
      showModalError('Oops! All spots are taken now! Pick another drink 😱');
      return;
    }

    // Check if this person already signed up for this drink
    var sanitizedName = sanitize(name);
    var alreadySignedUp = drink.claimedBy.some(function(n) {
      return n.toLowerCase() === sanitizedName.toLowerCase();
    });
    if (alreadySignedUp) {
      showModalError('You\'re already bringing this one! 😄');
      return;
    }

    // Disable button while processing
    var btn = claimForm.querySelector('.btn-claim');
    btn.disabled = true;
    btn.textContent = '⏳ Claiming...';

    try {
      drink.claimedBy.push(sanitizedName);
      if (!drink.quantities) drink.quantities = [];
      drink.quantities.push(quantity);

      if (!isOfflineMode) {
        await updateGoogleSheet(drink, quantity);
      }

      if (isOfflineMode) {
        saveOffline();
      }

      closeClaimModal();
      renderDrinks();
      fireConfetti();
    } catch (err) {
      // Roll back on failure
      drink.claimedBy.pop();
      if (drink.quantities) drink.quantities.pop();
      console.error('Claim failed:', err);
      showModalError('Something went wrong! Try again 😵');
    } finally {
      btn.disabled = false;
      btn.textContent = '🎉 I\'m Bringing It! 🎉';
    }
  }

  async function updateGoogleSheet(drink, quantity) {
    // Use Apps Script web app via GET request (bypasses all CORS issues)
    var url = CONFIG.APPS_SCRIPT_URL;
    if (!url || url === 'YOUR_APPS_SCRIPT_URL_HERE') {
      throw new Error('Apps Script URL not configured');
    }

    var latestName = drink.claimedBy[drink.claimedBy.length - 1];
    var params = '?action=claim' +
      '&row=' + encodeURIComponent(drink.rowIndex) +
      '&name=' + encodeURIComponent(latestName) +
      '&max=' + encodeURIComponent(drink.max) +
      '&quantity=' + encodeURIComponent(quantity || '');

    // Fire-and-forget via image tag — no CORS, no redirects, just works
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(); };
      img.onerror = function () { resolve(); }; // Still resolves — the "error" is just because response isn't an image
      img.src = url + params;

      // Safety timeout
      setTimeout(resolve, 5000);
    });
  }

  function showModalError(msg) {
    modalError.textContent = msg;
    modalError.style.display = '';
  }

  // --- Taken popup ---
  function showTakenPopup() {
    takenPopup.style.display = '';
    setTimeout(function () {
      takenPopup.style.display = 'none';
    }, 1500);
  }

  // --- Filter ---
  function setupFilters() {
    var buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderDrinks();
      });
    });
  }

  // --- Random Spinner ---
  function openSpinner() {
    spinnerModal.style.display = '';
    spinnerDisplay.textContent = '???';
    spinnerDisplay.classList.remove('spinning');
  }

  function closeSpinner() {
    spinnerModal.style.display = 'none';
  }

  function spin() {
    var available = drinks.filter(function (d) { return !isFull(d); });
    if (!available.length) {
      spinnerDisplay.textContent = 'All taken! 😱';
      return;
    }

    spinnerDisplay.classList.add('spinning');
    spinBtn.disabled = true;

    var spins = 0;
    var totalSpins = 15 + Math.floor(Math.random() * 10);
    var interval = setInterval(function () {
      var rand = available[Math.floor(Math.random() * available.length)];
      spinnerDisplay.textContent = (rand.emoji || '🍹') + ' ' + rand.name;
      spins++;

      if (spins >= totalSpins) {
        clearInterval(interval);
        spinnerDisplay.classList.remove('spinning');
        spinBtn.disabled = false;
        // Final pick
        var pick = available[Math.floor(Math.random() * available.length)];
        spinnerDisplay.textContent = (pick.emoji || '🍹') + ' ' + pick.name + ' 🎉';
        fireConfetti();
      }
    }, 80 + spins * 5);
  }

  // --- Countdown Timer ---
  function startCountdown() {
    function update() {
      var target = new Date(CONFIG.PARTY_DATE).getTime();
      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        document.getElementById('cd-days').textContent = '🎉';
        document.getElementById('cd-hours').textContent = 'IT\'S';
        document.getElementById('cd-mins').textContent = 'PARTY';
        document.getElementById('cd-secs').textContent = 'TIME';
        return;
      }

      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);

      document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // --- Confetti 🎊 ---
  function fireConfetti() {
    var ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    var particles = [];
    var colors = ['#ff2d95', '#00d4ff', '#39ff14', '#fff01f', '#ff6b35', '#b537f2'];

    for (var i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: -10 - Math.random() * confettiCanvas.height * 0.3,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    var frame = 0;
    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      var alive = false;

      particles.forEach(function (p) {
        if (p.opacity <= 0) return;
        alive = true;

        p.x += p.vx;
        p.vy += 0.1;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (frame > 60) {
          p.opacity -= 0.015;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frame++;
      if (alive && frame < 200) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    animate();
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    claimForm.addEventListener('submit', handleClaim);
    modalClose.addEventListener('click', closeClaimModal);
    claimModal.addEventListener('click', function (e) {
      if (e.target === claimModal) closeClaimModal();
    });

    randomBtn.addEventListener('click', openSpinner);
    spinBtn.addEventListener('click', spin);
    spinnerClose.addEventListener('click', closeSpinner);
    spinnerModal.addEventListener('click', function (e) {
      if (e.target === spinnerModal) closeSpinner();
    });

    setupFilters();

    // Close modals on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeClaimModal();
        closeSpinner();
      }
    });

    // Handle window resize for confetti canvas
    window.addEventListener('resize', function () {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    });
  }

  // --- Start! ---
  document.addEventListener('DOMContentLoaded', init);
})();
