(function () {
  'use strict';

  var SHEET_ID   = 'SHEET_ID_PLACEHOLDER';
  var SHEET_NAME = '제품목록';
  var CSV_URL    = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID +
                   '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(SHEET_NAME);

  /* ── 카테고리 정의 ── */
  var CAT_MAP = {
    '플레이트머신': 'plate',
    '유산소':       'cardio',
    '오리지널머신': 'original',
    '프리웨이트':   'freeweight',
    '기타':         'etc',
  };
  var CAT_ORDER = ['플레이트머신', '유산소', '오리지널머신', '프리웨이트', '기타'];

  /* ── 카테고리별 기본 SVG ── */
  var SVG = {
    plate: '<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="10" y="38" width="100" height="14" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="5" y="28" width="18" height="34" rx="4" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="97" y="28" width="18" height="34" rx="4" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="35" y="20" width="10" height="50" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '<rect x="75" y="20" width="10" height="50" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '</svg>',

    cardio: '<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="15" y="55" width="90" height="12" rx="4" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="20" y="20" width="30" height="35" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '<rect x="25" y="25" width="20" height="10" rx="2" fill="#1a2d6e" opacity="0.2"/>' +
      '<line x1="30" y1="55" x2="25" y2="67" stroke="#1a2d6e" stroke-width="2"/>' +
      '<line x1="45" y1="55" x2="50" y2="67" stroke="#1a2d6e" stroke-width="2"/>' +
      '<path d="M18 55 Q60 40 102 55" stroke="#c8a94a" stroke-width="2" fill="none" stroke-dasharray="4 3"/>' +
      '</svg>',

    original: '<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="18" y="8" width="8" height="74" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="94" y="8" width="8" height="74" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="18" y="10" width="84" height="8" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '<rect x="18" y="72" width="84" height="8" rx="2" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '<rect x="35" y="30" width="50" height="8" rx="2" fill="#c8a94a" opacity="0.7" stroke="#a8882e" stroke-width="1.5"/>' +
      '</svg>',

    freeweight: '<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="50" y="40" width="20" height="10" rx="2" fill="#dde3f2" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="5" y="32" width="45" height="26" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="70" y="32" width="45" height="26" rx="5" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/>' +
      '<rect x="12" y="22" width="14" height="46" rx="3" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '<rect x="94" y="22" width="14" height="46" rx="3" fill="#cdd5ee" stroke="#1a2d6e" stroke-width="1.5"/>' +
      '</svg>',

    etc: '<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="10" y="55" width="100" height="18" rx="4" fill="#e8ecf6" stroke="#1a2d6e" stroke-width="2"/>' +
      '<path d="M20 55 Q60 25 100 55" stroke="#c8a94a" stroke-width="2.5" fill="none"/>' +
      '<rect x="28" y="40" width="64" height="16" rx="3" fill="#dde3f2" stroke="#1a2d6e" stroke-width="1.5" opacity="0.7"/>' +
      '</svg>',
  };

  /* ── CSV 파싱 ── */
  function parseCSVLine(line) {
    var result = [], current = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { current += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === ',' && !inQ) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  function parseCSV(text) {
    var lines = text.trim().split('\n');
    return lines.slice(1).map(function (line) {
      var c = parseCSVLine(line);
      return {
        name:     c[0] || '',
        category: c[1] || '',
        desc:     c[2] || '',
        status:   c[3] || '판매중',
        imageUrl: c[4] || '',
      };
    }).filter(function (p) { return p.name; });
  }

  /* ── HTML 이스케이프 ── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 카드 렌더링 ── */
  function renderCard(p) {
    var catKey   = CAT_MAP[p.category] || 'etc';
    var catLabel = p.category || '기타';
    var sold     = p.status === '판매완료';
    var reserved = p.status === '예약중';

    var thumb = p.imageUrl
      ? '<img src="' + esc(p.imageUrl) + '" alt="' + esc(p.name) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;">'
      : (SVG[catKey] || SVG.etc);

    var statusBadge = sold
      ? '<span class="product-status status-sold">판매완료</span>'
      : reserved
        ? '<span class="product-status status-reserved">예약중</span>'
        : '';

    var actionBtn = sold
      ? ''
      : '<a href="contact.html?type=buy" class="btn btn-secondary btn-sm">문의하기</a>';

    return '<article class="product-card' + (sold ? ' product-card--sold' : '') +
      '" data-category="' + catKey + '">' +
      '<div class="product-thumb">' + thumb + '</div>' +
      '<div class="product-body">' +
        '<span class="product-badge badge-' + catKey + '">' + esc(catLabel) + '</span>' +
        statusBadge +
        '<h3 class="product-name">' + esc(p.name) + '</h3>' +
        '<p class="product-desc">' + esc(p.desc) + '</p>' +
        actionBtn +
      '</div>' +
    '</article>';
  }

  /* ── 필터 버튼 렌더링 ── */
  function renderFilters(products) {
    var filterWrap = document.getElementById('filter-wrap');
    if (!filterWrap) return;

    var used = products.reduce(function (acc, p) {
      if (p.category) acc[p.category] = true;
      return acc;
    }, {});

    var html = '<button class="filter-btn active" data-filter="all" role="tab" aria-selected="true">전체</button>';
    CAT_ORDER.forEach(function (cat) {
      if (used[cat]) {
        var key = CAT_MAP[cat] || 'etc';
        html += '<button class="filter-btn" data-filter="' + key + '" role="tab" aria-selected="false">' + cat + '</button>';
      }
    });
    filterWrap.innerHTML = html;
  }

  /* ── 필터 이벤트 연결 ── */
  function initFilter(products) {
    var filterWrap   = document.getElementById('filter-wrap');
    var productCount = document.getElementById('product-count');
    var noResult     = document.getElementById('no-result');
    if (!filterWrap) return;

    if (productCount) {
      productCount.innerHTML = '전체 <strong>' + products.length + '</strong>개 제품';
    }

    filterWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      var filter = btn.dataset.filter;

      filterWrap.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      var cards = document.querySelectorAll('#product-grid .product-card');
      var visible = 0;
      cards.forEach(function (card) {
        var match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      if (productCount) {
        var label = filter === 'all' ? '전체' : btn.textContent.trim();
        productCount.innerHTML = label + ' <strong>' + visible + '</strong>개 제품';
      }
      if (noResult) noResult.hidden = visible > 0;
    });
  }

  /* ── fade-in 재적용 ── */
  function applyFadeIn(grid) {
    if (!('IntersectionObserver' in window)) return;
    var cards = grid.querySelectorAll('.product-card');
    cards.forEach(function (el) { el.classList.add('fade-in'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    cards.forEach(function (el) { io.observe(el); });
  }

  /* ── 진입점 ── */
  function init() {
    var grid    = document.getElementById('product-grid');
    var loading = document.getElementById('products-loading');
    var noResult = document.getElementById('no-result');
    var count   = document.getElementById('product-count');
    if (!grid) return;

    fetch(CSV_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (csv) {
        if (loading) loading.hidden = true;

        var products = parseCSV(csv);

        if (!products.length) {
          if (count) count.innerHTML = '전체 <strong>0</strong>개 제품';
          if (noResult) noResult.hidden = false;
          return;
        }

        renderFilters(products);
        grid.innerHTML = products.map(renderCard).join('');
        initFilter(products);
        applyFadeIn(grid);
      })
      .catch(function () {
        if (loading) loading.hidden = true;
        if (count) count.textContent = '';
        grid.innerHTML =
          '<p class="products-error">제품 정보를 불러오지 못했습니다.<br>' +
          '잠시 후 새로고침하거나 전화로 문의해 주세요. (010-9906-8300)</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
