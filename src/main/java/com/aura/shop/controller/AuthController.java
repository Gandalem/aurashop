package com.aura.shop.controller;

import com.aura.shop.entity.User;
import com.aura.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.aura.shop.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 리액트와 데이터를 주고받을 DTO (record 사용)
    public record SignupRequest(String email, String password, String name, String address, String phone,String role, String businessNumber) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token, String role) {}

    // 1. 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body("이미 사용 중인 이메일입니다.");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.setAddress(request.address());
        user.setPhone(request.phone());

        // 🌟 오직 판매자와 일반 회원만 가입 가능! (ADMIN은 가입 불가)
        if ("SELLER".equals(request.role())) {
            user.setRole("SELLER");
            user.setBusinessNumber(request.businessNumber());
        } else {
            user.setRole("USER");
        }

        userRepository.save(user);

        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 🌟 2. 로그인 메서드 수정
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest request) {
        // 1. 이메일로 사용자 찾기
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        // 2. 비밀번호 확인
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
        }

        // 3. 토큰 생성 (jwtUtil 방식에 맞게)
        String token = jwtUtil.generateToken(user.getEmail());

        // 🌟 4. [핵심] AuthResponse를 사용해서 '토큰'과 '권한(role)'을 같이 묶어서 리액트로 보내줍니다!
        return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
    }
}