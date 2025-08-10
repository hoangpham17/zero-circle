# Sprint 1 Planning - ZeroCircle

## Tổng quan Sprint

**Mục tiêu Sprint**: Xây dựng nền tảng cơ bản cho ứng dụng ZeroCircle với tính năng thiền định cốt lõi và trải nghiệm người dùng ban đầu.

**Thời gian**: 2 tuần

**Điểm Sprint**: 40 điểm

**Thành viên tham gia**:
- Product Owner
- Scrum Master
- 2 Frontend Developer
- 1 Backend Developer
- 1 UI/UX Designer
- 1 QA Engineer

## Backlog Items

### 1. Thiết lập Bộ hẹn giờ thiền Ensō

**Độ ưu tiên**: Cao  
**Điểm ước lượng**: 13  
**Người phụ trách**: Frontend Team

#### User Story

**Với tư cách là** người dùng mới bắt đầu thiền,  
**Tôi muốn** có một bộ hẹn giờ thiền trực quan và dễ sử dụng,  
**Để** tôi có thể tập trung vào việc thiền mà không lo lắng về thời gian.

#### Acceptance Criteria

1. **Thiết lập thời gian**:
   - Người dùng có thể chọn thời lượng thiền từ các tùy chọn được định sẵn (5, 10, 15, 20, 30, 45, 60 phút)
   - Người dùng có thể nhập thời lượng tùy chỉnh (tối đa 180 phút)
   - Giao diện hiển thị thời gian đã chọn rõ ràng

2. **Điều khiển phiên thiền**:
   - Người dùng có thể bắt đầu phiên thiền bằng nút rõ ràng
   - Người dùng có thể tạm dừng và tiếp tục phiên thiền
   - Người dùng có thể kết thúc phiên thiền sớm
   - Có xác nhận khi người dùng muốn kết thúc sớm

3. **Trải nghiệm thiền**:
   - Khi bắt đầu, có âm thanh nhẹ nhàng báo hiệu bắt đầu phiên thiền
   - Bộ đếm thời gian hiển thị rõ ràng nhưng không gây mất tập trung
   - Biểu tượng Ensō hiển thị và thay đổi theo tiến trình thiền (dần hoàn thiện theo thời gian)
   - Khi kết thúc, có âm thanh nhẹ nhàng báo hiệu kết thúc phiên thiền

4. **Lưu trữ dữ liệu**:
   - Phiên thiền được tự động lưu vào lịch sử thiền của người dùng
   - Dữ liệu bao gồm: thời lượng, thời gian bắt đầu/kết thúc, có hoàn thành hay không

5. **Trải nghiệm người dùng**:
   - Giao diện tối giản, không gây mất tập trung
   - Hoạt động mượt mà trên cả iOS và Android
   - Hỗ trợ chế độ tối/sáng theo thiết lập hệ thống

#### Ghi chú kỹ thuật

- Sử dụng React Native Animation API cho hiệu ứng Ensō
- Sử dụng React Native Sound cho âm thanh
- Lưu dữ liệu cục bộ bằng AsyncStorage
- Thiết kế theo hướng tiết kiệm pin

---

### 2. Tùy chỉnh trải nghiệm thiền

**Độ ưu tiên**: Trung bình  
**Điểm ước lượng**: 8  
**Người phụ trách**: Frontend Team

#### User Story

**Với tư cách là** người thực hành thiền thường xuyên,  
**Tôi muốn** tùy chỉnh trải nghiệm thiền của mình,  
**Để** phù hợp với phương pháp thực hành và sở thích cá nhân của tôi.

#### Acceptance Criteria

1. **Tùy chỉnh âm thanh**:
   - Người dùng có thể chọn từ ít nhất 5 âm thanh bắt đầu/kết thúc khác nhau (chuông Tibetan, chuông Zen, chuông chùa Việt Nam, v.v.)
   - Người dùng có thể nghe thử âm thanh trước khi chọn
   - Người dùng có thể điều chỉnh âm lượng của âm thanh

2. **Tùy chỉnh hình ảnh**:
   - Người dùng có thể chọn từ ít nhất 3 hình nền Ensō khác nhau
   - Người dùng có thể bật/tắt hiệu ứng hình ảnh (như Ensō dần hiện ra trong quá trình thiền)

