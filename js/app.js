(function(){
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOotPM83z6FnsDeGxOCS65izGfBZrUbtA",
  authDomain: "expense-book-suraj.firebaseapp.com",
  projectId: "expense-book-suraj",
  storageBucket: "expense-book-suraj.firebasestorage.app",
  messagingSenderId: "832074886569",
  appId: "1:832074886569:web:aafd5f3ff8a3c156ea68b8",
  measurementId: "G-Y6XH9N22R6"
};
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  const $ = id => document.getElementById(id);
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // ================= THEME =================
  const THEME_BG = { light:'#F3F6F3', dark:'#0A0F0C' };
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch(e){}
    const label = theme === 'dark' ? 'Light mode' : 'Dark mode';
    const lbl = document.getElementById('themeToggleLabel');
    if (lbl) lbl.textContent = label;
  }
  function toggleTheme(ev){
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    const wipe = document.getElementById('themeWipe');
    if (wipe && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const btn = ev && ev.currentTarget;
      let x = window.innerWidth / 2, y = 24;
      if (btn && btn.getBoundingClientRect){
        const r = btn.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top + r.height / 2;
      }
      // radius needed to cover the farthest corner from the origin point
      const maxDist = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const pct = Math.ceil((maxDist / Math.min(window.innerWidth, window.innerHeight)) * 100) + 10;
      wipe.style.setProperty('--tx', x + 'px');
      wipe.style.setProperty('--ty', y + 'px');
      wipe.style.setProperty('--reach', pct + '%');
      wipe.style.background = THEME_BG[next];
      wipe.classList.remove('run');
      void wipe.offsetWidth;
      wipe.classList.add('run');
      // Theme swaps underneath the instant the overlay finishes covering the screen (45% of 900ms),
      // then the overlay fades away immediately — no static hold, so it never looks frozen.
      setTimeout(() => applyTheme(next), 400);
      setTimeout(() => wipe.classList.remove('run'), 920);
    } else {
      applyTheme(next);
    }
  }
  (function initThemeLabel(){
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(t);
  })();

  const CAT_META = {
    Groceries:      { tint:'green',  icon:'basket' },
    Food:           { tint:'rose',   icon:'cup' },
    Transport:      { tint:'blue',   icon:'car' },
    Utilities:      { tint:'blue',   icon:'zap' },
    Shopping:       { tint:'gold',   icon:'bag' },
    Health:         { tint:'rose',   icon:'heart' },
    Entertainment:  { tint:'purple', icon:'film' },
    Other:          { tint:'purple', icon:'dots' }
  };
  const TINTS = {
    green:{bg:'var(--brand-tint)', fg:'var(--brand-deep)'},
    gold:{bg:'var(--gold-tint)', fg:'var(--gold)'},
    blue:{bg:'var(--blue-tint)', fg:'var(--blue)'},
    purple:{bg:'var(--purple-tint)', fg:'var(--purple)'},
    rose:{bg:'var(--rose-tint)', fg:'var(--rose)'}
  };
  const ICON_PATHS = {
    basket:'<path d="M4 9h16l-1.5 9.5a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z"/><path d="M8 9l2-5M16 9l-2-5M9.5 13v3M14.5 13v3"/>',
    cup:'<path d="M3 8h13v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M16 8h2a3 3 0 0 1 0 6h-1"/><path d="M6 2v2M10 2v2"/>',
    car:'<path d="M5 11l1.5-4.2A2 2 0 0 1 8.4 5.5h7.2a2 2 0 0 1 1.9 1.3L19 11"/><path d="M3 11h18v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H8a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1z"/>',
    zap:'<path d="M13 2L4 14h7l-1 8 10-12h-7z"/>',
    bag:'<path d="M6 2l1.6 4h8.8L18 2"/><path d="M3 6h18l-1.4 14.2a2 2 0 0 1-2 1.8H6.4a2 2 0 0 1-2-1.8z"/><path d="M9 10a3 3 0 0 0 6 0"/>',
    heart:'<path d="M12 21s-8-5.3-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.7-8 11-8 11z"/>',
    film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    dots:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>'
  };
  function catIcon(cat){ const meta = CAT_META[cat] || CAT_META.Other; return ICON_PATHS[meta.icon] || ICON_PATHS.dots; }
  function catTint(cat){ const meta = CAT_META[cat] || CAT_META.Other; return TINTS[meta.tint]; }
  function catIconSvg(cat, size){ const t = catTint(cat); return `<div class="exp-cat-icon" style="background:${t.bg};"><svg class="icon" style="stroke:${t.fg};" viewBox="0 0 24 24">${catIcon(cat)}</svg></div>`; }
  function chipHtml(cat){ const t = catTint(cat); return `<span class="exp-chip" style="background:${t.bg};color:${t.fg};">${escapeHtml(cat)}</span>`; }
  function svgIcon(name){ return `<svg class="icon" viewBox="0 0 24 24">${ICON_PATHS[name]||''}</svg>`; }

  let uid = null;
  let userEmail = '';
  let budgetEntries = [];
  let expenses = [];
  let settings = { alertThreshold: 0, pin: null, lastAlertMonth: '', tutorialDone: false };
  let viewMonth = { y: new Date().getFullYear(), m: new Date().getMonth() };
  let dateFrom = '', dateTo = '', quickDate = '', searchQuery = '', catFilterVal = '', payFilterVal = '', amtFilterVal = '';
  let recentSearchQuery = '', recentDateFilter = '';
  let lastDeleted = null, toastTimer = null;
  let isFirstTimeSetup = false;
  let currentPage = 'dashboard';
  let catExpanded = false;
  let editingExpenseId = null;
  let isSignUpFlow = false;

  const monthKey = (y,m) => `${y}-${String(m+1).padStart(2,'0')}`;
  const fmtMoney = n => '₹' + Number(n||0).toLocaleString('en-IN', {maximumFractionDigits: 0});
  const escapeHtml = str => { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; };
  function userDoc(name){ return db.collection('users').doc(uid).collection('data').doc(name); }

  async function loadData(){
    const budgetSnap = await userDoc('budget').get();
    if (budgetSnap.exists) {
      budgetEntries = budgetSnap.data().list || [];
    } else {
      budgetEntries = [];
      isFirstTimeSetup = true;
      await userDoc('budget').set({ list: budgetEntries });
    }
    const exSnap = await userDoc('expenses').get();
    expenses = exSnap.exists ? (exSnap.data().list || []) : [];
    if (!exSnap.exists) await userDoc('expenses').set({ list: expenses });
    expenses.forEach(e => { if(!e.paymentMode) e.paymentMode = 'Cash'; });

    const setSnap = await userDoc('settings').get();
    const defaults = { alertThreshold: 0, pin: null, lastAlertMonth: '', tutorialDone: false };
    settings = setSnap.exists ? Object.assign({}, defaults, setSnap.data()) : defaults;
    if (!setSnap.exists) { isFirstTimeSetup = true; await userDoc('settings').set(settings); }
  }
  async function saveBudgetToDb(){ await userDoc('budget').set({ list: budgetEntries }); }
  async function saveExpensesToDb(){ await userDoc('expenses').set({ list: expenses }); }
  async function saveSettingsToDb(){ await userDoc('settings').set(settings); }

  function totals(){
    const totalBudget = budgetEntries.reduce((s,b) => s + Number(b.amount), 0);
    const totalSpent = expenses.reduce((s,e) => s + Number(e.amount), 0);
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
  }
  function monthSpent(y,m){
    const key = monthKey(y,m);
    return expenses.filter(e => e.date && e.date.slice(0,7) === key).reduce((s,e)=>s+Number(e.amount),0);
  }

  // ---------- Categories select population ----------
  function populateCategorySelect(sel, includeOther){
    sel.innerHTML = Object.keys(CAT_META).map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // ---------- Stats & progress ----------
  function renderStats(){
    const { totalBudget, totalSpent, remaining } = totals();
    $('statBudget').textContent = fmtMoney(totalBudget);
    $('statBudgetSub').textContent = `Budget for ${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}`;
    $('statSpent').textContent = fmtMoney(totalSpent);
    $('statSpentSub').textContent = totalBudget > 0 ? `${Math.min(100, Math.round((totalSpent/totalBudget)*100))}% of budget` : '—';
    const remEl = $('statRemaining');
    remEl.textContent = fmtMoney(remaining);
    remEl.style.color = remaining >= 0 ? 'var(--brand-deep)' : 'var(--danger)';
    $('statRemainingSub').textContent = totalBudget > 0 ? `${Math.max(0, Math.round((remaining/totalBudget)*100))}% left` : '—';
    const now = new Date();
    const daysElapsed = now.getDate();
    const curSpent = monthSpent(now.getFullYear(), now.getMonth());
    $('statAvg').textContent = fmtMoney(Math.round(curSpent / daysElapsed));
    const pct = totalBudget > 0 ? Math.min(100, (totalSpent/totalBudget)*100) : (totalSpent>0?100:0);
    $('progressFill').style.width = pct + '%';
    $('progressFill').classList.toggle('warn', remaining < 0);
    $('progressPct').textContent = Math.round(pct) + '%';

    // Mobile hero card
    $('heroBudget').textContent = fmtMoney(totalBudget);
    $('heroMonthLabel').firstChild.textContent = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()} `;
    $('heroSpent').textContent = fmtMoney(totalSpent);
    $('heroRemaining').textContent = fmtMoney(remaining);
    $('heroAvg').textContent = fmtMoney(Math.round(curSpent / daysElapsed));
    $('heroProgressFill').style.width = pct + '%';
    $('heroProgressFill').classList.toggle('warn', remaining < 0);
    $('heroProgressPct').textContent = Math.round(pct) + '% of budget used';
  }

  function renderAlertBanner(){
    const threshold = Number(settings.alertThreshold) || 0;
    const now = new Date();
    const spent = monthSpent(now.getFullYear(), now.getMonth());
    const banner = $('alertBanner');
    if (threshold > 0 && spent >= threshold) {
      banner.textContent = `Heads up — you've spent ${fmtMoney(spent)} this month, over your ${fmtMoney(threshold)} monthly alert.`;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
    $('notifDot').classList.toggle('hidden', !(threshold > 0 && spent/threshold >= 0.7));
  }

  function renderNotifPanel(){
    const threshold = Number(settings.alertThreshold) || 0;
    const now = new Date();
    const spent = monthSpent(now.getFullYear(), now.getMonth());
    $('notifSpent').textContent = fmtMoney(spent);
    if (threshold > 0){
      const pct = Math.round((spent/threshold)*100);
      $('notifThreshold').textContent = fmtMoney(threshold);
      $('notifPct').textContent = pct + '%';
      const msgEl = $('notifMsg');
      if (spent >= threshold){
        msgEl.textContent = `You've crossed your monthly alert — spending is ${fmtMoney(spent - threshold)} over.`;
        msgEl.classList.add('alert');
      } else {
        msgEl.textContent = `You're ${fmtMoney(threshold - spent)} away from your monthly alert.`;
        msgEl.classList.remove('alert');
      }
    } else {
      $('notifThreshold').textContent = 'Not set';
      $('notifPct').textContent = '—';
      $('notifMsg').textContent = "Set a monthly spend alert in Budget Setup to get notified when you're close to it.";
      $('notifMsg').classList.remove('alert');
    }
  }

  function sendBrowserNotification(msg){
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification('Expense Book', { body: msg }); } catch(e) { console.error('Notification failed', e); }
  }
  async function checkSpendAlert(){
    const threshold = Number(settings.alertThreshold) || 0;
    if (!threshold) return;
    const now = new Date();
    const key = monthKey(now.getFullYear(), now.getMonth());
    const spent = monthSpent(now.getFullYear(), now.getMonth());
    const pct = spent / threshold;
    if (pct >= 0.9 && settings.lastAlertMonth !== key) {
      sendBrowserNotification(`You've spent ${fmtMoney(spent)} (${Math.round(pct*100)}%) of your ${fmtMoney(threshold)} alert for ${MONTH_NAMES[now.getMonth()]}.`);
      settings.lastAlertMonth = key;
      await saveSettingsToDb();
    }
  }

  // ---------- Category breakdown ----------
  function renderCategoryBreakdown(){
    const sums = {};
    expenses.forEach(e => { sums[e.category] = (sums[e.category] || 0) + Number(e.amount); });
    let entries = Object.entries(sums).sort((a,b) => b[1]-a[1]);
    const total = entries.reduce((s,[,v])=>s+v,0);
    const grid = $('catGrid');
    if (entries.length === 0){
      grid.innerHTML = ''; $('catEmpty').classList.remove('hidden'); $('catViewAll').classList.add('hidden');
      return;
    }
    $('catEmpty').classList.add('hidden');
    $('catViewAll').classList.toggle('hidden', entries.length <= 4);
    $('catViewAll').innerHTML = catExpanded ? 'Show less <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" transform="rotate(180 12 12)"/></svg>' : 'View all <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
    const shown = catExpanded ? entries : entries.slice(0,4);
    grid.innerHTML = shown.map(([cat,amt]) => {
      const t = catTint(cat);
      const pct = total > 0 ? Math.round((amt/total)*100) : 0;
      return `<div class="card cat-card"><div class="cat-icon" style="background:${t.bg};"><svg class="icon" style="stroke:${t.fg};" viewBox="0 0 24 24">${catIcon(cat)}</svg></div><div class="cat-label">${escapeHtml(cat)}</div><div class="cat-amt">${fmtMoney(amt)}</div><div class="cat-pct">${pct}%</div></div>`;
    }).join('');
  }

  // ---------- Expense row rendering ----------
  function expenseRowHtml(e){
    return `<div class="card expense-row" data-id="${e.id}">
      ${catIconSvg(e.category)}
      <div class="exp-mid">
        <div class="exp-desc-line">${chipHtml(e.category)}<span class="exp-desc">${escapeHtml(e.description || 'No description')}</span></div>
        <div class="exp-meta">${e.date} · ${escapeHtml(e.paymentMode || 'Cash')}</div>
      </div>
      <div class="exp-right">
        <span class="exp-amt">-${fmtMoney(e.amount)}</span>
        <div class="exp-actions">
          <button class="edit" data-id="${e.id}" title="Edit">${svgIcon('edit')}</button>
          <button class="del" data-id="${e.id}" title="Delete">${svgIcon('trash')}</button>
        </div>
      </div>
    </div>`;
  }

  function renderRecent(){
    let list = expenses.slice();
    if (recentDateFilter) list = list.filter(e => e.date === recentDateFilter);
    if (recentSearchQuery.trim()){
      const q = recentSearchQuery.trim().toLowerCase();
      list = list.filter(e => (e.description||'').toLowerCase().includes(q) || (e.category||'').toLowerCase().includes(q) || String(e.amount).includes(q));
    }
    list = list.sort((a,b)=> a.date===b.date ? b.id-a.id : (a.date<b.date?1:-1));
    const isFiltering = !!(recentDateFilter || recentSearchQuery.trim());
    const recent = isFiltering ? list.slice(0,50) : list.slice(0,5);
    $('recentList').innerHTML = recent.map(expenseRowHtml).join('');
    $('recentEmpty').classList.toggle('hidden', recent.length>0);
    if (isFiltering && recent.length===0){
      $('recentEmpty').classList.remove('hidden');
      $('recentEmpty').querySelector('div').textContent = 'No matching expenses found.';
    } else if (!isFiltering) {
      $('recentEmpty').querySelector('div').textContent = 'No expenses recorded yet.';
    }
  }

  function getFilteredExpenses(useMonthNav){
    let list = expenses.slice();
    if (quickDate){
      list = list.filter(e => e.date === quickDate);
    } else if (dateFrom || dateTo){
      if (dateFrom) list = list.filter(e => e.date >= dateFrom);
      if (dateTo) list = list.filter(e => e.date <= dateTo);
    } else if (useMonthNav) {
      const key = monthKey(viewMonth.y, viewMonth.m);
      list = list.filter(e => e.date && e.date.slice(0,7) === key);
    }
    if (catFilterVal) list = list.filter(e => e.category === catFilterVal);
    if (payFilterVal) list = list.filter(e => (e.paymentMode||'Cash') === payFilterVal);
    if (amtFilterVal){
      const [lo,hi] = amtFilterVal.split('-').map(Number);
      list = list.filter(e => Number(e.amount) >= lo && Number(e.amount) <= hi);
    }
    if (searchQuery.trim()){
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(e => (e.description||'').toLowerCase().includes(q) || (e.category||'').toLowerCase().includes(q) || String(e.amount).includes(q));
    }
    return list.sort((a,b)=> a.date===b.date ? b.id-a.id : (a.date<b.date?1:-1));
  }

  function renderExpensesPage(){
    $('monthLabel').textContent = `${MONTH_NAMES[viewMonth.m]} ${viewMonth.y}`;
    $('monthNav').style.opacity = (quickDate || dateFrom || dateTo) ? '0.4' : '1';
    const filtered = getFilteredExpenses(true);
    const total = filtered.reduce((s,e)=>s+Number(e.amount),0);
    const scopeLabel = quickDate ? `on ${quickDate}` : ((dateFrom||dateTo) ? 'in selected range' : `in ${MONTH_NAMES[viewMonth.m]}`);
    $('listContext').textContent = `${filtered.length} entr${filtered.length===1?'y':'ies'} ${scopeLabel} · Total ${fmtMoney(total)}`;
    $('allExpensesList').innerHTML = filtered.map(expenseRowHtml).join('');
    $('allExpensesEmpty').classList.toggle('hidden', filtered.length>0);
  }

  function renderBudgetPage(){
    const { totalBudget } = totals();
    $('budgetTotalBig').textContent = fmtMoney(totalBudget);
    $('budgetEntriesCount').textContent = `${budgetEntries.length} entr${budgetEntries.length===1?'y':'ies'}`;
    const sorted = budgetEntries.slice().sort((a,b)=> a.date===b.date ? b.id-a.id : (a.date<b.date?1:-1));
    $('budgetLog').innerHTML = sorted.map(b => `<div class="card budget-log-row" data-id="${b.id}">
      <div class="exp-cat-icon" style="background:var(--brand-tint);"><svg class="icon" style="stroke:var(--brand-deep);" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
      <div class="exp-mid"><div class="budget-log-note">${escapeHtml(b.note || 'Budget added')}</div><div class="budget-log-date">${b.date}</div></div>
      <div class="exp-right"><span class="budget-log-amt">+${fmtMoney(b.amount)}</span><div class="exp-actions"><button class="bdel" data-id="${b.id}" title="Delete">${svgIcon('trash')}</button></div></div>
    </div>`).join('');
    $('budgetLogEmpty').classList.toggle('hidden', budgetEntries.length>0);
    $('alertThreshold').value = settings.alertThreshold || '';
  }

  function renderSettingsPage(){
    $('settingsAccountEmail').textContent = userEmail;
    $('accountEmail').textContent = userEmail;
  }

  function updateDescList(){
    const uniq = [...new Set(expenses.map(e => e.description).filter(Boolean))];
    $('descList').innerHTML = uniq.map(d => `<option value="${escapeHtml(d)}"></option>`).join('');
  }

  function renderAll(){
    renderStats();
    renderAlertBanner();
    renderNotifPanel();
    renderCategoryBreakdown();
    renderRecent();
    renderExpensesPage();
    renderBudgetPage();
    renderSettingsPage();
    updateDescList();
    checkSpendAlert();
    if (userEmail) $('avatarBtn').textContent = userEmail.charAt(0).toUpperCase();
  }

  function showToast(msg, withUndo){
    $('toastMsg').textContent = msg;
    $('undoBtn').style.display = withUndo ? 'inline-block' : 'none';
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4200);
  }

  function exportCSV(){
    const rows = [['Type','Date','Category / Note','Description','Amount','Payment Mode']];
    expenses.slice().sort((a,b)=> a.date<b.date?-1:1).forEach(e => rows.push(['Expense', e.date, e.category, e.description||'', e.amount, e.paymentMode||'Cash']));
    budgetEntries.slice().sort((a,b)=> a.date<b.date?-1:1).forEach(b => rows.push(['Budget', b.date, b.note||'', '', b.amount, '']));
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `expense-book-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ================= PAGE NAV =================
  const PAGE_META = {
    dashboard: { title:'Dashboard', sub:'Track your expenses. Stay on budget.' },
    expenses: { title:'Expenses', sub:'Search, filter and manage every entry.' },
    budget: { title:'Budget Setup', sub:'Add funds and manage your monthly alert.' },
    settings: { title:'Settings', sub:'Security, notifications & account.' }
  };
  function goToPage(p){
    currentPage = p;
    document.querySelectorAll('.page').forEach(el => el.classList.add('page-hidden'));
    $('page-' + p).classList.remove('page-hidden');
    document.querySelectorAll('.nav-item[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page===p));
    document.querySelectorAll('.bn-item[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page===p));
    $('pageTitle').textContent = PAGE_META[p].title;
    $('pageBackBtn').classList.toggle('show', p !== 'dashboard');
    document.querySelector('.main').scrollTop = 0;
    closeAllDropdowns();
  }
  document.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', () => goToPage(el.dataset.page)));
  $('pageBackBtn').addEventListener('click', () => goToPage('dashboard'));

  function closeAllDropdowns(){
    $('notifPanel').classList.remove('open');
    $('accountPanel').classList.remove('open');
  }
  $('notifBtn').addEventListener('click', (ev)=>{ ev.stopPropagation(); $('accountPanel').classList.remove('open'); $('notifPanel').classList.toggle('open'); });
  $('avatarBtn').addEventListener('click', (ev)=>{ ev.stopPropagation(); $('notifPanel').classList.remove('open'); $('accountPanel').classList.toggle('open'); });
  document.addEventListener('click', closeAllDropdowns);
  $('notifPanel').addEventListener('click', ev => ev.stopPropagation());
  $('accountPanel').addEventListener('click', ev => ev.stopPropagation());

  $('budgetSetupBtn').addEventListener('click', () => goToPage('budget'));
  $('settingsBudgetSetup').addEventListener('click', () => goToPage('budget'));
  $('bnFabBtn').addEventListener('click', () => openExpenseModal());
  $('catViewAll').addEventListener('click', () => { catExpanded = !catExpanded; renderCategoryBreakdown(); });
  $('recentViewAll').addEventListener('click', () => { goToPage('expenses'); setTimeout(() => $('searchBox').focus(), 100); });
  $('recentSearchBox').addEventListener('input', () => { recentSearchQuery = $('recentSearchBox').value; renderRecent(); });
  $('recentDateFilter').addEventListener('change', () => { recentDateFilter = $('recentDateFilter').value; renderRecent(); });
  $('settingsExportCsv').addEventListener('click', exportCSV);
  $('exportCsvBtn').addEventListener('click', exportCSV);
  $('settingsSignOut').addEventListener('click', () => auth.signOut());

  [document.getElementById('themeToggleDesktop'), document.getElementById('themeToggleMobile')].forEach(b => {
    if (b) b.addEventListener('click', toggleTheme);
  });

  // ================= AUTH =================
  function passwordChecks(pw){
    return {
      len: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw)
    };
  }
  function passwordIsStrong(pw){ const c = passwordChecks(pw); return c.len && c.upper && c.lower && c.num && c.special; }
  function updatePwStrengthHint(pw){
    const c = passwordChecks(pw);
    $('pwRuleLen').classList.toggle('ok', c.len);
    $('pwRuleUpper').classList.toggle('ok', c.upper);
    $('pwRuleLower').classList.toggle('ok', c.lower);
    $('pwRuleNum').classList.toggle('ok', c.num);
    $('pwRuleSpecial').classList.toggle('ok', c.special);
  }
  $('loginPassword').addEventListener('input', () => {
    const pw = $('loginPassword').value;
    if (pw.length > 0) { $('pwStrengthHint').classList.remove('hidden'); updatePwStrengthHint(pw); }
    else { $('pwStrengthHint').classList.add('hidden'); }
  });

  function friendlyAuthError(err){
    const code = err.code || '';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Incorrect email or password.';
    if (code === 'auth/invalid-email') return 'That email address doesn\'t look right.';
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists — try signing in instead.';
    if (code === 'auth/weak-password') return 'That password is too weak. Please choose a stronger one.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
    return err.message;
  }

  $('signInBtn').addEventListener('click', async () => {
    $('loginError').textContent = '';
    $('loginNoUserBox').classList.add('hidden');
    const email = $('loginEmail').value.trim(), pw = $('loginPassword').value;
    if (!email || !pw) { $('loginError').textContent = 'Please enter both email and password.'; return; }
    try { isSignUpFlow = false; await auth.signInWithEmailAndPassword(email, pw); }
    catch(err) {
      if (err.code === 'auth/user-not-found') {
        $('loginNoUserBox').classList.remove('hidden');
      } else {
        $('loginError').textContent = friendlyAuthError(err);
      }
    }
  });
  $('loginCreateAccountBtn').addEventListener('click', () => { $('signUpBtn').click(); });
  $('signUpBtn').addEventListener('click', async () => {
    $('loginError').textContent = '';
    $('loginNoUserBox').classList.add('hidden');
    const email = $('loginEmail').value.trim(), pw = $('loginPassword').value;
    if (!email || !pw) { $('loginError').textContent = 'Please enter both email and password.'; return; }
    if (!passwordIsStrong(pw)) {
      $('pwStrengthHint').classList.remove('hidden');
      updatePwStrengthHint(pw);
      $('loginError').textContent = 'Please choose a stronger password before creating your account.';
      return;
    }
    $('pwStrengthHint').classList.add('hidden');
    try { isSignUpFlow = true; await auth.createUserWithEmailAndPassword(email, pw); }
    catch(err) { $('loginError').textContent = friendlyAuthError(err); }
  });
  [$('signOutBtn'), $('signOutBtnDesktop')].forEach(b => b.addEventListener('click', () => auth.signOut()));

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      uid = user.uid; userEmail = user.email || '';
      $('appLoading').classList.add('hidden');
      $('loginScreen').classList.add('hidden');
      populateCategorySelect($('qaCategory'));
      populateCategorySelect($('mCategory'));
      const cf = $('catFilter'); Object.keys(CAT_META).forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; cf.appendChild(o); });
      await loadData();
      renderAll();

      if (isFirstTimeSetup && !settings.pin) {
        $('pinOverlay').classList.add('hidden');
        $('appShell').classList.add('hidden');
        $('pinSetupOverlay').classList.remove('hidden');
      } else if (settings.pin && sessionStorage.getItem('pinUnlocked_' + uid) !== '1') {
        $('pinSetupOverlay').classList.add('hidden');
        $('pinOverlay').classList.remove('hidden');
        $('appShell').classList.add('hidden');
      } else {
        $('pinSetupOverlay').classList.add('hidden');
        $('pinOverlay').classList.add('hidden');
        enterApp();
      }
    } else {
      uid = null;
      $('appShell').classList.add('hidden');
      $('pinOverlay').classList.add('hidden');
      $('pinSetupOverlay').classList.add('hidden');
      $('appLoading').classList.add('hidden');
      $('loginScreen').classList.remove('hidden');
    }
  });

  function enterApp(){
    $('appShell').classList.remove('hidden');
    goToPage('dashboard');
    if (!settings.tutorialDone) startTutorial();
    maybeShowNotifPrompt();
  }

  // ---- PIN strength ----
  function isWeakPin(v){
    if (/^(\d)\1+$/.test(v)) return true; // all same digit e.g. 1111
    const digits = v.split('').map(Number);
    let ascending = true, descending = true;
    for (let i = 1; i < digits.length; i++){
      if (digits[i] !== digits[i-1] + 1) ascending = false;
      if (digits[i] !== digits[i-1] - 1) descending = false;
    }
    if (ascending || descending) return true; // e.g. 1234, 4321
    const commonPins = ['0000','1111','1212','1122','2580','0852','1004'];
    if (commonPins.includes(v)) return true;
    return false;
  }
  let pinSetupWeakAcknowledged = false;
  $('pinSetupEntry').addEventListener('input', () => { pinSetupWeakAcknowledged = false; });

  // ---- PIN setup (mandatory, new users) ----
  $('pinSetupSubmit').addEventListener('click', async () => {
    const v1 = $('pinSetupEntry').value.trim(), v2 = $('pinSetupConfirm').value.trim();
    if (!/^\d{4,6}$/.test(v1)) { $('pinSetupError').textContent = 'PIN must be 4-6 digits'; return; }
    if (v1 !== v2) { $('pinSetupError').textContent = 'PINs do not match'; return; }
    if (isWeakPin(v1) && !pinSetupWeakAcknowledged) {
      $('pinSetupError').innerHTML = 'That PIN is easy to guess (like 1234 or 1111). Try a less predictable combination — or press Save again to use it anyway.';
      pinSetupWeakAcknowledged = true;
      return;
    }
    settings.pin = v1;
    await saveSettingsToDb();
    sessionStorage.setItem('pinUnlocked_' + uid, '1');
    $('pinSetupOverlay').classList.add('hidden');
    $('pinSetupEntry').value=''; $('pinSetupConfirm').value=''; $('pinSetupError').textContent='';
    $('pinSetupEntry').blur(); $('pinSetupConfirm').blur();
    enterApp();
    showToast('PIN set — welcome to Expense Book!', false);
  });

  // ---- PIN unlock ----
  function attemptPinUnlock(v){
    if (v === settings.pin) {
      sessionStorage.setItem('pinUnlocked_' + uid, '1');
      $('pinOverlay').classList.add('hidden');
      $('pinError').textContent = ''; $('pinEntry').value = '';
      $('pinEntry').classList.remove('shake');
      $('pinEntry').blur();
      enterApp();
    } else {
      $('pinError').textContent = 'Incorrect PIN — please try again';
      $('pinEntry').value = '';
      $('pinEntry').classList.remove('shake'); void $('pinEntry').offsetWidth; $('pinEntry').classList.add('shake');
      $('pinEntry').focus();
    }
  }
  $('pinSubmit').addEventListener('click', () => attemptPinUnlock($('pinEntry').value.trim()));
  $('pinEntry').addEventListener('keydown', ev => { if (ev.key==='Enter') $('pinSubmit').click(); });
  // Auto-login the moment the entered digits reach the stored PIN's length
  $('pinEntry').addEventListener('input', () => {
    const v = $('pinEntry').value.trim();
    $('pinError').textContent = '';
    if (settings.pin && v.length === settings.pin.length) attemptPinUnlock(v);
  });

  // ---- Header quick PIN change ----
  $('pinChangeBtn').addEventListener('click', () => $('pinModalBackdrop').classList.add('open'));
  $('pinModalClose').addEventListener('click', () => $('pinModalBackdrop').classList.remove('open'));
  let pmWeakAcknowledged = false;
  $('pmPinInput').addEventListener('input', () => { pmWeakAcknowledged = false; });
  $('pmSavePin').addEventListener('click', async () => {
    const val = $('pmPinInput').value.trim();
    if (!/^\d{4,6}$/.test(val)) { showToast('PIN must be 4-6 digits', false); return; }
    if (isWeakPin(val) && !pmWeakAcknowledged) {
      pmWeakAcknowledged = true;
      showToast('That PIN is easy to guess (like 1234) — tap Save again to use it anyway', false);
      return;
    }
    settings.pin = val; await saveSettingsToDb();
    $('pmPinInput').value = ''; $('pinModalBackdrop').classList.remove('open');
    showToast('PIN updated', false);
  });
  $('pmRemovePin').addEventListener('click', async () => {
    settings.pin = null; await saveSettingsToDb();
    $('pinModalBackdrop').classList.remove('open');
    showToast('PIN removed', false);
  });

  // ---- Settings page PIN ----
  let settingsPinWeakAcknowledged = false;
  $('pinInput').addEventListener('input', () => { settingsPinWeakAcknowledged = false; });
  $('savePin').addEventListener('click', async () => {
    const val = $('pinInput').value.trim();
    if (!/^\d{4,6}$/.test(val)) { showToast('PIN must be 4-6 digits', false); return; }
    if (isWeakPin(val) && !settingsPinWeakAcknowledged) {
      settingsPinWeakAcknowledged = true;
      showToast('That PIN is easy to guess (like 1234) — tap Set PIN again to use it anyway', false);
      return;
    }
    settings.pin = val; await saveSettingsToDb();
    $('pinInput').value = '';
    showToast('PIN updated', false);
  });
  $('removePin').addEventListener('click', async () => {
    settings.pin = null; await saveSettingsToDb();
    showToast('PIN removed', false);
  });
  // ---- Notification permission: auto-prompt once per device, 30s after entering the app ----
  function maybeShowNotifPrompt(){
    if (!('Notification' in window)) return;                 // unsupported browser
    if (Notification.permission !== 'default') return;        // already decided (granted or denied)
    if (localStorage.getItem('notifPromptShown')) return;      // already shown once on this device
    setTimeout(function tryShow(){
      if (Notification.permission !== 'default') return; // re-check in case it changed meanwhile
      if ($('tutOverlay').classList.contains('open')) { setTimeout(tryShow, 5000); return; } // don't stack on the tutorial
      $('notifPromptBackdrop').classList.add('open');
      localStorage.setItem('notifPromptShown', '1');
    }, 30000);
  }
  $('notifPromptEnable').addEventListener('click', async () => {
    $('notifPromptBackdrop').classList.remove('open');
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
    showToast(Notification.permission==='granted' ? 'Notifications enabled' : 'Notifications not enabled', false);
  });
  $('notifPromptDismiss').addEventListener('click', () => {
    $('notifPromptBackdrop').classList.remove('open');
  });

  // ---- Budget page ----
  $('addBudget').addEventListener('click', async () => {
    const date = $('budgetDate').value || new Date().toISOString().slice(0,10);
    const note = $('budgetNote').value.trim();
    const amount = Number($('budgetAmount').value);
    if (!amount || amount <= 0) { showToast('Enter an amount to add to your budget', false); return; }
    budgetEntries.push({ id: Date.now(), date, note, amount });
    await saveBudgetToDb();
    $('budgetNote').value=''; $('budgetAmount').value='';
    renderStats(); renderBudgetPage(); renderCategoryBreakdown();
    showToast(`Added ${fmtMoney(amount)} to your budget`, false);
  });
  $('budgetLog').addEventListener('click', async ev => {
    const btn = ev.target.closest('.bdel'); if (!btn) return;
    budgetEntries = budgetEntries.filter(b => b.id !== Number(btn.dataset.id));
    await saveBudgetToDb();
    renderStats(); renderBudgetPage();
  });
  $('saveAlert').addEventListener('click', async () => {
    settings.alertThreshold = Number($('alertThreshold').value) || 0;
    await saveSettingsToDb();
    renderAlertBanner(); renderNotifPanel();
    await checkSpendAlert();
    showToast('Alert threshold saved', false);
  });

  // ---- Quick add (dashboard) ----
  $('qaAdd').addEventListener('click', async () => {
    const date = $('qaDate').value || new Date().toISOString().slice(0,10);
    const category = $('qaCategory').value;
    const description = $('qaDesc').value.trim();
    const amount = Number($('qaAmount').value);
    if (!amount || amount <= 0) { showToast('Enter an amount before adding', false); return; }
    expenses.push({ id: Date.now(), date, category, description, amount, paymentMode:'Cash' });
    await saveExpensesToDb();
    viewMonth = { y: Number(date.slice(0,4)), m: Number(date.slice(5,7))-1 };
    $('qaDesc').value=''; $('qaAmount').value='';
    renderAll();
    showToast('Expense added', false);
  });

  // ---- Add/Edit Expense modal ----
  function openExpenseModal(id){
    editingExpenseId = id || null;
    const e = id ? expenses.find(x => x.id === id) : null;
    $('expenseModalTitle').textContent = e ? 'Edit Expense' : 'Add Expense';
    $('mDate').value = e ? e.date : new Date().toISOString().slice(0,10);
    if (e && !Object.keys(CAT_META).includes(e.category)){
      $('mCategory').value = 'Other'; $('mCustomCatWrap').style.display='block'; $('mCategoryOther').value = e.category;
    } else {
      $('mCategory').value = e ? e.category : 'Groceries'; $('mCustomCatWrap').style.display='none'; $('mCategoryOther').value='';
    }
    $('mDesc').value = e ? (e.description||'') : '';
    $('mAmount').value = e ? e.amount : '';
    $('mPayment').value = e ? (e.paymentMode||'Cash') : 'Cash';
    $('expenseModalBackdrop').classList.add('open');
  }
  $('addExpenseBtn').addEventListener('click', () => openExpenseModal());
  $('expenseModalClose').addEventListener('click', () => $('expenseModalBackdrop').classList.remove('open'));
  $('expenseModalCancel').addEventListener('click', () => $('expenseModalBackdrop').classList.remove('open'));
  $('mCategory').addEventListener('change', () => { $('mCustomCatWrap').style.display = $('mCategory').value==='Other' ? 'block' : 'none'; });
  $('expenseModalSave').addEventListener('click', async () => {
    const date = $('mDate').value || new Date().toISOString().slice(0,10);
    let category = $('mCategory').value;
    if (category === 'Other' && $('mCategoryOther').value.trim()) category = $('mCategoryOther').value.trim();
    const description = $('mDesc').value.trim();
    const amount = Number($('mAmount').value);
    const paymentMode = $('mPayment').value;
    if (!amount || amount <= 0) { showToast('Enter a valid amount', false); return; }
    if (editingExpenseId){
      const idx = expenses.findIndex(x => x.id === editingExpenseId);
      if (idx !== -1) expenses[idx] = { ...expenses[idx], date, category, description, amount, paymentMode };
      showToast('Expense updated', false);
    } else {
      expenses.push({ id: Date.now(), date, category, description, amount, paymentMode });
      viewMonth = { y: Number(date.slice(0,4)), m: Number(date.slice(5,7))-1 };
      showToast('Expense added', false);
    }
    await saveExpensesToDb();
    $('expenseModalBackdrop').classList.remove('open');
    renderAll();
  });

  // ---- Edit / delete on any expense list ----
  function bindExpenseListEvents(containerId){
    $(containerId).addEventListener('click', async ev => {
      const editBtn = ev.target.closest('.edit');
      if (editBtn) { openExpenseModal(Number(editBtn.dataset.id)); return; }
      const delBtn = ev.target.closest('.del');
      if (delBtn){
        const id = Number(delBtn.dataset.id);
        const idx = expenses.findIndex(e => e.id === id);
        if (idx === -1) return;
        lastDeleted = { entry: expenses[idx], index: idx };
        expenses.splice(idx,1);
        await saveExpensesToDb();
        renderAll();
        showToast('Entry deleted', true);
      }
    });
  }
  bindExpenseListEvents('recentList');
  bindExpenseListEvents('allExpensesList');
  $('undoBtn').addEventListener('click', async () => {
    if (!lastDeleted) return;
    expenses.splice(lastDeleted.index, 0, lastDeleted.entry);
    lastDeleted = null;
    await saveExpensesToDb();
    renderAll();
    $('toast').classList.remove('show');
  });

  // ---- Filters (Expenses page) ----
  $('searchBox').addEventListener('input', () => { searchQuery = $('searchBox').value; renderExpensesPage(); });
  $('quickDate').addEventListener('change', () => { quickDate = $('quickDate').value; if (quickDate) { dateFrom=''; dateTo=''; $('dateFrom').value=''; $('dateTo').value=''; } renderExpensesPage(); });
  $('dateFrom').addEventListener('change', () => { dateFrom = $('dateFrom').value; if (dateFrom) { quickDate=''; $('quickDate').value=''; } renderExpensesPage(); });
  $('dateTo').addEventListener('change', () => { dateTo = $('dateTo').value; if (dateTo) { quickDate=''; $('quickDate').value=''; } renderExpensesPage(); });
  $('catFilter').addEventListener('change', () => { catFilterVal = $('catFilter').value; renderExpensesPage(); });
  $('payFilter').addEventListener('change', () => { payFilterVal = $('payFilter').value; renderExpensesPage(); });
  $('amtFilter').addEventListener('change', () => { amtFilterVal = $('amtFilter').value; renderExpensesPage(); });
  $('filterToggleBtn').addEventListener('click', () => { $('filterExtra').classList.toggle('open'); $('filterToggleBtn').classList.toggle('active'); });
  $('clearFilters').addEventListener('click', () => {
    searchQuery=''; dateFrom=''; dateTo=''; quickDate=''; catFilterVal=''; payFilterVal=''; amtFilterVal='';
    $('searchBox').value=''; $('dateFrom').value=''; $('dateTo').value=''; $('quickDate').value=''; $('catFilter').value=''; $('payFilter').value=''; $('amtFilter').value='';
    $('filterExtra').classList.remove('open');
    $('filterToggleBtn').classList.remove('active');
    renderExpensesPage();
  });
  $('prevMonth').addEventListener('click', () => { dateFrom=''; dateTo=''; quickDate=''; $('dateFrom').value=''; $('dateTo').value=''; $('quickDate').value=''; viewMonth.m-=1; if(viewMonth.m<0){viewMonth.m=11;viewMonth.y-=1;} renderExpensesPage(); });
  $('nextMonth').addEventListener('click', () => { dateFrom=''; dateTo=''; quickDate=''; $('dateFrom').value=''; $('dateTo').value=''; $('quickDate').value=''; viewMonth.m+=1; if(viewMonth.m>11){viewMonth.m=0;viewMonth.y+=1;} renderExpensesPage(); });

  $('qaDate').value = new Date().toISOString().slice(0,10);
  $('budgetDate').value = new Date().toISOString().slice(0,10);

  // ================= TUTORIAL =================
  const TUT_STEPS = [
    { sel: '[data-tut="stats"]', title:'Your snapshot', text:'Total budget, spent, remaining and your daily average all live right here on the dashboard.' },
    { sel: '[data-tut="quick-add"], #bnFabBtn', title:'Quick Add Expense', text:'Log an expense in seconds — from the dashboard on desktop, or the + button below on mobile.' },
    { sel: '[data-tut="budget-btn"], [data-page="budget"]', title:'Budget Setup', text:'Add funds to your budget and set a monthly spend alert here.' },
    { sel: '[data-tut="pin-btn"], [data-page="settings"]', title:'Security', text:'Manage your security PIN anytime from Settings.' },
    { sel: '[data-tut="notif-btn"]', title:'Notifications', text:'Tap the bell anytime to see how much you have spent this month against your alert.' },
    { sel: '[data-tut="add-expense"], #bnFabBtn', title:'Add Expense', text:'Use this button anytime to add a full expense with payment mode.' }
  ];
  let tutIndex = 0;
  function visibleTarget(selList){
    const sels = selList.split(',').map(s=>s.trim());
    for (const s of sels){
      const candidates = document.querySelectorAll(s);
      for (const el of candidates){
        if (el && el.offsetParent !== null) return el;
      }
    }
    return null;
  }
  function showTutStep(){
    const step = TUT_STEPS[tutIndex];
    const el = visibleTarget(step.sel);
    if (!el){ tutIndex++; if (tutIndex < TUT_STEPS.length) showTutStep(); else finishTutorial(); return; }
    const r = el.getBoundingClientRect();
    const pad = 6;
    const spot = $('tutSpot');
    spot.style.left = (r.left-pad)+'px'; spot.style.top = (r.top-pad)+'px';
    spot.style.width = (r.width+pad*2)+'px'; spot.style.height = (r.height+pad*2)+'px';
    $('tutStepCount').textContent = `Step ${tutIndex+1} of ${TUT_STEPS.length}`;
    $('tutTipTitle').textContent = step.title;
    $('tutTipText').textContent = step.text;
    $('tutNext').textContent = tutIndex === TUT_STEPS.length-1 ? 'Done' : 'Next';

    const tip = $('tutTip');
    const arrow = $('tutArrow');
    const margin = 16;
    const vw = window.innerWidth, vh = window.innerHeight;
    const tipWidth = Math.min(270, vw - margin*2);
    tip.style.width = tipWidth + 'px';

    const gap = 18;
    const tipH = tip.offsetHeight || 150;
    let placeBelow = true;
    let top = r.bottom + gap;
    if (top + tipH > vh - margin) { placeBelow = false; top = r.top - tipH - gap; }
    top = Math.min(Math.max(margin, top), vh - tipH - margin);

    let left = r.left + r.width/2 - tipWidth/2;
    left = Math.min(Math.max(margin, left), vw - tipWidth - margin);

    tip.style.top = top+'px'; tip.style.left = left+'px';

    // Arrow points from the tip straight at the highlighted element's center
    const arrowSize = 16;
    let arrowLeft = r.left + r.width/2 - arrowSize/2;
    arrowLeft = Math.min(Math.max(left + 12, arrowLeft), left + tipWidth - 12 - arrowSize);
    arrow.style.left = arrowLeft + 'px';
    arrow.style.top = (placeBelow ? top - arrowSize/2 : top + tipH - arrowSize/2) + 'px';
    arrow.style.boxShadow = placeBelow ? '-2px -2px 4px rgba(0,0,0,.06)' : '2px 2px 4px rgba(0,0,0,.06)';
  }
  function startTutorial(){
    tutIndex = 0;
    $('tutOverlay').classList.add('open');
    setTimeout(showTutStep, 50);
  }
  function finishTutorial(){
    $('tutOverlay').classList.remove('open');
    settings.tutorialDone = true;
    saveSettingsToDb();
  }
  $('tutNext').addEventListener('click', () => { tutIndex++; if (tutIndex < TUT_STEPS.length) showTutStep(); else finishTutorial(); });
  $('tutSkip').addEventListener('click', finishTutorial);
  window.addEventListener('resize', () => { if ($('tutOverlay').classList.contains('open')) showTutStep(); });
  $('restartTutorialBtn').addEventListener('click', () => { closeAllDropdowns(); goToPage('dashboard'); setTimeout(startTutorial, 150); });
  $('settingsTutorial').addEventListener('click', () => { goToPage('dashboard'); setTimeout(startTutorial, 150); });

})();
