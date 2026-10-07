package com.example.demo.modules.product.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long categoryId;
    private String name;
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double price;
    private Double salePrice;
    private Integer stock;
    private Boolean isActive;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ProductImage> images;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getSalePrice() { return salePrice; }
    public void setSalePrice(Double salePrice) { this.salePrice = salePrice; }

    public Integer getStock() { 
        if (variants != null && !variants.isEmpty()) {
            return variants.stream()
                           .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                           .sum();
        }
        return stock; 
    }
    public void setStock(Integer stock) { this.stock = stock; }

    public void syncStock() {
        if (variants != null && !variants.isEmpty()) {
            this.stock = variants.stream()
                    .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                    .sum();
        }
    }

    @PrePersist
    @PreUpdate
    public void preSave() {
        syncStock();
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ProductVariant> variants;

    public List<ProductVariant> getVariants() { return variants; }
    public void setVariants(List<ProductVariant> variants) { this.variants = variants; }
}