3. **Lưu cấu hình**:
   - Người dùng có thể lưu cấu hình tùy chỉnh để sử dụng lại sau này
   - Người dùng có thể đặt tên cho cấu hình tùy chỉnh
   - Người dùng có thể chọn cấu hình mặc định

4. **Áp dụng thiết lập**:
   - Tất cả tùy chọn được lưu và áp dụng cho các phiên thiền tiếp theo
   - Người dùng có thể dễ dàng chuyển đổi giữa các cấu hình đã lưu

#### Ghi chú kỹ thuật

- Tạo thư viện âm thanh nhỏ gọn, tối ưu hóa kích thước
- Sử dụng lazy loading cho tài nguyên âm thanh và hình ảnh
- Lưu cấu hình người dùng bằng AsyncStorage

---

### 3. Thiết lập chuông định kỳ

**Độ ưu tiên**: Thấp  
**Điểm ước lượng**: 5  
**Người phụ trách**: Frontend Team

#### User Story

**Với tư cách là** người thực hành thiền Zen,  
**Tôi muốn** thiết lập chuông định kỳ trong phiên thiền,  
**Để** giúp tôi duy trì sự tỉnh thức và nhận biết về thời gian trôi qua.

#### Acceptance Criteria

1. **Bật/tắt chuông định kỳ**:
   - Người dùng có thể bật/tắt tính năng chuông định kỳ
   - Trạng thái bật/tắt được hiển thị rõ ràng

2. **Thiết lập khoảng thời gian**:
   - Người dùng có thể thiết lập khoảng thời gian giữa các chuông (1-10 phút)
   - Giao diện hiển thị khoảng thời gian đã chọn rõ ràng

3. **Tùy chỉnh âm thanh**:
   - Người dùng có thể chọn âm thanh chuông định kỳ từ ít nhất 3 tùy chọn
   - Người dùng có thể điều chỉnh âm lượng của chuông định kỳ riêng biệt với chuông bắt đầu/kết thúc

4. **Hoạt động trong phiên thiền**:
   - Chuông định kỳ phát ra đúng thời điểm đã thiết lập trong suốt phiên thiền
   - Chuông định kỳ không làm gián đoạn bộ đếm thời gian

#### Ghi chú kỹ thuật

- Sử dụng background timer để đảm bảo chuông hoạt động chính xác ngay cả khi ứng dụng ở chế độ nền
- Tối ưu hóa việc phát âm thanh để tránh độ trễ

---

### 4. Màn hình Onboarding

**Độ ưu tiên**: Cao  
**Điểm ước lượng**: 8  
**Người phụ trách**: UI/UX Designer, Frontend Team

#### User Story

**Với tư cách là** người dùng mới,  
**Tôi muốn** được giới thiệu về ứng dụng một cách trực quan và hấp dẫn,  
**Để** tôi hiểu được giá trị và cách sử dụng ứng dụng.

#### Acceptance Criteria

1. **Trải nghiệm Onboarding**:
   - Hiển thị tối đa 4 màn hình giới thiệu ngắn gọn, trực quan
   - Mỗi màn hình tập trung vào một giá trị/tính năng cốt lõi
   - Hình ảnh và văn bản phù hợp với tinh thần Phật pháp và thiền định
   - Người dùng có thể vuốt qua lại giữa các màn hình

2. **Nội dung Onboarding**:
   - Màn hình 1: Giới thiệu về ZeroCircle và biểu tượng Ensō
   - Màn hình 2: Giới thiệu về bộ hẹn giờ thiền và cách sử dụng
   - Màn hình 3: Giới thiệu về lợi ích của thiền định đều đặn
   - Màn hình 4: Giới thiệu về cộng đồng và hỗ trợ

3. **Điều hướng**:
   - Người dùng có thể bỏ qua Onboarding bất cứ lúc nào
   - Có nút "Tiếp theo" và "Quay lại" rõ ràng
   - Có chỉ báo vị trí hiện tại trong chuỗi Onboarding
   - Sau khi hoàn thành, người dùng được chuyển đến màn hình chính

4. **Trải nghiệm người dùng**:
   - Chuyển động mượt mà giữa các màn hình
   - Thời gian tải nhanh, không có độ trễ
   - Hỗ trợ cả định hướng dọc và ngang
   - Hỗ trợ chế độ tối/sáng

#### Ghi chú kỹ thuật

