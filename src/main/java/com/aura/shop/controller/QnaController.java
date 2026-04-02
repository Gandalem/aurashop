package com.aura.shop.controller;

import com.aura.shop.entity.Question;
import com.aura.shop.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qna")
@RequiredArgsConstructor
public class QnaController {

    private final QuestionRepository questionRepository;

    // 💡 리액트에서 보낼 JSON 데이터를 받을 그릇(DTO)
    public record QuestionRequest(String title, String content, String author) {}

    // 1️⃣ [질문 등록하기] 리액트에서 질문을 보내면 DB에 저장합니다.
    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody QuestionRequest request) {
        Question newQuestion = Question.builder()
                .title(request.title())
                .content(request.content())
                .author(request.author() != null ? request.author() : "익명 사용자")
                .build();

        // DB에 저장 (createdAt과 status는 Entity의 @PrePersist가 알아서 채워줍니다!)
        questionRepository.save(newQuestion);

        return ResponseEntity.ok("질문이 성공적으로 등록되었습니다.");
    }

    // 2️⃣ [질문 목록 불러오기] DB에 있는 모든 질문을 최신순으로 꺼내서 리액트에게 줍니다.
    @GetMapping
    public ResponseEntity<List<Question>> getQuestions() {
        List<Question> questions = questionRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(questions);
    }
}