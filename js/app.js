// ============================================================
// Constants
// ============================================================

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];
const LS_KEY = 'expense-app-state';

// ============================================================
// State
// ============================================================

let state = {
  transactions: [],     // Transaction[]
  categories: [],       // string[] (custom only; defaults always prepended)
  spendingLimit: null,  // number | null
  theme: 'light',       // 'light' | 'dark'
  sortOrder: 'default'  // 'default' | 'amount-asc' | 'amount-desc' | 'category-asc'
};

// ============================================================
// Persistence
// ============================================================

/**
 * Reads "expense-app-state" from Local Storage and populates state.
 * Falls back to defaults on missing or corrupt data.
 */
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return; // no saved state — keep defaults

    const parsed = JSON.parse(raw);

    state.transactions  = Array.isArray(parsed.transactions)  ? parsed.transactions  : [];
    state.categories    = Array.isArray(parsed.categories)    ? parsed.categories    : [];
    state.spendingLimit = typeof parsed.spendingLimit === 'number' ? parsed.spendingLimit : null;
    state.theme         = parsed.theme === 'dark' ? 'dark' : 'light';
    state.sortOrder     = ['default', 'amount-asc', 'amount-desc', 'category-asc'].includes(parsed.sortOrder)
                            ? parsed.sortOrder
                            : 'default';

    // Apply theme immediately so there's no flash of wrong theme before render
    applyTheme();
  } catch (err) {
    // Corrupted JSON — reset to defaults and clear the bad entry
    console.warn('expense-app: failed to parse Local Storage state, resetting.', err);
    state = {
      transactions: [],
      categories: [],
      spendingLimit: null,
      theme: 'light',
      sortOrder: 'default'
    };
    try { localStorage.removeItem(LS_KEY); } catch (_) { /* ignore */ }
  }
}

/**
 * Serializes the current state to Local Storage.
 * Shows an in-memory-only banner if Local Storage is unavailable.
 */
function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('expense-app: Local Storage unavailable, running in-memory only.', err);
    const banner = document.getElementById('ls-banner');
    if (banner) banner.classList.remove('hidden');
  }
}

// ============================================================
// Mutations
// ============================================================

/**
 * Generates a unique ID using crypto.randomUUID() with a fallback.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random();
}

/**
 * Adds a new transaction to state and persists it.
 * @param {string} name - Non-empty item name
 * @param {number} amount - Positive numeric amount
 * @param {string} category - Valid category label
 */
function addTransaction(name, amount, category) {
  const transaction = {
    id: generateId(),
    name: name.trim(),
    amount: Number(amount),
    category,
    date: new Date().toISOString()
  };
  state.transactions.push(transaction);
  saveState();
}

// ============================================================
// Computed values
// ============================================================

/**
 * Sums all amount values from the transactions array.
 * Returns 0 for an empty array.
 * @param {Array} transactions
 * @returns {number}
 */
