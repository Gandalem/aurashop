package com.aura.shop.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // 암호화 키 (실제 운영 환경에서는 application.yml에 길고 복잡한 문자로 숨겨서 사용해야 합니다)
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 토큰 만료 시간 (예: 24시간)
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    // 1. 토큰 생성 메서드
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // 토큰 내용에 이메일 저장
                .setIssuedAt(new Date()) // 발행 시간
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 만료 시간
                .signWith(key) // 비밀 키로 서명 (위변조 방지)
                .compact();
    }

    // 2. 토큰에서 이메일 추출 메서드
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. 토큰 유효성 검증 메서드
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // 토큰이 조작되었거나, 만료되었을 경우 false 반환
            return false;
        }
    }
}