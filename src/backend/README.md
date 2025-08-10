# ZeroCircle Backend

## Tổng quan

Backend của ZeroCircle được xây dựng trên NestJS - một framework Node.js hiện đại, có cấu trúc rõ ràng và hỗ trợ TypeScript. Backend được thiết kế theo kiến trúc microservices để đảm bảo khả năng mở rộng và bảo trì dễ dàng.

## Cấu trúc thư mục

```
src/backend/
├── apps/                  # Các ứng dụng microservices
│   ├── api-gateway/       # API Gateway - điểm vào chính của hệ thống
│   ├── auth-service/      # Dịch vụ xác thực và phân quyền
│   ├── content-service/   # Dịch vụ quản lý nội dung thiền và Phật pháp
│   ├── community-service/ # Dịch vụ quản lý cộng đồng
│   ├── analytics-service/ # Dịch vụ phân tích dữ liệu
│   ├── notification-service/ # Dịch vụ thông báo
│   └── payment-service/   # Dịch vụ thanh toán
├── libs/                  # Thư viện dùng chung
│   ├── common/            # Mã dùng chung (DTO, interfaces, utils)
│   ├── database/          # Cấu hình và kết nối database
│   ├── auth/              # Logic xác thực dùng chung
│   └── config/            # Cấu hình dùng chung
├── prisma/                # Schema Prisma và migrations
├── docker/                # Cấu hình Docker
├── scripts/               # Scripts hỗ trợ
├── package.json           # Dependencies và scripts
├── nest-cli.json          # Cấu hình NestJS
├── tsconfig.json          # Cấu hình TypeScript
└── README.md              # Tài liệu
```

## Công nghệ sử dụng

- **Framework**: NestJS
- **Ngôn ngữ**: TypeScript
- **Database**: PostgreSQL (chính), Redis (cache)
- **ORM**: Prisma
- **Authentication**: JWT, Passport
- **API**: REST, GraphQL (Apollo)
- **Message Queue**: Bull/Redis
- **Testing**: Jest
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Microservices

### API Gateway

Điểm vào chính của hệ thống, chịu trách nhiệm:
- Định tuyến request đến các service phù hợp
- Xác thực và phân quyền
- Rate limiting
- Logging và monitoring
- Caching

### Auth Service

Quản lý xác thực và phân quyền:
- Đăng ký và đăng nhập
- Quản lý phiên và token
- Xác thực hai yếu tố
- Quản lý quyền và vai trò
- Tích hợp đăng nhập mạng xã hội

### Content Service

Quản lý nội dung thiền và Phật pháp:
- CRUD nội dung thiền
- CRUD nội dung Phật pháp
- Quản lý khóa học
- Tìm kiếm và đề xuất nội dung
- Quản lý tệp đa phương tiện

### Community Service

Quản lý tương tác cộng đồng:
- CRUD bài đăng và bình luận
- Quản lý thử thách cộng đồng
- Quản lý tương tác (thích, chia sẻ)
- Quản lý người dùng và nhóm

### Analytics Service

Phân tích dữ liệu người dùng:
- Thu thập dữ liệu sử dụng
- Phân tích hành vi người dùng
- Báo cáo và thống kê
- Cá nhân hóa trải nghiệm

### Notification Service

Quản lý thông báo:
- Thông báo đẩy
- Thông báo email
- Nhắc nhở chánh niệm
- Thông báo sự kiện

### Payment Service

Xử lý thanh toán và đăng ký:
- Tích hợp cổng thanh toán
- Quản lý đăng ký
- Quản lý hóa đơn
- Báo cáo doanh thu

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
cd src/backend
npm install
```

2. Thiết lập database:
```bash
npx prisma migrate dev
```

3. Chạy development:
```bash
npm run start:dev
```

4. Build production:
```bash
npm run build
```

## Coding Standards

- Tuân thủ nguyên tắc SOLID
- Sử dụng TypeScript strict mode
- Viết unit tests cho tất cả các services
- Sử dụng Prettier và ESLint
- Tuân thủ conventional commits
- Code review bắt buộc trước khi merge