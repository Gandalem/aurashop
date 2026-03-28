package com.aura.shop.repository;

import com.aura.shop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // 로그인 시 이메일로 회원 정보를 가져오기 위한 메서드
    Optional<User> findByEmail(String email);

    // 회원가입 시 이메일 중복 체크를 위한 메서드
    boolean existsByEmail(String email);
}