# 헬스스케치 (HS Health Sketch) 웹사이트

경기도 파주시 탄현면 소재 중고 헬스기구 전문 도매업체 **헬스스케치**의 공식 웹사이트입니다.

---

## 📁 파일 구조

```
healthsketch/
├── index.html        홈 페이지
├── products.html     제품 목록
├── services.html     서비스 안내
├── location.html     매장 안내
├── contact.html      문의하기
├── 404.html          오류 페이지
├── css/
│   └── style.css     전체 스타일 (디자인)
├── js/
│   └── main.js       기능 스크립트
└── README.md         이 파일
```

---

## ✏️ 자주 바꾸는 내용 수정 방법

> **준비물:** 메모장(Windows) 또는 텍스트편집기로 파일을 열면 됩니다.
> VS Code, 메모장, 메모장++ 모두 가능합니다.

---

### 📞 전화번호 바꾸는 법

전화번호가 바뀌었을 때 — **모든 HTML 파일**에서 아래 내용을 찾아 바꿉니다.

1. 파일 탐색기에서 `healthsketch` 폴더를 열기
2. 각 `.html` 파일을 메모장으로 열기
3. `Ctrl + H` (찾아 바꾸기) 실행
4. **찾을 내용:** `010-9906-8300`
5. **바꿀 내용:** 새 전화번호 (예: `010-1234-5678`)
6. **모두 바꾸기** 클릭 후 저장

> 바꿔야 할 파일: `index.html`, `products.html`, `services.html`, `location.html`, `contact.html`, `404.html`

---

### 🕐 영업시간 바꾸는 법

영업시간은 아래 파일들에 있습니다.

**`location.html`** 파일에서 찾기:
```
평일 09:00 – 18:00
토요일 09:00 – 15:00
일요일·공휴일 휴무
```

**`contact.html`** 파일에서도 동일하게 수정:
```
평일 09:00–18:00
토요일 09:00–15:00
```

**`services.html`** 파일의 A/S 섹션도 확인:
```
평일 09:00 – 18:00
토요일 09:00 – 15:00
```

> 팁: `Ctrl + F`로 `09:00`을 검색하면 빠르게 찾을 수 있습니다.

---

### 📍 주소 바꾸는 법

주소가 바뀌었을 때 — 각 파일에서 아래 문구를 찾아 바꿉니다.

```
경기도 파주시 탄현면 배나무길 67-13
```

바꿔야 할 파일: **모든 `.html` 파일** (푸터에 주소가 공통으로 들어있음)

`location.html`은 지도 링크도 함께 수정해야 합니다:
- 카카오맵 링크: `map.kakao.com/link/search/` 뒤의 주소 변경
- 네이버지도 링크: `map.naver.com/p/search/` 뒤의 주소 변경

---

### 🌐 네이버 카페 주소 바꾸는 법

```
http://cafe.naver.com/healthsketch
```

이 문구를 검색해서 새 카페 주소로 바꿉니다.  
바꿔야 할 파일: **모든 `.html` 파일**

---

### 📦 제품 추가하는 법

`products.html`을 메모장으로 열고,  
기존 제품 카드 하나를 **복사해서 붙여넣기** 한 뒤 내용을 수정합니다.

```html
<!-- 이 블록 하나가 제품 카드 1개입니다 -->
<article class="product-card" data-category="plate">
  <div class="product-thumb">
    <!-- SVG 아이콘 부분 (바꾸지 않아도 됨) -->
  </div>
  <div class="product-body">
    <span class="product-badge badge-plate">플레이트머신</span>  ← 카테고리
    <h3 class="product-name">제품 이름</h3>                     ← 제품명 수정
    <p class="product-desc">제품 설명을 여기에...</p>            ← 설명 수정
    <a href="contact.html" class="btn btn-secondary btn-sm">문의하기</a>
  </div>
</article>
```

**카테고리 종류:**
| `data-category` 값 | `badge-` 클래스 | 표시 이름 |
|---|---|---|
| `plate` | `badge-plate` | 플레이트머신 |
| `cardio` | `badge-cardio` | 유산소 |
| `original` | `badge-original` | 오리지널머신 |
| `freeweight` | `badge-freeweight` | 프리웨이트 |
| `etc` | `badge-etc` | 기타 |

---

### 🎨 색상/폰트 바꾸는 법

`css/style.css` 파일의 맨 위 `:root { ... }` 부분에서 색상을 바꿀 수 있습니다.

```css
:root {
  --navy:   #1a2d6e;   /* 메인 네이비 블루 색상 */
  --accent: #c8a94a;   /* 골드 포인트 색상 */
}
```

색상 코드는 구글에서 "색상 선택기"를 검색하면 원하는 색의 코드를 찾을 수 있습니다.

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — Git 초기화 (최초 1회)

```bash
# healthsketch 폴더 안에서 실행
git init
git add .
git commit -m "헬스스케치 웹사이트 최초 배포"
```

### 2단계 — GitHub 저장소 만들기

1. [github.com](https://github.com) 접속 → 로그인
2. 오른쪽 상단 `+` → **New repository** 클릭
3. Repository name: `healthsketch` (소문자)
4. **Public** 선택
5. **Create repository** 클릭

### 3단계 — GitHub에 업로드

```bash
git remote add origin https://github.com/[내아이디]/healthsketch.git
git branch -M main
git push -u origin main
```

`[내아이디]` 부분을 본인 GitHub 아이디로 바꾸세요.

### 4단계 — GitHub Pages 활성화

1. GitHub 저장소 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴 **Pages** 클릭
3. **Source** 드롭다운에서 `Deploy from a branch` 선택
4. Branch: `main` / 폴더: `/ (root)` 선택
5. **Save** 클릭

약 1~2분 후 아래 주소로 접속 가능합니다:
```
https://[내아이디].github.io/healthsketch/
```

### 5단계 — 내용 수정 후 업데이트 방법

파일을 수정한 뒤 아래 명령어를 실행하면 웹사이트가 자동 업데이트됩니다.

```bash
git add .
git commit -m "수정 내용 간단히 적기"
git push
```

---

## 📋 사업체 정보

| 항목 | 내용 |
|---|---|
| 상호명 | 헬스스케치 (HS Health Sketch) |
| 대표자 | 김종태 |
| 전화 | 010-9906-8300 |
| 주소 | 경기도 파주시 탄현면 배나무길 67-13 |
| 업종 | 중고 헬스기구 매입/판매 (도매) |
| 네이버카페 | http://cafe.naver.com/healthsketch |

---

## 🛠️ 기술 스택

- HTML5 / CSS3 / Vanilla JavaScript
- Google Fonts (Noto Sans KR, Oswald)
- 외부 라이브러리 없음 (순수 HTML/CSS/JS)
- GitHub Pages 호스팅

---

&copy; 2024 헬스스케치. All rights reserved.
