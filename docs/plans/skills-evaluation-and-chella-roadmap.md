# Báo Cáo Đánh Giá 12 Repositories / Skills & Chỉ Dẫn Triển Khai Cho Dự Án Chella

> **Mục đích tài liệu**: Đồng bộ toàn bộ kết quả phân tích 12 bộ Skills/Repositories trên GitHub, danh sách **16 skills đã đóng gói** vào `antiantigravity-synchronization` (`ponytail` + `pro-workflows`), và **bộ chỉ dẫn thực thi chi tiết (Actionable Roadmap)** để Google Antigravity trên máy công ty / máy cá nhân tiếp tục triển khai cho dự án **Chella** ở các phiên làm việc tiếp theo.

---

## Phần 1: Tổng Hợp Phân Tích 12 Repositories & Trạng Thái Cài Đặt

| # | Repository | Stars | Bản chất thực tế (qua kiểm tra mã nguồn) | Độ hợp với **Chella** | Độ hợp **Dự án khác** | Trạng thái trong `antiantigravity-synchronization` |
| :-: | :--- | :---: | :--- | :---: | :---: | :--- |
| **1** | `google-labs-code/design.md` | 28.8k | Chuẩn đặc tả `DESIGN.md` của Google Labs cho AI Agent | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Đã cài Global Skill `design-md`** (`~/.gemini/config/skills/design-md`) kèm `spec.md`, `examples/` & `subskills/` |
| **2** | `imskyleen/animate-ui` | 4.9k | Thư viện React component động (Tailwind + Motion + Shadcn) + 1 skill | ⭐⭐ *(Khác stack)* | ⭐⭐⭐⭐⭐ *(Dự án Tailwind)* | **Đã cài Global Skill `animate-ui`** (`~/.gemini/config/skills/animate-ui`) chỉ định rõ cho dự án Tailwind/Shadcn |
| **3** | `nextlevelbuilder/ui-ux-pro-max-skill` | 147k | Skill + CLI Python tra cứu 80 UI styles, 192 bảng màu, 74 font | ⭐⭐ *(Xung đột)* | ⭐⭐⭐⭐ | **Không bật cùng lúc với `ui-ux-skills`** để tránh phá vỡ 7 theme của Chella |
| **4** | `ByteByteGoHq/system-design-101` | 91k | Kho bài viết & sơ đồ kiến trúc hệ thống | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Đã đóng gói Global Skill `system-design-101`** (`~/.gemini/config/skills/system-design-101`) + tích hợp kịch bản mẫu (Xem Phần 3) |
| **5** | `tailucanh/offload-mcp-server` | 17 | MCP Server giúp Claude Code gọi nhờ CLI Antigravity đọc file | ⭐ *(Dư thừa)* | ⭐ | **Bỏ qua** — Antigravity đã có sẵn công cụ gốc `invoke_subagent(TypeName: 'research')` |
| **6** | `coreyhaines31/marketingskills` | 59.4k | 53 skills về Copywriting, CRO, Onboarding, Pricing, Launch | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Đã cài 4 skills chính** (`copywriting`, `onboarding`, `cro`, `product-marketing` + 11 sub-skills SaaS trong `subskills/`) vào `pro-workflows` |
| **7** | `AgriciDaniel/claude-seo` | 27.6k | 26 skills + 19 agents kiểm toán SEO, Schema, GEO, `llms.txt` | ⭐⭐ *(SPA sau login)* | ⭐⭐⭐⭐⭐ *(Web public)* | **Đã cài Global Skill router `seo`** (`~/.gemini/config/skills/seo` kèm trọn bộ 25 `seo-*` sub-skills trong `subskills/` & 19 `agents/`, chỉ tốn 1 slot skill) |
| **8** | `ant-design/ant-design` | 100k | Thư viện UI Ant Design (`.agents/skills` là skill nội bộ cho maintainer) | ⭐ *(Xung đột MUI)* | ⭐⭐⭐⭐ *(App ERP mới)* | **Không cài vào Chella** (tránh trộn `antd` với `@mui/material`) |
| **9** | `obra/superpowers` | 315k | 15 skills quy trình TDD, Debugging, Planning, Subagents | ⭐⭐⭐ *(Trùng 75%)* | ⭐⭐⭐⭐ | **Đã cherry-pick 2 skills** (`systematic-debugging`, `brainstorming`) vào plugin `pro-workflows` |
| **10** | `remotion-dev/remotion` | 71.9k | Framework tạo video MP4 bằng React + skill `remotion-best-practices` | ⭐⭐⭐ *(Tách module)* | ⭐⭐⭐⭐⭐ | **Đã cài `remotion-best-practices`** (kèm 11 sub-modules nội bộ) vào plugin `pro-workflows` |
| **11** | `muratcankoylan/Agent-Skills-for-Context-Engineering` | 18.3k | 18 skills về Context Engineering, Multi-Agent, Tool Design | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Đã cài 5 skills chính** (`context-optimization`, `context-compression`, `tool-design`, `multi-agent-patterns`, `evaluation` + 8 sub-skills trong `subskills/`) vào `pro-workflows` |
| **12** | `DietrichGebert/ponytail` | 187k | 6 skills triết lý *"Senior Dev tối giản"*: gọt code thừa, audit nợ kỹ thuật | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Đã cài trọn bộ 6 skills** vào plugin `ponytail` |

