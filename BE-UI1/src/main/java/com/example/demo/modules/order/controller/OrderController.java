package com.example.demo.modules.order.controller;

import com.example.demo.modules.order.entity.Order;
import com.example.demo.modules.order.entity.OrderItem;
import com.example.demo.modules.order.repository.OrderRepository;
import com.example.demo.modules.account.entity.ActivityLog;
import com.example.demo.modules.account.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private com.example.demo.modules.promotion.repository.PromotionRepository promotionRepository;

    @Autowired
    private com.example.demo.modules.product.repository.ProductRepository productRepository;


    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE order_items ADD COLUMN size VARCHAR(255) DEFAULT 'M'");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE order_items ADD COLUMN color VARCHAR(255) DEFAULT ''");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255)");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(255)");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(1000)");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(255)");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN discount_amount DOUBLE DEFAULT 0.0");
        } catch (Exception e) {}
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void seedPromotionsOnStartup() {
        try {
            // Seed promotions if empty
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM promotions", Integer.class);
            if (count == 0) {
                jdbcTemplate.execute("INSERT INTO promotions (code, description, discount_type, discount_value, minimum_order_amount, max_discount_amount, start_date, end_date, usage_limit, usage_count, is_active) " +
                        "VALUES ('KM10', 'Giảm giá 10% tối đa 50k cho đơn từ 200k', 'PERCENTAGE', 10, 200000, 50000, '2026-05-01 00:00:00', '2026-12-31 23:59:59', 100, 0, true)");
                jdbcTemplate.execute("INSERT INTO promotions (code, description, discount_type, discount_value, minimum_order_amount, max_discount_amount, start_date, end_date, usage_limit, usage_count, is_active) " +
                        "VALUES ('GIAM50K', 'Giảm ngay 50k cho đơn hàng từ 400k', 'FIXED', 50000, 400000, NULL, '2026-05-01 00:00:00', '2026-12-31 23:59:59', 5, 0, true)");
                jdbcTemplate.execute("INSERT INTO promotions (code, description, discount_type, discount_value, minimum_order_amount, max_discount_amount, start_date, end_date, usage_limit, usage_count, is_active) " +
                        "VALUES ('LUOTNGAN', 'Mã giới hạn chỉ 2 lượt dùng toàn hệ thống', 'FIXED', 20000, 100000, NULL, '2026-05-01 00:00:00', '2026-12-31 23:59:59', 2, 0, true)");
                System.out.println("====== SUCCESS: Seeded default promotions into MySQL! ======");
            }
        } catch (Exception e) {
            System.out.println("Seeding error during ApplicationReadyEvent: " + e.getMessage());
        }
    }

    @PostMapping
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Order order = new Order();
            
            if(payload.containsKey("userId") && payload.get("userId") != null) {
                order.setUserId(Long.valueOf(payload.get("userId").toString()));
            } else {
                order.setUserId(1L); // Default local fallback user if none
            }
            
            order.setStatus("PENDING");
            order.setPaymentMethod(payload.containsKey("paymentMethod") ? payload.get("paymentMethod").toString() : "COD");
            order.setGhnOrderCode("GHN" + (10000 + new Random().nextInt(90000)));
            
            double shippingFee = payload.containsKey("shippingFee") ? Double.valueOf(payload.get("shippingFee").toString()) : 0.0;
            order.setShippingFee(shippingFee);
            order.setCreatedAt(LocalDateTime.now());
            
            if (payload.containsKey("customerName") && payload.get("customerName") != null) {
                order.setCustomerName(payload.get("customerName").toString());
            }
            if (payload.containsKey("customerPhone") && payload.get("customerPhone") != null) {
                order.setCustomerPhone(payload.get("customerPhone").toString());
            }
            if (payload.containsKey("shippingAddress") && payload.get("shippingAddress") != null) {
                order.setShippingAddress(payload.get("shippingAddress").toString());
            }
            
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            List<OrderItem> orderItems = new ArrayList<>();
            double calculatedSubtotal = 0.0;
            if (itemsList != null) {
                for(Map<String, Object> itemData : itemsList) {
                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    
                    Long productId = Long.valueOf(itemData.get("id").toString());
                    com.example.demo.modules.product.entity.Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new RuntimeException("Sản phẩm có ID " + productId + " không tồn tại."));
                    item.setProduct(product);
                    
                    int quantity = Integer.valueOf(itemData.get("quantity").toString());
                    double itemPrice = Double.valueOf(itemData.get("rawPrice").toString());
                    String size = itemData.containsKey("size") ? itemData.get("size").toString() : "M";
                    String color = itemData.containsKey("color") ? itemData.get("color").toString() : "";
                    
                    // Validate stock and decrement it
                    if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                        com.example.demo.modules.product.entity.ProductVariant targetVariant = null;
                        for (com.example.demo.modules.product.entity.ProductVariant variant : product.getVariants()) {
                            if (size.equalsIgnoreCase(variant.getSize()) && (color.isEmpty() || color.equalsIgnoreCase(variant.getColor() == null ? "" : variant.getColor()))) {
                                targetVariant = variant;
                                break;
                            }
                        }
                        if (targetVariant != null) {
                            int availableStock = targetVariant.getStock() != null ? targetVariant.getStock() : 0;
                            if (availableStock < quantity) {
                                return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " (Size " + size + (color.isEmpty() ? "" : ", Màu " + color) + ") chỉ còn " + availableStock + " sản phẩm trong kho. Vui lòng cập nhật giỏ hàng.");
                            }
                            targetVariant.setStock(availableStock - quantity);
                        } else {
                            return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " không có phiên bản Size " + size + (color.isEmpty() ? "" : ", Màu " + color) + ".");
                        }
                    } else {
                        int availableStock = product.getStock() != null ? product.getStock() : 0;
                        if (availableStock < quantity) {
                            return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " chỉ còn " + availableStock + " sản phẩm trong kho. Vui lòng cập nhật giỏ hàng.");
                        }
                        product.setStock(availableStock - quantity);
                    }
                    
                    productRepository.save(product);
                    
                    item.setQuantity(quantity);
                    item.setPrice(itemPrice);
                    item.setSize(size);
                    item.setColor(color);
                    orderItems.add(item);
                    
                    calculatedSubtotal += quantity * itemPrice;
                }
            }
            order.setItems(orderItems);

            double discountAmount = 0.0;
            if (payload.containsKey("couponCode") && payload.get("couponCode") != null && !payload.get("couponCode").toString().trim().isEmpty()) {
                String cCode = payload.get("couponCode").toString().trim().toUpperCase();
                java.util.Optional<com.example.demo.modules.promotion.entity.Promotion> promoOpt = promotionRepository.findByCode(cCode);
                if (promoOpt.isPresent()) {
                    com.example.demo.modules.promotion.entity.Promotion promo = promoOpt.get();
                    LocalDateTime now = LocalDateTime.now();
                    
                    // Check if this account has already used this coupon code
                    if (order.getUserId() != null && orderRepository.existsByUserIdAndCouponCode(order.getUserId(), cCode)) {
                        return ResponseEntity.badRequest().body("Tài khoản của bạn đã sử dụng mã giảm giá này rồi. Mỗi tài khoản chỉ được nhập 1 lần!");
                    }
                    
                    // Validate coupon security on server
                    if (promo.getIsActive() != null && promo.getIsActive()
                        && (promo.getStartDate() == null || !now.isBefore(promo.getStartDate()))
                        && (promo.getEndDate() == null || !now.isAfter(promo.getEndDate()))
                        && (promo.getUsageLimit() == null || promo.getUsageCount() == null || promo.getUsageCount() < promo.getUsageLimit())
                        && (promo.getMinimumOrderAmount() == null || calculatedSubtotal >= promo.getMinimumOrderAmount())) {
                        
                        // Calculate discount
                        if ("PERCENTAGE".equalsIgnoreCase(promo.getDiscountType())) {
                            discountAmount = calculatedSubtotal * (promo.getDiscountValue() / 100.0);
                            if (promo.getMaxDiscountAmount() != null && discountAmount > promo.getMaxDiscountAmount()) {
                                discountAmount = promo.getMaxDiscountAmount();
                            }
                        } else if ("FIXED".equalsIgnoreCase(promo.getDiscountType())) {
                            discountAmount = promo.getDiscountValue();
                        }
                        discountAmount = Math.min(discountAmount, calculatedSubtotal);
                        
                        order.setCouponCode(promo.getCode());
                        order.setDiscountAmount(discountAmount);
                        
                        // Update usage count of the promotion
                        promo.setUsageCount(promo.getUsageCount() + 1);
                        promotionRepository.save(promo);
                    } else {
                        return ResponseEntity.badRequest().body("Mã giảm giá không hợp lệ, đã hết hạn, hết lượt sử dụng hoặc không đủ điều kiện đơn hàng tối thiểu.");
                    }
                } else {
                    return ResponseEntity.badRequest().body("Mã giảm giá không tồn tại.");
                }
            }
            
            double totalAmount = calculatedSubtotal + shippingFee - discountAmount;
            order.setTotalAmount(totalAmount);
            
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/track")
    public ResponseEntity<?> trackOrder(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Query parameter 'query' is required");
        }
        
        String cleanQuery = query.trim();
        if (cleanQuery.startsWith("#")) {
            cleanQuery = cleanQuery.substring(1).trim();
        }
        
        List<Order> results = new ArrayList<>();

        // 1. Try search by Order ID
        try {
            Long orderId = Long.parseLong(cleanQuery);
            java.util.Optional<Order> orderOpt = orderRepository.findById(orderId);
            orderOpt.ifPresent(results::add);
        } catch (NumberFormatException e) {
            // Ignore if not a numeric ID
        }

        // 2. Try search by GHN Order Code (case-insensitive)
        java.util.Optional<Order> ghnOpt = orderRepository.findByGhnOrderCode(cleanQuery);
        if (ghnOpt.isPresent() && !results.contains(ghnOpt.get())) {
            results.add(ghnOpt.get());
        } else {
            java.util.Optional<Order> ghnOptUpper = orderRepository.findByGhnOrderCode(cleanQuery.toUpperCase());
            if (ghnOptUpper.isPresent() && !results.contains(ghnOptUpper.get())) {
                results.add(ghnOptUpper.get());
            }
        }

        // 3. Try search by customer phone number
        List<Order> phoneOrders = orderRepository.findByCustomerPhoneContaining(cleanQuery);
        for (Order o : phoneOrders) {
            if (!results.contains(o)) {
                results.add(o);
            }
        }

        return ResponseEntity.ok(results);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAllOrdersForAdmin() {
        // Normally you'd want pagination here
        List<Order> orders = orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, @RequestHeader(value = "X-User-Name", defaultValue = "Hệ thống") String userName) {
        try {
            Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            String newStatus = payload.get("status");
            String oldStatus = order.getStatus();
            if (newStatus != null && !newStatus.trim().isEmpty()) {
                order.setStatus(newStatus);
                orderRepository.save(order);
                activityLogRepository.save(new ActivityLog(userName, "Cập nhật đơn hàng", "Đổi trạng thái đơn #" + id + " từ " + oldStatus + " sang " + newStatus));
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestHeader(value = "X-User-Name", defaultValue = "Khách hàng") String userName) {
        try {
            Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ có thể hủy đơn hàng khi trạng thái là Chờ xử lý (PENDING)"));
            }
            String oldStatus = order.getStatus();
            order.setStatus("CANCELLED");
            
            // Restore product and variant stocks
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    com.example.demo.modules.product.entity.Product product = item.getProduct();
                    if (product != null) {
                        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                        String size = item.getSize();
                        String color = item.getColor();
                        
                        // Refetch product from db to be sure
                        product = productRepository.findById(product.getId()).orElse(product);
                        
                        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                            for (com.example.demo.modules.product.entity.ProductVariant variant : product.getVariants()) {
                                if (size.equalsIgnoreCase(variant.getSize()) && (color == null || color.isEmpty() || color.equalsIgnoreCase(variant.getColor() == null ? "" : variant.getColor()))) {
                                    int currentStock = variant.getStock() != null ? variant.getStock() : 0;
                                    variant.setStock(currentStock + quantity);
                                    break;
                                }
                            }
                        } else {
                            int currentStock = product.getStock() != null ? product.getStock() : 0;
                            product.setStock(currentStock + quantity);
                        }
                        productRepository.save(product);
                    }
                }
            }
            
            if (order.getCouponCode() != null && !order.getCouponCode().trim().isEmpty()) {
                promotionRepository.findByCode(order.getCouponCode().trim().toUpperCase()).ifPresent(promo -> {
                    if (promo.getUsageCount() != null && promo.getUsageCount() > 0) {
                        promo.setUsageCount(promo.getUsageCount() - 1);
                        promotionRepository.save(promo);
                    }
                });
            }
            
            orderRepository.save(order);
            activityLogRepository.save(new ActivityLog(userName, "Hủy đơn hàng", "Khách hàng hủy đơn #" + id + " (trạng thái cũ: " + oldStatus + ")"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/shipping-address")
    public ResponseEntity<?> updateShippingAddress(@PathVariable Long id, @RequestBody Map<String, String> payload, @RequestHeader(value = "X-User-Name", defaultValue = "Khách hàng") String userName) {
        try {
            Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
            if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ có thể chỉnh sửa địa chỉ khi đơn hàng đang ở trạng thái Chờ xử lý (PENDING)"));
            }
            
            String newAddress = payload.get("shippingAddress");
            if (newAddress == null || newAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Địa chỉ giao hàng không được để trống"));
            }
            
            String oldAddress = order.getShippingAddress();
            order.setShippingAddress(newAddress);
            
            if (payload.containsKey("customerName")) {
                order.setCustomerName(payload.get("customerName"));
            }
            if (payload.containsKey("customerPhone")) {
                order.setCustomerPhone(payload.get("customerPhone"));
            }
            
            orderRepository.save(order);
            activityLogRepository.save(new ActivityLog(userName, "Thay đổi địa chỉ giao hàng", "Thay đổi địa chỉ đơn #" + id + " từ '" + oldAddress + "' sang '" + newAddress + "'"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
