package com.example.demo.modules.product.controller;

import com.example.demo.modules.product.entity.ProductReview;
import com.example.demo.modules.product.repository.ProductReviewRepository;
import com.example.demo.modules.account.entity.User;
import com.example.demo.modules.account.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ProductReviewController {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/product/{productId}")
    public List<ProductReview> getReviewsByProduct(@PathVariable Long productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @GetMapping("/check-eligibility")
    public ResponseEntity<Boolean> checkEligibility(
            @RequestParam Long productId,
            @RequestParam Long userId) {
        if (userId == null || productId == null) {
            return ResponseEntity.ok(false);
        }
        long purchases = productReviewRepository.countCompletedPurchases(userId, productId);
        return ResponseEntity.ok(purchases > 0);
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.valueOf(payload.get("productId").toString());
            Long userId = Long.valueOf(payload.get("userId").toString());
            Integer rating = Integer.valueOf(payload.get("rating").toString());
            String comment = payload.get("comment").toString();

            // Validate eligibility on server side
            long purchases = productReviewRepository.countCompletedPurchases(userId, productId);
            if (purchases == 0) {
                return ResponseEntity.badRequest().body("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng thành công!");
            }

            Optional<User> userOptional = userRepository.findById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("Người dùng không tồn tại!");
            }

            ProductReview review = new ProductReview();
            review.setUser(userOptional.get());
            review.setProductId(productId);
            review.setRating(rating);
            review.setComment(comment);
            review.setIsPurchased(true);
            review.setStatus("APPROVED");
            review.setCreatedAt(LocalDateTime.now());

            ProductReview saved = productReviewRepository.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }
}