function computeBalance(transactions) {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Groups transactions by YYYY-MM and sums amounts per group.
 * Returns an object with keys sorted chronologically.
 * @param {Array} transactions
 * @returns {Object} e.g. { '2024-01': 42.5, '2024-02': 18.0 }
 */
function computeMonthlySummary(transactions) {
  const groups = {};
  for (const tx of transactions) {
    const key = tx.date.slice(0, 7); // 'YYYY-MM' from ISO 8601
    groups[key] = (groups[key] || 0) + tx.amount;
  }
  // Return a new object with keys sorted chronologically
  return Object.fromEntries(
    Object.keys(groups).sort().map(k => [k, groups[k]])
  );
}

// ============================================================
// Render (stub — will be filled in by subsequent tasks)
// ============================================================

/**
 * Calls all render functions to fully refresh the UI from state.
 * Individual render functions will be implemented in later tasks.
 */
function renderAll() {
  renderBalance();
  renderTransactionList();
  renderChart();
  renderMonthlySummary();
  renderLimitIndicator();
  renderCategoryDropdowns();
  renderCategoryManager();
  applyTheme();
}

// Module-level Chart instance tracker
let chartInstance = null;

// Stub render functions — each will be fully implemented in its own task.

function renderBalance() {
  const el = document.getElementById('balance');
  if (!el) return;
  const total = computeBalance(state.transactions);
  el.textContent = '$' + total.toFixed(2);
}

/**
 * Updates the sort order in state and re-renders the transaction list.
 * @param {string} order - One of 'default', 'amount-asc', 'amount-desc', 'category-asc'
 */
function setSortOrder(order) {
  state.sortOrder = order;
  renderTransactionList();
}

function sortTransactions(transactions, sortOrder) {
  const sorted = [...transactions];
  switch (sortOrder) {
    case 'amount-asc':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'category-asc':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'default':
    default:
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(tx => tx.id !== id);
  saveState();
  renderTransactionList();
  renderBalance();
  renderChart();
  renderMonthlySummary();
  renderLimitIndicator();
}

function renderTransactionList() {
  const el = document.getElementById('transaction-list');
  if (!el) return;

  if (state.transactions.length === 0) {
    el.innerHTML = '<li class="tx-empty">No transactions yet.</li>';
    return;
  }

  const sorted = sortTransactions(state.transactions, state.sortOrder);
  el.innerHTML = '';

  sorted.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.dataset.id = tx.id;

    li.innerHTML = `
      <div class="tx-info">
        <div class="tx-name">${escapeHtml(tx.name)}</div>
        <div class="tx-meta">${escapeHtml(tx.category)}</div>
      </div>
      <span class="tx-amount">$${tx.amount.toFixed(2)}</span>
      <button class="btn-danger" aria-label="Delete ${escapeHtml(tx.name)}">Delete</button>
    `;

    li.querySelector('button').addEventListener('click', () => deleteTransaction(tx.id));
    el.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderChart() {
  const canvas = document.getElementById('spending-chart');
  if (!canvas) return;

  // Remove any existing placeholder
  const existingPlaceholder = canvas.parentElement.querySelector('.chart-placeholder');
  if (existingPlaceholder) existingPlaceholder.remove();

  // Chart.js CDN failed to load
  if (!window.Chart) {
    canvas.style.display = 'none';
    canvas.insertAdjacentHTML('afterend', '<p class="chart-placeholder">Chart unavailable</p>');
    return;
  }

  // No transactions — show placeholder, destroy chart if it exists
  if (state.transactions.length === 0) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    canvas.style.display = 'none';
    canvas.insertAdjacentHTML('afterend', '<p class="chart-placeholder">No transactions yet</p>');
    return;
  }

  // Compute per-category totals
  const allCategories = [...DEFAULT_CATEGORIES, ...state.categories];
  const totals = allCategories.map(cat =>
    state.transactions
      .filter(tx => tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  // Filter out categories with zero spending
  const labels = allCategories.filter((_, i) => totals[i] > 0);
  const data   = totals.filter(t => t > 0);

  canvas.style.display = '';

  if (!chartInstance) {
    // First call — create the Chart instance
    chartInstance = new window.Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56',
            '#4BC0C0', '#9966FF', '#FF9F40',
            '#C9CBCF', '#7BC8A4', '#E7E9ED'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  } else {
    // Subsequent calls — update existing instance
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
  }
}

function renderMonthlySummary() {
  const el = document.getElementById('monthly-summary');
  if (!el) return;

  if (state.transactions.length === 0) {
    el.innerHTML = '<p class="summary-empty">No transactions yet.</p>';
    return;
  }

  const summary = computeMonthlySummary(state.transactions);
  el.innerHTML = '';

  for (const [month, total] of Object.entries(summary)) {
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML = `
      <span class="summary-month">${month}</span>
      <span class="summary-amount">$${total.toFixed(2)}</span>
    `;
    el.appendChild(row);
  }
}

/**
 * Returns true iff spendingLimit is a positive number AND the sum of all
 * transaction amounts strictly exceeds it.
 * @param {Object} appState
 * @returns {boolean}
 */
function shouldShowLimitIndicator(appState) {
  if (typeof appState.spendingLimit !== 'number' || appState.spendingLimit <= 0) {
    return false;
  }
  return computeBalance(appState.transactions) > appState.spendingLimit;
}

/**
 * Sets the spending limit in state, persists it, and re-renders the indicator.
 * Rejects non-positive or non-numeric values silently.
 * @param {number|string} value
 */
function setSpendingLimit(value) {
  const parsed = Number(value);
  if (isNaN(parsed) || parsed <= 0) return;
  state.spendingLimit = parsed;
  saveState();
  renderLimitIndicator();
}

function renderLimitIndicator() {
  const el = document.getElementById('limit-indicator');
  if (!el) return;
  if (shouldShowLimitIndicator(state)) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }

  // Update the current-limit display
  const currentLimitEl = document.getElementById('current-limit');
  if (currentLimitEl) {
    currentLimitEl.textContent = state.spendingLimit
      ? `Current limit: $${state.spendingLimit.toFixed(2)}`
      : '';
  }
}

function renderCategoryDropdowns() {
  const select = document.getElementById('tx-category');
  if (!select) return;
  const allCategories = [...DEFAULT_CATEGORIES, ...state.categories];
  // Preserve current selection
  const current = select.value;
  select.innerHTML = '<option value="">-- Select category --</option>';
  allCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === current) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderCategoryManager() {
  const list = document.getElementById('category-list');
  if (!list) return;
  list.innerHTML = '';
  // Show default categories (read-only)
  DEFAULT_CATEGORIES.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'category-item';
    li.innerHTML = `<span class="category-default">${escapeHtml(cat)} (default)</span>`;
    list.appendChild(li);
  });
  // Show custom categories with delete button
  state.categories.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'category-item';
    li.innerHTML = `
      <span>${escapeHtml(cat)}</span>
      <button class="btn-danger" aria-label="Delete category ${escapeHtml(cat)}">Delete</button>
    `;
    li.querySelector('button').addEventListener('click', () => deleteCategory(cat));
    list.appendChild(li);
  });

  // Clear any previous validation error
  const errorEl = document.getElementById('category-error');
  if (errorEl) errorEl.textContent = '';
}

