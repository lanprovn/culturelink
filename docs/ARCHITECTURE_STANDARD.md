# KHUNG KIẾN TRÚC PHẦN MỀM CAO CẤP PHỔ QUÁT
## UNIVERSAL ENTERPRISE SOFTWARE ARCHITECTURE FRAMEWORK (UESAF)
> **Phiên bản**: v1.0.0-PRO  
> **Phạm vi áp dụng**: Mọi dự án (Web, Mobile, Microservices, Backend API, Desktop)  
> **Độc lập ngôn ngữ**: TypeScript / JavaScript, Go, Python, Java, C#, Rust, Swift / Kotlin

---

## 🎯 1. TRIẾT LÝ CỐT LÕI (CORE ARCHITECTURAL AXIOMS)

Bất kỳ hệ thống phần mềm nào muốn tồn tại 5-10 năm mà không bị "đập đi xây lại" đều phải tuân thủ **3 Định Luật Bất Biến**:

### Định luật 1: Quy Tắc Phụ Thuộc Hướng Tâm (The Inward Dependency Rule)
* Các tầng code nghiệp vụ bên trong **TUYỆT ĐỐI KHÔNG BIẾT** gì về công nghệ ở tầng bên ngoài.
* Code tính toán nghiệp vụ (Domain/Core) không được `import` Next.js, React, Express, Supabase, MySQL hay bất kỳ thư viện bên thứ 3 nào.
* **Nguyên tắc**: *UI, Database, Frameworks chỉ là "Plugin" có thể tháo lắp.*

```
       [ TẦNG NGOÀI CÙNG ] UI, Database, Cloud SDKs, HTTP Frameworks
              │ (phụ thuộc vào)
              ▼
       [ TẦNG TRUNG GIAN ] Controllers, Presenters, Repositories
              │ (phụ thuộc vào)
              ▼
       [ TẦNG TRÁI TIM ] Domain Entities & Business Rules (Bất biến)
```

### Định luật 2: Đơn Nhiệm & Phân Tách Mối Quan Tâm (Single Responsibility & SoC)
* Mỗi module, mỗi class/hàm chỉ chịu trách nhiệm cho **đúng 1 lý do duy nhất để thay đổi**.
* Một hàm render giao diện không được chứa câu lệnh truy vấn CSDL.
* Một hàm xử lý thanh toán không được can thiệp vào định dạng hiển thị thông báo.

### Định luật 3: Lập Trình Dựa Trên Hợp Đồng (Contract-First via Interfaces)
* Mọi giao tiếp giữa các tầng phải thông qua **Interface / Abstract Class (Cổng kết nối - Ports)**.
* Khi thay đổi nhà cung cấp (ví dụ: đổi từ SMS Viettel sang Zalo Notification, đổi từ Postgres sang MongoDB), chỉ cần viết thêm một **Adapter** mới thỏa mãn Interface đó mà **không phải sửa một dòng code nghiệp vụ nào**.

---

## 🏛️ 2. MÔ HÌNH 4 TẦNG PHỔ QUÁT (THE 4 UNIVERSAL CONCENTRIC LAYERS)

Dù dự án viết bằng ngôn ngữ nào, cấu trúc logic luôn phân bổ thành 4 tầng rõ rệt:

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: INFRASTRUCTURE & DRIVERS (Hạ tầng, Driver, SDK ngoài)        │
│  - Web Framework (Next.js, FastAPI, Gin, Spring Boot)                  │
│  - Database Drivers (PostgreSQL, MongoDB, Redis, Supabase SDK)         │
│  - Third-party APIs (Zalo, Stripe, Firebase, AWS S3)                   │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: ADAPTERS & PRESENTERS (Bộ điều hợp & Chuyển đổi)             │
│  - Controllers: Nhận Request, parse payload, gọi UseCase               │
│  - Presenters / ViewModels: Chuyển dữ liệu UseCase sang định dạng UI   │
│  - Repository Implementations: Thực thi Interface lấy data từ DB       │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: APPLICATION / USE CASES (Kịch bản nghiệp vụ ứng dụng)        │
│  - UseCase 1: BookTicketUseCase (Đặt vé)                               │
│  - UseCase 2: VerifyQRScannerUseCase (Soát vé)                         │
│  - Port Interfaces: ITicketRepository, INotificationService             │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: DOMAIN / CORE (Trái tim nghiệp vụ - Độc lập 100%)            │
│  - Entities: Ticket, Event, User                                       │
│  - Value Objects: Money, Email, QRCodeSignature                        │
│  - Domain Exceptions & Validation Rules thuần túy                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 3. BẢN ĐỒ THƯ MỤC TIÊU CHUẨN PHỔ QUÁT (UNIVERSAL DIRECTORY BLUEPRINT)

