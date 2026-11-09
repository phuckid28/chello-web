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

## 4. Kiến trúc Hệ thống Hiện hành (v7 + v8 + v9 + v9.1 + v9.2 + v9.3, Graphify, Archify, Spec-Kit & Baoyu-Design — Cập nhật 2026-11-09)
- **Hệ thống Người dùng & Cộng tác Đa tầng (User System v7)**:
  - **Workspaces Đa tầng (3 cấp)**: `Organization` (depth 0) $\rightarrow$ `Space` (depth 1) $\rightarrow$ `Team/Sub-space` (depth 2) với cơ chế kế thừa quyền tự động (`inheritPermissions`).
  - **Bảo mật & Định danh**: Quản lý phiên đăng nhập đa thiết bị (`sessions`), Xác thực 2 lớp TOTP (`RFC 6238` + 10 mã dự phòng băm SHA-256 có salt `userId`), khóa tạm thời chống brute-force, đặt lại mật khẩu và đổi email an toàn, CSRF header `X-Requested-With: XMLHttpRequest`.
  - **Hồ sơ, Cộng tác & Giao diện Chủ đề**: Trang cá nhân `/u/:username`, `UserHoverCard`, trạng thái tùy chỉnh (`customStatus`), tải ảnh qua Google Drive Bridge, 7 tab Cài đặt (`/settings/*`), xuất dữ liệu JSON (GDPR), xóa tài khoản có thời gian ân hạn 14 ngày, `/inbox`, `/my-work`, `@mention`, `watchers`, `presence`, `activities`. Bộ chủ đề (`workspaceTheme`) và font hiển thị `"Be Vietnam Pro", "Plus Jakarta Sans", "Noto Sans JP", sans-serif` áp dụng đồng nhất toàn ứng dụng.
- **Trung tâm Giám sát Hệ thống, Chống DDoS L7, Bảo mật SOC/WAF & Ứng phó Khẩn cấp (Observability & Security Center v8)**:
  - **Telemetry & DDoS Radar (`telemetryEngine.js`, `TrafficOverviewTab.jsx`, `AccessDdosTab.jsx`)**: Ring-buffer 60 phút đo `bytesIn`/`bytesOut`, RPM/RPS, phân bổ HTTP status (`2xx`, `3xx`, `4xx`, `429`, `5xx`), độ trễ phân vị (`p50`, `p95`, `p99`), thuật toán **EWMA + Z-Score** phát hiện bất thường và 4 bộ quét L7 (*HTTP Flood*, *Credential Stuffing*, *Path Scanner*, *CSRF Guard*) kèm Auto-Ban tự động (`autoBanEnabled: true`).
  - **Tường lửa IP Động, Hạ tầng & Cầu dao Khẩn cấp (`systemControlModel.js`, `systemGuardMiddleware.js`, `SecurityWafTab.jsx`, `InfrastructureTab.jsx`, `EmergencyControlTab.jsx`)**: Chấm điểm Security Posture (0–100), quy tắc IP/CIDR Blocklist & Whitelist, luồng SIEM hợp nhất, đo lường USE Runtime (CPU, V8 Heap/RSS, Event Loop Delay, MongoDB latency), và Cầu dao Ngắt Khẩn cấp (`underAttackMode`, `maintenanceMode`, granular feature circuit breakers).
- **Quản trị Doanh nghiệp, IAM, API Logs, Cron Job, Ma trận Phân quyền & Proxy/Server (Enterprise Governance v9)**:
  - **Monitoring API Logs (`apiLogEngine.js`, `ApiLogsTab.jsx`)**: Live Request/Response Inspector kèm PII/Secret Scrubber, xuất lệnh `cURL`, bộ lọc đa chiều và tự động xóa log cũ theo ngưỡng FIFO (`maxDbLogs`, mặc định `2000`).
  - **Quản lý Cron Job (`cronManager.js`, `CronJobsTab.jsx`)**: Điều khiển 6 tác vụ nền (`purge_expired_accounts`, `cleanup_expired_sessions`, `prune_stale_waf_and_logs`, `server_and_proxy_healthcheck`, `password_expiry_and_security_audit`, `workspace_integrity_reconcile`) với bật/tắt, chỉnh chu kỳ phút, `Run Now`, lịch sử `cronJobRuns` và cầu dao tự ngắt sau 3 lần lỗi liên tiếp.
  - **Ma trận Phân quyền RBAC 3 Tầng (`rbacEngine.js`, `PermissionMatrixTab.jsx`)**: Quản lý trực quan 30 quyền nguyên tử trên Global Roles (`admin`, `ops_manager`, `security_auditor`, `client`), Workspace Roles (`owner`, `admin`, `member`, `viewer`) và Board Roles (`admin`, `editor`, `commenter`, `viewer`) kèm **Effective Permission Simulator & Shadow User View**.
  - **Force Thay đổi Mật khẩu — Phương án B (`ForcePasswordChangeDialog.jsx`)**: Thu hồi toàn bộ phiên đăng nhập (`revokeAllSessions`) ngay lập tức để đăng xuất trên mọi thiết bị VÀ đặt `mustChangePassword = true` bắt buộc đổi mật khẩu mới ở lần đăng nhập kế tiếp (kiểm tra chống trùng `passwordHistory`). Admin không bắt buộc bật 2FA (`enforceAdmin2fa: false`).
  - **Tạo / Nhập Tài khoản Hàng loạt & Quản lý Proxy/Server (`ProxyServerTab.jsx`)**: Tạo tài khoản trực tiếp, Bulk Import Wizard (`CSV`/`TSV`/`JSON` kèm Dry-Run & xuất phiếu CSV mật khẩu), cấu hình Inbound Trusted Reverse Proxy, Outbound Proxy Pool (mã hóa `AES-256-GCM`), danh bạ Server Nodes, xác minh chuỗi băm kiểm toán (`SHA-256 Hash Chain Verifier`) và `WAF Self-Test Simulator`.
