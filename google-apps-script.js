// ============================================================
//  헬스스케치 문의 폼 — Google Apps Script
//  배포 후 exec URL을 main.js의 GAS_SCRIPT_URL에 붙여 넣으세요.
// ============================================================

var NOTIFY_EMAIL = 'vertau.business@gmail.com'; // 알림 받을 이메일
var SHEET_NAME   = '문의접수';                   // 스프레드시트 시트 이름

function doPost(e) {
  try {
    var name    = e.parameter.name    || '';
    var phone   = e.parameter.phone   || '';
    var email   = e.parameter.email   || '';
    var type    = e.parameter.type    || '';
    var message = e.parameter.message || '';
    var now     = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    // 스프레드시트에 행 추가
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['접수일시', '이름', '연락처', '이메일', '문의유형', '내용', '처리상태']);
    }
    sheet.appendRow([now, name, phone, email, type, message, '미처리']);

    // 관리자 알림 이메일
    var adminSubject = '[헬스스케치] 새 문의 - ' + type + ' ' + name;
    var adminBody    =
      '새 문의가 접수되었습니다.\n\n' +
      '접수일시: ' + now   + '\n' +
      '이름:     ' + name  + '\n' +
      '연락처:   ' + phone + '\n' +
      '이메일:   ' + (email || '미입력') + '\n' +
      '문의유형: ' + type  + '\n' +
      '내용:\n'   + message;

    GmailApp.sendEmail(NOTIFY_EMAIL, adminSubject, adminBody);

    // 고객 확인 이메일 (이메일 주소를 입력한 경우에만 발송)
    if (email && isValidEmail(email)) {
      var confirmSubject = '[헬스스케치] 문의가 접수되었습니다';
      var confirmBody    =
        '안녕하세요, ' + name + '님.\n' +
        '헬스스케치에 문의해 주셔서 감사합니다.\n' +
        '아래 내용으로 문의가 접수되었으며 영업시간 내 빠르게 연락드리겠습니다.\n\n' +
        '━━━━━━━━━━━━━━━━━\n' +
        '문의 유형: ' + type    + '\n' +
        '문의 내용: ' + message + '\n' +
        '접수 일시: ' + now     + '\n' +
        '━━━━━━━━━━━━━━━━━\n\n' +
        '영업시간: 평일 09:00~18:00 / 토요일 09:00~15:00\n' +
        '전화: 010-9906-8300\n' +
        '헬스스케치 드림';

      GmailApp.sendEmail(email, confirmSubject, confirmBody);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// GET 요청 (연결 테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', message: 'Health Sketch GAS is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
