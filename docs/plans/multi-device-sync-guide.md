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

## 3. Đồng bộ Global Rules (`ecc-core`, 11 Plugins, 10 Global Skills & User Settings) giữa 2 máy

Trong file `~/.gemini/config/config.json` của bạn hiện đang bật bộ khung kỹ thuật **`ecc-core`** (chứa quy tắc TDD, Code Review, Security Checklist) cùng 11 Plugins và 10 Global Skills:
- **11 Plugins (`~/.gemini/config/plugins/`)**:
  - `ecc-core`
  - `ui-ux-skills` (`impeccable`, `design-taste-frontend`)
  - `ponytail` (`ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`)
  - `pro-workflows` (`systematic-debugging`, `brainstorming`, `context-optimization`, `context-compression`, `tool-design`, `multi-agent-patterns`, `copywriting`, `onboarding`, `cro`, `remotion-best-practices`)
  - `modern-web-guidance-plugin`
  - `gemini-api` (`v2.4.0`: `gemini-api-dev`, `gemini-live-api-dev`, `gemini-omni-flash-api`)
  - `firebase` (`v1.0.3`)
  - `gdrive` (`v0.0.11`)
  - `flutter` (`v1.0.7`)
  - `science` (`v1.4.0`)
  - `google-antigravity-sdk` (`v0.0.9`)
- **10 Global Skills (`~/.gemini/config/skills/`)**:
  - `graphify`, `archify`, `spec-kit`, `dataviz`, `claude-design`, `claude-design-system`, `claude-dashboard`, `claude-slides`, `claude-motion`, `motion-director`

**Để máy thứ 2 có y hệt bộ Global Rules, Plugins, Skills, `.env` và `graphify-out/` này:**
1. Sử dụng trực tiếp kho lưu trữ Private `antiantigravity-synchronization`:
   - Trên Máy 1 (trước khi rời máy): `powershell -ExecutionPolicy Bypass -File "C:\Users\thanhphuc\Documents\GitHub\antiantigravity-synchronization\scripts\sync-push.ps1"`
   - Trên Máy 2 (khi bắt đầu làm việc): `powershell -ExecutionPolicy Bypass -File "C:\Users\thanhphuc\Documents\GitHub\antiantigravity-synchronization\scripts\sync-pull.ps1"`
2. **Lưu ý quan trọng khi đồng bộ `config.json` giữa 2 máy**:
   - Script `sync-pull.ps1` tự động gộp (`merge`) khối `"plugins"` vào `~/.gemini/config/config.json` trên máy đích mà vẫn bảo toàn `"remoteControlHostname"`, `"sidecars"` và `"userSettings"` cục bộ của từng máy.
   - Ngoài ra, mọi quy tắc cốt lõi nhất của `ecc-core`, `Graphify`, `Archify`, `Spec-Kit` và `Baoyu-Design` đã được trích xuất và nhúng thẳng vào file **`AGENTS.md`** tại gốc repo `chello-web` và `chello-api`. Nhờ vậy, kể cả khi máy 2 chưa kịp chạy script, AI vẫn tuân thủ 100% quy tắc của bạn!

---

## 4. Quy trình 30 giây khi chuyển đổi giữa 2 máy

### Trước khi rời Máy 1:
1. Nhắn AI: *"Hãy cập nhật tiến độ hiện tại vào `docs/plans/` và push lên Git giúp tôi"*.
2. AI sẽ tự động ghi lại bước đang làm dở vào `docs/plans/`, commit và `git push`.

### Khi ngồi vào Máy 2:
1. Chạy `git pull` ở cả `chello-web` và `chello-api` (hoặc nhắn AI: *"Hãy `git pull` cả 2 repo và đọc `AGENTS.md` cùng `docs/plans/` để tiếp tục công việc"*).
2. Antigravity tự động nạp `AGENTS.md`, đọc `docs/plans/` và tiếp tục đúng ngay bước bạn dừng lại ở Máy 1 mà không cần giải thích lại từ đầu!
