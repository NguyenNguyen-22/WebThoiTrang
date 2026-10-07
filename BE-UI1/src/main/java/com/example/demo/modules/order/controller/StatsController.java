package com.example.demo.modules.order.controller;

import com.example.demo.modules.account.repository.UserRepository;
import com.example.demo.modules.order.entity.Order;
import com.example.demo.modules.order.entity.OrderItem;
import com.example.demo.modules.order.repository.OrderRepository;
import com.example.demo.modules.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Bean
    public CommandLineRunner alterUserRoleColumn(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");
                System.out.println("Altered users.role to VARCHAR(50)");
            } catch (Exception e) {
                System.out.println("Failed to alter users.role: " + e.getMessage());
            }
        };
    }

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(@RequestParam(required = false, defaultValue = "all") String filter) {
        List<Order> allOrders = orderRepository.findAll();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = null;
        if ("day".equalsIgnoreCase(filter)) {
            startDate = now.toLocalDate().atStartOfDay();
        } else if ("week".equalsIgnoreCase(filter)) {
            startDate = now.minusDays(7);
        } else if ("month".equalsIgnoreCase(filter)) {
            startDate = now.minusDays(30);
        } else if ("year".equalsIgnoreCase(filter)) {
            startDate = now.minusDays(365);
        }

        List<Order> orders = new ArrayList<>();
        if (startDate != null) {
            for (Order o : allOrders) {
                if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startDate)) {
                    orders.add(o);
                }
            }
        } else {
            orders = allOrders;
        }

        long totalOrders = orders.size();
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();

        double totalRevenue = 0;

        // Group by Date for chart
        Map<String, Double> revenueByDateMap = new TreeMap<>();

        // Top products calculation
        Map<String, Integer> productSales = new HashMap<>();

        for (Order o : orders) {
            String status = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
            if (!"CANCELLED".equals(status) && !"ĐÃ HỦY".equals(status)) {
                double amount = o.getTotalAmount() != null ? o.getTotalAmount() : 0.0;
                totalRevenue += amount;

                if (o.getCreatedAt() != null) {
                    String datePattern = "yyyy-MM-dd";
                    if ("day".equalsIgnoreCase(filter)) {
                        datePattern = "HH:00";
                    } else if ("year".equalsIgnoreCase(filter)) {
                        datePattern = "yyyy-MM";
                    }
                    String dateStr = o.getCreatedAt().format(DateTimeFormatter.ofPattern(datePattern));
                    revenueByDateMap.put(dateStr, revenueByDateMap.getOrDefault(dateStr, 0.0) + amount);
                }

                // Top products
                if (o.getItems() != null) {
                    for (OrderItem item : o.getItems()) {
                        String productName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm khác";
                        int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                        productSales.put(productName, productSales.getOrDefault(productName, 0) + qty);
                    }
                }
            }
        }

        // Format revenue chart data
        List<Map<String, Object>> revenueChart = new ArrayList<>();
        for (Map.Entry<String, Double> entry : revenueByDateMap.entrySet()) {
            revenueChart.add(Map.of("name", entry.getKey(), "Doanh thu", entry.getValue()));
        }

        // Format top products
        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("Đã bán", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("summary", Map.of(
                "totalRevenue", totalRevenue,
                "totalOrders", totalOrders,
                "totalCustomers", totalCustomers,
                "totalProducts", totalProducts));
        result.put("revenueChart", revenueChart);
        result.put("topProducts", topProducts);

        return ResponseEntity.ok(result);
    }
}
