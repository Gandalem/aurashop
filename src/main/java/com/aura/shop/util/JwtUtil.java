package com.aura.shop.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 👇 (추가) 1. Access Token 생성 (수명: 30분)
    // 👇 파라미터에 String role 추가!
    public String generateAccessToken(String email, String role) {
        long EXPIRATION_TIME = 1000 * 60 * 30; // 30분
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // 🌟 핵심! 이 명찰을 빼먹었었습니다 ㅠㅠ
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    // 👇 (추가) 2. Refresh Token 생성 (수명: 14일)
    public String generateRefreshToken(String email) {
        long EXPIRATION_TIME = 1000L * 60 * 60 * 24 * 14; // 14일 (L을 꼭 붙여야 오버플로우가 안 납니다!)
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    // 2. 토큰에서 이메일 추출 메서드 (기존과 동일)
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    // 🌟 3. (새로 추가) 토큰에서 직급(Role)을 꺼내는 메서드!
    public String getRoleFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class); // 아까 넣었던 "role"을 그대로 꺼냅니다.
    }

    // 4. 토큰 유효성 검증 메서드 (기존과 동일)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}