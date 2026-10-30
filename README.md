# CultureLink (Văn Hóa Việt) — Nền Tảng Vé & Trải Nghiệm Di Sản Văn Hóa Việt Nam

[![Live Demo](https://img.shields.io/badge/Live%20Demo-culturelink--vn.pages.dev-059669?style=for-the-badge&logo=cloudflare-pages&logoColor=white)](https://culturelink-vn.pages.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📖 Giới thiệu Dự án (About CultureLink)

**CultureLink** là nền tảng số bảo tồn, quảng bá và kết nối người trẻ với các giá trị di sản văn hóa truyền thống Việt Nam. Hệ thống cung cấp trải nghiệm số toàn diện từ khám phá sự kiện văn hóa, bản đồ di sản tương tác định vị GIS, trắc nghiệm sở thích văn hóa, ví vé số thông minh chuẩn bảo mật HMAC, đến cổng soát vé thực chiến dành cho Ban Tổ Chức (BTC).

- 🌐 **Đường dẫn ứng dụng chính thức**: [https://culturelink-vn.pages.dev](https://culturelink-vn.pages.dev)
- 🏆 **Phiên bản dự thi**: `v1.0-competition`

---

## ✨ Các Trụ Cột Tính Năng Nổi Bật (Core Modules)

### 1. 🎭 Khám Phá & Đặt Vé Di Sản (Heritage Discovery & Ticketing)
- Thư viện sự kiện văn hóa đa dạng (Đêm nhạc Trịnh & Áo dài, Lễ hội Đèn lồng Phố Hội, Sơn mài đương đại, Đờn ca tài tử...).
- Bộ lọc thông minh theo chủ đề (Workshop, Triển lãm, Ẩm thực, Di sản).
- Form đặt vé trực tuyến thời gian thực, cấp mã định danh duy nhất `CL-XXXXXX`, hiệu ứng tương tác confetti chúc mừng.

### 2. 🗺️ Bản Đồ Di Sản Tương Tác GIS (Interactive Heritage Map)
- Tích hợp Leaflet GIS tương tác thực tế với các tọa độ di sản văn hóa tại TP.HCM và các vùng lân cận.
- Tính năng lọc theo bán kính khoảng cách, xem thông tin di tích và chỉ đường trực quan.

### 3. 🧩 Ghép Đôi Sở Thích Văn Hóa (Culture Match & Quiz Engine)
- Trắc nghiệm sở thích văn hóa tương tác giúp cá nhân hóa trải nghiệm.
- Thuật toán gợi ý thông minh đề xuất sự kiện phù hợp nhất với gu thẩm mỹ và tính cách của người dùng.

### 4. 📱 Ví Vé Số Thông Minh & Chia Sẻ Zalo (Smart Ticket Wallet & Security)
- Lưu trữ vé cá nhân trực quan với trạng thái kiểm soát (Hợp lệ / Đã check-in).
- Tạo mã QR động chuẩn mã hóa HMAC chống giả mạo vé.
- Tích hợp chia sẻ vé trực tiếp qua Zalo / mạng xã hội và tải vé về điện thoại (PNG/PDF).

### 5. 📷 Cổng Soát Vé Thực Chiến Cho Ban Tổ Chức (Staff QR Scanner)
- Quét mã QR siêu tốc tối ưu cho **Camera sau (Rear/Environment Camera)** của thiết bị di động.
- Cơ chế chống quét trùng lặp khung hình (Anti-duplicate Scan Throttling), chuông bíp phản hồi âm thanh.
- Hỗ trợ nhập mã thủ công và tra cứu nhanh danh sách người tham gia theo tên / số điện thoại.

### 6. ☁️ Kiến Trúc Dữ Liệu Đồng Bộ Đám Mây (Hybrid Cloud Architecture)
- Hoạt động mượt mà ở chế độ offline / local-first và tự động đồng bộ dữ liệu lên cơ sở dữ liệu đám mây **Supabase PostgreSQL**.
- Phân quyền bảo mật cấp hàng (Row Level Security - RLS).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Lớp (Layer) | Công nghệ chính |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19 |
| **Ngôn ngữ** | TypeScript 5 (Strict Mode) |
| **Giao diện & Styling** | Tailwind CSS v4, Lucide React Icons |
| **Bản đồ GIS** | Leaflet, React-Leaflet |
| **Xử lý QR Code** | `html5-qrcode` (Hardware Camera Scanner), `qrcode` (HMAC Generator) |
| **Cơ sở dữ liệu** | Supabase Cloud (PostgreSQL 15), Supabase JS Client v2 |
| **Triển khai (Deployment)** | Cloudflare Pages (Edge Network CDN) |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ (Local Setup)

### Yêu cầu hệ thống:
- Node.js >= 18.17.0
- Trình quản lý gói: `npm`, `pnpm` hoặc `yarn`

### Các bước cài đặt:

```bash
# 1. Clone repository
git clone https://github.com/lanprovn/culturelink.git
cd culturelink

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Cấu hình biến môi trường (tùy chọn kết nối Supabase)
cp .env.local.example .env.local

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

---

## 📂 Cấu Trúc Dự Án (Project Structure)

```text
culturepass/
├── public/                  # Tài nguyên tĩnh (ảnh sự kiện thực tế, banner, icons)
│   └── assets/events/       # Ảnh chủ đề văn hóa Việt Nam
├── src/
│   ├── app/                 # Next.js App Router (layout, page, global css)
│   ├── components/
│   │   ├── events/          # Thẻ sự kiện, modal chi tiết, đánh giá
│   │   ├── layout/          # Thanh điều hướng (BottomNav, Sidebar)
│   │   ├── map/             # Bản đồ Leaflet GIS tương tác
│   │   ├── tabs/            # Các màn hình chính (Home, Map, Match, Tickets, Admin)
│   │   └── ui/              # Cổng soát vé (Scanner), User Guide, Modal thông báo
│   ├── context/             # AppContext (Quản lý trạng thái vé & đồng bộ Supabase)
│   ├── data/                # MockData sự kiện văn hóa chuẩn
│   ├── lib/                 # Supabase client SDK & tiện ích xuất vé
│   └── types/               # TypeScript interfaces & types định nghĩa chặt chẽ
├── supabase/
│   └── schema.sql           # Cấu trúc bảng PostgreSQL & chính sách RLS
└── package.json             # Cấu hình scripts & dependencies
```

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án phát triển bởi **Đội ngũ CultureLink (lanprovn)** phục vụ cho cuộc thi phát triển ứng dụng công nghệ văn hóa. Mọi quyền được bảo lưu © 2026.
