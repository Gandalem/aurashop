package com.aura.shop.repository;

import com.aura.shop.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    // 최신 질문이 맨 위에 오도록 생성일 기준 내림차순(최신순)으로 가져오는 메서드
    List<Question> findAllByOrderByCreatedAtDesc();
}