package com.aura.shop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String author; // 나중에는 회원 이름이나 이메일이 들어갑니다.

    @Column(nullable = false)
    private String status; // 예: "대기중", "답변완료"

    // 🌟 여기 추가! 관리자가 작성할 답변을 저장할 공간입니다.
    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 🌟 질문이 DB에 저장되기 직전에 자동으로 현재 시간과 기본 상태를 세팅해 줍니다!
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "대기중";
        }
    }
}