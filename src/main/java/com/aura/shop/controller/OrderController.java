package com.aura.shop.controller;

import com.aura.shop.entity.*;
import com.aura.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // 배송지 정보를 받을 DTO
    public record OrderRequest(String shippingAddress) {}

    // 현재 로그인한 사용자 정보 가져오기
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    // 🛍️ 장바구니 상품 전체 주문하기 API
    @PostMapping
    @Transactional // 중요: 이 메서드 안의 DB 작업 중 하나라도 실패하면 모두 롤백(취소)됩니다.
    public ResponseEntity<?> createOrderFromCart(@RequestBody OrderRequest request) {
        User user = getCurrentUser();
        List<Cart> cartItems = cartRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("장바구니가 비어 있습니다.");
        }

        // 1. 총 주문 금액 계산 및 재고 확인
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Cart cart : cartItems) {
            Product product = cart.getProduct();
            if (product.getStockQuantity() < cart.getQuantity()) {
                throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다.");
            }
            // 가격 * 수량
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(cart.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // 2. Orders(주문 마스터) 테이블 저장
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.shippingAddress());
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        // 3. OrderItems(주문 상세) 저장 및 Products(상품) 재고 감소
        for (Cart cart : cartItems) {
            Product product = cart.getProduct();

            // 주문 상세 기록
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cart.getQuantity());
            orderItem.setPriceAtOrder(product.getPrice()); // 현재 시점의 가격 저장
            orderItemRepository.save(orderItem);

            // 상품 재고 감소 로직
            product.setStockQuantity(product.getStockQuantity() - cart.getQuantity());
            productRepository.save(product);
        }

        // 4. 주문이 끝난 장바구니 비우기
        cartRepository.deleteAll(cartItems);

        return ResponseEntity.ok("주문이 성공적으로 완료되었습니다. (주문번호: " + savedOrder.getId() + ")");
    }

    // 📦 내 주문 내역 조회 API (마이페이지용)
    @GetMapping
    public ResponseEntity<?> getMyOrders() {
        User user = getCurrentUser();
        List<Order> myOrders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return ResponseEntity.ok(myOrders);
    }

    // 🚚 판매자용 1: 모든 고객의 주문 목록 전체 조회 API
    @GetMapping("/seller") // 👈 2. 이 코드가 반드시 있어야 함!
    public ResponseEntity<?> getAllOrdersForSeller() {
        List<Order> allOrders = orderRepository.findAll();
        return ResponseEntity.ok(allOrders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer id, @RequestBody java.util.Map<String, String> request) {

        // 1. 수정할 주문 번호 찾기
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        // 2. 리액트에서 보낸 새로운 상태값(PENDING, SHIPPED 등) 꺼내기
        String newStatus = request.get("status");

        // 3. 상태 업데이트 후 DB에 저장
        order.setStatus(newStatus);
        orderRepository.save(order);

        return ResponseEntity.ok("주문 상태가 [" + newStatus + "](으)로 변경되었습니다.");
    }
}