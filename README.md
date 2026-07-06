# Todo App

Dự án Todo App là một hệ thống quản lý công việc toàn diện, giúp người dùng tổ chức, theo dõi và sắp xếp các công việc hàng ngày một cách trực quan và hiệu quả. Ứng dụng cung cấp các tính năng từ cơ bản (tạo, cập nhật, xóa) đến nâng cao như lọc, phân trang, sắp xếp và xem công việc dưới dạng lịch (Agenda View).

# Demo link: https://todo-app-psi-two-59.vercel.app/
Lưu ý: Dạ backend được deploy trên gói miễn phí của Render, gói free tự động tắt sau 15 phút không hoạt động. Lần truy cập đầu tiên sau khi server ngủ có thể mất 30-60 giây để khởi động lại — đây là giới hạn của gói free, không phải lỗi ứng dụng. Xin vui lòng đợi một chút ở lần tải đầu tiên, các lần sau sẽ nhanh bình thường.

## Mục lục
- [Tech Stack](#tech-stack)
- [Cấu trúc thư mục tổng quan](#cấu-trúc-thư-mục-tổng-quan)
- [Yêu cầu môi trường (Prerequisites)](#yêu-cầu-môi-trường-prerequisites)
- [Hướng dẫn chạy dự án](#hướng-dẫn-chạy-dự-án)
  - [a) Chạy bằng Docker Compose (Khuyến nghị)](#a-chạy-bằng-docker-compose-khuyến-nghị)
  - [b) Chạy thủ công không dùng Docker](#b-chạy-thủ-công-không-dùng-docker)
- [Bảng API Endpoint](#bảng-api-endpoint)
- [Swagger UI](#swagger-ui)
- [Troubleshooting](#troubleshooting)

## Tech Stack
**Backend:**
- Java 17
- Spring Boot 3.3.1
- MySQL 8.0
- Spring Data JPA, Hibernate, MapStruct, Lombok

**Frontend:**
- React 19.2
- Vite 8.1
- TailwindCSS 4.3
- Axios

**DevOps:**
- Docker & Docker Compose

## Cấu trúc thư mục tổng quan
```text
TodoApp/
├── Backend/                 # Mã nguồn backend Spring Boot
│   ├── src/main/java/       # Code logic (Controller, Service, Entity,...)
│   └── pom.xml              # Maven dependencies & build configs
├── Frontend/                # Mã nguồn frontend React + Vite
│   ├── src/                 # Code UI (Components, Pages, Hooks, Utils)
│   └── package.json         # NPM dependencies & scripts
├── docker-compose.yml       # Cấu hình containerization cho toàn bộ dự án
└── README.md                # Tài liệu hướng dẫn (File này)
```

## Yêu cầu môi trường (Prerequisites)
Để chạy dự án, máy tính cần cài đặt các phần mềm sau. Vui lòng chạy các lệnh tương ứng trong terminal để kiểm tra:

- **JDK 17:** (Bắt buộc nếu chạy thủ công)
  ```bash
  java -version
  ```
- **Node.js (phiên bản 18+):** (Bắt buộc nếu chạy thủ công)
  ```bash
  node -v
  ```
- **Docker & Docker Compose:** (Bắt buộc nếu chạy qua Docker)
  ```bash
  docker -v
  docker-compose -v
  ```

## Hướng dẫn chạy dự án

### a) Chạy bằng Docker Compose (Khuyến nghị, nhanh nhất)
Đây là cách tối ưu nhất để tránh các lỗi xung đột môi trường. Các bước thực hiện:

1. **Clone repository và di chuyển vào thư mục:**
   ```bash
   git clone <repo-url>
   cd TodoApp
   ```
2. **Thiết lập biến môi trường:**
   Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
3. **Khởi chạy hệ thống:**
   ```bash
   docker-compose up --build
   ```
4. **Truy cập ứng dụng:**
   - Website Frontend: `http://localhost`
   - Backend API: `http://localhost:8081/api`

### b) Chạy thủ công không dùng Docker (Cho debug/develop)
Dành cho người muốn can thiệp sâu vào code và xem log trực tiếp từ IDE.

**Bước 1: Cài đặt và cấu hình MySQL**
1. Cài đặt MySQL Server tại local (Port mặc định 3306).
2. Tạo database với tên `todoapp`.
3. Kiểm tra file `application-dev.yml` (hoặc `application.yml` trong `Backend/src/main/resources`) và cập nhật `username`, `password` của MySQL cho khớp với local của bạn.

**Bước 2: Chạy Backend**
1. Mở terminal, trỏ tới thư mục `Backend`:
   ```bash
   cd Backend
   ```
2. Khởi động Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   *(Backend sẽ chạy ở `http://localhost:8080`)*

**Bước 3: Chạy Frontend**
1. Mở một terminal khác, trỏ tới thư mục `Frontend`:
   ```bash
   cd Frontend
   ```
2. Thiết lập biến môi trường để Frontend gọi đúng API Backend ở port 8080:
   ```bash
   cp .env.example .env
   ```
3. Cài đặt các package cần thiết:
   ```bash
   npm install
   ```
4. Khởi động Vite Server:
   ```bash
   npm run dev
   ```
   *(Frontend sẽ chạy ở `http://localhost:5173`)*

## Bảng API Endpoint
Base path của ứng dụng là: `/api`. Chi tiết các endpoint:

| Method | Path | Mô tả | Request Body (Mẫu) | Response (Mẫu) |
|---|---|---|---|---|
| **GET** | `/tasks` | Lấy danh sách task (kèm phân trang, `search`, `status`, `sortBy`) | *(Không có)* | `{ "content": [ { "id": 1, "title": "Buy milk", "status": "PENDING"... } ], "pageNumber": 0, "totalPages": 1 }` |
| **GET** | `/tasks/by-date` | Lấy danh sách task nhóm theo ngày (Yêu cầu param: `fromDate`, `toDate`) | *(Không có)* | `[ { "date": "2024-03-01", "tasks": [...] } ]` |
| **POST** | `/tasks` | Tạo mới một công việc | `{ "title": "Học Docker", "description": "Hoàn thành bài tập", "dueDate": "2024-03-01", "priority": "HIGH" }` | `{ "id": 1, "title": "Học Docker", "status": "PENDING", ... }` |
| **PUT** | `/tasks/{id}` | Cập nhật toàn bộ thông tin của công việc | `{ "title": "Học Docker Update", "dueDate": "2024-03-05", "version": 0 }` | `{ "id": 1, "title": "Học Docker Update", "version": 1, ... }` |
| **PATCH**| `/tasks/{id}/toggle-status`| Thay đổi trạng thái công việc (PENDING <-> COMPLETED) | *(Không có)* | `{ "id": 1, "status": "COMPLETED", ... }` |
| **DELETE**| `/tasks/{id}`| Xóa một công việc (Xóa mềm) | *(Không có)* | *(Trống, Status 204 No Content)* |

## Swagger UI
Bạn có thể xem document chi tiết và test trực tiếp các API thông qua giao diện Swagger UI sinh tự động tại link sau:
- Chạy thủ công: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)

## Troubleshooting
Một số lỗi thường gặp và cách xử lý:

1. **Lỗi "Connection refused" khi Backend khởi động**
   - **Dấu hiệu:** Spring Boot không thể kết nối tới MySQL và báo lỗi `CommunicationsException: Communications link failure`.
   - **Khắc phục:** Nếu dùng Docker, hãy kiểm tra container `todoapp_mysql` đã có trạng thái `(healthy)` chưa. Nếu chạy thủ công, hãy đảm bảo MySQL Service tại local của bạn đang bật và credentials (tên đăng nhập, mật khẩu) đã cấu hình đúng.

2. **Lỗi CORS khi Frontend gọi API**
   - **Dấu hiệu:** Xem console trình duyệt báo lỗi `Blocked by CORS policy` hoặc `Network Error`.
   - **Khắc phục:** Nguyên nhân là do URL frontend đang truy cập không khớp với cấu hình allowed origins. Kiểm tra lại biến `CORS_ALLOWED_ORIGINS` trong file `.env` hoặc `application.yml`, bổ sung địa chỉ frontend của bạn (VD: `http://localhost` hoặc `http://localhost:5173`) vào danh sách.

3. **Lỗi Port đã bị chiếm dụng (Address already in use)**
   - **Dấu hiệu:** Quá trình `docker-compose up` hoặc `npm run dev` thất bại vì báo lỗi các port như `8080`, `5173`, `80` hoặc `3306` đang được sử dụng.
   - **Khắc phục:** Tắt các ứng dụng đang dùng port đó. Hoặc bạn có thể đổi port trực tiếp trong `.env` / `docker-compose.yml` (VD: ở dịch vụ `frontend`, đổi `"80:80"` thành `"8082:80"`).
