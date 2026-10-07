package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/products/**", "/api/orders/**", "/api/cart/**", "/api/payment/**", "/api/shipping/**", "/api/stats/**", "/api/users/**", "/api/activity-logs/**", "/api/reviews/**", "/api/promotions/**", "/api/upload/**", "/uploads/**", "/error").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
