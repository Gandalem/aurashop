package com.aura.shop.config;

import com.aura.shop.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 전역 설정 연결 (중요!)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (JWT를 사용하므로 필요 없음)
                .csrf(csrf -> csrf.disable())

                // 3. 세션을 사용하지 않음 (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 🌟 1. 리액트의 찌르기(OPTIONS) 요청을 보안 필터 없이 무조건 통과!
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/files/**", "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()

                        // 🌟 2. DB에 권한이 SELLER, ROLE_SELLER 무엇으로 저장되어 있든 다 통과!
                        .requestMatchers("/api/orders/seller", "/api/orders/*/status").hasAuthority("SELLER")

                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )

                // 5. JWT 필터를 기본 인증 필터 앞에 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🔑 CORS 통행증 발급 세부 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Vite(5173)와 CRA(3000) 포트 모두 허용
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));

        // OPTIONS 메서드 허용 (Preflight 요청 통과를 위해 매우 중요!)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 모든 헤더 허용 (Authorization 등)
        configuration.setAllowedHeaders(List.of("*"));

        // 쿠키나 인증 정보를 포함한 요청을 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 주소(/**)에 이 설정을 적용
        return source;
    }
}