---

## Phần 2: Danh Sách 2 Plugins Mới Đã Đồng Bộ Vào `~/.gemini/config/plugins/`

Khi chạy `scripts/sync-pull.ps1` trên bất kỳ máy tính nào, hệ thống tự động cài đặt và kích hoạt thêm 2 plugins mới bên cạnh `ecc-core` và `ui-ux-skills`:

### 1. Plugin `ponytail` (`~/.gemini/config/plugins/ponytail`)
Triết lý: *"The best code is the code you never wrote"* — Chuyên dùng ở bước `REFACTOR` sau khi tính năng đã chạy xanh tests:
- `ponytail`: Chế độ code tối giản, ưu tiên giải pháp ngắn gọn, dễ đọc, không tạo wrapper/abstraction thừa.
- `ponytail-audit`: Quét các file mới sửa để phát hiện over-engineering, dead code và các lớp trung gian không cần thiết.
- `ponytail-debt`: Định lượng nợ kỹ thuật (technical debt), chỉ ra các file vượt ngưỡng 400–800 dòng hoặc hàm quá dài.
- `ponytail-review`: Review `git diff` theo góc nhìn Senior Dev thực dụng.
- `ponytail-gain`: Báo cáo số dòng code và độ phức tạp đã cắt giảm được.
- `ponytail-help`: Hướng dẫn sử dụng bộ lệnh Ponytail.

### 2. Plugin `pro-workflows` (`~/.gemini/config/plugins/pro-workflows`)
Tập hợp 10 skills tinh hoa được chọn lọc kỹ để không trùng lặp với `ecc-core` và không gây phình ngữ cảnh (Context Bloat):
- **Gỡ lỗi & Khám phá yêu cầu (từ `obra/superpowers`):**
  - `systematic-debugging`: Quy trình 4 pha truy vết nguyên nhân gốc rễ (`root-cause-tracing.md`, `defense-in-depth.md`, `condition-based-waiting.md`) trước khi sửa bug.
  - `brainstorming`: Khai thác góc khuất nghiệp vụ và edge cases trước khi lập kế hoạch.
- **Kỹ thuật Ngữ cảnh & Kiến trúc AI Agent (từ `Agent-Skills-for-Context-Engineering`):**
  - `context-optimization`: Tối ưu hóa prompt, KV-cache và phân bổ ngân sách token.
  - `context-compression`: Chiến lược nén lịch sử hội thoại và tóm tắt ngữ cảnh dài.
  - `tool-design`: Chuẩn thiết kế schema cho Function Calling / API / MCP Tools.
  - `multi-agent-patterns`: Các mẫu điều phối Subagents (Supervisor, Swarm, Handoffs).
- **Sản phẩm, UX Copywriting & Chuyển đổi (từ `coreyhaines31/marketingskills`):**
  - `copywriting`: Chuẩn hóa câu chữ giao diện (UX microcopy, CTA, thông báo lỗi, chống giọng văn AI sáo rỗng `ai-tells.md`).
  - `onboarding`: Thiết kế luồng đón người dùng mới theo mô hình *Minimum Path to Value* (`minimum-path-to-value.md`, `activation-models.md`).
  - `cro`: Tối ưu hóa tỷ lệ chuyển đổi cho trang giới thiệu sản phẩm và biểu mẫu đăng ký (`form.md`, `experiments.md`).
