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

    // 🌟 1. DTO에서 String imageUrl -> List<String> imageUrls 로 변경
    public record ProductRequest(
            Integer categoryId,
            String name,
            Double price,
            Integer stockQuantity,
            String description,
            List<String> imageUrls // 여러 장의 이미지를 받기 위해 List로 변경!
    ) {}

    // 🌟 GET: 전체 또는 카테고리별 상품 조회
    @GetMapping
    public ResponseEntity<List<Product>> getProducts(@RequestParam(required = false) Integer categoryId) {
        if (categoryId != null) {
            return ResponseEntity.ok(productRepository.findByCategoryId(categoryId));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    // 🌟 상품 등록 API
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductRequest request) {
        Product product = new Product();
        product.setCategoryId(request.categoryId());
        product.setName(request.name());
        product.setPrice(BigDecimal.valueOf(request.price()));
        product.setStockQuantity(request.stockQuantity());
        product.setDescription(request.description());

        // 🌟 여러 장의 이미지를 저장
        product.setImageUrls(request.imageUrls());

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    // 🌟 개별 상품 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품을 찾을 수 없습니다. ID: " + id));
        return ResponseEntity.ok(product);
    }

    // 📦 상품 수정 API (판매자용)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        // 내용 업데이트
        product.setCategoryId(request.categoryId());
        product.setName(request.name());
        product.setPrice(BigDecimal.valueOf(request.price()));
        product.setStockQuantity(request.stockQuantity());
        product.setDescription(request.description());

        // 🌟 수정 시에도 이미지 리스트로 덮어쓰기
        product.setImageUrls(request.imageUrls());

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
            return ResponseEntity.status(400).body("누군가 장바구니에 담았거나 이미 결제된 상품은 삭제할 수 없습니다. (품절 처리를 이용해주세요!)");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("상품 삭제 중 오류가 발생했습니다.");
        }
    }
}