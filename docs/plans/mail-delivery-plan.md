# Kịch bản sửa hệ thống email (Brevo + Gmail Apps Script)

> [!IMPORTANT]
> Theo yêu cầu, **chưa sửa code repo**. Thứ tự: (1) bạn chỉnh Brevo + Apps Script và cấu hình → (2) bạn xác nhận → (3) tôi code, test, deploy.

## Giai đoạn 0 — Việc bạn làm trước (không cần code repo)

### 0.1 Kiểm tra Brevo (5 phút)
| # | Việc | Ở đâu |
|---|---|---|
| 1 | Key phải bắt đầu bằng `xkeysib-` (API key), **không phải** `xsmtp-` | Brevo → SMTP & API → API Keys |
| 2 | Email gửi (`ADMIN_EMAIL_ADDRESS`) phải ở trạng thái **verified** | Senders, Domains & Dedicated IPs → Senders |
| 3 | **Tắt "Authorized IPs"** (hoặc tắt chặn) vì IP Render đổi liên tục | Security → Authorized IPs |
| 4 | Xem log gửi thử | Transactional → Logs |
| 5 | Trên Render có đủ `BREVO_API_KEY`, `ADMIN_EMAIL_ADDRESS`, `ADMIN_EMAIL_NAME` | Render → chello-api → Environment |

Không cần cấu hình thêm biến nào khác cho phương án B: backend sẽ **tái dùng** `GOOGLE_DRIVE_SCRIPT_URL` và `GOOGLE_DRIVE_BRIDGE_SECRET` đang có.

### 0.2 Cập nhật Google Apps Script (cầu Drive hiện có)
Mở script đang chạy cầu Drive → làm lần lượt:

1. **Đổi tên** hàm `doPost` hiện có thành `handleDriveUpload_` (giữ nguyên nội dung bên trong).
2. **Dán đoạn dưới đây** vào cuối file (đoạn này có `doPost` mới làm bộ định tuyến).
3. **Project Settings → Script properties** → thêm `BRIDGE_SECRET` = đúng giá trị của `GOOGLE_DRIVE_BRIDGE_SECRET` trên Render (đừng dán secret vào chat).
4. Chọn hàm `authorizeMail_` → **Run** → cấp quyền *gửi email* khi Google hỏi.
5. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** (giữ nguyên URL `/exec`; *Execute as: Me*, *Who has access: Anyone*).

```javascript
// ====== Chella Mail Bridge (dán vào cuối file) ======
var MAIL_DAILY_LIMIT = 80   // Gmail thường tối đa 100/ngày, chừa dư 20
var MAIL_MAX_HTML = 60000
var EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/

function doPost(e) {
  var body = null
  try { body = JSON.parse(e.postData.contents) } catch (err) { body = null }
  if (body && body.action === 'sendMail') return handleSendMail_(body)
  return handleDriveUpload_(e) // luồng upload Drive cũ giữ nguyên
}

function handleSendMail_(body) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('BRIDGE_SECRET')
    if (!secret || !safeEquals_(String(body.secret || ''), secret)) {
      return json_({ ok: false, error: 'UNAUTHORIZED' })
    }
    var to = String(body.to || '').trim()
    var subject = String(body.subject || '').replace(/[\r\n]+/g, ' ').slice(0, 200)
    var html = String(body.html || '')
    var text = String(body.text || subject)
    if (!EMAIL_PATTERN.test(to) || !subject || !html || html.length > MAIL_MAX_HTML) {
      return json_({ ok: false, error: 'INVALID_PAYLOAD' })
    }
    var remaining = consumeQuota_()
    if (remaining < 0) return json_({ ok: false, error: 'DAILY_LIMIT_REACHED' })

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: text,
      htmlBody: html,
      name: String(body.fromName || 'Chella').slice(0, 60),
      replyTo: body.replyTo && EMAIL_PATTERN.test(body.replyTo) ? body.replyTo : ''
    })
    return json_({ ok: true, remaining: remaining })
  } catch (err) {
    return json_({ ok: false, error: 'MAIL_FAILED', detail: String(err).slice(0, 200) })
  }
}

function consumeQuota_() {
  var lock = LockService.getScriptLock()
  lock.waitLock(5000)
  try {
    var props = PropertiesService.getScriptProperties()
    var key = 'MAIL_COUNT_' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd')
    var used = Number(props.getProperty(key) || 0)
    if (used >= MAIL_DAILY_LIMIT) return -1
    props.setProperty(key, String(used + 1))
    return MAIL_DAILY_LIMIT - used - 1
  } finally { lock.releaseLock() }
}

function safeEquals_(a, b) {
  if (a.length !== b.length) return false
  var diff = 0
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

// Chạy 1 lần trong editor để cấp quyền + gửi thử cho chính bạn
function authorizeMail_() {
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Chella mail bridge OK', 'Quyền gửi email đã được cấp.')
}
```

