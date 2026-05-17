import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject,
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js';

/* ── Firebase 초기화 ── */
const firebaseConfig = {
  apiKey:            'AIzaSyBK2nv1p52OCArp3G9rpWNZi64RYvbb474',
  authDomain:        'health-sketch.firebaseapp.com',
  projectId:         'health-sketch',
  storageBucket:     'health-sketch.firebasestorage.app',
  messagingSenderId: '800191894133',
  appId:             '1:800191894133:web:8c342fb3fe4617e29f5e3c',
};
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

/* ── DOM 참조 ── */
const loginScreen       = document.getElementById('login-screen');
const dashboard         = document.getElementById('dashboard');
const loginForm         = document.getElementById('login-form');
const loginEmail        = document.getElementById('login-email');
const loginPassword     = document.getElementById('login-password');
const loginError        = document.getElementById('login-error');
const loginBtn          = document.getElementById('login-btn');
const logoutBtn         = document.getElementById('logout-btn');
const productForm       = document.getElementById('product-form');
const formTitle         = document.getElementById('form-title');
const formCancelBtn     = document.getElementById('form-cancel-btn');
const editId            = document.getElementById('edit-id');
const pName             = document.getElementById('p-name');
const pCategory         = document.getElementById('p-category');
const pDesc             = document.getElementById('p-desc');
const pStatus           = document.getElementById('p-status');
const dropZone          = document.getElementById('drop-zone');
const imageInput        = document.getElementById('image-input');
const imagePreviewList  = document.getElementById('image-preview-list');
const saveBtn           = document.getElementById('save-btn');
const productList       = document.getElementById('product-list');
const productCountBadge = document.getElementById('product-count-badge');
const toastEl           = document.getElementById('toast');

/* ── 이미지 상태 ── */
let existingImages = []; // { url, path } — 편집 시 기존 이미지
let pendingFiles   = []; // File[] — 새로 추가할 파일
let removedPaths   = []; // string[] — 삭제할 Storage 경로

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

/* ══════════════════════════════════
   Auth
══════════════════════════════════ */
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.hidden = true;
    dashboard.hidden = false;
    loadProducts();
  } else {
    loginScreen.hidden = false;
    dashboard.hidden = true;
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('is-visible');
  loginBtn.disabled = true;
  loginBtn.textContent = '로그인 중…';
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
  } catch {
    loginError.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
    loginError.classList.add('is-visible');
    loginBtn.disabled = false;
    loginBtn.textContent = '로그인';
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));

/* ══════════════════════════════════
   이미지 드래그앤드롭
══════════════════════════════════ */
dropZone.addEventListener('click',     () => imageInput.click());
dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles([...e.dataTransfer.files]);
});
imageInput.addEventListener('change', (e) => {
  handleFiles([...e.target.files]);
  imageInput.value = '';
});

function handleFiles(files) {
  const used    = existingImages.length + pendingFiles.length;
  const allowed = 5 - used;
  if (allowed <= 0) { showToast('사진은 최대 5장까지 추가할 수 있습니다.', 'error'); return; }
  const toAdd = files.filter(f => f.type.startsWith('image/')).slice(0, allowed);
  pendingFiles = [...pendingFiles, ...toAdd];
  renderPreviews();
}

function renderPreviews() {
  imagePreviewList.innerHTML = '';

  existingImages.forEach((img, i) => {
    const item = makePreviewItem(img.url, () => {
      removedPaths.push(img.path);
      existingImages.splice(i, 1);
      renderPreviews();
    });
    imagePreviewList.appendChild(item);
  });

  pendingFiles.forEach((file, i) => {
    const item = makePreviewItem(URL.createObjectURL(file), () => {
      pendingFiles.splice(i, 1);
      renderPreviews();
    });
    imagePreviewList.appendChild(item);
  });
}

function makePreviewItem(src, onRemove) {
  const div = document.createElement('div');
  div.className = 'image-preview-item';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  const btn = document.createElement('button');
  btn.className = 'image-preview-remove';
  btn.type = 'button';
  btn.textContent = '×';
  btn.addEventListener('click', onRemove);
  div.appendChild(img);
  div.appendChild(btn);
  return div;
}

