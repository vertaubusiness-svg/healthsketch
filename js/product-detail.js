console.log('[product-detail] 스크립트 실행 시작');

/* ── 카테고리 맵 + SVG ── */
const CAT_MAP = {
  '플레이트머신': 'plate',
  '유산소':       'cardio',
  '오리지널머신': 'original',
  '프리웨이트':   'freeweight',
  '기타':         'etc',
};

const SVG = {
  plate:      '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="10" y="38" width="100" height="14" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="5" y="28" width="18" height="34" rx="4" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="97" y="28" width="18" height="34" rx="4" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="35" y="20" width="10" height="50" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="75" y="20" width="10" height="50" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/></svg>',
  cardio:     '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="15" y="55" width="90" height="12" rx="4" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="20" y="20" width="30" height="35" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="1.5"/><line x1="30" y1="55" x2="25" y2="67" stroke="#1a2d6e" stroke-width="2"/><line x1="45" y1="55" x2="50" y2="67" stroke="#1a2d6e" stroke-width="2"/><path d="M18 55 Q60 40 102 55" stroke="#c8a94a" stroke-width="2" fill="none" stroke-dasharray="4 3"/></svg>',
  original:   '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="18" y="8" width="8" height="74" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="94" y="8" width="8" height="74" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="18" y="10" width="84" height="8" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="18" y="72" width="84" height="8" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="35" y="30" width="50" height="8" rx="2" fill="#c8a94a" opacity="0.7" stroke="#a8882e" stroke-width="1.5"/></svg>',
  freeweight: '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="50" y="40" width="20" height="10" rx="2" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/><rect x="5" y="32" width="45" height="26" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="70" y="32" width="45" height="26" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><rect x="12" y="22" width="14" height="46" rx="3" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/><rect x="94" y="22" width="14" height="46" rx="3" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/></svg>',
  etc:        '<svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><rect x="10" y="55" width="100" height="18" rx="4" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/><path d="M20 55 Q60 25 100 55" stroke="#c8a94a" stroke-width="2.5" fill="none"/><rect x="28" y="40" width="64" height="16" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="1.5" opacity="0.7"/></svg>',
};

/* ── DOM ── */
const loadingEl  = document.getElementById('detail-loading');
const errorEl    = document.getElementById('detail-error');
const contentEl  = document.getElementById('detail-content');

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showError() {
  loadingEl.setAttribute('hidden', '');
  contentEl.setAttribute('hidden', '');
  errorEl.removeAttribute('hidden');
}

function showContent() {
  loadingEl.setAttribute('hidden', '');
  errorEl.setAttribute('hidden', '');
  contentEl.removeAttribute('hidden');
}

/* ── 연관 제품 카드 렌더링 (products.html과 동일한 구조) ── */
function renderRelatedCard(data) {
  const catKey   = CAT_MAP[data.category] || 'etc';
  const catLabel = data.category || '기타';
  const sold     = data.status === '판매완료';
  const reserved = data.status === '예약중';

  const thumb = (data.images && data.images.length)
    ? `<img src="${esc(data.images[0])}" alt="${esc(data.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
    : (SVG[catKey] || SVG.etc);

  const statusBadge = sold
    ? '<span class="product-status status-sold">판매완료</span>'
    : reserved ? '<span class="product-status status-reserved">예약중</span>' : '';

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
      <div class="product-card-actions">${actionBtn}</div>
    </div>
  </article>`;
}

/* ── 연관 제품 카드 클릭 ── */
function initRelatedClicks(grid) {
  grid.addEventListener('click', (e) => {
    if (e.target.closest('[data-no-nav]')) return;
    const card = e.target.closest('[data-id]');
    if (!card) return;
    window.location.href = `product-detail.html?id=${encodeURIComponent(card.dataset.id)}`;
  });
}