**Vì sao thiết kế vậy:** secret dùng `Script properties` (không nằm trong code), so sánh hằng thời gian, hạn mức 80 thư/ngày chống lạm dụng nếu lộ secret, lọc xuống dòng ở tiêu đề (chặn header injection), giới hạn kích thước/định dạng, và **không** làm hỏng luồng upload Drive vì chỉ rẽ nhánh khi `action === 'sendMail'`.

### 0.3 Kiểm tra cầu mail (PowerShell, secret không hiện ra chat)
```powershell
$url    = Read-Host 'Apps Script /exec URL'
$secret = Read-Host 'BRIDGE secret' -AsSecureString
$plain  = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret))
$body = @{ action='sendMail'; secret=$plain; to='EMAIL_CUA_BAN@gmail.com'; subject='Test Chella'; html='<b>OK</b>'; text='OK'; fromName='Chella' } | ConvertTo-Json
Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $body
```
Kết quả mong đợi: `ok: True, remaining: 79`. Gửi tôi kết quả (không gửi secret).

### 0.4 Quyết định cần bạn chốt (mặc định in đậm)
| Câu hỏi | Mặc định đề xuất |
|---|---|
| Thứ tự gửi | **Brevo → Gmail bridge** (Brevo lỗi thì tự chuyển sang Gmail) |
| Hạn dùng link xác thực | **24 giờ** |
| Chặn gửi lại email | **60 giây** mỗi lần, tối đa 5 lần/giờ/email |
| Tên người gửi / chữ ký | **Chella** (bỏ chữ ký cứng “Dao Thanh Phuc”) |
| Ngôn ngữ email | **Theo ngôn ngữ người dùng đang chọn** (VI/EN/JA/KO) |
| Gmail gửi | Nên dùng **Gmail riêng** cho Chella thay vì Gmail cá nhân |

## Giai đoạn 1 — Backend (tôi làm sau khi bạn xác nhận) — `chello-api`
TDD (RED→GREEN), lint 0 warning, test xanh.

1. **`MailProvider`** mới ([BrevoProvider.js](file:///c:/Users/thanhphuc/Documents/GitHub/chello-api/src/providers/BrevoProvider.js) giữ nguyên làm driver): chuỗi driver `brevo` → `gmail-bridge`, timeout 15s mỗi driver, **không bao giờ ném lỗi**, trả `{ ok, provider, attempts[] }`, log lý do (không lộ key/secret). Thiếu cấu hình thì ghi log rõ ràng thay vì im lặng `return null`.
2. **Sửa luồng [userService.js](file:///c:/Users/thanhphuc/Documents/GitHub/chello-api/src/services/userService.js)**: tạo user xong mà gửi mail lỗi thì **không** trả 500; trả `emailSent: false` kèm hướng dẫn.
3. **Token xác thực an toàn**: lưu **hash SHA-256**, thêm `verifyTokenExpiresAt` (24h), so sánh hằng thời gian; user cũ chưa có trường này vẫn xác thực được (tương thích ngược).
4. **`POST /v1/users/resend_verification`**: phản hồi trung tính (không lộ email có tồn tại), cooldown + rate limit.
5. **Mẫu email đa ngôn ngữ** (VI/EN/JA/KO), escape HTML, có nút + link thô, thương hiệu Chella.
6. **Chống liệt kê email** ở đăng ký (phản hồi trung tính, thư cảnh báo tới chủ email nếu đã tồn tại).
7. **`GET /v1/integrations/status`** thêm `mail.providers[{name, configured}]` (chỉ boolean) để bạn tự kiểm tra cấu hình.
8. Cập nhật `.env.example`, README.

## Giai đoạn 2 — Frontend — `chello-web`
- Form đăng ký: gửi kèm `lang`; sau đăng ký hiện trạng thái “đã gửi / chưa gửi được” + nút **Gửi lại email** (đếm ngược 60s).
- [AccountVerification.jsx](file:///c:/Users/thanhphuc/Documents/GitHub/chello-web/src/pages/Auth/AccountVerification.jsx): thông báo link hết hạn + gửi lại.
- Đăng nhập tài khoản chưa kích hoạt: gợi ý gửi lại email.
- i18n đủ VI/EN/JA/KO, test, lint, build.

## Giai đoạn 3 — Triển khai & kiểm thử thật
Push `chello-api` (Render) → `chello-web` (Vercel) → đăng ký thử 1 email thật; kiểm tra thư qua Brevo, rồi tắt Brevo thử để xác nhận tự chuyển sang Gmail.

> [!NOTE]
> Sau Giai đoạn 1–3, tính năng **Quên mật khẩu** (đã đề xuất ở lộ trình tài khoản) dùng lại ngay hạ tầng email này.
