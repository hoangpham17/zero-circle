# ZeroCircle Frontend

## Tổng quan

Frontend của ZeroCircle được xây dựng bằng React Native, cho phép phát triển ứng dụng di động đa nền tảng (iOS và Android) với trải nghiệm người dùng nhất quán. Dự án sử dụng TypeScript để đảm bảo type safety và cải thiện khả năng bảo trì.

## Cấu trúc thư mục

```
src/frontend/
├── app/                   # Mã nguồn chính của ứng dụng
│   ├── assets/            # Tài nguyên tĩnh (hình ảnh, âm thanh, fonts)
│   ├── components/        # Components React Native
│   │   ├── common/        # Components dùng chung (Button, Input, Card...)
│   │   ├── meditation/    # Components liên quan đến thiền
│   │   ├── dharma/        # Components liên quan đến Phật pháp
│   │   └── community/     # Components liên quan đến cộng đồng
│   ├── screens/           # Màn hình ứng dụng
│   │   ├── auth/          # Màn hình xác thực (Login, Register...)
│   │   ├── meditation/    # Màn hình thiền (Timer, Guided...)
│   │   ├── dharma/        # Màn hình Phật pháp (Library, Courses...)
│   │   ├── community/     # Màn hình cộng đồng (Feed, Profile...)
│   │   ├── settings/      # Màn hình cài đặt
│   │   └── premium/       # Màn hình tính năng premium
│   ├── navigation/        # Cấu hình điều hướng
│   ├── services/          # Dịch vụ API và tích hợp
│   │   ├── api/           # Các API clients
│   │   ├── audio/         # Dịch vụ xử lý âm thanh
│   │   ├── storage/       # Dịch vụ lưu trữ cục bộ
│   │   └── analytics/     # Dịch vụ phân tích
│   ├── store/             # Quản lý state (Redux/Context)
│   │   ├── slices/        # Redux slices
│   │   ├── hooks/         # Custom hooks
│   │   └── middleware/    # Redux middleware
│   ├── utils/             # Tiện ích và helpers
│   ├── hooks/             # Custom hooks
│   ├── constants/         # Hằng số và cấu hình
│   ├── types/             # TypeScript types và interfaces
│   └── theme/             # Cấu hình theme và styling
├── shared/                # Mã dùng chung với web và backend
│   ├── types/             # Types dùng chung
│   ├── utils/             # Utils dùng chung
│   ├── constants/         # Hằng số dùng chung
│   └── validation/        # Logic validation dùng chung
├── __tests__/            # Tests
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── android/               # Mã nguồn Android native
├── ios/                   # Mã nguồn iOS native
├── scripts/               # Scripts hỗ trợ
├── package.json           # Dependencies và scripts
├── tsconfig.json          # Cấu hình TypeScript
├── babel.config.js        # Cấu hình Babel
├── metro.config.js        # Cấu hình Metro bundler
├── app.json               # Cấu hình ứng dụng
└── README.md              # Tài liệu
```

## Công nghệ sử dụng

- **Framework**: React Native
- **Ngôn ngữ**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Styling**: Styled Components
- **API Client**: Axios, React Query
- **Forms**: Formik, Yup
- **Animations**: React Native Reanimated
- **Audio**: React Native Track Player
- **Testing**: Jest, React Native Testing Library
- **CI/CD**: Fastlane, GitHub Actions

## Tính năng chính

### Bộ hẹn giờ thiền Ensō

- Thiết lập phiên thiền với thời gian tùy chỉnh
- Tùy chỉnh âm thanh bắt đầu/kết thúc
- Chuông định kỳ trong phiên thiền
- Theo dõi tiến trình thiền

### Thư viện thiền có hướng dẫn

- Duyệt và tìm kiếm bài thiền
- Trình phát âm thanh với điều khiển đầy đủ
- Lưu và tổ chức bài thiền yêu thích
- Gợi ý bài thiền cá nhân hóa

### Thư viện Phật pháp

- Duyệt và tìm kiếm nội dung Phật pháp
- Đọc và nghe nội dung Phật pháp
- Đánh dấu và ghi chú
- Khóa học có cấu trúc

### Cộng đồng học tập

- Diễn đàn thảo luận
- Thử thách cộng đồng
- Hồ sơ người dùng
- Tương tác (thích, bình luận, chia sẻ)

## Shared Components

Thư mục `shared/` chứa các components dùng chung có thể tái sử dụng trong toàn bộ ứng dụng:

- **Button**: Các loại nút với style nhất quán
- **Typography**: Text components với style nhất quán
- **Card**: Card components cho hiển thị nội dung
- **Icon**: Icon components tùy chỉnh
- **Input**: Input components với validation
- **Modal**: Modal và dialog components
- **List**: List và grid components
- **Loading**: Loading indicators
- **ErrorBoundary**: Xử lý lỗi graceful

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
cd src/frontend
npm install
```

2. Chạy trên iOS:
```bash
npm run ios
```

3. Chạy trên Android:
```bash
npm run android
```

4. Chạy tests:
```bash
npm test
```

## Coding Standards

- Sử dụng functional components và hooks
- Tuân thủ nguyên tắc DRY và SOLID
- Sử dụng TypeScript strict mode
- Viết tests cho tất cả components
- Sử dụng Prettier và ESLint
- Tuân thủ conventional commits
- Code review bắt buộc trước khi merge