- Sử dụng React Native Reanimated cho hiệu ứng chuyển cảnh
- Lưu trạng thái đã xem Onboarding để không hiển thị lại
- Tối ưu hóa hình ảnh để giảm kích thước ứng dụng

---

### 5. Màn hình chính và điều hướng

**Độ ưu tiên**: Cao  
**Điểm ước lượng**: 13  
**Người phụ trách**: UI/UX Designer, Frontend Team

#### User Story

**Với tư cách là** người dùng ứng dụng,  
**Tôi muốn** có một màn hình chính trực quan và điều hướng dễ dàng,  
**Để** tôi có thể truy cập nhanh chóng các tính năng của ứng dụng.

#### Acceptance Criteria

1. **Màn hình chính**:
   - Hiển thị biểu tượng Ensō làm trung tâm
   - Hiển thị nút bắt đầu thiền rõ ràng
   - Hiển thị thời gian thiền đã chọn gần đây
   - Hiển thị thống kê ngắn gọn về thói quen thiền (nếu có)
   - Thiết kế tối giản, tạo cảm giác bình yên

2. **Thanh điều hướng**:
   - Có 4 tab chính: Thiền, Học tập, Cộng đồng, Hồ sơ
   - Icon và nhãn rõ ràng cho mỗi tab
   - Hiệu ứng khi chọn tab
   - Vị trí thuận tiện cho thao tác một tay

3. **Điều hướng trong ứng dụng**:
   - Chuyển đổi mượt mà giữa các màn hình
   - Có nút quay lại rõ ràng khi cần thiết
   - Hiệu ứng chuyển cảnh phù hợp với tinh thần thiền định
   - Hỗ trợ cử chỉ vuốt để điều hướng (nếu phù hợp)

4. **Trải nghiệm người dùng**:
   - Thời gian phản hồi nhanh khi chuyển đổi màn hình
   - Trạng thái tải được hiển thị khi cần thiết
   - Hỗ trợ chế độ tối/sáng
   - Hỗ trợ các kích thước màn hình khác nhau

#### Ghi chú kỹ thuật

- Sử dụng React Navigation cho điều hướng
- Áp dụng mẫu thiết kế Bottom Tab Navigation
- Tối ưu hóa hiệu suất khi chuyển đổi màn hình
- Sử dụng skeleton loading khi cần thiết

---

## Rủi ro và Giảm thiểu

1. **Rủi ro**: Hiệu suất của bộ hẹn giờ thiền trên các thiết bị cũ  
   **Giảm thiểu**: Kiểm tra trên nhiều thiết bị, tối ưu hóa animation, cung cấp tùy chọn tắt hiệu ứng

2. **Rủi ro**: Độ trễ khi phát âm thanh  
   **Giảm thiểu**: Tải trước âm thanh, sử dụng định dạng tối ưu, kiểm tra kỹ trên nhiều thiết bị

3. **Rủi ro**: Trải nghiệm người dùng không phù hợp với tinh thần thiền định  
   **Giảm thiểu**: Tham khảo ý kiến từ người thực hành thiền, kiểm tra UX với người dùng thực tế

## Mục tiêu Definition of Done

1. Tất cả acceptance criteria được đáp ứng
2. Code được review và approve bởi ít nhất 1 thành viên khác
3. Kiểm tra trên cả iOS và Android
4. Kiểm tra trên ít nhất 3 kích thước màn hình khác nhau
5. Tất cả unit tests và integration tests đều pass
6. Tài liệu kỹ thuật được cập nhật
7. Không có lỗi UI/UX nghiêm trọng
8. Hiệu suất đáp ứng yêu cầu (thời gian tải < 2s, FPS > 30)

## Kết quả mong đợi

Sau Sprint 1, chúng ta sẽ có:

1. Bộ hẹn giờ thiền Ensō hoạt động đầy đủ với các tùy chỉnh cơ bản
2. Trải nghiệm Onboarding cho người dùng mới
3. Cấu trúc điều hướng cơ bản của ứng dụng
4. Nền tảng kỹ thuật cho các tính năng tiếp theo

Sprint này tập trung vào việc xây dựng trải nghiệm thiền cốt lõi và thiết lập nền tảng UX cho toàn bộ ứng dụng, phù hợp với tầm nhìn sản phẩm về một ứng dụng thiền & Phật pháp dễ tiếp cận và có chiều sâu.