package com.example.demo.modules.order.repository;

import com.example.demo.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndCouponCode(Long userId, String couponCode);
    List<Order> findByCouponCodeOrderByCreatedAtDesc(String couponCode);
    List<Order> findByCustomerPhoneContaining(String customerPhone);
    java.util.Optional<Order> findByGhnOrderCode(String ghnOrderCode);
}