/* ══════════════════════════════════
   메인
══════════════════════════════════ */
(async () => {
  /* URL 파라미터에서 id 추출 */
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { showError(); return; }

  /* Firebase dynamic import */
  let initializeApp, getFirestore, docFn, getDoc, collection, query, orderBy, limit, getDocs;
  try {
    console.log('[product-detail] Firebase 모듈 import...');
    ({ initializeApp } =
      await import('https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js'));
    ({ getFirestore, doc: docFn, getDoc, collection, query, orderBy, limit, getDocs } =
      await import('https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js'));
    console.log('[product-detail] ✅ Firebase 로드 완료');
  } catch (err) {
    console.error('[product-detail] ❌ Firebase import 실패:', err);
    showError();
    return;
  }

  /* Firebase 초기화 */
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

  /* 제품 단건 조회 */
  let docSnap;
  try {
    docSnap = await getDoc(docFn(db, 'products', id));
  } catch (err) {
    console.error('[product-detail] ❌ Firestore 조회 실패:', err);
    showError();
    return;
  }

  if (!docSnap.exists()) {
    console.warn('[product-detail] 제품 없음:', id);
    showError();
    return;
  }

  const data   = docSnap.data();
  const catKey = CAT_MAP[data.category] || 'etc';
  const images = (data.images && data.images.length) ? data.images : [];
  const sold   = data.status === '판매완료';
  const reserved = data.status === '예약중';

  /* ── 페이지 타이틀 / 브레드크럼 ── */
  document.title = `${data.name || '제품 상세'} | 헬스스케치`;
  document.getElementById('bc-name').textContent = data.name || '';

  /* ── 뱃지 ── */
  const statusHtml = sold
    ? '<span class="product-status status-sold">판매완료</span>'
    : reserved ? '<span class="product-status status-reserved">예약중</span>' : '';
  document.getElementById('detail-meta').innerHTML =
    `<span class="product-badge badge-${catKey}">${esc(data.category || '기타')}</span>${statusHtml}`;

  /* ── 제품명 ── */
  document.getElementById('detail-name').textContent = data.name || '';

  /* ── 설명 ── */
  const descEl = document.getElementById('detail-desc');
  if (data.description && data.description.trim()) {
    descEl.textContent = data.description;
  } else {
    descEl.textContent = '상세 설명이 없습니다.';
    descEl.classList.add('detail-desc-empty');
  }

  /* ── 갤러리 ── */
  const mainImg  = document.getElementById('detail-main-img');
  const svgWrap  = document.getElementById('detail-svg-wrap');
  const thumbsEl = document.getElementById('detail-thumbs');

  if (images.length) {
    mainImg.src = images[0];
    mainImg.alt = data.name || '';
    svgWrap.innerHTML = '';

    if (images.length > 1) {
      thumbsEl.innerHTML = images.map((url, i) =>
        `<button class="detail-thumb${i === 0 ? ' active' : ''}" data-src="${esc(url)}" type="button" aria-label="사진 ${i + 1}">
           <img src="${esc(url)}" alt="사진 ${i + 1}" loading="lazy" />
         </button>`
      ).join('');

      thumbsEl.addEventListener('click', (e) => {
        const thumb = e.target.closest('.detail-thumb');
        if (!thumb) return;
        thumbsEl.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImg.src = thumb.dataset.src;
      });
    }
  } else {
    mainImg.style.display = 'none';
    svgWrap.innerHTML = SVG[catKey] || SVG.etc;
  }

  /* ── 페이지 표시 ── */
  showContent();

  /* ── 연관 제품 로드 (같은 카테고리, 최신순, 자기 자신 제외) ── */
  try {
    const relQ  = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(20));
    const relSnap = await getDocs(relQ);
    const related = relSnap.docs
      .filter(d => d.id !== id && d.data().category === data.category)
      .slice(0, 4)
      .map(d => ({ id: d.id, ...d.data() }));

    if (related.length) {
      const relSection = document.getElementById('related-section');
      const relGrid    = document.getElementById('related-grid');
      document.getElementById('related-title').textContent =
        `같은 카테고리 제품 — ${data.category || ''}`;
      relGrid.innerHTML = related.map(renderRelatedCard).join('');
      initRelatedClicks(relGrid);
      relSection.hidden = false;
    }
  } catch (err) {
    console.warn('[product-detail] 연관 제품 로드 실패 (무시):', err);
  }

  console.log('[product-detail] ✅ 렌더링 완료:', data.name);
})();
