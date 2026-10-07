-- Sample data for activity_logs table
-- Chạy script này để test chức năng xem hoạt động nhân viên

INSERT INTO activity_logs (user_name, action, details, timestamp) VALUES
('admin', 'LOGIN', 'Đăng nhập từ 192.168.1.1', '2026-05-10 08:00:00'),
('admin', 'CREATE_PRODUCT', 'Sản phẩm ID: 1 - Áo tím nam', '2026-05-10 08:15:30'),
('admin', 'UPDATE_PRODUCT', 'Cập nhật giá sản phẩm ID: 1 từ 100000 -> 95000', '2026-05-10 08:30:45'),
('staff_1', 'LOGIN', 'Đăng nhập từ 192.168.1.5', '2026-05-10 09:00:00'),
('staff_1', 'CREATE_ORDER', 'Đơn hàng ID: 101 - Khách hàng: Nguyễn Văn A', '2026-05-10 09:30:00'),
('staff_1', 'UPDATE_ORDER', 'Cập nhật trạng thái đơn 101: PENDING -> CONFIRMED', '2026-05-10 09:45:00'),
('staff_2', 'LOGIN', 'Đăng nhập từ 192.168.1.8', '2026-05-10 09:15:00'),
('staff_2', 'CREATE_USER', 'Tạo tài khoản khách: customer_new@example.com', '2026-05-10 10:00:00'),
('admin', 'DELETE_PRODUCT', 'Xóa sản phẩm ID: 5 - Quần jean cũ', '2026-05-10 10:30:00'),
('staff_1', 'UPDATE_ORDER', 'Cập nhật trạng thái đơn 101: CONFIRMED -> SHIPPED', '2026-05-10 11:00:00'),
('staff_2', 'UPDATE_USER', 'Cập nhật thông tin khách hàng ID: 50', '2026-05-10 11:30:00'),
('admin', 'CREATE_PRODUCT', 'Sản phẩm ID: 10 - Áo xanh nữ', '2026-05-10 12:00:00'),
('staff_1', 'LOGOUT', 'Đăng xuất', '2026-05-10 12:30:00'),
('staff_2', 'CREATE_ORDER', 'Đơn hàng ID: 102 - Khách hàng: Trần Thị B', '2026-05-10 13:00:00'),
('admin', 'UPDATE_PRODUCT', 'Cập nhật kho hàng sản phẩm ID: 10', '2026-05-10 13:30:00'),
('staff_1', 'LOGIN', 'Đăng nhập từ 192.168.1.5', '2026-05-10 14:00:00'),
('staff_1', 'UPDATE_ORDER', 'Cập nhật trạng thái đơn 102: PENDING -> CONFIRMED', '2026-05-10 14:30:00'),
('admin', 'CREATE_PRODUCT', 'Sản phẩm ID: 11 - Mũ lưỡi trai', '2026-05-10 15:00:00'),
('staff_2', 'UPDATE_ORDER', 'Cập nhật trạng thái đơn 102: CONFIRMED -> SHIPPED', '2026-05-10 15:30:00'),
('admin', 'LOGOUT', 'Đăng xuất', '2026-05-10 16:00:00');
