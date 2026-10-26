# Dablo: what is new in this version

## 1. Permanent storage (Postgres)
The backend now stores everything in Postgres instead of a local SQLite file.
- Set `DATABASE_URL` (for example a free Neon database) in `server/.env` locally or in your host's environment variables.
- Tables are created automatically on first start.
- `better-sqlite3` is gone, so there is no native build step.

## 2. Revenue updates live
- Totals on Overview and Revenue include revenue typed on a content item, unless a revenue record is already linked to that
  content (matched by title), so nothing is counted twice.
- While you fill in the add/edit form for revenue or content, a "Live revenue total" line shows the total before and after saving.
- The workspace refreshes itself every 20 seconds while the tab is visible, so clicks, imports and other tabs show up without a reload.

## 3. Currency changes convert every amount
- Each amount keeps the currency it was entered in. The app converts to the display currency when it shows it, so switching
  from INR to USD and back loses nothing.
- Switch currency from the top bar or Settings. Exchange rates come from open.er-api.com (daily, attribution shown in the footer)
  and are cached on the server; approximate fixed rates are used if the service cannot be reached.
- Content, tracking links and campaigns now remember the currency they were entered in.

## 4. Import existing CSV data
- "Import CSV" on Content, Revenue, Campaigns and Products.
- Pick a file, check how its columns map to Dablo fields, preview, import. Up to 1000 rows at a time.
- Handles quoted fields, comma/semicolon/tab files, amounts like "₹1,23,456.50" or "$1,200", and DD/MM or MM/DD dates.
- Rows that already exist are skipped, so importing the same file twice does not create duplicates.

## Running it
```
npm install
npm --prefix server install
cp server/.env.example server/.env     # set JWT_SECRET, TOKEN_ENCRYPTION_KEY and DATABASE_URL
npm run dev:all
```
On Render: build `npm install --include=dev && npm run build && npm --prefix server install`, start `npm --prefix server start`,
and set `DATABASE_URL`, `JWT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `NODE_ENV=production`, `TRUST_PROXY=1`, `PUBLIC_URL`.
