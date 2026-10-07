package com.example.demo.modules.product.controller;

import com.example.demo.modules.product.entity.Product;
import com.example.demo.modules.product.entity.ProductImage;
import com.example.demo.modules.product.entity.ProductVariant;
import com.example.demo.modules.product.repository.ProductRepository;
import com.example.demo.modules.account.entity.ActivityLog;
import com.example.demo.modules.account.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.Objects;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Cho phép mọi domain gọi API này
public class ProductController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findByIsActiveTrue();
    }
    
    @GetMapping("/admin")
    public List<Product> getAllProductsAdmin() {
        return productRepository.findAll();
    }
    
    @PostMapping
    public Product createProduct(@RequestBody Product product, @RequestHeader(value = "X-User-Name", defaultValue = "Hệ thống") String userName) {
        if (product.getIsActive() == null) {
            product.setIsActive(true);
        }
        if (product.getImages() != null) {
            product.getImages().forEach(image -> image.setProduct(product));
        }
        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setProduct(product));
        }
        Product saved = productRepository.save(product);
        activityLogRepository.save(new ActivityLog(userName, "Thêm sản phẩm", "Đã thêm sản phẩm: " + saved.getName()));
        return saved;
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails, @RequestHeader(value = "X-User-Name", defaultValue = "Hệ thống") String userName) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            product.setName(productDetails.getName());
            product.setCategoryId(productDetails.getCategoryId());
            product.setSlug(productDetails.getSlug());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setSalePrice(productDetails.getSalePrice());
            product.setStock(productDetails.getStock());
            product.setIsActive(productDetails.getIsActive());
            
            // To properly update images and variants, more logic is needed. 
            // For simple case, we clear and re-add or just ignore if not provided by frontend
            if (productDetails.getImages() != null) {
                if (product.getImages() != null) {
                    // Remove images that are not in the new list
                    List<Long> incomingIds = productDetails.getImages().stream()
                            .map(ProductImage::getId)
                            .filter(Objects::nonNull)
                            .toList();
                    product.getImages().removeIf(img -> img.getId() != null && !incomingIds.contains(img.getId()));

                    // Update existing images or add new ones
                    for (ProductImage incomingImg : productDetails.getImages()) {
                        if (incomingImg.getId() != null) {
                            Optional<ProductImage> existingOpt = product.getImages().stream()
                                    .filter(img -> img.getId().equals(incomingImg.getId()))
                                    .findFirst();
                            if (existingOpt.isPresent()) {
                                ProductImage existing = existingOpt.get();
                                existing.setImageUrl(incomingImg.getImageUrl());
                                existing.setIsMain(incomingImg.getIsMain());
                                existing.setSortOrder(incomingImg.getSortOrder());
                                existing.setColor(incomingImg.getColor());
                            }
                        } else {
                            incomingImg.setProduct(product);
                            product.getImages().add(incomingImg);
                        }
                    }
                } else {
                    productDetails.getImages().forEach(img -> img.setProduct(product));
                    product.setImages(productDetails.getImages());
                }
            }
            
            if (productDetails.getVariants() != null) {
                if (product.getVariants() != null) {
                    // Remove variants that are not in the new list
                    List<Long> incomingVarIds = productDetails.getVariants().stream()
                            .map(ProductVariant::getId)
                            .filter(Objects::nonNull)
                            .toList();
                    product.getVariants().removeIf(v -> v.getId() != null && !incomingVarIds.contains(v.getId()));

                    // Update existing variants or add new ones
                    for (ProductVariant incomingVar : productDetails.getVariants()) {
                        if (incomingVar.getId() != null) {
                            Optional<ProductVariant> existingOpt = product.getVariants().stream()
                                    .filter(v -> v.getId().equals(incomingVar.getId()))
                                    .findFirst();
                            if (existingOpt.isPresent()) {
                                ProductVariant existing = existingOpt.get();
                                existing.setSize(incomingVar.getSize());
                                existing.setColor(incomingVar.getColor());
                                existing.setStock(incomingVar.getStock());
                                existing.setPrice(incomingVar.getPrice());
                                existing.setSku(incomingVar.getSku());
                            }
                        } else {
                            incomingVar.setProduct(product);
                            product.getVariants().add(incomingVar);
                        }
                    }
                } else {
                    productDetails.getVariants().forEach(var -> var.setProduct(product));
                    product.setVariants(productDetails.getVariants());
                }
            }
            
            Product updated = productRepository.save(product);
            activityLogRepository.save(new ActivityLog(userName, "Sửa sản phẩm", "Đã cập nhật sản phẩm: " + updated.getName()));
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, @RequestHeader(value = "X-User-Name", defaultValue = "Hệ thống") String userName) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            String productName = productOptional.get().getName();
            productRepository.deleteById(id);
            activityLogRepository.save(new ActivityLog(userName, "Xóa sản phẩm", "Đã xóa sản phẩm: " + productName));
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
