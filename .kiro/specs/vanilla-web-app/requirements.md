# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application built with vanilla HTML, CSS, and JavaScript (no frameworks). Users can track personal spending by adding transactions with a name, amount, and category. The app displays a running total balance, a scrollable transaction list with delete capability, and a live pie chart (via Chart.js CDN) showing spending distribution by category.

Beyond the core tracking features, users can: create custom spending categories in addition to the defaults (Food, Transport, Fun); view a monthly summary that aggregates spending by calendar month; sort the transaction list by amount or category; define a personal spending limit that triggers a visual alert when exceeded; and toggle between light and dark display themes.

All data — transactions, custom categories, spending limit, and theme preference — is persisted exclusively in the browser's Local Storage with no backend or network requests required.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense entry consisting of a name, amount, and category
- **Transaction_List**: The scrollable UI component displaying all recorded transactions
- **Input_Form**: The HTML form used to submit new transactions
- **Balance_Display**: The UI element showing the total sum of all transaction amounts
- **Chart**: The pie chart visualizing spending distribution by category
- **Category**: A spending label applied to a transaction; includes the default labels Food, Transport, and Fun, plus any user-defined Custom_Categories
- **Custom_Category**: A user-defined spending label created in addition to the default categories
- **Category_Manager**: The UI component used to create and manage Custom_Categories
- **Monthly_Summary**: The UI view that aggregates and displays total spending grouped by calendar month
- **Sort_Control**: The UI control that allows the user to reorder the Transaction_List by a chosen field
- **Spending_Limit**: A user-defined numeric threshold above which total spending is considered over-budget
- **Limit_Indicator**: The UI element that signals when total spending has exceeded the Spending_Limit
- **Theme**: The visual color scheme of the App, either light or dark
- **Theme_Toggle**: The UI control that switches the App between light and dark Theme
- **Local_Storage**: The browser's built-in client-side key-value storage API

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to fill out a form with an item name, amount, and category, so that I can record a new expense.

#### Acceptance Criteria

1. THE Input_Form SHALL include a text field for item name, a numeric field for amount, and a dropdown selector for category (Food, Transport, Fun).
2. WHEN the user submits the Input_Form with all fields filled, THE App SHALL add the transaction to the Transaction_List.
3. WHEN the user submits the Input_Form with all fields filled, THE App SHALL persist the transaction to Local_Storage.
4. IF the user submits the Input_Form with one or more empty fields, THEN THE Input_Form SHALL display a validation error and SHALL NOT add the transaction.
5. IF the user submits the Input_Form with an amount that is not a positive number, THEN THE Input_Form SHALL display a validation error and SHALL NOT add the transaction.
6. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

### Requirement 2: Display Transaction List

**User Story:** As a user, I want to see all my recorded transactions in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction's item name, amount, and category.
2. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
3. WHEN the App loads, THE Transaction_List SHALL render all transactions previously persisted in Local_Storage.
4. THE Transaction_List SHALL display transactions in the order they were added, with the most recent at the top.

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove outdated entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each transaction entry.
2. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from the Transaction_List.
3. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from Local_Storage.

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total spending at a glance, so that I can understand how much I have spent overall.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts.
2. WHEN a transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
4. WHEN no transactions exist, THE Balance_Display SHALL show a total of 0.

### Requirement 5: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display spending distribution across the Food, Transport, and Fun categories as a pie chart.
2. WHEN a transaction is added, THE Chart SHALL update automatically to reflect the new category totals.
3. WHEN a transaction is deleted, THE Chart SHALL update automatically to reflect the updated category totals.
4. WHEN no transactions exist, THE Chart SHALL display an empty or placeholder state.
5. THE Chart SHALL use a charting library (such as Chart.js) loaded via CDN, requiring no build step or local installation.

### Requirement 6: Persist Data Across Sessions

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I don't lose my data when I close the tab.

#### Acceptance Criteria

1. WHEN the App loads, THE App SHALL read all previously stored transactions from Local_Storage and restore the full application state.
2. WHEN a transaction is added or deleted, THE App SHALL synchronize the current transaction list to Local_Storage immediately.
3. THE App SHALL store all data client-side only, with no network requests to any external server for data persistence.

### Requirement 7: Manage Custom Categories

**User Story:** As a user, I want to create my own spending categories in addition to the defaults, so that I can tailor the app to my personal budget structure.

