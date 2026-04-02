package com.aura.shop.controller;

import com.aura.shop.entity.User;
import com.aura.shop.repository.UserRepository;
import com.aura.shop.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse; // 추가!
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate; // 추가!
import org.springframework.http.HttpHeaders; // 추가!
import org.springframework.http.ResponseCookie; // 추가!
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit; // 추가!

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 👇 (핵심) Redis를 사용하기 위한 템플릿 주입!
    private final RedisTemplate<String, String> redisTemplate;

    public record SignupRequest(String email, String password, String name, String address, String phone,String role, String businessNumber) {}
    public record LoginRequest(String email, String password) {}

    // 👇 (추가) 응답용 DTO
    public record LoginResponse(String accessToken, String role) {}

    // 1. 회원가입 API (기존과 동일)
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest request) {
        // ... 기존 회원가입 로직 유지 ...
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 2. 로그인 API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {

        // 🚨 1. DB에서 이메일로 진짜 유저 찾기!
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        // 🚨 2. 입력한 비밀번호와 DB의 암호화된 비밀번호 짝 맞추기!
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(401).body("비밀번호가 일치하지 않습니다.");
        }

        // 비밀번호가 맞으면 당당하게 이메일과 직급(role) 꺼내기
        String email = user.getEmail();
        String role = user.getRole(); // 🌟 이 코드가 빠져서 에러가 났던 것입니다! (직급 꺼내기)

        // 3. Access Token & Refresh Token 생성
        String accessToken = jwtUtil.generateAccessToken(email, role); // 이제 role이 뭔지 압니다!
        String refreshToken = jwtUtil.generateRefreshToken(email);

        // 4. Redis에 Refresh Token 저장
        redisTemplate.opsForValue().set(
                "RT:" + email,
                refreshToken,
                14, TimeUnit.DAYS
        );

        // 5. Refresh Token을 HttpOnly 쿠키로 만들기
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // 로컬 테스트용
                .path("/")
                .maxAge(14 * 24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 6. Access Token 응답
        return ResponseEntity.ok(new LoginResponse(accessToken, role)); // 여기도 정상 작동!
    }

    // 3. 토큰 재발급 API
    @PostMapping("/reissue")
    public ResponseEntity<?> reissue(@CookieValue(name = "refreshToken") String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body("Refresh Token이 만료/손상되었습니다.");
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);

        // 🌟 DB에서 유저를 다시 찾아서 진짜 직급(role)을 가져옵니다.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        String redisRefreshToken = redisTemplate.opsForValue().get("RT:" + email);
        if (!refreshToken.equals(redisRefreshToken)) {
            return ResponseEntity.status(403).body("유효하지 않은 Refresh Token입니다. 강제 로그아웃!");
        }

        // 🌟 새 토큰에도 명찰(role) 달아주기
        String newAccessToken = jwtUtil.generateAccessToken(email, user.getRole());
        return ResponseEntity.ok(new LoginResponse(newAccessToken, user.getRole()));
    }
}