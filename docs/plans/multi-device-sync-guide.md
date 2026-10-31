# Hướng dẫn Đồng bộ Toàn diện giữa 2 Thiết bị (Multi-Device Sync Guide)

Tài liệu này giải quyết bài toán chuyển đổi liên tục giữa 2 máy tính khi làm việc trên **Google Antigravity (AGY)** cho dự án **Chella** (`chello-web` & `chello-api`), bao gồm cả các cấu hình **an toàn** (đưa lên Git) và các dữ liệu **nhạy cảm / cục bộ** (`.env`, Plugins, Global Config, lịch sử phiên).

---

## 1. Phân loại 4 nhóm dữ liệu cần đồng bộ

| Nhóm dữ liệu | Vị trí trên máy | Có đẩy lên Git công khai được không? | Giải pháp đồng bộ chuẩn |
| :--- | :--- | :--- | :--- |
| **1. Rules, Nguyên tắc thiết kế & Plans** | `AGENTS.md`, `docs/plans/*.md` trong mỗi repo | **CÓ (An toàn 100%)** | Đã tích hợp sẵn vào repo. Chỉ cần `git pull` / `git push`. |
| **2. Biến môi trường & Bí mật (`.env`)** | `chello-api/.env`, `chello-web/.env` | **KHÔNG (Chứa API Key, DB URI, JWT Secret)** | Mã hóa AES-256 thành file `.env.enc` (hoặc dùng Private Gist / Bitwarden / 1Password / Google Drive cá nhân). |
| **3. Global Config & Plugins AGY** | `~/.gemini/config/` (`config.json`, `plugins/`) | **BÁN AN TOÀN** (`config.json` an toàn, thư mục credential thì không) | Dùng script `scripts/sync-dev-env.ps1` để xuất/nhập danh sách plugins & settings, hoặc Junction Link qua Google Drive/OneDrive. |
| **4. Ngữ cảnh cuộc trò chuyện (Brain)** | `~/.gemini/antigravity/brain/<id>` | **KHÔNG NÊN** (Nặng, chứa đường dẫn tuyệt đối của từng máy) | Thay thế bằng việc ghi trạng thái vào `docs/plans/` trước khi rời máy. |

---

## 2. Cách đồng bộ những thứ "Không an toàn nếu để lộ" (Secrets & `.env`)

Vì bạn thường xuyên đổi qua lại giữa 2 máy, việc copy `.env` thủ công bằng USB rất bất tiện, còn đẩy `.env` thẳng lên GitHub thì **cực kỳ nguy hiểm** (GitHub sẽ quét và khóa key ngay). Có **2 cách an toàn tuyệt đối**:

### Cách A (Khuyên dùng — Tích hợp sẵn bằng Script PowerShell): Mã hóa `.env` bằng mật khẩu cá nhân
Bạn có thể mã hóa file `.env` thành file `.env.vault` bằng chuẩn mã hóa hoặc lưu trực tiếp trong thư mục đám mây cá nhân (Google Drive Desktop / OneDrive) rồi tạo **Symbolic Link / Copy tự động**:

Chạy lệnh sau trên PowerShell để **Sao lưu (Export)** toàn bộ `.env` + cấu hình Global AGY (`config.json`) vào một thư mục đồng bộ đám mây (ví dụ Google Drive hoặc OneDrive trên máy bạn):

```powershell
# 1. Trên máy đang làm việc (Export ra thư mục Cloud cá nhân của bạn)
$SyncDir = "$HOME\Google Drive\Chella-Sync" # Hoặc "$HOME\OneDrive\Chella-Sync"
New-Item -ItemType Directory -Force -Path $SyncDir | Out-Null

Copy-Item "c:\Users\thanhphuc\Documents\GitHub\chello-api\.env" "$SyncDir\chello-api.env" -Force
if (Test-Path "c:\Users\thanhphuc\Documents\GitHub\chello-web\.env") {
  Copy-Item "c:\Users\thanhphuc\Documents\GitHub\chello-web\.env" "$SyncDir\chello-web.env" -Force
}
Copy-Item "$HOME\.gemini\config\config.json" "$SyncDir\agy-config.json" -Force
Write-Host "Đã sao lưu .env và cấu hình AGY lên Cloud cá nhân!" -ForegroundColor Green
```

