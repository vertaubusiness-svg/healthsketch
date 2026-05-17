import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
import {
  getFirestore, collection, query, orderBy, onSnapshot,
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

/* ── Firebase 초기화 ── */
const firebaseConfig = {
  apiKey:            'AIzaSyBK2nv1p52OCArp3G9rpWNZi64RYvbb474',
  authDomain:        'health-sketch.firebaseapp.com',
  projectId:         'health-sketch',
  storageBucket:     'health-sketch.firebasestorage.app',
  messagingSenderId: '800191894133',
  appId:             '1:800191894133:web:8c342fb3fe4617e29f5e3c',
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ── 카테고리 정의 ── */
const CAT_MAP = {
  '플레이트머신': 'plate',
  '유산소':       'cardio',
  '오리지널머신': 'original',
  '프리웨이트':   'freeweight',
  '기타':         'etc',
};
const CAT_ORDER = ['플레이트머신', '유산소', '오리지널머신', '프리웨이트', '기타'];

/* ── 카테고리별 기본 SVG ── */
const SVG = {
  plate:      '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="10" y="38" width="100" height="14" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="5" y="28" width="18" height="34" rx="4" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="97" y="28" width="18" height="34" rx="4" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="35" y="20" width="10" height="50" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="75" y="20" width="10" height="50" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/></svg>',
  cardio:     '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="15" y="55" width="90" height="12" rx="4" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="20" y="20" width="30" height="35" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="1.5"/><line x1="30" y1="55" x2="25" y2="67" stroke="#1a2d6e" stroke-width="2"/><line x1="45" y1="55" x2="50" y2="67" stroke="#1a2d6e" stroke-width="2"/><path d="M18 55 Q60 40 102 55" stroke="#c8a94a" stroke-width="2" fill="none" stroke-dasharray="4 3"/></svg>',
  original:   '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="18" y="8" width="8" height="74" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="94" y="8" width="8" height="74" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="18" y="10" width="84" height="8" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="18" y="72" width="84" height="8" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="35" y="30" width="50" height="8" rx="2" fill="#c8a94a" opacity="0.7" stroke="#a8882e" stroke-width="1.5"/></svg>',
  freeweight: '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="50" y="40" width="20" height="10" rx="2" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="5" y="32" width="45" height="26" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="70" y="32" width="45" height="26" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="12" y="22" width="14" height="46" rx="3" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="94" y="22" width="14" height="46" rx="3" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/></svg>',
  etc:        '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="10" y="55" width="100" height="18" rx="4" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><path d="M20 55 Q60 25 100 55" stroke="#c8a94a" stroke-width="2.5" fill="none"/><rect x="28" y="40" width="64" height="16" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="1.5" opacity="0.7"/></svg>',
};

/* ── DOM ── */
const filterWrap = document.getElementById('filter-wrap');
const grid       = document.getElementById('product-grid');
const loading    = document.getElementById('products-loading');
const noResult   = document.getElementById('no-result');
const countEl    = document.getElementById('product-count');

/* ── HTML 이스케이프 ── */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── 카드 렌더링 ── */
function renderCard(data) {
  const catKey   = CAT_MAP[data.category] || 'etc';
  const catLabel = data.category || '기타';
  const sold     = data.status === '판매완료';
  const reserved = data.status === '예약중';

  const thumb = (data.images && data.images.length)
    ? `<img src="${esc(data.images[0])}" alt="${esc(data.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
    : (SVG[catKey] || SVG.etc);

  const statusBadge = sold
    ? '<span class="product-status status-sold">판매완료</span>'
    : reserved
      ? '<span class="product-status status-reserved">예약중</span>'
      : '';

  const actionBtn = sold
    ? ''
    : `<a href="contact.html?type=buy" class="btn btn-secondary btn-sm" data-no-nav>문의하기</a>`;

  return `<article class="product-card${sold ? ' product-card--sold' : ''} product-card--clickable"
      data-category="${catKey}" data-id="${esc(data.id)}"
      role="button" tabindex="0" aria-label="${esc(data.name)} 상세 보기">
    <div class="product-thumb">${thumb}</div>
    <div class="product-body">
      <span class="product-badge badge-${catKey}">${esc(catLabel)}</span>
      ${statusBadge}
      <h3 class="product-name">${esc(data.name)}</h3>
      <p class="product-desc">${esc(data.description || '')}</p>
      <div class="product-card-actions">
        ${actionBtn}
      </div>
    </div>
  </article>`;
}

/* ── 필터 버튼 렌더링 ── */
function renderFilters(products) {
  if (!filterWrap) return;
  const used = new Set(products.map(p => p.category).filter(Boolean));
  let html = '<button class="filter-btn active" data-filter="all" role="tab" aria-selected="true">전체</button>';
  CAT_ORDER.forEach(cat => {
    if (used.has(cat)) {
      const key = CAT_MAP[cat] || 'etc';
      html += `<button class="filter-btn" data-filter="${key}" role="tab" aria-selected="false">${cat}</button>`;
    }
  });
  filterWrap.innerHTML = html;
}

/* ── 필터 이벤트 ── */
function initFilter(total) {
  if (!filterWrap) return;
  if (countEl) countEl.innerHTML = `전체 <strong>${total}</strong>개 제품`;

  filterWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;

    filterWrap.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    let visible = 0;
    grid.querySelectorAll('.product-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    if (countEl) {
      const label = filter === 'all' ? '전체' : btn.textContent.trim();
      countEl.innerHTML = `${label} <strong>${visible}</strong>개 제품`;
    }
    if (noResult) noResult.hidden = visible > 0;
  });
}

/* ── Fade-in ── */
function applyFadeIn() {
  if (!('IntersectionObserver' in window)) return;
  const cards = grid.querySelectorAll('.product-card');
  cards.forEach(el => el.classList.add('fade-in'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  cards.forEach(el => io.observe(el));
}

/* ── 카드 클릭 → 상세 페이지 이동 ── */
function initCardClicks() {
  grid.addEventListener('click', (e) => {
    if (e.target.closest('[data-no-nav]')) return;
    const card = e.target.closest('[data-id]');
    if (!card) return;
    window.location.href = `product-detail.html?id=${encodeURIComponent(card.dataset.id)}`;
  });
  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-id]');
    if (!card) return;
    e.preventDefault();
    window.location.href = `product-detail.html?id=${encodeURIComponent(card.dataset.id)}`;
  });
}

/* ══════════════════════════════════
   Firestore 실시간 구독
══════════════════════════════════ */
if (grid) {
  initCardClicks();

  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

  onSnapshot(q, (snapshot) => {
    if (loading) loading.hidden = true;

    if (snapshot.empty) {
      if (countEl)  countEl.innerHTML = '전체 <strong>0</strong>개 제품';
      if (noResult) noResult.hidden = false;
      grid.innerHTML = '';
      return;
    }

    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFilters(products);
    grid.innerHTML = products.map(renderCard).join('');
    initFilter(products.length);
    applyFadeIn();
    if (noResult) noResult.hidden = true;
  }, (err) => {
    console.error(err);
    if (loading) loading.hidden = true;
    if (countEl)  countEl.textContent = '';
    grid.innerHTML =
      '<p class="products-error">제품 정보를 불러오지 못했습니다.<br>잠시 후 새로고침하거나 전화로 문의해 주세요. (010-9906-8300)</p>';
  });
}
