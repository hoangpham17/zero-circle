# Sprint 2 Planning - ZeroCircle

## Tổng quan Sprint

**Mục tiêu Sprint**: Phát triển thư viện thiền có hướng dẫn và hệ thống theo dõi tiến trình để nâng cao trải nghiệm người dùng và khuyến khích thói quen thiền định đều đặn.

**Thời gian**: 2 tuần

**Điểm Sprint**: 42 điểm

**Thành viên tham gia**:
- Product Owner
- Scrum Master
- 2 Frontend Developer
- 2 Backend Developer
- 1 UI/UX Designer
- 1 QA Engineer

## Backlog Items

### 1. Thư viện thiền có hướng dẫn - Cơ sở hạ tầng

**Độ ưu tiên**: Cao  
**Điểm ước lượng**: 13  
**Người phụ trách**: Backend Team, Frontend Team

#### User Story

**Với tư cách là** người dùng mới bắt đầu thiền,  
**Tôi muốn** truy cập vào thư viện các bài thiền có hướng dẫn,  
**Để** tôi có thể học và thực hành thiền một cách đúng đắn.

#### Acceptance Criteria

1. **Cơ sở hạ tầng backend**:
   - Thiết kế và triển khai cơ sở dữ liệu cho bài thiền có hướng dẫn
   - Xây dựng API để lấy danh sách bài thiền, chi tiết bài thiền, và phát nội dung
   - Hỗ trợ phân trang và lọc kết quả
   - Hỗ trợ lưu trữ và phát trực tuyến tệp âm thanh
   - Triển khai caching để tối ưu hiệu suất

2. **Cơ sở hạ tầng frontend**:
   - Xây dựng trình phát âm thanh có khả năng phát trong nền
   - Hỗ trợ tải trước nội dung để phát offline
   - Hỗ trợ điều khiển phát: play, pause, seek, tốc độ phát
   - Hiển thị thời gian hiện tại và tổng thời gian
   - Hỗ trợ hiển thị lời hướng dẫn (nếu có)

3. **Quản lý trạng thái**:
   - Lưu trữ trạng thái phát (đang phát, tạm dừng, đã hoàn thành)
   - Lưu vị trí đã nghe để tiếp tục sau khi quay lại
   - Đồng bộ trạng thái giữa các thiết bị (nếu đăng nhập)

4. **Hiệu suất và độ tin cậy**:
   - Thời gian tải ban đầu < 2 giây
   - Không bị gián đoạn khi ứng dụng ở chế độ nền
   - Xử lý mất kết nối internet một cách mượt mà
   - Tối ưu hóa sử dụng dữ liệu di động

#### Ghi chú kỹ thuật

- Sử dụng AWS S3 hoặc Firebase Storage cho lưu trữ tệp âm thanh
- Sử dụng React Native Track Player cho trình phát âm thanh
- Triển khai caching với React Query hoặc SWR
- Sử dụng Redux hoặc Context API cho quản lý trạng thái

---

### 2. Giao diện thư viện thiền có hướng dẫn

**Độ ưu tiên**: Cao  
**Điểm ước lượng**: 8  
**Người phụ trách**: UI/UX Designer, Frontend Team

#### User Story

**Với tư cách là** người dùng ứng dụng,  
**Tôi muốn** dễ dàng duyệt và tìm kiếm các bài thiền có hướng dẫn,  
**Để** tôi có thể nhanh chóng tìm thấy bài thiền phù hợp với nhu cầu của mình.

#### Acceptance Criteria

1. **Màn hình danh sách**:
   - Hiển thị danh sách bài thiền với hình ảnh, tiêu đề, thời lượng và giáo viên
   - Hỗ trợ cuộn vô hạn (infinite scroll) để tải thêm nội dung
   - Hiển thị skeleton loading khi đang tải
   - Hỗ trợ kéo xuống để làm mới (pull-to-refresh)

2. **Phân loại và lọc**:
   - Hiển thị các danh mục nổi bật (Người mới bắt đầu, Giảm căng thẳng, Cải thiện giấc ngủ, v.v.)
   - Cho phép lọc theo thời lượng (5-10 phút, 10-20 phút, 20+ phút)
   - Cho phép lọc theo cấp độ (người mới, trung cấp, nâng cao)
   - Cho phép lọc theo giáo viên

