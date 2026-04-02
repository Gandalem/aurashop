package com.aura.shop.repository;

import com.aura.shop.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 최신 공지가 맨 위에 오도록 생성일 기준 내림차순 정렬
    List<Notice> findAllByOrderByCreatedAtDesc();
}