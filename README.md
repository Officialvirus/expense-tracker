# Expense Tracker

A clean, fast expense tracking web app. Log expenses in seconds, keep an eye on your monthly budget, and search or filter your spending history — all from a responsive dashboard that works just as well on your phone as it does on desktop. Installable as a home-screen app on iOS and Android, with light and dark themes.

**Live app:** [meetfluorine.github.io/expense-tracker](https://meetfluorine.github.io/expense-tracker)

---

## Project structure

```
expense-tracker/
├── index.html          # markup only, links to css/js/manifest below
├── manifest.json        # PWA install config (name, colors, icons)
├── css/
│   └── styles.css       # all styles, including light + dark theme variables
├── js/
│   └── app.js            # Firebase config, auth, PIN lock, and all app logic
└── assets/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-512-maskable.png
    ├── apple-touch-icon.png
    └── favicon-32.png
```

## Features

- **Dashboard overview** — total budget, total spent, remaining balance, and daily average spend at a glance, plus a budget-used progress bar.
- **Spending by category** — a visual breakdown of where your money is going, expandable to see every category.
- **Quick Add Expense** — log an expense (date, category, description, amount) without leaving the dashboard.
- **Recent Expenses** — the latest entries right on the dashboard, with an inline search box and date filter so you don't have to leave the page to find something.
- **Full Expenses page** — search by description, amount, or category; filter by category, payment mode, amount range, or a custom date range; step through months with the month navigator; edit or delete any entry.
- **Budget management** — add funds to your budget over time, set a monthly spend-alert threshold, and review your full budget log.
- **Notifications** — a quick summary of this month's spending against your alert threshold.
- **CSV export** — download all your expenses and budget entries at any time.
- **Optional PIN lock** — secure your ledger with a 4–6 digit PIN required each new session, independent of your account password.
- **Guided tutorial** — a first-run walkthrough of the app's main features, replayable anytime from Settings.
- **Responsive design** — a full sidebar layout on desktop, and a bottom navigation bar with a floating "Add Expense" button on mobile.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript — no framework, no build step, a single static file.
- **Backend:** [Firebase](https://firebase.google.com/) — Authentication (email/password) and Firestore (data storage), all client-side.
- **Fonts:** [Manrope](https://fonts.google.com/specimen/Manrope) and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts.

## Getting Started

This is a single self-contained HTML file — there's nothing to build or install.

1. **Clone the repo**
   ```bash
   git clone https://github.com/meetfluorine/expense-tracker.git
   cd expense-tracker
   ```

2. **Set up Firebase**
   - Create a project at the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication → Email/Password**.
   - Enable **Firestore Database**.
   - Copy your web app's Firebase config and paste it into the `firebaseConfig` object near the top of `js/app.js`.

3. **Run it locally**
   - Just open the HTML file in a browser, or serve it with any static server, e.g.:
   ```bash
   npx serve .
   ```

4. **Deploy**
   - The live version is hosted on GitHub Pages. To deploy your own copy, push the entire `expense-tracker/` folder (including `css/`, `js/`, `assets/`, and `manifest.json`) to a repo and enable GitHub Pages on the `main` branch (or `/docs` folder, depending on your setup). No build step is required — it's still plain static files, just organized into folders instead of one file.

## Usage

1. Create an account (email + password) on first visit.
2. Set up a security PIN — you'll be asked for it once per new session.
3. Use **Quick Add Expense** on the dashboard, or the **+ Add Expense** button, to log spending.
4. Set your budget and an optional monthly alert threshold from **Budget Setup**.
5. Use the search box and filters on the dashboard or the Expenses page to find specific entries.
6. Export your data to CSV anytime from the account menu or Settings.

## License

This project is available for personal use. Add a license of your choice (e.g. MIT) if you plan to open-source it further.