- **Lập trình Video bằng React (từ `remotion-dev/remotion`):**
  - `remotion-best-practices`: Router skill (đã nhúng sẵn 11 thư mục con `remotion-create`, `remotion-markup`, `remotion-render`, `remotion-studio`, `remotion-saas`, `remotion-captions`, `remotion-multimedia`, `remotion-interactivity`, `remotion-docs`, `remotion-license`, `remotion-upgrade`) để dựng video MP4/WebM bằng React.

---

## Phần 3: Chỉ Dẫn Cho Antigravity — 5 Hạng Mục Ứng Dụng Vào Dự Án Chella

> **Hướng dẫn dành cho AI Agent ở phiên làm việc tiếp theo**: Khi người dùng yêu cầu triển khai các cải tiến từ tài liệu này cho **Chella**, hãy thực hiện tuần tự theo quy trình **ECC Pipeline (`Research -> Plan -> Test (RED) -> Implement (GREEN) -> Review -> Verify`)** đối với 5 hạng mục dưới đây:

### Hạng mục 1: Kiểm toán Nợ kỹ thuật & Gọt gọn Code sau đợt nâng cấp v7 (Dùng skill `ponytail-debt` & `ponytail-audit`)
- **Mục tiêu**: Sau khi hợp nhất nhánh User System v7 (+8,000 dòng ở Backend và hàng chục trang mới ở Frontend), một số file đã vượt ngưỡng 400–800 dòng theo quy chuẩn `ecc-core`.
- **Các file mục tiêu cần rà soát và tách nhỏ (không làm thay đổi API contract)**:
  - **Frontend (`chello-web`)**:
    - `src/pages/CrStudio/CrStudio.jsx` (~915 dòng) -> Tách dữ liệu mô phỏng (`buildSimulationModel`) và các sub-panels sang thư mục `src/pages/CrStudio/parts/`.
    - `src/pages/Boards/AwwwardsWorkspaceHero.jsx` (~488 dòng) & `src/pages/Admin/AdminConsole.jsx` (~445 dòng) -> Tách các sub-components và helper thuần.
    - `src/components/Modal/ActiveCard/GoogleDriveFrdControls.jsx` (~424 dòng) & `ActiveCard.jsx` -> Rút gọn logic xử lý file và dùng chung helper.
  - **Backend (`chello-api`)**:
    - `src/services/workspaceService.js` (~570 dòng) -> Tách các hàm kiểm tra cây phân cấp và invite links sang helper/sub-service rõ ràng.
- **Tiêu chí nghiệm thu**: Giữ nguyên 100% hành vi, `npm run lint` = 0 warnings, `npx vitest run` pass 100%, báo cáo số dòng cắt giảm qua `ponytail-gain`.

