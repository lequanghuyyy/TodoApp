-- Seed data cho bảng tasks
INSERT INTO tasks (title, description, status, priority) VALUES
('Hoàn thành tài liệu kỹ thuật', 'Viết xong file thiết kế database và API documentation', 'COMPLETED', 'HIGH'),
('Tạo file migration cho database', 'Cấu hình Flyway và viết script tạo bảng tasks', 'COMPLETED', 'HIGH'),
('Thiết kế giao diện người dùng (UI)', 'Vẽ wireframe và mockup cho màn hình danh sách công việc', 'PENDING', 'MEDIUM'),
('Triển khai tính năng đăng nhập', 'Tích hợp JWT và tạo API Authentication', 'PENDING', 'HIGH'),
('Cấu hình CI/CD pipeline', 'Thiết lập Github Actions để tự động build và test khi có push mới', 'PENDING', 'MEDIUM'),
('Viết Unit Test cho Service', 'Đảm bảo code coverage đạt ít nhất 80% cho TaskService', 'PENDING', 'LOW'),
('Fix bug hiển thị sai trạng thái', 'Kiểm tra lại logic cập nhật trạng thái trên frontend', 'PENDING', 'MEDIUM'),
('Tối ưu hoá câu query database', 'Sử dụng index để tăng tốc độ tìm kiếm công việc', 'PENDING', 'LOW'),
('Lên kịch bản kiểm thử (Test case)', 'Chuẩn bị danh sách test case cho toàn bộ module quản lý công việc', 'PENDING', 'MEDIUM'),
('Deploy ứng dụng lên server', 'Cấu hình Nginx, Docker và đẩy code lên máy chủ production', 'PENDING', 'HIGH');
