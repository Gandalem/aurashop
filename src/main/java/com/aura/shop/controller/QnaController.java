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

    // 💡 사장님이 보낼 답변 데이터를 받을 그릇
    public record AnswerRequest(String answer) {}

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

    // 3️⃣ [답변 달기] 사장님이 특정 질문(id)에 답변을 달면 DB를 수정합니다.
    @PutMapping("/{id}/answer")
    public ResponseEntity<?> answerQuestion(@PathVariable Long id, @RequestBody AnswerRequest request) {
        // 1. 번호표(id)를 보고 DB에서 해당 질문을 찾습니다.
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 질문을 찾을 수 없습니다."));

        // 2. 답변을 적어주고, 상태를 '답변완료'로 바꿉니다.
        question.setAnswer(request.answer());
        question.setStatus("답변완료");

        // 3. 수정된 내용을 DB에 다시 저장합니다.
        questionRepository.save(question);

        return ResponseEntity.ok("답변이 성공적으로 등록되었습니다.");
    }

}