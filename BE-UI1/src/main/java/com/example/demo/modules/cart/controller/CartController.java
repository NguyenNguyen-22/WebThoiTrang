package com.example.demo.modules.cart.controller;

import com.example.demo.modules.cart.entity.Cart;
import com.example.demo.modules.cart.entity.CartItem;
import com.example.demo.modules.cart.repository.CartItemRepository;
import com.example.demo.modules.cart.repository.CartRepository;
import com.example.demo.modules.product.entity.Product;
import com.example.demo.modules.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE cart_items ADD COLUMN size VARCHAR(255) DEFAULT 'M'");
        } catch (Exception e) {}
        try {
            jdbcTemplate.execute("ALTER TABLE cart_items ADD COLUMN color VARCHAR(255) DEFAULT ''");
        } catch (Exception e) {}
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            cart = cartRepository.save(cart);
        }
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{userId}/add")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> addToCart(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.valueOf(payload.get("productId").toString());
            int quantity = payload.containsKey("quantity") ? Integer.parseInt(payload.get("quantity").toString()) : 1;
            String size = payload.containsKey("size") ? payload.get("size").toString() : "M";
            String color = payload.containsKey("color") ? payload.get("color").toString() : "";

            Cart cart = cartRepository.findByUserId(userId).orElse(null);
            if (cart == null) {
                cart = new Cart();
                cart.setUserId(userId);
                cart.setItems(new ArrayList<>());
                cart = cartRepository.save(cart);
            }

            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

            Optional<CartItem> existingItemOpt = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId) && size.equals(item.getSize()) && color.equals(item.getColor() == null ? "" : item.getColor()))
                    .findFirst();

            int existingQty = existingItemOpt.map(CartItem::getQuantity).orElse(0);
            int newQuantity = existingQty + quantity;

            // Validate stock
            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                Optional<com.example.demo.modules.product.entity.ProductVariant> variantOpt = product.getVariants().stream()
                        .filter(v -> size.equalsIgnoreCase(v.getSize()) && (color.isEmpty() || color.equalsIgnoreCase(v.getColor() == null ? "" : v.getColor())))
                        .findFirst();
                if (variantOpt.isPresent()) {
                    int availableStock = variantOpt.get().getStock() != null ? variantOpt.get().getStock() : 0;
                    if (availableStock < newQuantity) {
                        return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " (Size " + size + (color.isEmpty() ? "" : ", Màu " + color) + ") chỉ còn " + availableStock + " sản phẩm trong kho.");
                    }
                } else {
                    return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " không có phiên bản Size " + size + (color.isEmpty() ? "" : ", Màu " + color) + ".");
                }
            } else {
                int availableStock = product.getStock() != null ? product.getStock() : 0;
                if (availableStock < newQuantity) {
                    return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " chỉ còn " + availableStock + " sản phẩm trong kho.");
                }
            }

            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                existingItem.setQuantity(newQuantity);
                cartItemRepository.save(existingItem);
            } else {
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                newItem.setSize(size);
                newItem.setColor(color);
                cartItemRepository.save(newItem);
                cart.getItems().add(newItem);
            }

            cartRepository.save(cart);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/update")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateQuantity(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.valueOf(payload.get("productId").toString());
            int quantity = Integer.parseInt(payload.get("quantity").toString());
            String size = payload.containsKey("size") ? payload.get("size").toString() : "M";
            String color = payload.containsKey("color") ? payload.get("color").toString() : "";

            Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));

            Optional<CartItem> existingItemOpt = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId) && size.equals(item.getSize()) && color.equals(item.getColor() == null ? "" : item.getColor()))
                    .findFirst();

            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                if (quantity <= 0) {
                    cartItemRepository.delete(existingItem);
                    cart.getItems().remove(existingItem);
                } else {
                    Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
                    
                    // Validate stock
                    if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                        Optional<com.example.demo.modules.product.entity.ProductVariant> variantOpt = product.getVariants().stream()
                                .filter(v -> size.equalsIgnoreCase(v.getSize()) && (color.isEmpty() || color.equalsIgnoreCase(v.getColor() == null ? "" : v.getColor())))
                                .findFirst();
                        if (variantOpt.isPresent()) {
                            int availableStock = variantOpt.get().getStock() != null ? variantOpt.get().getStock() : 0;
                            if (availableStock < quantity) {
                                return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " (Size " + size + (color.isEmpty() ? "" : ", Màu " + color) + ") chỉ còn " + availableStock + " sản phẩm trong kho.");
                            }
                        } else {
                            return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " không có phiên bản Size " + size + (color.isEmpty() ? "" : ", Màu " + color) + ".");
                        }
                    } else {
                        int availableStock = product.getStock() != null ? product.getStock() : 0;
                        if (availableStock < quantity) {
                            return ResponseEntity.badRequest().body("Sản phẩm " + product.getName() + " chỉ còn " + availableStock + " sản phẩm trong kho.");
                        }
                    }

                    existingItem.setQuantity(quantity);
                    cartItemRepository.save(existingItem);
                }
            }

            cartRepository.save(cart);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long productId, @RequestParam(defaultValue = "M") String size, @RequestParam(defaultValue = "") String color) {
        try {
            Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));

            CartItem target = null;
            for (CartItem item : cart.getItems()) {
                if (item.getProduct().getId().equals(productId) && size.equals(item.getSize()) && color.equals(item.getColor() == null ? "" : item.getColor())) {
                    target = item;
                    break;
                }
            }

            if (target != null) {
                cart.getItems().remove(target);
                cartItemRepository.delete(target);
            }

            cartRepository.save(cart);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/clear")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            
            cartRepository.save(cart);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