3. **Tìm kiếm**:
   - Cung cấp thanh tìm kiếm dễ tiếp cận
   - Hiển thị kết quả tìm kiếm theo độ phù hợp
   - Hiển thị lịch sử tìm kiếm gần đây
   - Đề xuất từ khóa khi người dùng nhập

4. **Chi tiết bài thiền**:
   - Hiển thị thông tin chi tiết: tiêu đề, mô tả, thời lượng, giáo viên, cấp độ
   - Hiển thị nút phát rõ ràng
   - Hiển thị các bài thiền liên quan
   - Cho phép lưu vào danh sách yêu thích
   - Hiển thị đánh giá và bình luận (nếu có)

#### Ghi chú kỹ thuật

- Sử dụng FlatList hoặc FlashList cho hiệu suất tốt
- Triển khai memoization để tránh render lại không cần thiết
- Sử dụng debounce cho tìm kiếm
- Tối ưu hóa hình ảnh với kích thước phù hợp

---

### 3. Trình phát bài thiền có hướng dẫn

**Độ ưu tiên**: Cao  
**Điểm ước lượng**: 8  
**Người phụ trách**: Frontend Team

#### User Story

**Với tư cách là** người dùng đang thực hành thiền,  
**Tôi muốn** có trải nghiệm phát bài thiền có hướng dẫn mượt mà và không bị gián đoạn,  
**Để** tôi có thể tập trung hoàn toàn vào việc thiền mà không bị phân tâm bởi vấn đề kỹ thuật.

#### Acceptance Criteria

1. **Giao diện trình phát**:
   - Hiển thị hình ảnh bài thiền lớn và hấp dẫn
   - Hiển thị tiêu đề, giáo viên và thời lượng
   - Hiển thị thanh tiến trình với thời gian hiện tại và tổng thời gian
   - Các nút điều khiển rõ ràng: phát/tạm dừng, tua đi 15s, tua lại 15s

2. **Điều khiển phát**:
   - Phát/tạm dừng hoạt động mượt mà không có độ trễ
   - Tua đi/lại chính xác và cập nhật vị trí ngay lập tức
   - Thanh tiến trình có thể kéo để di chuyển đến vị trí khác
   - Hỗ trợ điều khiển từ thông báo và màn hình khóa

3. **Tùy chọn phát**:
   - Điều chỉnh tốc độ phát (0.75x, 1x, 1.25x, 1.5x)
   - Hẹn giờ tắt (15, 30, 45, 60 phút)
   - Tùy chọn tự động phát bài tiếp theo
   - Tùy chọn lặp lại bài hiện tại

4. **Trải nghiệm nền**:
   - Tiếp tục phát khi ứng dụng ở chế độ nền
   - Hiển thị thông báo với thông tin bài thiền và điều khiển
   - Xử lý các sự kiện như cuộc gọi đến, báo thức
   - Tiếp tục từ vị trí đã dừng sau khi bị gián đoạn

#### Ghi chú kỹ thuật

- Sử dụng React Native Track Player cho trình phát âm thanh
- Triển khai foreground service trên Android
- Xử lý audio session trên iOS
- Tối ưu hóa sử dụng pin

---

### 4. Hệ thống theo dõi tiến trình - Cơ sở hạ tầng

**Độ ưu tiên**: Trung bình  
**Điểm ước lượng**: 8  
**Người phụ trách**: Backend Team

#### User Story

**Với tư cách là** người muốn phát triển thói quen thiền đều đặn,  
**Tôi muốn** theo dõi tiến trình thiền của mình,  
**Để** tôi có thể thấy sự tiến bộ và duy trì động lực.

#### Acceptance Criteria

1. **Mô hình dữ liệu**:
   - Thiết kế schema cho phiên thiền (thời gian bắt đầu, kết thúc, thời lượng, loại thiền)
   - Thiết kế schema cho mục tiêu thiền (hàng ngày, hàng tuần, tổng thời gian)
   - Thiết kế schema cho thành tựu và huy hiệu
   - Hỗ trợ đồng bộ hóa dữ liệu giữa các thiết bị

