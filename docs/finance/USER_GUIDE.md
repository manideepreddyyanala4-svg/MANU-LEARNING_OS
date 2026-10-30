# ManuOS Finance — Everyday User Guide

**Status:** These Finance features currently reside in the development release branch. They will only appear at the live ManuOS URL after the production release gates pass. Do not enter real financial data into an unverified preview database.

## First-time setup

1. Sign in to the existing ManuOS website with your authorized account and open **Finance** from the main navigation.
2. In **Overview** or **Accounts**, enter the opening balance you **personally verified** for Post Bank (Chunghwa Post), CTBC (China Trust) and Cash Wallet. Enter **0** for an empty account; leaving it blank means not yet configured. Set the date of that observed balance and save.
3. The total available money is the sum of the three manually maintained accounts. ManuOS does not connect to the banks. If you forget to record a real purchase, the displayed balance can differ from the bank statement.

## Daily spending in seconds

1. Open **Finance → Transactions** or the existing quick expense action.
2. Choose **Expense**, enter the amount (e.g. `350.00`), the account you paid from, merchant (e.g. PX Mart), category (**Groceries**) and the local purchase date.
3. Press **Save** once and look for the confirmed saved state. The account balance goes down only after the server commits.
4. If mobile service drops while saving, **do not change the form and repeatedly submit**. Open transaction history and verify the payment first. The application reuses an operation ID for identical unconfirmed details in the same browser session; database retries are idempotent. If your browser disabled storage or the session was lost, check history before attempting another charge.
5. **Income** increases the chosen receiving account and is not expense spending. Refunds are recorded as income under the current policy.
6. To move money (including CTBC → Cash withdrawals), use **Accounts → Transfer** and choose the source, destination and amount. The total across accounts stays unchanged; transferring is not spending.

## Corrections and reconciliation

- In **Transactions**, open the recorded expense to **edit** amount/account/category or **void** an incorrect entry. Voiding reverses its ledger impact once but retains its historical audit trail. Existing daily allocations are also removed from active consumption.
- In **Accounts**, choose **Match an observed balance** when a real bank balance differs from ManuOS. Enter the amount actually observed and a reason. A reconciliation creates a dated adjustment; it does **not** delete past transactions.
- **Historical edits/backdated entries:** if an earlier statement has already been reconciled, Finance may block changes to a transaction dated on or before that checkpoint. Do not work around this by changing an unrelated transaction. Use a separately documented corrective entry or reconcile again with an accurate reason, after reviewing the bank statement.

## Budgets, daily allowances and groceries

1. In **Budget**, select the calendar month and set a spending limit in **TWD or INR**. There are no invented default budgets.
2. For an INR budget, enter/select an explicit manually observed INR→TWD rate and read the saved converted amount. This is a **frozen user-entered snapshot**, not a live foreign-exchange quote.
3. **Monthly budget remaining** = saved monthly limit (in comparable TWD units) minus actual monthly expenses. This is **not** bank money or savings.
4. **Standard daily allowance** divides that month's spending limit across the actual number of days (28/29/30/31), using exact pennies/paise rounding where appropriate.
5. **Today's attributed consumption** includes grocery portions assigned to today. Today's allowance left is the daily budget minus today's consumption and may be negative. **Dynamic remaining-days allowance** spreads remaining monthly budget across remaining days including today; it is a separate number.
6. For groceries covering several days, enter one expense for the **full receipt total**, select multi-day allocation and specify the duration (for example, NT$450 over 3 days). This deducts **NT$450 once** from the bank, and attributes **NT$150** to each selected consumption day. Allocations can cross month boundaries.
7. If you itemize a grocery basket, ensure the individual allocated item amounts add up exactly to the full paid receipt. The database refuses incomplete/mismatched allocation totals.

## Calendar and analytics

- **Calendar → Cash-flow** shows purchases on their actual payment dates.
- **Calendar → Consumption** shows everyday attributed costs, including already-paid grocery amounts from previous dates. It is not a second set of deductions.
- **Analytics** shows posted actual expenses by category, merchant and original payment account, monthly trends, groceries versus outside food, and budget-versus-actual. Transfers and manually reconciled balances do not count as spending.
- A partial current month and historical periods before the first tracked transaction are labeled separately. A projection is speculative and may be unavailable if data is insufficient.

## Export and keeping your own copy

1. Open **Finance → Data & backups**.
2. Use **Run ledger integrity check** to verify owner-scoped posting, allocation and operation invariants. It does not edit your financial records.
3. **Export verified CSV**: obtain transaction history, optionally restricting transaction dates. Values are quoted and protected against spreadsheet formula injection.
4. **Download complete verified backup (JSON)**: confirm that you will store the file privately. It includes owned accounts, all transactions and void statuses, audit and posting history, budgets, category definitions, manual FX rates, grocery allocations and scheduled entries, with original IDs.
5. Save a second copy in a storage location you control and test that you can access both copies. The SHA-256 checksum detects accidental corruption; it does not encrypt the backup or prove authenticity.
6. **Automatic restore is not available.** A full restore must be rehearsed and performed on an isolated database by an authorized administrator, then validated before any production recovery. Never blindly import a JSON backup on top of an existing account.

**Privacy:** The tracker does not ask for bank credentials or retrieve live bank balances. Account amounts are manually maintained estimates. No software promises permanent, risk-free data storage; keep private exports and verify the provider's database backup/recovery service.
