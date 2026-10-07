# Dự Án Website Thời Trang (Fashion E-Commerce Website)

Hệ thống Website bán hàng thời trang đa kênh tích hợp AI ước tính kích cỡ thông minh (AI Size Estimator).

---

## 🏗 Kiến Trúc Hệ Thống

Dự án bao gồm 3 phân hệ chính:

1. **Frontend (`UI1/bn-store`)**:
   - Giao diện người dùng web thời trang xây dựng bằng **React + Vite**.
   - Hỗ trợ đăng nhập Google, Facebook, giỏ hàng, xem chi tiết sản phẩm, đặt hàng, quản trị.
   - Cổng chạy: `https://localhost:5173`

2. **Backend (`BE-UI1`)**:
   - RESTful API Backend xây dựng bằng **Java Spring Boot**, quản lý bởi Gradle.
   - Quản lý danh mục, sản phẩm, đơn hàng, người dùng, xác thực bảo mật JWT, logs hoạt động.
   - Cổng chạy: `http://localhost:8080/identity`

3. **AI Estimator (`ai-estimator`)**:
   - Dịch vụ AI tính toán kích cỡ quần áo phù hợp cho người dùng xây dựng bằng **Python FastAPI**.
   - Cổng chạy: `http://localhost:5000`

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

Khởi động toàn bộ các dịch vụ chỉ với một cú click:

- Chạy file: `start_all.bat` (Mở tự động cả 3 dịch vụ trên các cửa sổ riêng biệt)
- Dừng toàn bộ các dịch vụ: Chạy file `stop_all.bat`

---

## 🛠 Hướng Dẫn Cài Đặt Chi Tiết

### 1. Frontend
```bash
cd UI1/bn-store
npm install
npm run dev
```

### 2. Backend
```bash
cd BE-UI1
./gradlew bootRun
```

### 3. AI Estimator
```bash
cd ai-estimator
pip install -r requirements.txt
python app.py
```

---

## 👥 Tác Giả & Bản Quyền
Dự án được phát triển cho hệ thống Web Thời Trang.