- **Âm thanh Không gian Ngũ cung, Con trỏ Đa người dùng / AI & Sprint Swarm Replay (Swarm Experience v9.1 — Cập nhật 2026-11-04)**:
  - **Spatial Glass Piano & Key Tick (`swarmEngine.js`, `soundEffects.js`)**: Tổng hợp tiếng đàn Glass Piano 3 sóng hài (`sine` + `triangle` octave + `2.756x` glass bell partial) trên âm giai Ngũ cung Trưởng Mi (`E Major Pentatonic`: `E, F#, G#, B, C#`) kết hợp định vị âm thanh nổi `StereoPannerNode` (`[-0.8, 0.8]`) theo tọa độ ngang màn hình khi kéo-thả thẻ/cột và gõ phím cơ học (`playSpatialKeyTick`).
  - **Live Multiplayer Cursors & `🤖 Gemini AI` Co-Pilot Cursor (`presenceRoute.js`, `presenceService.js`, `presenceApi.js`, `FigmaCursorPointer.jsx`, `LiveBoardCursorsOverlay.jsx`, `CrAssistantPanel.jsx`)**: Đồng bộ tọa độ con trỏ thời gian thực (`cursor: { xPct, yPct, view, action }`) qua Socket.IO `BE_PRESENCE`, hiển thị con trỏ chuẩn Figma (`arrow`, `cross`, `dup`, `ibeam`) và con trỏ tác tử `🤖 Gemini AI` bay vào thao tác mỗi khi kích hoạt AI CR Assistant.
  - **Interactive Sprint Swarm Replay (`SprintSwarmReplayOverlay.jsx`, `BoardContent.jsx`, `ToolsMenu.jsx`)**: Tái hiện quá trình dựng Sprint theo thời gian thực (`Alt+Shift+S`) với thước đo Figma 20px, đường gióng Snap Guides đỏ (`#F24822`), đàn `6–14` con trỏ thành viên Sprint dựng cột, nhân bản thẻ `⌥-drag` (`⌥ +12px`), gõ tiêu đề CR và thanh điều khiển HUD (Pause/Resume, tốc độ `1×/2×/3×`, bật/tắt âm thanh, Replay).
- **Evidence Console, Authored Reachability (`Upstream` / `Downstream`), Semantic Passport & `1200×630` Share Card (Archify Experience v9.2 — Cập nhật 2026-11-05)**:
  - **Authored Reachability (`computeReachability` trong `graphModel.js`, `ReachabilityBar` trong `GraphOverlays.jsx`, phím tắt `U` / `D`)**: Truy vết luồng phụ thuộc có hướng `Upstream` (Repository Violet `#a78bfa`) và `Downstream` (Proof Green `#34d399`), làm mờ các nút không liên quan và hiển thị biên nhận số nút, số liên kết và số bước nhảy tối đa (`maxHops`).
  - **Semantic Passport & Verified Source Beacon (`SRC n` trong `graphRenderer.js`, `GraphInspector.jsx`, `Card.jsx`)**: Hiển thị viên thuốc dẫn chứng `SRC n` (`#34d399` trên nền `#0f172a`) ở góc phải nút đồ thị và trên thẻ CR Kanban, kèm thẻ **Semantic Passport** liệt kê danh sách tài liệu FRD, `[[WikiLink]]`, Backlinks và URL tham chiếu.
  - **Portable Share Card Exporter (`exportShareCard` trong `graphEngine.js`, `buildShareCardSpec` trong `graphModel.js`)**: Xuất ảnh thẻ `1200×630` PNG chuẩn "Evidence Console" cho chế độ `Upstream/Downstream Reach`, `Shortest Route` hoặc toàn cảnh đồ thị Sprint.