Cấu trúc thư mục áp dụng chung cho mọi dự án:

```text
root/
├── .github/                   # CI/CD pipelines, PR templates, issue templates
├── docs/                      # Kiến trúc hệ thống, ADR (Architecture Decision Records)
│
├── src/
│   ├── core/                  # [TẦNG 1 & 2] Nơi chứa Trái tim nghiệp vụ (Không chứa framework)
│   │   ├── domain/            # Thực thể (Entities), Value Objects, Domain Errors
│   │   │   ├── entities/      # Ticket.ts / ticket.go / ticket.py
│   │   │   └── errors/        # DomainError, TicketExpiredError
│   │   └── usecases/          # Các kịch bản nghiệp vụ (Use Cases)
│   │       ├── ports/         # Interfaces cho Database, Mailer, Payment
│   │       └── ticket/        # BookTicketUseCase, CheckInTicketUseCase
│   │
│   ├── adapters/              # [TẦNG 3] Chuyển đổi dữ liệu 2 chiều
│   │   ├── controllers/       # HTTP / CLI / Event Handlers
│   │   ├── presenters/        # Chuyển đổi output cho UI / API JSON
│   │   └── repositories/      # Hiện thực hóa interface ports
│   │
│   ├── infrastructure/        # [TẦNG 4] Kết nối thư viện & thế giới bên ngoài
│   │   ├── database/          # Supabase, Prisma, TypeORM, GORM, SQLAlchemy
│   │   ├── external-services/ # ZaloClient, PaymentGateway, AWSClient
│   │   └── http/              # Express, Next.js Routes, Gin, FastAPI server
│   │
│   ├── presentation/          # (Đối với dự án Frontend/Mobile) Giao diện UI
│   │   ├── components/        # Design System nguyên tử (Button, Modal, Input)
│   │   └── screens/           # Các trang / Tab màn hình
│   │
│   └── shared/                # Tiện ích dùng chung
│       ├── constants/         # Hằng số toàn cục
│       └── utils/             # Format tiền tệ, ngày tháng, mã hóa HMAC
│
├── tests/                     # Kiểm thử tự động
│   ├── unit/                  # Test usecases & domain (tốc độ mili-giây)
│   └── integration/           # Test database & API thật
│
├── .env.example               # Khung biến môi trường mẫu (không chứa secret)
└── README.md                  # Hướng dẫn kiến trúc & chạy dự án
```

---

## 💻 4. BẢNG QUY ĐỔI CHO CÁC NGÔN NGỮ PHỔ BIẾN

| Khái niệm Kiến trúc | TypeScript (React/Next/Node) | Go (Golang) | Python (FastAPI/Django) | Mobile (Flutter/Swift) |
| :--- | :--- | :--- | :--- | :--- |
| **Domain Entity** | `class Ticket` / `interface Ticket` | `type Ticket struct` | `class Ticket(BaseModel)` | `class Ticket` / `struct Ticket` |
| **Port / Contract**| `interface ITicketRepository` | `type TicketRepository interface` | `class ITicketRepository(ABC)` | `abstract class ITicketRepo` / `protocol` |
| **Use Case** | `class BookTicketUseCase` | `func (uc *BookTicketUC) Execute()` | `class BookTicketService` | `class BookTicketUseCase` (BLoC/Cubit) |
| **Adapter/Repo** | `SupabaseTicketRepository` | `PostgresTicketRepo` | `SqlAlchemyTicketRepo` | `LocalDatabaseTicketRepo` |
| **Presentation** | React Components / App Router | Fiber / Gin Handlers | FastAPI Routers | Flutter Widgets / SwiftUI Views |

---

## 🛡️ 5. QUY CHUẨN XỬ LÝ LỖI TẬP TRUNG (UNIFIED ERROR STANDARD)

Tuyệt đối không để xảy ra tình trạng "lỗi im lặng" (silent error) hoặc văng lỗi thô (stack trace) cho người dùng cuối:

1. **Phân loại lỗi 3 cấp**:
   - **Validation Error (400)**: Dữ liệu người dùng gửi lên sai quy cách.
   - **Domain / Business Error (422/409)**: Vé đã bị check-in trước đó, sự kiện đã hết chỗ.
   - **System / Infrastructure Error (500)**: Mất kết nối database, sập mạng bên thứ 3.