/* ══════════════════════════════════
   제품 저장 (추가 / 수정)
══════════════════════════════════ */
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!pName.value.trim()) { showToast('제품명을 입력해 주세요.', 'error'); return; }
  if (!pCategory.value)    { showToast('카테고리를 선택해 주세요.', 'error'); return; }

  saveBtn.disabled = true;
  saveBtn.textContent = '저장 중…';

  try {
    const newImageData = await uploadImages(pendingFiles);
    await deleteImages(removedPaths);

    const allUrls  = [...existingImages.map(i => i.url),  ...newImageData.map(i => i.url)];
    const allPaths = [...existingImages.map(i => i.path), ...newImageData.map(i => i.path)];

    const data = {
      name:        pName.value.trim(),
      category:    pCategory.value,
      description: pDesc.value.trim(),
      status:      pStatus.value,
      images:      allUrls,
      imagePaths:  allPaths,
      updatedAt:   serverTimestamp(),
    };

    const id = editId.value;
    if (id) {
      await updateDoc(doc(db, 'products', id), data);
      showToast('제품이 수정되었습니다.', 'success');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'products'), data);
      showToast('제품이 추가되었습니다.', 'success');
    }

    resetForm();
  } catch (err) {
    console.error(err);
    showToast('저장 중 오류가 발생했습니다.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '저장';
  }
});

formCancelBtn.addEventListener('click', resetForm);

function resetForm() {
  productForm.reset();
  editId.value = '';
  formTitle.textContent = '제품 추가';
  formCancelBtn.hidden = true;
  existingImages = [];
  pendingFiles   = [];
  removedPaths   = [];
  renderPreviews();
}

/* ══════════════════════════════════
   Storage 업로드 / 삭제
══════════════════════════════════ */
async function uploadImages(files) {
  const results = [];
  for (const file of files) {
    const path      = `products/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
    const storRef   = ref(storage, path);
    await uploadBytes(storRef, file);
    const url = await getDownloadURL(storRef);
    results.push({ url, path });
  }
  return results;
}

async function deleteImages(paths) {
  for (const path of paths) {
    if (!path) continue;
    try { await deleteObject(ref(storage, path)); }
    catch { /* 이미 없는 파일은 무시 */ }
  }
}

/* ══════════════════════════════════
   제품 목록 (실시간)
══════════════════════════════════ */
function loadProducts() {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  onSnapshot(q, (snapshot) => {
    productCountBadge.textContent = `총 ${snapshot.size}개`;
    if (snapshot.empty) {
      productList.innerHTML = '<div class="list-empty">등록된 제품이 없습니다.</div>';
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'product-list';
    snapshot.forEach(docSnap => wrap.appendChild(buildListItem(docSnap)));
    productList.innerHTML = '';
    productList.appendChild(wrap);
  }, (err) => {
    console.error(err);
    productList.innerHTML = '<div class="list-empty">목록을 불러오지 못했습니다.</div>';
  });
}

function buildListItem(docSnap) {
  const d      = docSnap.data();
  const catKey = CAT_MAP[d.category] || 'etc';

  const item = document.createElement('div');
  item.className = 'product-list-item';

  const thumb = (d.images && d.images.length)
    ? `<img src="${esc(d.images[0])}" alt="${esc(d.name)}">`
    : SVG[catKey];

  item.innerHTML = `
    <div class="product-list-thumb">${thumb}</div>
    <div class="product-list-info">
      <div class="product-list-name">${esc(d.name)}</div>
      <div class="product-list-meta">
        <span class="badge badge-${catKey}">${esc(d.category)}</span>
        <span class="badge badge-${esc(d.status)}">${esc(d.status)}</span>
      </div>
    </div>
    <div class="product-list-actions">
      <button class="btn btn-outline btn-sm" data-action="edit">수정</button>
      <button class="btn btn-danger btn-sm"  data-action="delete">삭제</button>
    </div>`;

  item.querySelector('[data-action="edit"]').addEventListener('click',   () => startEdit(docSnap));
  item.querySelector('[data-action="delete"]').addEventListener('click', () => confirmDelete(docSnap.id, d));
  return item;
}

/* ── 수정 시작 ── */
function startEdit(docSnap) {
  const d = docSnap.data();
  editId.value   = docSnap.id;
  pName.value    = d.name        || '';
  pCategory.value = d.category  || '';
  pDesc.value    = d.description || '';
  pStatus.value  = d.status      || '판매중';

  existingImages = (d.images || []).map((url, i) => ({
    url,
    path: (d.imagePaths || [])[i] || '',
  }));
  pendingFiles = [];
  removedPaths = [];
  renderPreviews();

  formTitle.textContent = '제품 수정';
  formCancelBtn.hidden  = false;
  document.querySelector('.admin-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── 삭제 ── */
async function confirmDelete(id, data) {
  if (!confirm(`"${data.name}" 제품을 삭제하시겠습니까?\n사진도 함께 삭제됩니다.`)) return;
  try {
    await deleteImages(data.imagePaths || []);
    await deleteDoc(doc(db, 'products', id));
    showToast('제품이 삭제되었습니다.', 'success');
  } catch (err) {
    console.error(err);
    showToast('삭제 중 오류가 발생했습니다.', 'error');
  }
}

/* ══════════════════════════════════
   유틸
══════════════════════════════════ */
let toastTimer;
function showToast(msg, type = 'success') {
  toastEl.textContent = msg;
  toastEl.className   = `toast toast-${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 3000);
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
