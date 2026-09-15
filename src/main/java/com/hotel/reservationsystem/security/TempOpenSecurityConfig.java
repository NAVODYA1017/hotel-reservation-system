package com.hotel.reservationsystem.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * TEMPORARY. spring-boot-starter-security is on the classpath, which by
 * default locks every endpoint behind a login form + a random password
 * printed in the console on startup. That makes it impossible to test
 * /api/payments and /api/invoices from the frontend right now.
 *
 * This config just opens everything up so we can develop and demo.
 *
 * ⚠️ COORDINATE WITH KAVINDI (UC-01) BEFORE ADDING THIS FILE.
 * Once real login/JWT auth exists, this file should be DELETED and replaced
 * with the real SecurityConfig that protects endpoints properly — having
 * two SecurityFilterChain beans, or this alongside the real one, will
 * conflict/break the app. Only one of you should add a file here.
 */
@Configuration
public class TempOpenSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}