- **Đồ thị Tri thức Kiến trúc (`Graphify` v0.9.101), Sơ đồ Tương tác (`Archify` v3.2.0), Đặc tả SDD (`Spec-Kit` v1.3.1) & Bộ Công cụ Thiết kế (`Baoyu-Design`)**:
  - **Graphify (`~/.gemini/config/skills/graphify/SKILL.md`)**: Thư mục `graphify-out/` trong mỗi repo chứa `GRAPH_REPORT.md` và `graph.json` để tra cứu God Nodes và cấu trúc toàn cục.
  - **Archify (`~/.gemini/config/skills/archify/SKILL.md`)**: Global Skill tạo sơ đồ tương tác độc lập (`architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`, `erd`, `class`, `tree`, `timeline`, `waterfall`) và trang giải thích `explainer` một trang `.html` (bản đồ mẫu: `docs/architecture/chella-system-architecture.html`).
  - **Spec-Kit SDD & Convergence Gate (`specKitAudit.js`, `SpecKitConvergencePanel.jsx`, `Card.jsx`, `GraphInspector.jsx`, Global Skill `spec-kit`, CLI `specify`)**: Kiểm toán độ hội tụ Đặc tả – Triển khai theo chuẩn GitHub Spec-Kit v1.3.1 (`converged | partial | needs-clarification | contradicts`), phát hiện điểm mơ hồ `[NEEDS CLARIFICATION: ...]`, đối chiếu yêu cầu `FR-###` / `SC-###` / kịch bản `Given-When-Then` với Subtasks thực thi, hiển thị huy hiệu `SPEC ✓` / `CLARIFY n` / `GAP n` trên thẻ Kanban & Knowledge Graph Inspector, và tự động sinh các nhiệm vụ hội tụ (`[Converge]`) theo cơ chế chỉ-thêm (`append-only`).
  - **Baoyu-Design OKLab/CVD Dataviz & Traceable KPI Sources (`datavizPalette.js`, `DataLineageDrawer.jsx`, `BoardAnalyticsView.jsx`, `designs/chella-design-system/`)**: Kiểm định bảng màu biểu đồ bằng khoảng cách cảm nhận `OKLab ΔE` (trên cả 3 mô phỏng mù màu Deuteranopia, Protanopia, Tritanopia) & tương phản `WCAG 2.1`, tích hợp ngăn kéo truy xuất nguồn gốc chỉ số **Data Sources & Lineage** (`data-source`, `data-field`, `data-where`) kèm tải xuống JSON/CSV trong `BoardAnalyticsView`, và đóng gói **Chella Enterprise Design System** (`designs/chella-design-system/project/design-system.json`, `tokens.json`) đạt chuẩn `claude-design-system` (`0 problems`).
  - **Hệ sinh thái 10 Global Skills & 9 Plugins (`~/.gemini/config/`)**:
    - **10 Global Skills (`~/.gemini/config/skills/`)**: `graphify`, `archify`, `spec-kit`, `dataviz`, `claude-design`, `claude-design-system`, `claude-dashboard`, `claude-slides`, `claude-motion`, `motion-director`.
    - **9 Plugins (`~/.gemini/config/plugins/`)**: `ecc-core`, `ui-ux-skills` (`impeccable`, `design-taste-frontend`), `modern-web-guidance-plugin`, `gemini-api` (`v2.4.0`: `gemini-api-dev`, `gemini-live-api-dev`, `gemini-omni-flash-api`), `gdrive` (`v0.0.11`), `firebase` (`v1.0.3`), `flutter` (`v1.0.7`), `science` (`v1.4.0`), `google-antigravity-sdk` (`v0.0.9`).

---

## 5. Lộ trình & Kế hoạch trong `docs/plans/`
Khi bắt đầu phiên làm việc trên thiết bị mới, hãy kiểm tra thư mục `docs/plans/` để nắm ngay trạng thái công việc:
- `docs/plans/enterprise-governance-iam-ops-plan.md` — Kế hoạch kiến trúc Quản trị Chuyên sâu: API Logs Inspector (FIFO), Cron Job Control Plane, Ma trận Phân quyền RBAC 3 tầng, Force Đổi Mật khẩu (Phương án B), Tạo/Nhập Tài khoản & Proxy/Server (v9 — **Đã hoàn thành & triển khai 2026-11-03**).
- `docs/plans/system-observability-and-security-plan.md` — Kế hoạch kiến trúc Trung tâm Giám sát Hệ thống, Chống DDoS L7, Bảo mật SOC/WAF, Hạ tầng & Ứng phó Khẩn cấp (v8 — **Đã hoàn thành & triển khai 2026-11-03**).
- `docs/plans/user-system-master-plan.md` — Kế hoạch kiến trúc tổng thể Hệ thống Người dùng, Workspace 3 tầng, RBAC, 2FA, Trang cá nhân & Cộng tác (v7 — **Đã hoàn thành & triển khai 2026-11-02**).
- `docs/plans/user-system-api-contract.md` — Hợp đồng API chi tiết (Sections 0–9) đồng bộ giữa `chello-api` và `chello-web`.
- `docs/plans/account-upgrade-roadmap.md` — Lộ trình nâng cấp Tài khoản & Bảo mật ban đầu.
- `docs/plans/mail-delivery-plan.md` — Kịch bản hệ thống gửi Email kép (Brevo Transactional API + Gmail qua Google Apps Script Bridge fallback).
- `docs/plans/multi-device-sync-guide.md` — Hướng dẫn đồng bộ toàn diện cấu hình, biến môi trường (`.env`) và phiên làm việc giữa nhiều máy tính.