/**
 * Adds a new custom category to state after validation.
 * Rejects empty/whitespace or duplicate labels.
 * @param {string} label
 * @returns {boolean} true if added, false if rejected
 */
function addCategory(label) {
  const trimmed = label ? label.trim() : '';
  const errorEl = document.getElementById('category-error');

  if (!trimmed) {
    if (errorEl) errorEl.textContent = 'Category name cannot be empty.';
    return false;
  }

  const allCategories = [...DEFAULT_CATEGORIES, ...state.categories];
  const isDuplicate = allCategories.some(
    c => c.toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    if (errorEl) errorEl.textContent = 'Category already exists.';
    return false;
  }

  state.categories.push(trimmed);
  saveState();
  renderCategoryDropdowns();
  renderCategoryManager();
  return true;
}

/**
 * Removes a custom category from state and re-renders.
 * @param {string} label
 */
function deleteCategory(label) {
  state.categories = state.categories.filter(c => c !== label);
  saveState();
  renderCategoryDropdowns();
  renderCategoryManager();
}

/**
 * Applies the given theme to the document, updates state, and persists.
 * @param {'light'|'dark'} theme
 */
function setTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  saveState();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

// ============================================================
// Bootstrap
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderAll();

  // ── Spending limit form submit handler ───────────────────
  const limitForm = document.getElementById('limit-form');
  if (limitForm) {
    limitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const limitInput = document.getElementById('limit-input');
      if (limitInput) {
        setSpendingLimit(limitInput.value);
        limitInput.value = '';
      }
    });
  }

  // ── Sort control change handler ──────────────────────────
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      setSortOrder(e.target.value);
    });
  }

  // ── Theme toggle click handler ────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
    });
  }

  // ── Category add form submit handler ─────────────────────
  const categoryAddForm = document.getElementById('category-add-form');
  if (categoryAddForm) {
    categoryAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('category-input');
      if (input) {
        const added = addCategory(input.value);
        if (added) input.value = '';
      }
    });
  }

  // ── Transaction form submit handler ──────────────────────
  const form = document.getElementById('transaction-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput     = document.getElementById('tx-name');
      const amountInput   = document.getElementById('tx-amount');
      const categoryInput = document.getElementById('tx-category');

      const nameError     = document.getElementById('tx-name-error');
      const amountError   = document.getElementById('tx-amount-error');
      const categoryError = document.getElementById('tx-category-error');

      // Clear previous errors
      nameError.textContent     = '';
      amountError.textContent   = '';
      categoryError.textContent = '';

      const nameVal     = nameInput.value;
      const amountVal   = amountInput.value;
      const categoryVal = categoryInput.value;

      let valid = true;

      // Validate name — must be non-empty / non-whitespace
      if (!nameVal || !nameVal.trim()) {
        nameError.textContent = 'Item name is required.';
        valid = false;
      }

      // Validate amount — must be a positive number
      const parsedAmount = parseFloat(amountVal);
      if (amountVal === '' || isNaN(parsedAmount) || parsedAmount <= 0) {
        amountError.textContent = 'Please enter a positive amount.';
        valid = false;
      }

      // Validate category — must be selected
      if (!categoryVal) {
        categoryError.textContent = 'Please select a category.';
        valid = false;
      }

      if (!valid) return;

      // All fields valid — add transaction and reset form
      addTransaction(nameVal, parsedAmount, categoryVal);
      form.reset();
      renderAll();
    });
  }
});
