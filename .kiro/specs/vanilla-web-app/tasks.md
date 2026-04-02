# Implementation Plan: Expense & Budget Visualizer

## Overview

Incremental build of a vanilla HTML/CSS/JS single-page app. Each task produces working, integrated code. No frameworks, no build step — just `index.html`, `css/styles.css`, and `js/app.js`.

## Tasks

- [x] 1. Project scaffold and core data model
  - Create `index.html` with all layout regions: `#theme-toggle`, `#balance`, `#limit-indicator`, `#transaction-form`, `#sort-control`, `#transaction-list`, `#spending-chart`, `#monthly-summary`, `#category-manager`, `#limit-form`
  - Create `css/styles.css` with base styles, CSS variables for light/dark themes, and scrollable transaction list
  - Create `js/app.js` with the `state` object, `DEFAULT_CATEGORIES`, `loadState()`, `saveState()`, and `renderAll()` stub
  - Wire Chart.js CDN `<script>` tag in `index.html`
  - _Requirements: 1.1, 2.1, 5.5, 6.3_

- [x] 2. State management and Local Storage persistence
  - [x] 2.1 Implement `loadState()` to read and parse `"expense-app-state"` from Local Storage, falling back to defaults on missing or corrupt data
    - Wrap all LS calls in try/catch; reset to defaults and clear key on JSON parse failure
    - _Requirements: 6.1, 6.3_
  - [x] 2.2 Implement `saveState()` to serialize full state to `"expense-app-state"` in Local Storage
    - Wrap in try/catch; show in-memory-only banner if LS is unavailable
    - _Requirements: 6.2, 6.3_
  - [ ]* 2.3 Write property test for state restore round-trip (Property 7)
    - **Property 7: State restore round-trip**
    - **Validates: Requirements 2.3, 6.1**
    - Use `fc.record` arbitrary covering all AppState fields; assert deep equality after serialize → deserialize cycle

- [x] 3. Add transaction form and validation
  - [x] 3.1 Implement `addTransaction(name, amount, category)` — generate UUID id, push to `state.transactions`, call `saveState()`
    - Use `crypto.randomUUID()` with fallback to `Date.now().toString() + Math.random()`
    - _Requirements: 1.2, 1.3_
  - [x] 3.2 Implement form submit handler with validation: reject empty/whitespace name, non-positive or non-numeric amount, missing category; display inline error messages; reset form on success
    - _Requirements: 1.4, 1.5, 1.6_
  - [ ]* 3.3 Write property test for valid add grows list (Property 1)
    - **Property 1: Valid transaction add grows the list**
    - **Validates: Requirements 1.2**
    - Use `fc.string({minLength:1})`, `fc.float({min:0.01})`, category from `DEFAULT_CATEGORIES`
  - [ ]* 3.4 Write property test for empty-field rejection (Property 3)
    - **Property 3: Empty-field submissions are rejected**
    - **Validates: Requirements 1.4**
    - Use whitespace-only string arbitraries; assert `state.transactions` length unchanged
  - [ ]* 3.5 Write property test for non-positive amount rejection (Property 4)
    - **Property 4: Non-positive amounts are rejected**
    - **Validates: Requirements 1.5**
    - Use `fc.oneof(fc.constant(0), fc.float({max:0}))`; assert state unchanged
  - [ ]* 3.6 Write property test for persistence round-trip (Property 2)
    - **Property 2: Transaction persistence round-trip**
    - **Validates: Requirements 1.3, 6.2**
    - After `addTransaction`, serialize and deserialize; assert transaction present with same fields
  - [ ]* 3.7 Write property test for form reset after successful add (Property 5)
    - **Property 5: Form resets after successful add**
    - **Validates: Requirements 1.6**
    - Assert all form input values are empty/default after a valid submission

- [ ] 4. Transaction list display
  - [x] 4.1 Implement `renderTransactionList()` — sort by `state.sortOrder`, render each transaction as a `<li>` with name, amount, category, and a delete button
    - Default sort is most-recent-first by `date`
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ]* 4.2 Write property test for list renders all fields (Property 6)
    - **Property 6: Transaction list renders all required fields**
    - **Validates: Requirements 2.1, 3.1**
    - Use `fc.array(transactionArb)`; assert rendered HTML contains each transaction's name, amount, and category
  - [ ]* 4.3 Write property test for default sort most-recent-first (Property 8)
    - **Property 8: Default sort is most-recent-first**
    - **Validates: Requirements 2.4**
    - Use `fc.array(transactionArb, {minLength:2})`; assert first rendered item has the latest date

- [ ] 5. Delete transaction
  - [ ] 5.1 Implement `deleteTransaction(id)` — filter `state.transactions`, call `saveState()`, re-render list, balance, chart, monthly summary, and limit indicator
    - _Requirements: 3.2, 3.3_
  - [ ]* 5.2 Write property test for delete removes transaction from state (Property 9)
    - **Property 9: Delete removes transaction from state**
    - **Validates: Requirements 3.2, 3.3**
    - Use `fc.array(transactionArb, {minLength:1})`; pick random id, call `deleteTransaction`, assert id absent

- [ ] 6. Total balance display
  - [x] 6.1 Implement `computeBalance(transactions)` — sum all `amount` values; return 0 for empty array
    - _Requirements: 4.1, 4.4_
  - [x] 6.2 Implement `renderBalance()` — write computed balance to `#balance`; call after every add/delete
    - _Requirements: 4.2, 4.3_
  - [ ]* 6.3 Write property test for balance equals sum (Property 10)
    - **Property 10: Balance equals sum of all amounts**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Use `fc.array(transactionArb)`; assert `computeBalance` equals `amounts.reduce((a,b)=>a+b, 0)`

