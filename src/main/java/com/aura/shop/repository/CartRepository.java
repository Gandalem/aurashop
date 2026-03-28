package com.aura.shop.repository;

import com.aura.shop.entity.Cart;
import com.aura.shop.entity.Product;
import com.aura.shop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {

    // 특정 사용자의 장바구니 목록 전체 조회
    List<Cart> findByUser(User user);

    // 특정 사용자가 특정 상품을 이미 장바구니에 담았는지 확인
    Optional<Cart> findByUserAndProduct(User user, Product product);
}