2. **API Backend**:
   - API lưu phiên thiền mới
   - API lấy lịch sử thiền theo ngày/tuần/tháng
   - API lấy thống kê tổng hợp (tổng thời gian, số phiên, chuỗi ngày)
   - API thiết lập và theo dõi mục tiêu
   - API cập nhật và lấy thành tựu

3. **Xử lý dữ liệu**:
   - Tính toán chuỗi ngày thiền liên tiếp
   - Tính toán tiến trình đạt mục tiêu
   - Xác định thành tựu đạt được
   - Tạo báo cáo tổng hợp theo thời gian

4. **Bảo mật và hiệu suất**:
   - Bảo vệ dữ liệu người dùng theo quy định GDPR
   - Tối ưu hóa truy vấn cơ sở dữ liệu
   - Triển khai caching cho dữ liệu thường xuyên truy cập
   - Xử lý đồng bộ hóa offline-online

#### Ghi chú kỹ thuật

- Sử dụng MongoDB hoặc PostgreSQL cho cơ sở dữ liệu
- Triển khai API RESTful hoặc GraphQL
- Sử dụng Redis cho caching
- Triển khai JWT cho xác thực

---

### 5. Giao diện theo dõi tiến trình

**Độ ưu tiên**: Trung bình  
**Điểm ước lượng**: 5  
**Người phụ trách**: UI/UX Designer, Frontend Team

#### User Story

**Với tư cách là** người dùng ứng dụng,  
**Tôi muốn** xem thống kê và tiến trình thiền của mình một cách trực quan,  
**Để** tôi có thể theo dõi sự tiến bộ và duy trì động lực thực hành.

#### Acceptance Criteria

1. **Tổng quan tiến trình**:
   - Hiển thị tổng thời gian thiền trong ngày/tuần/tháng
   - Hiển thị số phiên thiền đã hoàn thành
   - Hiển thị chuỗi ngày thiền liên tiếp hiện tại
   - Hiển thị chuỗi ngày thiền dài nhất

2. **Biểu đồ và trực quan hóa**:
   - Hiển thị biểu đồ thời gian thiền theo ngày/tuần/tháng
   - Sử dụng màu sắc và hình ảnh phù hợp với tinh thần thiền định
   - Hiển thị lịch với các ngày đã thiền được đánh dấu
   - Hiển thị tiến trình đạt mục tiêu bằng biểu đồ tròn hoặc thanh

3. **Thành tựu và huy hiệu**:
   - Hiển thị danh sách thành tựu đã đạt được
   - Hiển thị danh sách thành tựu sắp đạt được
   - Hiển thị huy hiệu với thiết kế hấp dẫn
   - Hiển thị thông báo khi đạt được thành tựu mới

4. **Trải nghiệm người dùng**:
   - Chuyển đổi mượt mà giữa các chế độ xem (ngày/tuần/tháng)
   - Tương tác trực quan khi chạm vào biểu đồ để xem chi tiết
   - Hỗ trợ chia sẻ thành tựu lên mạng xã hội
   - Hiển thị lời khuyến khích phù hợp với tiến trình

#### Ghi chú kỹ thuật

- Sử dụng thư viện biểu đồ nhẹ như Victory Native hoặc react-native-svg-charts
- Tối ưu hóa render để tránh lag khi hiển thị biểu đồ phức tạp
- Sử dụng skeleton loading khi đang tải dữ liệu

---

### 6. Thiết lập và theo dõi mục tiêu thiền

**Độ ưu tiên**: Thấp  
**Điểm ước lượng**: 5  
**Người phụ trách**: Frontend Team

#### User Story

**Với tư cách là** người muốn xây dựng thói quen thiền đều đặn,  
**Tôi muốn** thiết lập và theo dõi mục tiêu thiền cá nhân,  
**Để** tôi có động lực thực hành đều đặn và đạt được mục tiêu của mình.

#### Acceptance Criteria

1. **Thiết lập mục tiêu**:
   - Người dùng có thể thiết lập mục tiêu thời gian thiền hàng ngày (5-60 phút)
   - Người dùng có thể thiết lập mục tiêu số ngày thiền trong tuần (1-7 ngày)
   - Người dùng có thể thiết lập mục tiêu tổng thời gian thiền trong tuần/tháng
   - Giao diện thiết lập mục tiêu trực quan và dễ sử dụng

