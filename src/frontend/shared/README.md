# ZeroCircle Shared Components

Thư mục này chứa các components dùng chung có thể tái sử dụng trong toàn bộ ứng dụng ZeroCircle. Các components này được thiết kế để đảm bảo tính nhất quán về giao diện và trải nghiệm người dùng.

## Cấu trúc thư mục

```
shared/
├── components/       # Các UI components dùng chung
│   ├── buttons/      # Các loại nút
│   ├── typography/   # Text components
│   ├── cards/        # Card components
│   ├── icons/        # Icon components
│   ├── inputs/       # Input components
│   ├── modals/       # Modal và dialog components
│   ├── lists/        # List và grid components
│   ├── loading/      # Loading indicators
│   └── feedback/     # Feedback components (alerts, toasts)
├── hooks/            # Custom hooks dùng chung
├── animations/       # Animations dùng chung
├── styles/           # Styles và theme dùng chung
└── README.md         # Tài liệu
```

## Nguyên tắc thiết kế

1. **Tính tái sử dụng**: Mỗi component phải có thể tái sử dụng trong nhiều ngữ cảnh khác nhau.
2. **Tính mở rộng**: Components phải dễ dàng mở rộng và tùy chỉnh thông qua props.
3. **Tính nhất quán**: Components phải tuân thủ design system và đảm bảo trải nghiệm nhất quán.
4. **Tính độc lập**: Components không nên phụ thuộc vào business logic cụ thể.
5. **Tính dễ hiểu**: API của components phải trực quan và dễ hiểu.

## Sử dụng components

```jsx
import { Button, Typography, Card } from '../shared/components';

const MyScreen = () => {
  return (
    <Card>
      <Typography.Heading>Thiền buổi sáng</Typography.Heading>
      <Typography.Body>Bắt đầu ngày mới với 10 phút thiền.</Typography.Body>
      <Button variant="primary">Bắt đầu ngay</Button>
    </Card>
  );
};
```

## Hướng dẫn đóng góp

1. Tạo component mới trong thư mục phù hợp.
2. Viết TypeScript interface cho props.
3. Viết documentation và examples.
4. Viết unit tests.
5. Cập nhật index.ts để export component mới.