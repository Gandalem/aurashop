package com.aura.shop.controller;

import com.aura.shop.entity.Product;
import com.aura.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    // 🌟 1. 프론트엔드에서 보낸 상품 데이터를 담을 그릇 (DTO) 생성
    public record ProductRequest(
            String name,
            Double price,
            Integer stockQuantity,
            String description,
            String imageUrl
    ) {}

    // (기존에 있던 상품 전체 조회 메서드 - 그대로 둡니다)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 🌟 2. 상품 등록을 처리하는 POST 메서드 추가
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        // 프론트에서 받은 데이터를 Product 엔티티에 세팅
        Product product = new Product();
        product.setName(request.name());
        product.setPrice(BigDecimal.valueOf(request.price()));

        // 데이터베이스 컬럼명이나 엔티티 설정에 따라 세팅 메서드가 다를 수 있습니다.
        // 기존 Product 엔티티에 있는 필드명과 맞춰주세요!
        product.setStockQuantity(request.stockQuantity());
        product.setDescription(request.description());
        product.setImageUrl(request.imageUrl());

        // DB에 저장
        productRepository.save(product);

        return ResponseEntity.ok("상품이 성공적으로 등록되었습니다.");
    }
}