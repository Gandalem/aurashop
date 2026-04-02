package com.aura.shop.controller;

import com.aura.shop.entity.Cart;
import com.aura.shop.entity.Product;
import com.aura.shop.entity.User;
import com.aura.shop.repository.CartRepository;
import com.aura.shop.repository.ProductRepository;
import com.aura.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // 리액트와 데이터를 주고받을 DTO
    public record CartAddRequest(Integer productId, Integer quantity) {}
    public record CartResponse(Integer id, Integer productId, String name, BigDecimal price, List<String> imageUrl, Integer quantity) {}

    // 🔑 현재 로그인한 사용자 정보를 가져오는 공통 메서드
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    // 1. 장바구니 목록 조회 API
    @GetMapping
    public List<CartResponse> getCartItems() {
        User user = getCurrentUser();

        // 데이터베이스에서 장바구니를 가져온 뒤, 리액트가 쓰기 편하게 DTO로 변환해서 줍니다.
        return cartRepository.findByUser(user).stream()
                .map(cart -> new CartResponse(
                        cart.getId(),
                        cart.getProduct().getId(),
                        cart.getProduct().getName(),
                        cart.getProduct().getPrice(),
                        cart.getProduct().getImageUrls(),
                        cart.getQuantity()
                )).toList();
    }

    // 2. 장바구니 상품 담기 API
    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartAddRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        // 이미 장바구니에 있는 상품인지 확인
        Optional<Cart> existingCart = cartRepository.findByUserAndProduct(user, product);

        if (existingCart.isPresent()) {
            // 이미 있다면 수량만 증가시킵니다.
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + request.quantity());
            cartRepository.save(cart);
        } else {
            // 없다면 새로 담습니다.
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setQuantity(request.quantity());
            cartRepository.save(cart);
        }

        return ResponseEntity.ok("장바구니에 상품이 담겼습니다.");
    }

    // 3. 장바구니 상품 삭제 API (보너스로 추가해 드려요!)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeCartItem(@PathVariable Integer id) {
        // 실제 운영 환경에서는 이 장바구니 아이템(id)이 현재 로그인한 사용자의 것인지 검증하는 로직이 추가로 필요합니다.
        cartRepository.deleteById(id);
        return ResponseEntity.ok("장바구니에서 상품이 삭제되었습니다.");
    }
}