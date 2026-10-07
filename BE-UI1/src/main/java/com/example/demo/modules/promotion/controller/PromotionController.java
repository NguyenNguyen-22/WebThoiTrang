package com.example.demo.modules.promotion.controller;

import com.example.demo.modules.promotion.entity.Promotion;
import com.example.demo.modules.promotion.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private com.example.demo.modules.order.repository.OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody Promotion promotion) {
        try {
            if (promotion.getCode() == null || promotion.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã khuyến mãi không được trống"));
            }
            promotion.setCode(promotion.getCode().trim().toUpperCase());
            
            // Check if code already exists
            Optional<Promotion> existing = promotionRepository.findByCode(promotion.getCode());
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã khuyến mãi '" + promotion.getCode() + "' đã tồn tại"));
            }

            if (promotion.getUsageCount() == null) {
                promotion.setUsageCount(0);
            }
            if (promotion.getIsActive() == null) {
                promotion.setIsActive(true);
            }

            Promotion saved = promotionRepository.save(promotion);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotionDetails) {
        try {
            Promotion promotion = promotionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

            if (promotionDetails.getCode() != null && !promotionDetails.getCode().trim().isEmpty()) {
                String newCode = promotionDetails.getCode().trim().toUpperCase();
                if (!newCode.equals(promotion.getCode())) {
                    Optional<Promotion> existing = promotionRepository.findByCode(newCode);
                    if (existing.isPresent()) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Mã khuyến mãi '" + newCode + "' đã tồn tại"));
                    }
                    promotion.setCode(newCode);
                }
            }

            if (promotionDetails.getDescription() != null) promotion.setDescription(promotionDetails.getDescription());
            if (promotionDetails.getDiscountType() != null) promotion.setDiscountType(promotionDetails.getDiscountType());
            if (promotionDetails.getDiscountValue() != null) promotion.setDiscountValue(promotionDetails.getDiscountValue());
            promotion.setMinimumOrderAmount(promotionDetails.getMinimumOrderAmount());
            promotion.setMaxDiscountAmount(promotionDetails.getMaxDiscountAmount());
            promotion.setStartDate(promotionDetails.getStartDate());
            promotion.setEndDate(promotionDetails.getEndDate());
            promotion.setUsageLimit(promotionDetails.getUsageLimit());
            if (promotionDetails.getUsageCount() != null) promotion.setUsageCount(promotionDetails.getUsageCount());
            if (promotionDetails.getIsActive() != null) promotion.setIsActive(promotionDetails.getIsActive());

            Promotion updated = promotionRepository.save(promotion);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        try {
            Promotion promotion = promotionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
            promotionRepository.delete(promotion);
            return ResponseEntity.ok(Map.of("message", "Xóa mã khuyến mãi thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromotion(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("code") || payload.get("code") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập mã giảm giá"));
            }
            String code = payload.get("code").toString().trim().toUpperCase();
            
            if (!payload.containsKey("orderAmount") || payload.get("orderAmount") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không có thông tin giá trị đơn hàng"));
            }
            Double orderAmount = Double.valueOf(payload.get("orderAmount").toString());

            if (payload.containsKey("userId") && payload.get("userId") != null) {
                Long userId = Long.valueOf(payload.get("userId").toString());
                if (orderRepository.existsByUserIdAndCouponCode(userId, code)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Tài khoản của bạn đã sử dụng mã giảm giá này rồi. Mỗi tài khoản chỉ được nhập 1 lần!"));
                }
            }

            Optional<Promotion> promoOpt = promotionRepository.findByCode(code);
            if (promoOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã giảm giá không tồn tại"));
            }

            Promotion promo = promoOpt.get();
            LocalDateTime now = LocalDateTime.now();

            if (promo.getIsActive() == null || !promo.getIsActive()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã giảm giá đã bị vô hiệu hóa hoặc không còn hoạt động"));
            }

            if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chương trình khuyến mãi này chưa bắt đầu"));
            }

            if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã giảm giá đã hết hạn sử dụng"));
            }

            if (promo.getUsageLimit() != null && promo.getUsageCount() != null && promo.getUsageCount() >= promo.getUsageLimit()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã giảm giá đã hết lượt nhập (đạt giới hạn sử dụng)"));
            }

            if (promo.getMinimumOrderAmount() != null && orderAmount < promo.getMinimumOrderAmount()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Đơn hàng chưa đạt giá trị tối thiểu " + 
                        String.format("%,.0f", promo.getMinimumOrderAmount()) + "đ để áp dụng mã này"));
            }

            // Calculate discount amount
            double discountAmount = 0;
            if ("PERCENTAGE".equalsIgnoreCase(promo.getDiscountType())) {
                discountAmount = orderAmount * (promo.getDiscountValue() / 100.0);
                if (promo.getMaxDiscountAmount() != null && discountAmount > promo.getMaxDiscountAmount()) {
                    discountAmount = promo.getMaxDiscountAmount();
                }
            } else if ("FIXED".equalsIgnoreCase(promo.getDiscountType())) {
                discountAmount = promo.getDiscountValue();
            }

            // Cap the discount at the order amount
            discountAmount = Math.min(discountAmount, orderAmount);

            return ResponseEntity.ok(Map.of(
                "valid", true,
                "code", promo.getCode(),
                "discountType", promo.getDiscountType(),
                "discountValue", promo.getDiscountValue(),
                "discountAmount", discountAmount,
                "description", promo.getDescription() != null ? promo.getDescription() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi xác thực mã: " + e.getMessage()));
        }
    }

    @GetMapping("/{code}/usage")
    public ResponseEntity<?> getPromotionUsageHistory(@PathVariable String code) {
        try {
            List<com.example.demo.modules.order.entity.Order> orders = orderRepository.findByCouponCodeOrderByCreatedAtDesc(code.trim().toUpperCase());
            List<Map<String, Object>> usageHistory = orders.stream().map(order -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("orderId", order.getId());
                map.put("ghnOrderCode", order.getGhnOrderCode() != null ? order.getGhnOrderCode() : "N/A");
                map.put("customerName", order.getCustomerName() != null ? order.getCustomerName() : "Khách hàng ẩn danh");
                map.put("customerPhone", order.getCustomerPhone() != null ? order.getCustomerPhone() : "N/A");
                map.put("discountAmount", order.getDiscountAmount() != null ? order.getDiscountAmount() : 0.0);
                map.put("totalAmount", order.getTotalAmount() != null ? order.getTotalAmount() : 0.0);
                map.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : "");
                return map;
            }).toList();
            return ResponseEntity.ok(usageHistory);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi lấy lịch sử dùng mã: " + e.getMessage()));
        }
    }
}
