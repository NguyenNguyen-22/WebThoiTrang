package com.example.demo.modules.product.repository;

import com.example.demo.modules.product.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.userId = :userId AND oi.product.id = :productId AND oi.order.status = 'COMPLETED'")
    long countCompletedPurchases(@Param("userId") Long userId, @Param("productId") Long productId);
}
