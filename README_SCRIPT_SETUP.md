# Google Apps Script 문의 폼 연동 설정 가이드

## 1. Google 스프레드시트 만들기

1. [Google Drive](https://drive.google.com) 접속 → **새로 만들기 > Google 스프레드시트**
2. 파일 이름을 `헬스스케치 문의접수`로 저장

## 2. Apps Script 편집기 열기

1. 스프레드시트 메뉴 **확장 프로그램 > Apps Script** 클릭
2. 기본으로 열린 `Code.gs` 내용을 전체 삭제
3. `google-apps-script.js` 파일의 내용을 전부 복사해서 붙여 넣기
4. 상단의 `NOTIFY_EMAIL` 값을 알림 받을 이메일 주소로 수정
5. **저장** (Ctrl+S)

## 3. 웹 앱으로 배포

1. 오른쪽 상단 **배포 > 새 배포** 클릭
2. 배포 유형: **웹 앱** 선택
3. 설정:
   - **설명**: 헬스스케치 문의 폼
   - **다음 사용자로 실행**: 나(본인 계정)
   - **액세스 권한**: **모든 사용자** (Anyone)
4. **배포** 클릭
5. 권한 승인 팝업이 뜨면 **액세스 허용** 클릭
6. 배포 완료 후 **웹 앱 URL** 복사

## 4. main.js에 URL 붙여 넣기

`healthsketch/js/main.js` 파일 상단 근처:

```javascript
const GAS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

위 줄에서 `YOUR_SCRIPT_ID` 부분을 복사한 URL의 실제 스크립트 ID로 교체.

예시:
```javascript
const GAS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxABC123.../exec';
```

## 5. 동작 확인

- 사이트에서 문의 폼 작성 후 전송
- 스프레드시트 `문의접수` 시트에 행이 추가되는지 확인
- `NOTIFY_EMAIL` 주소로 알림 메일 수신 확인

## 참고사항

- Apps Script를 수정한 경우 **새 배포**를 만들어야 변경 사항이 반영됩니다. (기존 URL은 구버전을 가리킴)
- 스프레드시트 이름(`SHEET_NAME`)을 변경했다면 코드 상단 변수도 동일하게 수정하세요.