2. **Theo dõi mục tiêu**:
   - Hiển thị tiến trình đạt mục tiêu hàng ngày/tuần/tháng
   - Hiển thị số ngày đã đạt mục tiêu trong tuần/tháng
   - Hiển thị chuỗi ngày đạt mục tiêu liên tiếp
   - Cập nhật tiến trình theo thời gian thực sau mỗi phiên thiền

3. **Nhắc nhở và động viên**:
   - Gửi thông báo nhắc nhở thiền theo mục tiêu đã thiết lập
   - Hiển thị thông báo chúc mừng khi đạt mục tiêu
   - Hiển thị lời động viên khi gần đạt mục tiêu
   - Đề xuất điều chỉnh mục tiêu dựa trên hiệu suất thực tế

4. **Điều chỉnh mục tiêu**:
   - Người dùng có thể thay đổi mục tiêu bất cứ lúc nào
   - Hiển thị lịch sử thay đổi mục tiêu
   - Đề xuất mục tiêu phù hợp dựa trên dữ liệu quá khứ
   - Xác nhận khi thay đổi mục tiêu đang theo dõi

#### Ghi chú kỹ thuật

- Sử dụng local notifications cho nhắc nhở
- Lưu trữ mục tiêu và tiến trình cả ở local và server
- Triển khai logic tính toán tiến trình ở client để giảm độ trễ

---

## Rủi ro và Giảm thiểu

1. **Rủi ro**: Vấn đề hiệu suất khi phát âm thanh trong thời gian dài  
   **Giảm thiểu**: Kiểm tra kỹ trên nhiều thiết bị, tối ưu hóa sử dụng bộ nhớ, triển khai xử lý lỗi mạnh mẽ

2. **Rủi ro**: Đồng bộ hóa dữ liệu không nhất quán giữa các thiết bị  
   **Giảm thiểu**: Triển khai cơ chế đồng bộ hóa mạnh mẽ, xử lý xung đột, lưu timestamp cho mọi thay đổi

3. **Rủi ro**: Trải nghiệm người dùng phức tạp với quá nhiều dữ liệu thống kê  
   **Giảm thiểu**: Thiết kế UX tập trung vào dữ liệu quan trọng nhất, cung cấp tùy chọn xem chi tiết khi cần

4. **Rủi ro**: Sử dụng pin quá mức khi phát âm thanh trong nền  
   **Giảm thiểu**: Tối ưu hóa sử dụng tài nguyên, kiểm tra mức sử dụng pin, cung cấp tùy chọn tiết kiệm pin

## Mục tiêu Definition of Done

1. Tất cả acceptance criteria được đáp ứng
2. Code được review và approve bởi ít nhất 1 thành viên khác
3. Kiểm tra trên cả iOS và Android
4. Kiểm tra trên ít nhất 3 kích thước màn hình khác nhau
5. Tất cả unit tests và integration tests đều pass
6. API được tài liệu hóa đầy đủ
7. Không có lỗi UI/UX nghiêm trọng
8. Hiệu suất đáp ứng yêu cầu (thời gian tải < 2s, phát âm thanh mượt mà)
9. Dữ liệu được đồng bộ hóa chính xác giữa các thiết bị

## Kết quả mong đợi

Sau Sprint 2, chúng ta sẽ có:

1. Thư viện thiền có hướng dẫn hoạt động đầy đủ với trình phát âm thanh mượt mà
2. Hệ thống theo dõi tiến trình cơ bản với biểu đồ và thống kê
3. Khả năng thiết lập và theo dõi mục tiêu thiền
4. Cơ sở hạ tầng backend cho việc lưu trữ và đồng bộ hóa dữ liệu

Sprint này tập trung vào việc mở rộng trải nghiệm thiền với nội dung có hướng dẫn và xây dựng hệ thống theo dõi tiến trình để khuyến khích người dùng thực hành đều đặn, phù hợp với mục tiêu sản phẩm về việc phát triển thói quen thiền định và học tập Phật pháp.