- [ ] 7. Pie chart with Chart.js
  - [x] 7.1 Implement `renderChart()` — compute per-category totals, create Chart instance on first call, update `chart.data` and call `chart.update()` on subsequent calls; show placeholder text if Chart.js CDN failed to load or no transactions exist
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 7.2 Write property test for chart data matches category totals (Property 11)
    - **Property 11: Chart data matches category totals**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Use `fc.array(transactionArb)`; assert data array passed to Chart equals per-category sums

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Custom categories
  - [x] 9.1 Implement `addCategory(label)` — validate non-empty, non-whitespace, non-duplicate against `[...DEFAULT_CATEGORIES, ...state.categories]`; push to `state.categories`; call `saveState()`
    - _Requirements: 7.2, 7.4_
  - [x] 9.2 Implement `deleteCategory(label)` — remove from `state.categories`; call `saveState()`; re-render dropdowns and category manager
    - _Requirements: 7.3, 7.7_
  - [x] 9.3 Implement `renderCategoryDropdowns()` and `renderCategoryManager()` — rebuild `<option>` elements and category list from `[...DEFAULT_CATEGORIES, ...state.categories]`
    - _Requirements: 7.1, 7.5, 7.6_
  - [ ]* 9.4 Write property test for category validation (Property 16)
    - **Property 16: Category validation rejects empty and duplicate names**
    - **Validates: Requirements 7.4**
    - Use empty, whitespace-only, and already-present label arbitraries; assert `state.categories` unchanged
  - [ ]* 9.5 Write property test for category add/delete round-trip (Property 17)
    - **Property 17: Custom category add/delete round-trip**
    - **Validates: Requirements 7.2, 7.3, 7.7**
    - Add then delete a valid label; assert `state.categories` equals original

- [x] 10. Monthly summary view
  - [x] 10.1 Implement `computeMonthlySummary(transactions)` — group by `YYYY-MM` key derived from `transaction.date`; sum amounts per group; return sorted object
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 10.2 Implement `renderMonthlySummary()` — render grouped rows into `#monthly-summary`; show placeholder when no transactions
    - _Requirements: 8.4_
  - [ ]* 10.3 Write property test for monthly summary groups and totals correctly (Property 12)
    - **Property 12: Monthly summary groups and totals correctly**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
    - Use `fc.array(transactionArb)`; assert each `YYYY-MM` key value equals sum of matching transaction amounts

- [x] 11. Sort transactions
  - [x] 11.1 Implement `sortTransactions(transactions, sortOrder)` — handle `'default'` (most-recent-first by date), `'amount-asc'`, `'amount-desc'`, `'category-asc'`
    - _Requirements: 9.2, 9.3_
  - [x] 11.2 Implement `setSortOrder(order)` and wire `#sort-control` change event; re-render transaction list on change
    - _Requirements: 9.1, 9.4_
  - [ ]* 11.3 Write property test for sort order correctness (Property 13)
    - **Property 13: Sort order is correct for all sort options**
    - **Validates: Requirements 9.2, 9.3**
    - Use `fc.array(transactionArb)` and `fc.constantFrom('amount-asc','amount-desc','category-asc')`; assert sorted output satisfies comparator

- [x] 12. Spending limit with visual highlight
  - [x] 12.1 Implement `setSpendingLimit(value)` — validate positive number; store in `state.spendingLimit`; call `saveState()` and `renderLimitIndicator()`
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 12.2 Implement `shouldShowLimitIndicator(state)` — return `true` iff `spendingLimit` is a positive number and total strictly exceeds it
    - _Requirements: 10.4, 10.5, 10.6, 10.7_
  - [x] 12.3 Implement `renderLimitIndicator()` — show/hide `#limit-indicator` based on `shouldShowLimitIndicator`; wire `#limit-form` submit handler
    - _Requirements: 10.4, 10.5_
  - [ ]* 12.4 Write property test for limit indicator visibility (Property 14)
    - **Property 14: Limit indicator visibility matches budget state**
    - **Validates: Requirements 10.4, 10.5, 10.6, 10.7**
    - Use `fc.array(transactionArb)` and `fc.option(fc.float({min:0.01}))`; assert `shouldShowLimitIndicator` matches expected boolean

- [x] 13. Dark/light mode toggle
  - [x] 13.1 Implement `setTheme(theme)` — apply `data-theme` attribute to `<html>`; update `state.theme`; call `saveState()`
    - _Requirements: 11.1, 11.2_
  - [x] 13.2 Wire `#theme-toggle` click handler to call `setTheme` with the opposite of `state.theme`; restore theme from state on `loadState()`
    - _Requirements: 11.3, 11.4_
  - [x] 13.3 Add CSS variable overrides for `[data-theme="dark"]` in `css/styles.css`
    - _Requirements: 11.1_
  - [ ]* 13.4 Write property test for theme toggle involution (Property 15)
    - **Property 15: Theme toggle is an involution**
    - **Validates: Requirements 11.2, 11.3**
    - Use `fc.constantFrom('light','dark')`; assert toggling twice returns original value

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Wire everything together
  - [ ] 15.1 Call `loadState()` then `renderAll()` inside `DOMContentLoaded` listener in `js/app.js`
    - Confirm all render functions are called from `renderAll()`
    - _Requirements: 2.3, 6.1_
  - [ ] 15.2 Verify all event handlers (form submit, delete buttons, sort control, category manager, limit form, theme toggle) are attached once and call the correct mutation + render functions
    - _Requirements: 1.2, 3.2, 9.1, 10.1, 11.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests can be run via a test HTML page loading fast-check from CDN, or with Node.js + a test runner
- Each property test must include a comment: `// Feature: vanilla-web-app, Property N: <property text>`
- Minimum 100 iterations per property test
- Checkpoints ensure incremental validation before moving to the next feature area
