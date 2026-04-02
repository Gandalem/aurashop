package com.aura.shop.controller;

import org.springframework.dao.DataIntegrityViolationException;
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
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new IllegalArgumentException("해당 상품을 찾을 수 없습니다. ID: " + id));
        return ResponseEntity.ok(product);
    }

    // 📦 상품 수정 API (판매자용)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        // 내용 업데이트
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setDescription(productDetails.getDescription());
        product.setImageUrl(productDetails.getImageUrl());

        Product updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(updatedProduct);
    }

    // 🗑️ 상품 삭제 API (판매자용)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        try {
            productRepository.deleteById(id);
            return ResponseEntity.ok("상품이 성공적으로 삭제되었습니다.");

        } catch (DataIntegrityViolationException e) {
            // DB에서 "주문 내역이 있어서 못 지워!" 라고 할 때
            return ResponseEntity.status(400).body("누군가 장바구니에 담았거나 이미 결제된 상품은 삭제할 수 없습니다. (품절 처리를 이용해주세요!)");

        } catch (Exception e) {
            // 그 외 알 수 없는 에러
            return ResponseEntity.status(500).body("상품 삭제 중 오류가 발생했습니다.");
        }
    }

}