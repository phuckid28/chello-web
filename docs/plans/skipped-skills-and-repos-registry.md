# Sổ Đăng Ký Các Repositories & Skills Đã Bỏ Qua / Trì Hoãn (`skipped-skills-and-repos-registry.md`)

> [!IMPORTANT]
> **QUY TẮC BẮT BUỘC DÀNH CHO AI AGENT TRÊN MỌI THIẾT BỊ (MULTI-DEVICE MANDATORY RULE)**:
> 1. Mỗi khi người dùng gửi bất kỳ **Repository, Plugin, Skill, hoặc MCP Server** nào để phân tích/cài đặt mà có thành phần **không được cài đặt (bỏ qua toàn bộ)** hoặc **chỉ cài chọn lọc (cherry-pick một phần)**, AI Agent **BẮT BUỘC** phải cập nhật vào tài liệu này trước khi kết thúc tác vụ.
> 2. Mọi mục ghi vào sổ đăng ký phải có đủ 4 thông tin: **(a) Tên & URL Repository/Skill**, **(b) Ngày đánh giá**, **(c) Lý do kỹ thuật chưa cài đặt**, và **(d) Khi nào nên tận dụng lại + Cách kích hoạt nhanh**.
> 3. Sau khi cập nhật file này tại `chello-web/docs/plans/skipped-skills-and-repos-registry.md` và `chello-api/docs/plans/skipped-skills-and-repos-registry.md`, phải chạy `antiantigravity-synchronization/scripts/sync-push.ps1` để đồng bộ sang các máy tính khác.

---

## Phần 1: Các Repositories Đã Bỏ Qua Hoàn Toàn (Chưa Cài Đặt)