#### Acceptance Criteria

1. THE Category_Manager SHALL allow the user to add a new Custom_Category by providing a non-empty, unique label.
2. WHEN a Custom_Category is created, THE Input_Form's category dropdown SHALL include the new Custom_Category alongside the default categories.
3. WHEN a Custom_Category is created, THE App SHALL persist the Custom_Category to Local_Storage.
4. 
### Requirement 7: Manage Custom Categories

**User Story:** As a user, I want to create my own spending categories beyond the defaults, so that I can organize expenses in a way that fits my lifestyle.

#### Acceptance Criteria

1. THE Category_Manager SHALL provide an input field and a submit control for creating a new Custom_Category.
2. WHEN the user submits a non-empty category name via the Category_Manager, THE App SHALL add the Custom_Category to the category dropdown in the Input_Form.
3. WHEN the user submits a non-empty category name via the Category_Manager, THE App SHALL persist the Custom_Category to Local_Storage.
4. IF the user submits an empty or duplicate category name, THEN THE Category_Manager SHALL display a validation error and SHALL NOT create the category.
5. WHEN the App loads, THE App SHALL restore all Custom_Categories from Local_Storage and include them in the Input_Form category dropdown.
6. THE Category_Manager SHALL display a delete control for each Custom_Category.
7. WHEN the user activates the delete control for a Custom_Category, THE App SHALL remove that Custom_Category from the Input_Form dropdown and from Local_Storage.

### Requirement 8: View Monthly Summary

**User Story:** As a user, I want to see my spending grouped by calendar month, so that I can understand my spending trends over time.

#### Acceptance Criteria

1. THE Monthly_Summary SHALL display the total spending amount for each calendar month in which at least one transaction exists.
2. THE Monthly_Summary SHALL group transactions by the calendar month and year of their recorded date.
3. WHEN a transaction is added, THE Monthly_Summary SHALL update to reflect the new monthly totals without requiring a page reload.
4. WHEN a transaction is deleted, THE Monthly_Summary SHALL update to reflect the revised monthly totals without requiring a page reload.
5. WHEN no transactions exist, THE Monthly_Summary SHALL display an empty or placeholder state.

### Requirement 9: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or category, so that I can quickly find and compare entries.

#### Acceptance Criteria

1. THE Sort_Control SHALL offer at minimum two sort options: by amount (ascending and descending) and by category (alphabetical).
2. WHEN the user selects a sort option from the Sort_Control, THE Transaction_List SHALL reorder all displayed transactions according to the chosen option without requiring a page reload.
3. WHEN a new transaction is added while a sort option is active, THE Transaction_List SHALL insert the new transaction in the position consistent with the active sort order.
4. THE Sort_Control SHALL have a default state that displays transactions in the order they were added, with the most recent at the top.

### Requirement 10: Spending Limit Alert

**User Story:** As a user, I want to set a personal spending limit and receive a visual alert when I exceed it, so that I can stay within my budget.

#### Acceptance Criteria

1. THE App SHALL provide an input field where the user can enter a numeric Spending_Limit.
2. WHEN the user saves a Spending_Limit, THE App SHALL persist it to Local_Storage.
3. WHEN the App loads, THE App SHALL restore the Spending_Limit from Local_Storage.
4. WHILE the sum of all transaction amounts exceeds the Spending_Limit, THE Limit_Indicator SHALL be visible and display a message indicating the budget has been exceeded.
5. WHILE the sum of all transaction amounts is at or below the Spending_Limit, THE Limit_Indicator SHALL not display an over-budget alert.
6. IF no Spending_Limit has been set, THEN THE Limit_Indicator SHALL remain hidden.
7. WHEN a transaction is added or deleted, THE App SHALL re-evaluate the Spending_Limit condition and update the Limit_Indicator accordingly without requiring a page reload.

### Requirement 11: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light display themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL be accessible from the main App interface at all times.
2. WHEN the user activates the Theme_Toggle, THE App SHALL switch the active Theme between light and dark.
3. WHEN the user activates the Theme_Toggle, THE App SHALL persist the selected Theme to Local_Storage.
4. WHEN the App loads, THE App SHALL restore the previously persisted Theme from Local_Storage and apply it before rendering content.
5. WHEN no Theme preference has been persisted, THE App SHALL apply the light Theme by default.
