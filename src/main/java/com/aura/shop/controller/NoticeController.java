package com.aura.shop.controller;

import com.aura.shop.entity.Notice;
import com.aura.shop.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeRepository noticeRepository;

    public record NoticeRequest(String title, String content) {}

    // 1️⃣ [공지사항 등록] (사장님 전용 기능)
    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody NoticeRequest request) {
        Notice notice = Notice.builder()
                .title(request.title())
                .content(request.content())
                .build();
        noticeRepository.save(notice);
        return ResponseEntity.ok("공지사항이 등록되었습니다.");
    }

    // 2️⃣ [공지사항 조회] (모두 볼 수 있는 기능)
    @GetMapping
    public ResponseEntity<List<Notice>> getNotices() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByCreatedAtDesc());
    }
}