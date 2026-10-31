# Chella — AI Agent Guidelines & Engineering Rules (`AGENTS.md`)

Tài liệu này được Google Antigravity (AGY) tự động nạp làm quy tắc bắt buộc cho mọi phiên làm việc trên mọi thiết bị.

---

## 1. Ngôn ngữ & Phong cách Giao tiếp
- **Ngôn ngữ bắt buộc**: Luôn phản hồi bằng **Tiếng Việt**, ngắn gọn, súc tích, định dạng chuẩn GitHub-style Markdown.
- **Liên kết mã nguồn**: Mọi file hoặc symbol (hàm, class, component) được nhắc đến trong phản hồi phải dùng link clickable chuẩn `[tên_file](file:///đường/dẫn/tuyệt/đối)`.
- **Bảo mật tuyệt đối**: **KHÔNG BAO GIỜ** in hoặc để lộ giá trị các biến môi trường nhạy cảm (`API_KEY`, `SECRET`, `MONGODB_URI`, `PASSWORD`, `TOKEN`) từ file `.env` ra màn hình chat hoặc log.

---

## 2. Định danh Dự án & Mô hình Nghiệp vụ (Domain Model)
- **Thương hiệu**: **Chella — A clone of "C"onfluence - tr"ELL"o - jir"A"**.
  - Tuyệt đối không dùng các từ khóa cũ như *"Anime"*, *"Otaku"*, *"Archon Realm"*, hay *"Verified SFW"* trên giao diện hiển thị.
- **Cấu trúc 2 Repositories**:
  - **Frontend (`chello-web`)**: React 18, Vite, Redux Toolkit, MUI v5, `@dnd-kit`, Canvas 2D Knowledge Graph (deploy trên Vercel: `https://chello-web.vercel.app`, nhánh `master`).
  - **Backend (`chello-api`)**: Node.js, Express, MongoDB Native Driver, Joi Validation, JWT (`httpOnly` cookies), Socket.IO (deploy trên Render: `https://chello-api.onrender.com/v1/status`, nhánh `main`).
- **Quy ước nghiệp vụ BA / Agile Sprint (`Board` = `Sprint`, `Card` = `Change Request / CR`)**:
  - **Sprint Metadata**: `Sprint`, `Start date`, `End date`, `Update till`, `By`, `Note`.
  - **CR / Ticket Metadata**: `Ticket ID` (`crCode`), `CR Description` (`title`), `Topic (Column)`, `Status` (`Processing`, `In testing`, `Blocking`, `Ready for deploy`, `Deployed`, `Done testing`), `Priority` (`Highest`, `High`, `Medium`, `Low`, `Lowest`), `Handle by` (`assignee`, hỗ trợ nhiều tên phân tách bằng dấu phẩy kể cả thành viên chưa đăng ký tài khoản), `Due date for dev` (`deadline`), `Dev Progress` (`0%` đến `100%` với bước nhảy `10%`), `Resource used` (`resourceUsed` points).
- **Đa ngôn ngữ (`VI / EN / JA / KO`) + Chế độ Song ngữ (Bilingual Mode)**:
  - Toàn bộ chuỗi văn bản tĩnh trên giao diện phải đi qua `useTranslation()` (`t`, `tPrimary`, `formatMessage`).
  - Giữ nguyên thuật ngữ kỹ thuật chuyên ngành (`Sprint`, `CR`, `FRD`, `Status`, `Handle by`, `UAT`, `Idempotency-Key`, v.v.).

---

## 3. Quy chuẩn Mã nguồn & Quy trình Kỹ thuật (ECC Pipeline)

$$\text{Research} \rightarrow \text{Plan} \rightarrow \text{Test (RED)} \rightarrow \text{Implement (GREEN)} \rightarrow \text{Review} \rightarrow \text{Verify}$$

- **Code Style bắt buộc (cả 2 repos)**:
  - Thụt lề **2 spaces**, dùng **single quotes (`'...'`)**, **KHÔNG dùng dấu chấm phẩy (`;`)**, không có trailing comma hoặc trailing spaces.
  - Ưu tiên tính bất biến (Immutability): tạo bản sao mới thay vì đột biến trực tiếp object/array.
- **Cổng Kiểm định trước khi Commit (Verification Gate)**:
  - **Frontend (`chello-web`)**:
    - `npx eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0` (0 warnings).
    - `npx vitest run` (100% unit tests pass).
    - `npx vite build` (build thành công).
  - **Backend (`chello-api`)**:
    - `npm run lint` (0 warnings).
    - `npm test` (100% tests pass).
- **Conventional Commits**: Đặt message theo chuẩn `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

---

## 4. Lộ trình & Kế hoạch đang thực hiện (`docs/plans/`)
Khi bắt đầu phiên làm việc trên thiết bị mới, hãy kiểm tra thư mục `docs/plans/` để nắm ngay trạng thái công việc đang thực hiện:
- `docs/plans/account-upgrade-roadmap.md` — Lộ trình nâng cấp toàn diện Tài khoản, Phân quyền (RBAC), Bảo mật (Sessions, 2FA, OAuth, CSRF) & Trang cá nhân.
- `docs/plans/mail-delivery-plan.md` — Kịch bản hệ thống gửi Email kép (Brevo Transactional API + Gmail qua Google Apps Script Bridge fallback) & xác thực tài khoản an toàn.
- `docs/plans/multi-device-sync-guide.md` — Hướng dẫn đồng bộ toàn diện cấu hình, biến môi trường (`.env` mã hóa) và phiên làm việc giữa nhiều máy tính.