### Hạng mục 2: Nâng cấp CR Studio Simulator & Knowledge Hub Templates từ `ByteByteGo/system-design-101`
- **Mục tiêu**: Biến `CrStudio.jsx` từ 1 kịch bản cố định (*Usage Limit Monthly Sync*) thành bộ **System Design Simulation Studio** đa kịch bản chuẩn kiến trúc sư hệ thống (Solution Architect / Principal BA).
- **Chi tiết triển khai**:
  1. Tạo file `src/pages/CrStudio/simulationPresets.js` trong `chello-web` chứa **5 kịch bản kiến trúc chuẩn ByteByteGo** (tự động nhận diện theo từ khóa CR hoặc cho phép BA chọn trực tiếp trên UI):
     - **Preset 1 — `usage-limit-lock`**: *Distributed Lock & Quota Sync* (Client -> API Gateway -> Redis `SETNX` Lock -> Business Rule -> Core DB & Audit Log).
     - **Preset 2 — `idempotent-payment`**: *Idempotent Payment & Ledger Double-Entry* (Client `Idempotency-Key` -> Payment Gateway -> Ledger Lock -> Outbox Pattern -> Webhook Notification).
     - **Preset 3 — `ekyc-circuit-breaker`**: *Real-time eKYC & Credit Scoring with Circuit Breaker* (App Upload -> OCR/FaceMatch Service -> Circuit Breaker / Fallback Queue -> Risk Scoring Engine -> Limit Approval).
     - **Preset 4 — `auto-debit-dlq`**: *Scheduled Auto-Debit T+0 & Dead-Letter Queue (DLQ) Retry* (Cron Trigger -> Batch Partitioner -> Core Banking Debit -> Exponential Backoff Retry -> Multi-channel ZNS/SMS Fallback).
     - **Preset 5 — `rate-limited-api`**: *Token Bucket Rate Limiter & Cache-Aside* (Client Request -> Edge Rate Limiter -> Redis Cache-Aside -> Read Replica DB -> Response).
  2. Mở rộng `src/pages/KnowledgeHub/wikiTemplates.js` bổ sung 2 mẫu tài liệu mới:
     - **System Architecture & Sequence Spec (ByteByteGo Style)**: Có sẵn sơ đồ Mermaid `flowchart` + `sequenceDiagram`, bảng SLA/Latency, chiến lược Caching/Locking và Failure Modes.
     - **API Contract & Idempotency Matrix**: Chuẩn hóa bảng HTTP Status (`200`, `400`, `409 Conflict`, `422`, `429 Too Many Requests`, `503 Service Unavailable`).
  3. Bổ sung đầy đủ khóa dịch 4 ngôn ngữ (`VI / EN / JA / KO`) và unit tests cho `simulationPresets.js`.

### Hạng mục 3: Tối ưu hóa Gemini AI CR Assistant (Dùng skill `context-optimization` & `tool-design`)
- **Mục tiêu**: Nâng cấp `src/services/integrationService.js` (`chello-api`) và `src/components/Modal/ActiveCard/CrAssistantPanel.jsx` (`chello-web`) theo chuẩn Context Engineering.
- **Chi tiết triển khai**:
  1. **Nén ngữ cảnh Board (`buildBoardContextSummary`)**: Thay vì chỉ cắt 12 thẻ đầu tiên dạng chuỗi thô, cấu trúc hóa thành bảng tóm tắt siêu gọn theo `crCode | Topic | Status | LinkedCRs` để gửi được toàn bộ các CR có liên quan trong Sprint mà tốn ít hơn 40% token.
  2. **Chuẩn hóa Prompt & Schema đầu ra (`assistCr`)**:
     - Bổ sung chế độ thứ 4: **`architecture_review`** (Phân tích rủi ro kiến trúc: Race condition, Idempotency, Timeout, Rollback cho CR hiện tại).
     - Áp dụng kỹ thuật phân tách `systemInstruction` cố định và `prompt` có cấu trúc rõ ràng để tận dụng prefix caching và tránh suy giảm ngữ cảnh.

### Hạng mục 4: Chuẩn hóa Luồng Onboarding, Trang Giới Thiệu & UX Copywriting (Dùng skill `onboarding`, `copywriting`, `cro`)
- **Mục tiêu**: Áp dụng mô hình *Minimum Path to Value* từ `onboarding` và nguyên tắc chống văn phong AI sáo rỗng (`ai-tells.md`) từ `copywriting` vào `chello-web`.
- **Chi tiết triển khai**:
  1. Rà soát và tinh chỉnh `src/pages/Onboarding/OnboardingPage.jsx`: giúp người dùng mới tạo ngay được **Sprint Board đầu tiên có sẵn dữ liệu mẫu (1-Click Template)** chỉ trong dưới 30 giây.
  2. Rà soát câu chữ đa ngôn ngữ (`VI / EN / JA / KO`) tại `src/pages/Auth/AuthShowcase.jsx`, `LoginForm.jsx`, `RegisterForm.jsx` và các trạng thái trống (Empty States) tại `/boards`, `/inbox`, `/my-work`.

### Hạng mục 5 (Mở rộng): Tính năng "Sprint Recap Video / Presentation" (Dùng skill `remotion-best-practices`)
- **Mục tiêu**: Cho phép BA / Scrum Master trình chiếu hoặc xuất đoạn tổng kết Sprint (Sprint Wrapped) cuối kỳ với hiệu ứng chuyển cảnh mượt mà tổng hợp: Tỷ lệ hoàn thành CR, tổng Resource Points, các CR nổi bật và đóng góp của đội ngũ.