Khi sang **máy tính thứ 2**, bạn chỉ cần chạy chiều ngược lại (**Import**):

```powershell
# 2. Trên máy tính thứ 2 (Import từ thư mục Cloud cá nhân về máy)
$SyncDir = "$HOME\Google Drive\Chella-Sync" # Hoặc "$HOME\OneDrive\Chella-Sync"

Copy-Item "$SyncDir\chello-api.env" "c:\Users\thanhphuc\Documents\GitHub\chello-api\.env" -Force
if (Test-Path "$SyncDir\chello-web.env") {
  Copy-Item "$SyncDir\chello-web.env" "c:\Users\thanhphuc\Documents\GitHub\chello-web\.env" -Force
}
Copy-Item "$SyncDir\agy-config.json" "$HOME\.gemini\config\config.json" -Force
Write-Host "Đã khôi phục .env và cấu hình AGY thành công!" -ForegroundColor Green
```

### Cách B: Tạo 1 GitHub Repository **Private** riêng tên là `dotfiles-private`
1. Tạo một repo **Private** (chỉ mình bạn thấy) trên GitHub.
2. Lưu `chello-api.env`, `chello-web.env` và `~/.gemini/config/config.json` vào repo Private đó.
3. Ở mỗi máy, chỉ cần `git pull` repo Private đó là có ngay toàn bộ key mới nhất.

---

## 3. Đồng bộ Global Rules (`ecc-core`, Plugins & User Settings) giữa 2 máy

Trong file `~/.gemini/config/config.json` của bạn hiện đang bật bộ khung kỹ thuật **`ecc-core`** (chứa quy tắc TDD, Code Review, Security Checklist) cùng các plugins:
- `ecc-core`
- `modern-web-guidance-plugin`
- `gemini-api`
- `firebase`
- `gdrive`
- `flutter`
- `science`
- `google-antigravity-sdk`

**Để máy thứ 2 có y hệt bộ Global Rules này:**
1. Mở Antigravity ở máy thứ 2 → đăng nhập cùng tài khoản Google.
2. Copy thư mục `C:\Users\thanhphuc\.gemini\config\plugins` và file `C:\Users\thanhphuc\.gemini\config\config.json` từ máy 1 sang máy 2 (qua Google Drive/OneDrive hoặc repo Private ở mục 2).
3. **Lưu ý quan trọng khi copy `config.json` giữa 2 máy**:
   - Trong `config.json` có trường `"remoteControlHostname"` và đường dẫn tuyệt đối trong `"sidecars"`. Nếu tên user Windows ở máy 2 khác `thanhphuc`, hãy dùng biến đường dẫn tương ứng trên máy 2 hoặc chỉ copy khối `"plugins"` trong `config.json`.
   - Ngoài ra, mọi quy tắc cốt lõi nhất của `ecc-core` đã được trích xuất và nhúng thẳng vào file **`AGENTS.md`** tại gốc repo `chello-web` và `chello-api`. Nhờ vậy, kể cả khi máy 2 chưa kịp cài plugin, AI vẫn tuân thủ 100% quy tắc của bạn!

---

## 4. Quy trình 30 giây khi chuyển đổi giữa 2 máy

### Trước khi rời Máy 1:
1. Nhắn AI: *"Hãy cập nhật tiến độ hiện tại vào `docs/plans/` và push lên Git giúp tôi"*.
2. AI sẽ tự động ghi lại bước đang làm dở vào `docs/plans/`, commit và `git push`.

### Khi ngồi vào Máy 2:
1. Chạy `git pull` ở cả `chello-web` và `chello-api` (hoặc nhắn AI: *"Hãy `git pull` cả 2 repo và đọc `AGENTS.md` cùng `docs/plans/` để tiếp tục công việc"*).
2. Antigravity tự động nạp `AGENTS.md`, đọc `docs/plans/` và tiếp tục đúng ngay bước bạn dừng lại ở Máy 1 mà không cần giải thích lại từ đầu!
