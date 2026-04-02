package com.aura.shop.repository;

import com.aura.shop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
     List<Product> findByCategoryId(Integer categoryId);
    // 카테고리별 상품 조회를 위한 메서드 추가 가능
    // List<Product> findByCategoryId(Integer categoryId);
}
