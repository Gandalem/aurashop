package com.aura.shop.repository;

import com.aura.shop.entity.Order;
import com.aura.shop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // 특정 사용자의 주문 내역(마이페이지용)을 최신순으로 조회
    List<Order> findByUserOrderByOrderDateDesc(User user);
}