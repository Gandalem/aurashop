package com.aura.shop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    private String address;

    @Column(length = 20)
    private String phone;

    // 🌟 새로 추가된 부분 1: 권한 (기본값은 USER)
    @Column(nullable = false, length = 20)
    private String role = "USER";

    // 🌟 새로 추가된 부분 2: 사업자 등록번호 (일반 회원은 없으므로 nullable 허용)
    @Column(name = "business_number", length = 50)
    private String businessNumber;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}