| # | Repository & URL | Ngày đánh giá | Bản chất kỹ thuật | Lý do không cài đặt ở thời điểm hiện tại | Khi nào nên tận dụng lại & Cách kích hoạt |
| :-: | :--- | :---: | :--- | :--- | :--- |
| **1** | **[`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** *(147k⭐)* | `2026-11-10` | Skill + Python CLI (`search.py`) tra cứu dữ liệu tĩnh từ CSV/JSON: 80 UI styles, 192 bảng màu, 74 cặp font, 120 UX guidelines. | **Xung đột trực tiếp với `ui-ux-skills` (`impeccable` v4.8 + `design-taste-frontend` v2.1) và `DESIGN.md`**: Hệ thống hiện tại dùng quy tắc *anti-slop* nghiêm ngặt, kiểm tra DOM thật và 7 Theme Archetypes của Chella. Nếu bật thêm `ui-ux-pro-max-skill`, AI sẽ nhận 2 luồng chỉ dẫn thiết kế trái ngược nhau và làm phình Context Budget. | **Khi nào dùng**: Khi làm một dự án Landing Page / App hoàn toàn mới từ con số 0 mà chưa có định hướng màu sắc hay font chữ.<br>**Cách lấy lại**: `git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git` và chép `.claude/skills/ui-ux-pro-max` vào `.agents/skills/` cục bộ của dự án đó. |
| **2** | **[`ant-design/ant-design`](https://github.com/ant-design/ant-design)** *(100k⭐)* | `2026-11-10` | Thư viện UI React Ant Design (`antd`). Thư mục `.agents/skills/` trong repo gồm 6 skills: `changelog-collect`, `commit-msg`, `create-pr`, `issue-reply`, `test-review`, `version-release`. | **Khác UI Stack & sai đối tượng**:<br>1. `chello-web` sử dụng **MUI v5 (`@mui/material` + `@emotion/react`)**; trộn thêm `antd` sẽ gây xung đột CSS reset và tăng gấp đôi bundle size.<br>2. 6 skills trong `.agents/skills/` của repo là quy trình nội bộ dành cho maintainer phát hành thư viện `antd`, không phải skill hướng dẫn lập trình giao diện Ant Design. | **Khi nào dùng**: Khi xây dựng một dự án Enterprise ERP / Backoffice / CMS mới chọn **Ant Design v5 + ProComponents** làm UI framework chính, hoặc khi đóng góp PR mã nguồn mở cho repo `ant-design`. |
| **3** | **[`tailucanh/offload-mcp-server`](https://github.com/tailucanh/offload-mcp-server)** *(17⭐)* | `2026-11-10` | MCP Server viết bằng TypeScript giúp Claude Code CLI gọi dòng lệnh `agy` (Antigravity CLI) để đọc và tóm tắt file hộ. | **Dư thừa & gây vòng lặp trên Antigravity**: Bạn đang làm việc trực tiếp trên chính **Google Antigravity (AGY)**. AGY đã có sẵn công cụ gốc `invoke_subagent(TypeName: 'research' \| 'self')` chạy trong sandbox ngữ cảnh riêng. Cài MCP này vào AGY sẽ tạo vòng lặp `AGY -> MCP -> gọi lại AGY CLI`. | **Khi nào dùng**: Chỉ khi bạn dùng một trình soạn thảo/CLI bên thứ ba (như Claude Code CLI độc lập hoặc Cursor) và muốn mượn quota đọc file của Antigravity CLI. |

---

## Phần 2: Các Skills Con Đã Bỏ Qua Trong Các Repositories Cài Chọn Lọc (Cherry-Picked)

Để bảo vệ **Context Window Budget** của Antigravity (tránh việc nạp hàng trăm mô tả skill gây tràn hạn mức và làm ẩn các skill quan trọng), các repositories lớn dưới đây đã được **chọn lọc tinh hoa (cherry-pick)**. Toàn bộ các skills con chưa cài được thống kê đầy đủ tại đây để tra cứu và kích hoạt bất cứ lúc nào:

---

### 2.1. Từ [`obra/superpowers`](https://github.com/obra/superpowers) *(315k⭐ — Đã cài 2/15 skills, Bỏ qua 13/15 skills)*
- **Đã cài vào plugin `pro-workflows`**: `systematic-debugging`, `brainstorming`.
- **13 Skills đã bỏ qua (và lý do)**:

| Nhóm | Danh sách Skills đã bỏ qua | Lý do chưa cài đặt | Khi nào nên tận dụng lại |
| :--- | :--- | :--- | :--- |
| **TDD & Verification** | `test-driven-development`, `verification-before-completion` | Trùng lặp 100% với `tdd-workflow` và `verification-loop` trong plugin cốt lõi `ecc-core` (`AGENTS.md`). | Không cần cài thêm trừ khi tắt `ecc-core`. |
| **Planning & Execution** | `writing-plans`, `executing-plans` | Trùng lặp với subagent `ecc-planner` và lệnh `/plan` gốc của Antigravity. | Tham khảo cấu trúc chia nhỏ task của `writing-plans` khi muốn viết prompt cho subagent nhỏ. |
| **Subagent & Code Review** | `subagent-driven-development`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review` | Trùng với cơ chế `invoke_subagent` native của Antigravity, quy tắc Pre-Report Gate (>80% confidence) của `ecc-code-reviewer`, và skill `multi-agent-patterns`. | Khi muốn áp dụng mẫu prompt phản biện code review hai chiều (`receiving-code-review`). |
| **Git Worktrees & Branching** | `using-git-worktrees`, `finishing-a-development-branch` | Quy trình làm việc hiện tại của bạn ưu tiên commit/push trực tiếp trên nhánh chính (`master`/`main`) và đồng bộ 2 máy qua `sync-push.ps1` thay vì tạo nhiều thư mục worktree rời rạc. | **Rất hữu ích khi**: Cần cho 3–4 subagents sửa cùng một repo song song trên các nhánh `git worktree` cô lập (`Workspace: 'share' \| 'branch'`). |
| **Meta Skills** | `writing-skills`, `using-superpowers` | Đã có skill gốc `agy-customizations` và `workflow-skill-creator` của Antigravity. | Khi muốn viết bộ kiểm thử áp lực (pressure testing) cho một skill mới. |

---

### 2.2. Từ [`coreyhaines31/marketingskills`](https://github.com/coreyhaines31/marketingskills) *(59.4k⭐ — Đã cài 15/53 skills, Bỏ qua 38/53 skills)*
- **Đã cài vào plugin `pro-workflows`**:
  - 4 Top-level skills: `copywriting`, `onboarding`, `cro`, `product-marketing`.
  - 11 Sub-skills trong `product-marketing/subskills/`: `launch`, `pricing`, `competitors`, `competitor-profiling`, `ab-testing`, `analytics`, `churn-prevention`, `signup`, `paywalls`, `copy-editing`, `marketing-psychology`.
- **38 Skills đã bỏ qua (và lý do)**:

| Phân nhóm (38 skills) | Danh sách cụ thể từng Skill đã bỏ qua | Lý do chưa cài đặt | Khi nào nên tận dụng lại |
| :--- | :--- | :--- | :--- |
| **1. SEO & Web Discovery** *(8 skills)* | `ai-seo`, `programmatic-seo`, `schema`, `seo-audit`, `site-architecture`, `link-building`, `directory-submissions`, `aso` | 7/8 skills mảng Web SEO đã được bao phủ sâu và đầy đủ hơn bởi Global Skill **`seo` (`claude-seo` v2.5.0)** (25 sub-skills + 19 agents). Riêng `aso` dành cho App Store (iOS/Google Play). | Lấy **`aso`** khi phát hành ứng dụng Flutter/Mobile lên Apple App Store hoặc Google Play; lấy **`directory-submissions`** khi muốn đăng sản phẩm SaaS lên các danh bạ (Product Hunt, AlternativeTo, G2). |
| **2. Paid Ads & Outbound Sales** *(7 skills)* | `ads`, `ad-creative`, `cold-email`, `prospecting`, `sales-enablement`, `revops`, `reverse-engineer-marketing` | Thuộc mảng vận hành quảng cáo trả phí (Google/Meta/LinkedIn Ads) và bán hàng B2B Outbound (SDR/CRM), không phục vụ trực tiếp cho quá trình phát triển phần mềm hằng ngày. | Khi bắt đầu chạy chiến dịch quảng cáo trả phí, viết kịch bản Cold Email B2B, hoặc xây dựng tài liệu Sales Deck / RevOps pipeline. |
| **3. Social, PR, Events & Community** *(8 skills)* | `social`, `influencer-marketing`, `community-marketing`, `public-relations`, `events`, `co-marketing`, `marketing-council`, `marketing-ideas` | Thuộc mảng truyền thông mạng xã hội, tổ chức sự kiện/webinar và quan hệ công chúng. Nạp thường trực sẽ gây nhiễu bộ định tuyến skill kỹ thuật. | Khi cần lên lịch bài đăng LinkedIn/X, tổ chức hội thảo ra mắt sản phẩm, hoặc cần 140 ý tưởng tăng trưởng (`marketing-ideas`). |
| **4. Lifecycle, Email, SMS & Lead Gen** *(8 skills)* | `emails`, `sms`, `referrals`, `marketing-loops`, `offers`, `lead-magnets`, `free-tools`, `popups` | Chuyên về chuỗi email nuôi dưỡng khách hàng (drip campaigns), tin nhắn SMS, chương trình giới thiệu (referral viral loops) và công cụ miễn phí thu phễu (engineering-as-marketing). | **Rất đáng dùng khi**: Thiết kế chuỗi email tự động cho người dùng mới (`emails`), xây dựng chương trình mời bạn bè nhận thưởng (`referrals`), hoặc tạo mini-tool miễn phí thu hút traffic (`free-tools`). |
| **5. Content, Media & Attribution** *(7 skills)* | `content-strategy`, `marketing-plan`, `customer-research`, `attribution`, `conversion-tracking`, `image`, `video` | Chuyên về lập kế hoạch nội dung dài hạn, phỏng vấn khách hàng (JTBD), gắn mã theo dõi chuyển đổi quảng cáo (GTM/Pixel) và kịch bản video quảng cáo. | Khi cần cài đặt Google Tag Manager / Meta Pixel (`conversion-tracking`), phân tích dữ liệu khảo sát người dùng (`customer-research`), hoặc lập kế hoạch nội dung quý (`content-strategy`). |

> **Cách lấy nhanh bất kỳ skill nào trong 38 skills trên**:
> ```powershell
> git clone --depth 1 --filter=blob:none --sparse https://github.com/coreyhaines31/marketingskills.git $env:TEMP\mkt
> git -C $env:TEMP\mkt sparse-checkout set skills/<ten-skill>
> Copy-Item "$env:TEMP\mkt\skills\<ten-skill>" "$HOME\.gemini\config\plugins\pro-workflows\skills\product-marketing\subskills\<ten-skill>" -Recurse -Force
> ```

---

### 2.3. Từ [`muratcankoylan/Agent-Skills-for-Context-Engineering`](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) *(18.3k⭐ — Đã cài 13/18 skills, Bỏ qua 5/18 skills)*
- **Đã cài vào plugin `pro-workflows`**:
  - 5 Top-level skills: `context-optimization`, `context-compression`, `tool-design`, `multi-agent-patterns`, `evaluation`.
  - 8 Sub-skills trong `evaluation/subskills/`: `advanced-evaluation`, `context-degradation`, `context-fundamentals`, `memory-systems`, `harness-engineering`, `filesystem-context`, `long-horizon-prompting`, `self-improvement-loops`.
- **5 Skills đã bỏ qua (và lý do)**:

| # | Tên Skill đã bỏ qua | Bản chất | Lý do chưa cài đặt | Khi nào nên tận dụng lại |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `bdi-mental-states` | Mô hình nhận thức *Belief-Desire-Intention (BDI)* cho hệ thống tác tử tự trị. | Mang tính lý thuyết học thuật (Cognitive AI / Game NPCs), ít dùng trong ứng dụng Web/Enterprise SaaS thực tế. | Khi thiết kế hệ thống mô phỏng đa tác tử có trạng thái tâm lý/ý định phức tạp hoặc nghiên cứu học thuật. |
| 2 | `latent-briefing` | Nén ngữ cảnh giữa các agent bằng biểu diễn tiềm ẩn / tóm tắt siêu cô đọng. | Đã có `context-compression` và `multi-agent-patterns` giải quyết bài toán handoff tường minh dễ debug hơn. | Khi xây dựng mạng lưới nhiều subagents trao đổi tần suất cực cao cần giảm tối đa độ trễ token. |
| 3 | `hosted-agents` | Kiến trúc vận hành Agent chạy nền trên hạ tầng Cloud VM / Container Sandbox. | Chỉ cần thiết khi tự xây dựng nền tảng hạ tầng Cloud Agent riêng (như Devin/OpenHands tự host). | Khi bạn xây dựng dịch vụ Backend cho phép người dùng cuối khởi chạy các AI Agent chạy ngầm trong Docker/Firecracker. |
| 4 | `self-managed-context` | Để Agent tự gọi tool cắt tỉa/quản lý cửa sổ ngữ cảnh của chính nó (kiểu MemGPT/Letta). | Antigravity quản lý context window tự động ở tầng hệ thống kết hợp `/compact` và `strategic-compact`. | Khi lập trình một Custom AI Agent độc lập dùng `google-antigravity-sdk` hoặc LangGraph cần tự quản lý bộ nhớ dài hạn. |
| 5 | `project-development` | Quy trình phát triển dự án AI từ ý tưởng đến triển khai. | Trùng lặp với quy trình `ECC Pipeline` (`AGENTS.md`) và `spec-kit` (`specify-cli`). | Không cần thiết vì bộ `ecc-core` + `spec-kit` hiện tại đã chặt chẽ hơn. |

---

### 2.4. Từ [`remotion-dev/remotion`](https://github.com/remotion-dev/remotion) *(71.9k⭐ — Đã cài `remotion-best-practices` + 11 sub-modules, Bỏ qua ~60 skills nội bộ)*
- **Đã cài vào plugin `pro-workflows`**: `remotion-best-practices` kèm 11 sub-modules hướng dẫn dựng video (`remotion-create`, `remotion-markup`, `remotion-render`, `remotion-studio`, `remotion-saas`, `remotion-captions`, `remotion-multimedia`, `remotion-interactivity`, `remotion-docs`, `remotion-license`, `remotion-upgrade`).
- **Đã bỏ qua**: Các skills nội bộ trong `.agents/skills/` của repo Remotion chỉ phục vụ cho nhân sự công ty Remotion (như viết tài liệu trang chủ `remotion.dev`, quy trình đóng gói bản phát hành nội bộ của Remotion).

---

### 2.5. Từ [`AgriciDaniel/claude-seo`](https://github.com/AgriciDaniel/claude-seo) *(27.6k⭐ — Đã cài đủ 26 skills + 19 agents, Bỏ qua `extensions/` tùy chọn)*
- **Đã cài vào Global Skill `seo`**: Trọn bộ 1 router skill `seo` + 25 `seo-*` sub-skills trong `subskills/` + 19 `agents/` + `scripts/`.
- **Đã bỏ qua (chưa kích hoạt mặc định)**: Thư mục `extensions/` bên ngoài (`firecrawl`, `dataforseo`, `matomo`, `ahrefs`, `bing`, `profound`, `seranking`, `unlighthouse`) vì các extension này yêu cầu trả phí API key bên thứ ba (DataForSEO, Firecrawl, Ahrefs, SE Ranking) hoặc cài thêm MCP server ngoài.
- **Khi nào tận dụng lại**: Khi bạn có API key của Firecrawl hoặc DataForSEO và muốn cào toàn bộ sơ đồ trang web quy mô hàng chục nghìn URL.
