# Plot Tracker

iPhone-first Progressive Web App for tracking plot and construction-site money: expenses, vendors, materials, machines, and income.

Data lives **on the device** (IndexedDB). There is no login and no backend. After the first load it works offline.

---

## 1. Install dependencies

```bash
npm install
```

Node 20+ is recommended.

## 2. Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use Chrome DevTools device mode or Safari on iPhone (same Wi-Fi) for a realistic layout.

## 3. Build

```bash
npm run build
npm run preview
```

Production builds use a **relative base** (`./`) so the app works on GitHub Pages under any repository name:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

Override only if you host it somewhere unusual:

```bash
VITE_BASE_PATH=/custom-prefix/ npm run build
```

Local `npm run dev` always serves from `/`.

The app uses **hash routing** (`#/quick-expense`) so GitHub Pages never 404s on client routes.

## 4. Configure GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main` or `master`.

The Vite `base` is relative (`./`), so a repo named `Money-Tracker` is served at:

```text
https://YOUR_USERNAME.github.io/Money-Tracker/
```

## 5. Deploy

```bash
git add .
git commit -m "Add Plot Tracker PWA"
git push -u origin main
```

Or run **Actions → Deploy to GitHub Pages → Run workflow**.

After the first successful deploy, the live URL is shown on the workflow summary.

## 6. Install on iPhone (Home Screen)

1. On iPhone, open Safari (not Chrome).
2. Go to `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`
3. Tap **Share** (square with arrow).
4. Tap **Add to Home Screen**.
5. Name it `Plot Tracker` → **Add**.

Open it from the Home Screen. It runs standalone, with the iOS status bar and Home Indicator respected.

Allow a moment on first launch so the service worker can cache the app for offline use.

## 7. iPhone Back Tap → Quick Expense

A GitHub Pages PWA cannot read the physical Back Tap gesture. Use an iOS Shortcut that opens the Quick Expense route.

**Quick Expense URL** (hash router):

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/#/quick-expense
```

### Create the Shortcut

1. Open the **Shortcuts** app.
2. Tap **+** → **Add Action**.
3. Search **Open URLs**.
4. Paste the Quick Expense URL above.
5. Name the shortcut **Open Plot Tracker Quick Expense**.
6. (Optional) Tap the shortcut info (**ⓘ**) → **Add to Home Screen** as a fallback.

### Attach it to Back Tap

1. **Settings**
2. **Accessibility**
3. **Touch**
4. **Back Tap**
5. **Double Tap**
6. Under **Shortcuts**, choose **Open Plot Tracker Quick Expense**

### Site workflow

1. Pay someone on the plot (e.g. ₹37,500).
2. Double-tap the back of the iPhone.
3. Plot Tracker opens on **Add Expense**.
4. Type `37500` on the keypad.
5. Tap **Cement**.
6. Select **Sachin Carpet** (or type a new vendor).
7. Tap **UPI**.
8. Tap **Save Expense**.

The site dashboard, category totals, vendor totals, today/month totals, and cash flow update immediately.

## 8. How data storage works

- Engine: **IndexedDB** via **Dexie.js**
- Database name: `plot-tracker`
- Tables: sites, expenses, incomes, vendors, machines, machineLogs, categories, settings
- IDs are UUIDs with `createdAt` / `updatedAt` so a future cloud sync can be added
- Nothing is sent to analytics or a server
- Clearing Safari / website data **deletes** the notebook — export backups

Last selected site, last category, last payment method, and recent vendors are remembered. Banking credentials are never stored.

## 9. Backup and restore

**Settings → Data backup**

| Action | What it does |
| --- | --- |
| Export backup | JSON file `plot-tracker-backup-YYYY-MM-DD.json` |
| Import & merge | Adds/updates records by id |
| Import & replace | Downloads a safety backup first, then replaces everything |
| Export CSV | Expenses, income, or machine logs |

Keep a copy in Files / iCloud Drive. This is the only way to move data to a new phone today.

Sample data (Vista Residency) can be loaded or removed from the same screen.

---

## Project structure

```text
src/
  components/     UI, sheets, forms
  pages/          Tabs and settings
  db/             Dexie + repositories + backup
  context/        Site, settings, sheets, toasts
  utils/          INR format, dates, totals, haptics
  types/          Schema
```

## Tabs

1. **Expenses** — site dashboard, breakdown, timeline
2. **Log** — machine hours (JCB, tractor, roller, …)
3. **Other** — non-site spend (not in plot investment)
4. **Income** — money received, optional site link

## Currency and dates

- INR with Indian grouping: `₹1,25,000`
- Dates: `10 Sep 2026`

## Offline

After the first visit, you can add expenses, income, and machine logs, search, filter, and export a backup without a network.

## Scripts

```bash
npm run dev       # local
npm run build     # typecheck + production build
npm run preview   # serve dist
npm run icons     # regenerate PWA icons
```
