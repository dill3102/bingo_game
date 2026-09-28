/*
  Bingo 抽選ロジック
  - DEFAULT_MAX: 最大値の初期値（設定画面から変更可能）
  - planned: シャッフル済みの排出予定配列（localStorage: bingo_planned_v1）
  - index: 次に取り出す位置（localStorage: bingo_index_v1）
  - settings: 最大値 / 履歴の列数 / 言語（localStorage: bingo_settings_v1）
  - 操作: Space / Enter / ボタン抽選 / リセット / F1で既存排出の表示
*/

(() => {
  const LS_PLANNED = 'bingo_planned_v1';
  const LS_INDEX = 'bingo_index_v1';
  const LS_SETTINGS = 'bingo_settings_v1';

  // 最大値の初期値（設定画面で上書き可能）
  const DEFAULT_MAX = 75;
  const MAX_LIMIT = 999;
  // 抽選履歴の列数の初期値
  const DEFAULT_COLS = 5;
  const SUPPORTED_LANGS = ['ja', 'en', 'zh'];

  const I18N = {
    ja: {
      pageTitle: 'Bingo 抽選ツール',
      appTitle: 'Bingo 抽選',
      draw: '抽選 (Space / Enter)',
      finished: '終了',
      reset: 'リセット',
      settings: '設定',
      latest: '最新抽選結果',
      remaining: '残り',
      total: '総数',
      hint: 'Space / Enter で抽選、F1 で既存排出を表示します。',
      history: '抽選履歴',
      noHistory: 'まだ抽選されていません',
      listTitle: '既存排出の確認',
      listInfo: (d, t) => `排出済み: ${d} / 総数: ${t}`,
      drawnOrder: '排出済み（排出順）',
      remainingAsc: '未排出（小さい順）',
      noDrawn: '排出済みの番号はありません',
      noRemaining: '未排出の番号はありません',
      closeHint: 'Esc / F1 で閉じる',
      close: '閉じる',
      resetTitle: 'リセットしますか？',
      resetBody: 'これまでの抽選結果は消去され、最初からやり直します。',
      no: 'No',
      ok: 'OK',
      resetDone: 'リセットしました。',
      allDrawn: '全ての番号を排出しました。',
      settingsTitle: '設定',
      maxLabel: '最大値（1〜MAX）',
      colsLabel: '抽選履歴の列数',
      langLabel: '言語 / Language',
      maxChangeNote: '最大値を変更すると抽選はリセットされます。',
      cancel: 'キャンセル',
      save: '保存',
      saved: '設定を保存しました。',
      invalidMax: (lim) => `最大値は 2〜${lim} の整数で入力してください。`,
      aboutTitle: 'このサイトについて',
      about: 'ビンゴ大会用の無料の抽選ツールです。広告なし・登録不要で、データはすべてお使いのブラウザ内（localStorage）にのみ保存されます。ページを閉じても続きから再開できます。',
      author: '作者',
    },
    en: {
      pageTitle: 'Bingo Number Draw',
      appTitle: 'Bingo Draw',
      draw: 'Draw (Space / Enter)',
      finished: 'Finished',
      reset: 'Reset',
      settings: 'Settings',
      latest: 'Latest number',
      remaining: 'Remaining',
      total: 'Total',
      hint: 'Press Space / Enter to draw, F1 to view all numbers.',
      history: 'History',
      noHistory: 'No numbers drawn yet',
      listTitle: 'Drawn numbers',
      listInfo: (d, t) => `Drawn: ${d} / Total: ${t}`,
      drawnOrder: 'Drawn (in order)',
      remainingAsc: 'Not drawn yet (ascending)',
      noDrawn: 'No numbers drawn yet',
      noRemaining: 'All numbers have been drawn',
      closeHint: 'Esc / F1 to close',
      close: 'Close',
      resetTitle: 'Reset the game?',
      resetBody: 'All drawn numbers will be cleared and the game starts over.',
      no: 'No',
      ok: 'OK',
      resetDone: 'The game has been reset.',
      allDrawn: 'All numbers have been drawn.',
      settingsTitle: 'Settings',
      maxLabel: 'Max number (1 to MAX)',
      colsLabel: 'History columns',
      langLabel: 'Language / 言語',
      maxChangeNote: 'Changing the max number resets the game.',
      cancel: 'Cancel',
      save: 'Save',
      saved: 'Settings saved.',
      invalidMax: (lim) => `Enter a whole number from 2 to ${lim}.`,
      aboutTitle: 'About',
      about: 'A free bingo number drawing tool. No ads, no sign-up. All data stays in your browser (localStorage), so you can close the page and resume later.',
      author: 'Author',
    },
    zh: {
      pageTitle: 'Bingo 抽号工具',
      appTitle: 'Bingo 抽号',
      draw: '抽号 (Space / Enter)',
      finished: '结束',
      reset: '重置',
      settings: '设置',
      latest: '最新号码',
      remaining: '剩余',
      total: '总数',
      hint: '按 Space / Enter 抽号，按 F1 查看已抽号码。',
      history: '抽号记录',
      noHistory: '尚未抽号',
      listTitle: '已抽号码',
      listInfo: (d, t) => `已抽: ${d} / 总数: ${t}`,
      drawnOrder: '已抽（按抽出顺序）',
      remainingAsc: '未抽（从小到大）',
      noDrawn: '尚无已抽号码',
      noRemaining: '所有号码均已抽出',
      closeHint: 'Esc / F1 关闭',
      close: '关闭',
      resetTitle: '确定要重置吗？',
      resetBody: '所有抽号记录将被清除，并从头开始。',
      no: 'No',
      ok: 'OK',
      resetDone: '已重置。',
      allDrawn: '所有号码均已抽出。',
      settingsTitle: '设置',
      maxLabel: '最大值（1〜MAX）',
      colsLabel: '抽号记录列数',
      langLabel: '语言 / Language',
      maxChangeNote: '更改最大值将重置抽号。',
      cancel: '取消',
      save: '保存',
      saved: '设置已保存。',
      invalidMax: (lim) => `请输入 2〜${lim} 之间的整数。`,
      aboutTitle: '关于本站',
      about: '免费的宾果抽号工具。无广告、无需注册，所有数据仅保存在您的浏览器（localStorage）中，关闭页面后也可继续。',
      author: '作者',
    },
  };

  const $ = (id) => document.getElementById(id);

  // UI 要素
  const currentEl = $('current');
  const remainingEl = $('remaining');
  const totalEl = $('total');
  const historyListEl = $('historyList');
  const drawBtn = $('drawBtn');
  const resetBtn = $('resetBtn');
  const settingsBtn = $('settingsBtn');
  const langSelect = $('langSelect');
  const toastEl = $('toast');

  const listModal = $('listModal');
  const drawnListEl = $('drawnList');
  const remainingListEl = $('remainingList');
  const listInfoEl = $('listInfo');

  const resetModal = $('resetModal');
  const resetOkBtn = $('resetOk');
  const resetNoBtn = $('resetNo');

  const settingsModal = $('settingsModal');
  const maxInput = $('maxInput');
  const colsInput = $('colsInput');
  const settingsError = $('settingsError');

  let settings = { max: DEFAULT_MAX, cols: DEFAULT_COLS, lang: detectLang() };
  let planned = [];
  let index = 0;
  let animTimer = null;
  let toastTimer = null;

  function detectLang() {
    const nav = (navigator.language || 'ja').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('ja')) return 'ja';
    return 'en';
  }

  const t = (key, ...args) => {
    const v = (I18N[settings.lang] || I18N.ja)[key];
    return typeof v === 'function' ? v(...args) : v;
  };

  // ---- 永続化 ----
  function readLS(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* 保存不可の環境では無視 */ }
  }

  function saveState() {
    writeLS(LS_PLANNED, JSON.stringify(planned));
    writeLS(LS_INDEX, String(index));
  }

  function saveSettings() {
    writeLS(LS_SETTINGS, JSON.stringify(settings));
  }

  function loadSettings() {
    try {
      const s = JSON.parse(readLS(LS_SETTINGS) || '{}');
      if (Number.isInteger(s.max) && s.max >= 2 && s.max <= MAX_LIMIT) settings.max = s.max;
      if (Number.isInteger(s.cols) && s.cols >= 3 && s.cols <= 10) settings.cols = s.cols;
      if (SUPPORTED_LANGS.includes(s.lang)) settings.lang = s.lang;
    } catch (e) { /* 既定値のまま */ }
  }

  function loadState() {
    try {
      planned = JSON.parse(readLS(LS_PLANNED) || '[]');
    } catch (e) {
      planned = [];
    }
    // 保存済み配列が現在の最大値と一致しない場合は作り直す
    if (!Array.isArray(planned) || planned.length !== settings.max) {
      planned = makeShuffledArray(settings.max);
      index = 0;
      saveState();
      return;
    }
    index = parseInt(readLS(LS_INDEX), 10) || 0;
    index = Math.min(Math.max(index, 0), planned.length);
  }

  function makeShuffledArray(n) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    // Durstenfeld shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---- 表示 ----
  function makeChip(num, drawn) {
    const chip = document.createElement('span');
    chip.className = drawn ? 'chip drawn' : 'chip';
    const label = document.createElement('span');
    label.textContent = num;
    chip.appendChild(label);
    return chip;
  }

  function applyI18n() {
    document.documentElement.lang = settings.lang === 'zh' ? 'zh-CN' : settings.lang;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    langSelect.value = settings.lang;
  }

  function applyLayout() {
    // 桁数に応じて文字サイズを調整し、チップは常に正方形にする
    const digits = Math.max(2, String(settings.max).length);
    document.documentElement.style.setProperty('--digits', digits);
    historyListEl.style.setProperty('--cols', settings.cols);
  }

  function updateUI(animateValue) {
    const total = planned.length;
    totalEl.textContent = String(total);
    remainingEl.textContent = String(Math.max(0, total - index));

    if (animateValue !== undefined) {
      currentEl.textContent = String(animateValue);
      currentEl.classList.add('rolling');
    } else {
      currentEl.textContent = index > 0 ? String(planned[index - 1]) : '--';
      currentEl.classList.remove('rolling');
    }

    historyListEl.innerHTML = '';
    if (index === 0) {
      const empty = document.createElement('div');
      empty.className = 'muted empty';
      empty.textContent = t('noHistory');
      historyListEl.appendChild(empty);
    } else {
      for (let i = index - 1; i >= 0; i--) {
        historyListEl.appendChild(makeChip(planned[i], true));
      }
    }

    const finished = index >= planned.length;
    drawBtn.disabled = finished;
    drawBtn.textContent = finished ? t('finished') : t('draw');
  }

  function renderAll() {
    applyI18n();
    applyLayout();
    updateUI();
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ---- 抽選 ----
  function doDraw() {
    if (animTimer) return;
    if (index >= planned.length) {
      showToast(t('allDrawn'));
      return;
    }
    const rollCount = 18;
    let step = 0;
    animTimer = setInterval(() => {
      updateUI(Math.floor(Math.random() * planned.length) + 1);
      step++;
      if (step >= rollCount) {
        clearInterval(animTimer);
        animTimer = null;
        index++;
        saveState();
        updateUI();
      }
    }, 40);
  }

  function resetGame() {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }
    planned = makeShuffledArray(settings.max);
    index = 0;
    saveState();
    updateUI();
  }

  // ---- モーダル ----
  const modals = [listModal, resetModal, settingsModal];
  let lastFocus = null;

  function openModal(modal, focusEl) {
    closeAllModals();
    lastFocus = document.activeElement;
    modal.classList.add('open');
    (focusEl || modal.querySelector('button')).focus();
  }

  function closeAllModals() {
    const wasOpen = openModalEl();
    modals.forEach((m) => m.classList.remove('open'));
    if (wasOpen && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openModalEl() {
    return modals.find((m) => m.classList.contains('open')) || null;
  }

  function showList() {
    const drawn = planned.slice(0, index);
    const remaining = planned.slice(index).sort((a, b) => a - b);
    listInfoEl.textContent = t('listInfo', drawn.length, planned.length);

    const fill = (el, nums, isDrawn, emptyKey) => {
      el.innerHTML = '';
      if (nums.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'muted empty';
        empty.textContent = t(emptyKey);
        el.appendChild(empty);
        return;
      }
      nums.forEach((n) => el.appendChild(makeChip(n, isDrawn)));
    };
    fill(drawnListEl, drawn, true, 'noDrawn');
    fill(remainingListEl, remaining, false, 'noRemaining');

    openModal(listModal);
  }

  function showReset() {
    openModal(resetModal, resetNoBtn);
  }

  function showSettings() {
    maxInput.value = settings.max;
    maxInput.max = MAX_LIMIT;
    colsInput.value = settings.cols;
    settingsError.textContent = '';
    openModal(settingsModal, maxInput);
  }

  function saveSettingsFromForm(e) {
    e.preventDefault();
    const newMax = Number(maxInput.value);
    if (!Number.isInteger(newMax) || newMax < 2 || newMax > MAX_LIMIT) {
      settingsError.textContent = t('invalidMax', MAX_LIMIT);
      maxInput.focus();
      return;
    }
    const maxChanged = newMax !== settings.max;
    settings.max = newMax;
    settings.cols = Number(colsInput.value) || DEFAULT_COLS;
    saveSettings();
    closeAllModals();
    if (maxChanged) resetGame();
    renderAll();
    showToast(t('saved'));
  }

  // ---- イベント ----
  window.addEventListener('keydown', (e) => {
    const open = openModalEl();

    if (e.key === 'F1') {
      e.preventDefault();
      if (open === listModal) closeAllModals();
      else showList();
      return;
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        closeAllModals();
      }
      return;
    }
    // モーダル表示中や入力中は抽選しない（ボタン・入力欄の標準動作を優先）
    if (open) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      doDraw();
    }
  });

  drawBtn.addEventListener('click', doDraw);
  resetBtn.addEventListener('click', showReset);
  settingsBtn.addEventListener('click', showSettings);
  $('showBtn').addEventListener('click', showList);

  resetNoBtn.addEventListener('click', closeAllModals);
  resetOkBtn.addEventListener('click', () => {
    closeAllModals();
    resetGame();
    showToast(t('resetDone'));
  });

  $('settingsForm').addEventListener('submit', saveSettingsFromForm);
  $('settingsCancel').addEventListener('click', closeAllModals);

  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeAllModals));
  modals.forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeAllModals(); }));

  langSelect.addEventListener('change', () => {
    settings.lang = SUPPORTED_LANGS.includes(langSelect.value) ? langSelect.value : 'ja';
    saveSettings();
    renderAll();
    langSelect.blur();
  });

  // ---- 初期化 ----
  loadSettings();
  loadState();
  renderAll();

  // console デバッグ用
  window._bingo = {
    get planned() { return planned; },
    get index() { return index; },
    setIndex(i) { index = i; saveState(); updateUI(); },
    reset: resetGame,
  };
})();
