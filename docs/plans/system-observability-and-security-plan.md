# Kế hoạch Kiến trúc: Trung tâm Giám sát Hệ thống, Chống DDoS, Bảo mật SOC & Ứng phó Khẩn cấp (Chella Observability & Security Center v8)

> **Trạng thái**: Đã hoàn thành triển khai & kiểm định (2026-11-03).
> - **Auto-Ban L7 kèm Cảnh báo**: Đã kích hoạt mặc định (`autoBanEnabled: true`).
> - **Thông báo qua Chat (Telegram)**: Đã tắt theo yêu cầu vận hành hiện tại, tập trung cảnh báo trực tiếp trên Dashboard & SIEM Feed.

---

## 1. 6 Phân hệ Chức năng Cốt lõi (v8)
1. **Lưu lượng Truy cập & Biểu đồ In/Out (`TrafficOverviewTab.jsx` & `telemetryEngine.js`)**:
   - Ring-buffer 60 phút đo `bytesIn`, `bytesOut`, `requests` (RPM/RPS), phân bổ mã trạng thái HTTP (`2xx`, `3xx`, `4xx`, `429`, `5xx`) và độ trễ phân vị (`p50`, `p95`, `p99`).
2. **Giám sát Truy cập & Radar DDoS Lớp 7 (`AccessDdosTab.jsx`)**:
   - Thuật toán **EWMA + Z-Score** phát hiện đột biến lưu lượng tự động (`normal`, `elevated`, `high`, `critical`).
   - 4 bộ quét hành vi L7: `Volumetric HTTP Flood`, `Credential Stuffing / Brute-Force`, `Sensitive Path & 404 Scanner` (`/.env`, `/wp-admin`, SQLi/XSS), và `CSRF / Origin Guard`.
   - Tự động khóa IP vi phạm (`auto_ban`) kèm cảnh báo trên SIEM Feed và nút Chặn / Gỡ chặn / Whitelist 1 chạm.
3. **Trung tâm Bảo mật & Tường lửa IP Động (`SecurityWafTab.jsx` & `systemControlModel.js`)**:
   - Chấm điểm **Security Posture Score (0–100)** tự động trên 6 hạng mục bảo mật.
   - Quản lý quy tắc **IP Blocklist & Whitelist** (hỗ trợ cả IP đơn lẻ và dải mạng CIDR `/24`, thời hạn 15p / 1h / 24h / Vĩnh viễn).
   - Luồng sự kiện **Unified Security & Audit Event Stream (SIEM)** hợp nhất `securityEvents` và `auditLogs`.
4. **Giám sát Hạ tầng & Tài nguyên (`InfrastructureTab.jsx`)**:
   - Đo lường **Node.js Runtime** (CPU %, V8 Heap & RSS Memory, **Event Loop Delay `p50/p95/p99`** & Utilization qua `node:perf_hooks`), độ trễ `ping` **MongoDB Atlas** & thống kê số lượng bản ghi của 10 collections, cùng trạng thái các dịch vụ tích hợp.
5. **Công tắc Khẩn cấp & Kịch bản Ứng biến (`EmergencyControlTab.jsx` & `systemGuardMiddleware.js`)**:
   - **Under Attack / DDoS Shield Mode**: Siết chặt giới hạn RPM, chặn request thiếu `User-Agent` hợp lệ và hạ ngưỡng Auto-Ban.
   - **Read-Only Maintenance Lockdown Mode**: Đóng băng mọi thao tác ghi (`POST/PUT/DELETE`) của người dùng thường với mã `503`, hiển thị `SystemStatusBanner.jsx` toàn ứng dụng, vẫn cho phép Admin thao tác xử lý sự cố.
   - **5 Feature Circuit Breakers**: Ngắt độc lập từng phân hệ (`registration`, `aiAssistant`, `fileUploads`, `publicInvites`, `dataExports`).
   - **4 One-Click Playbooks**: Thu hồi mọi phiên không phải Admin, gỡ toàn bộ IP Auto-Ban, dọn dẹp token/phiên hết hạn, và đặt lại bộ đếm Telemetry.