2. **Chuẩn hóa định dạng phản hồi (Unified Error Payload)**:
```json
{
  "success": false,
  "error": {
    "code": "TICKET_ALREADY_CHECKED_IN",
    "message": "Vé này đã được làm thủ tục soát vé lúc 08:30.",
    "timestamp": "2026-10-30T11:20:00Z"
  }
}
```

---

## 🔒 6. QUY CHUẨN BẢO MẬT THEO THIẾT KẾ (SECURITY BY DESIGN)

1. **Nguyên tắc Zero Trust**: Không tin tưởng bất kỳ dữ liệu nào đến từ bên ngoài (kể cả từ client gửi lên). Mọi payload phải đi qua bộ lọc Schema Validation (như Zod, Pydantic, Joi).
2. **Bảo mật cơ sở dữ liệu**:
   - Sử dụng **Prepared Statements / ORM** chống 100% SQL Injection.
   - Luôn bật **Row Level Security (RLS)** trên CSDL đám mây.
3. **Mã hóa dữ liệu nhạy cảm**:
   - Dữ liệu xác thực ngoại tuyến (như mã QR) bắt buộc dùng mã hóa chữ ký số **HMAC SHA-256** hoặc JWT kèm Secret Key.
4. **Vệ sinh biến môi trường (Secret Hygiene)**:
   - File `.env` chứa mật khẩu/token phải nằm trong `.gitignore`.
   - Luôn duy trì file `.env.example` với các giá trị mẫu cho đồng đội.

---

## 🚀 7. QUY CHUẨN GIT FLOW & PHÁT HÀNH PHIÊN BẢN (DEVOPS & RELEASE)

### Quy tắc phân nhánh:
* `main`: Nhánh production ổn định tuyệt đối (phục vụ người dùng / ban giám khảo).
* `dev`: Nhánh tích hợp các tính năng chuẩn bị phát hành.
* `feature/<ten-tinh-nang>`: Tách từ `dev` để phát triển, merge lại qua Pull Request.
* `hotfix/<ma-loi>`: Tách từ `main` để sửa lỗi khẩn cấp, sau đó merge đồng thời vào `main` và `dev`.

### Chuẩn đặt tên Commit (Conventional Commits):
* `feat`: Thêm tính năng mới (`feat(booking): add real-time seat selection`)
* `fix`: Sửa lỗi (`fix(scanner): resolve camera rear lens freezing`)
* `docs`: Cập nhật tài liệu (`docs: add architecture specification`)
* `refactor`: Viết lại code sạch hơn mà không đổi hành vi (`refactor: decouple context logic`)
* `chore`: Cập nhật cấu hình, dependencies (`chore: upgrade Tailwind v4`)

---

## ✅ 8. BẢNG CHECKLIST VÀNG ĐÁNH GIÁ DỰ ÁN ĐẠT CHUẨN (THE 10 COMMANDMENTS)

Trước khi nghiệm thu hoặc nộp bài thi, hãy kiểm tra 10 câu hỏi này:

1. [ ] **Tính độc lập**: Nếu thay đổi cơ sở dữ liệu (từ Supabase sang MySQL), có cần sửa code giao diện UI không? (Chuẩn: KHÔNG).
2. [ ] **Mô-đun hóa**: Từng tính năng có thể tháo rời hoặc đóng gói lại độc lập không?
3. [ ] **Bảo mật**: Có bất kỳ API key / mật khẩu bí mật nào bị lộ trên Git không?
4. [ ] **Xử lý lỗi**: Khi mất mạng, app có thông báo lịch sự thay vì văng màn hình trắng/lỗi crash không?
5. [ ] **Định danh mã**: Có sử dụng TypeScript / Type hints nghiêm ngặt, không lạm dụng kiểu dữ liệu `any` không?
6. [ ] **Kiểm thử**: Các logic tính toán cốt lõi có viết được unit test độc lập không?
7. [ ] **Cấu trúc Git**: Lịch sử commit có tuân theo chuẩn Conventional Commits không?
8. [ ] **Tài liệu README**: Người ngoài đọc README có thể cài đặt và chạy được dự án trong 5 phút không?
9. [ ] **Hiệu năng**: Các asset (ảnh, script) đã được tối ưu dung lượng và tải qua CDN chưa?
10. [ ] **Local-First & Offline**: Ứng dụng có thể xử lý trơn tru khi mạng bị ngắt quãng không?

---
*Tài liệu quy chuẩn được ban hành và tối ưu bởi Kiến trúc sư Hệ thống CultureLink.*
