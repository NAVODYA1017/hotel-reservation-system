package com.hotel.reservationsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Minimal security configuration for the Payment & Billing module.
 *
 * The full JWT login flow belongs to UC-01 (User Account Management,
 * Sandeepani H.G.K.). Until that security/ package is merged in, this
 * config leaves the payment API open (permitAll) so the module can be
 * demonstrated and graded standalone. When merging with the team's
 * JwtAuthenticationFilter, replace the permitAll() below with role-based
 * rules, e.g.:
 *   .requestMatchers("/api/payments/refund").hasAnyRole("RECEPTIONIST", "HOTEL_MANAGER")
 *   .requestMatchers("/api/payments/**", "/api/invoices/**").authenticated()
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

