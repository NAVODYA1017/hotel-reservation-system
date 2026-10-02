// ═══════════════════════════════════════════════════════════════════════
// FILE : SecurityConfig.java
// ROLE : Spring Security configuration
//
// WHY IS THIS NEEDED?
//   spring-boot-starter-security is in pom.xml, so Spring Security
//   is active. By DEFAULT, it blocks ALL requests and shows a login page.
//   This config DISABLES that default behavior for development, allowing
//   all API requests without authentication.
//
// WHAT IS CSRF?
//   CSRF (Cross-Site Request Forgery) protection prevents malicious websites
//   from sending requests on behalf of a logged-in user. It's disabled here
//   because we're building a REST API (stateless, no cookies/sessions).
//   REST APIs typically use token-based auth (Bearer tokens) instead.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.security;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// @Bean                – Makes the returned object a Spring-managed bean.
// @Configuration       – Marks this as a Spring configuration class.
// HttpSecurity         – Builder for configuring HTTP security rules.
// @EnableWebSecurity   – Enables Spring Security and allows customization.
// SecurityFilterChain  – The chain of security filters that process every request.
// ─────────────────────────────────────────────────────────────────────────
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration       // Spring reads this at startup.
@EnableWebSecurity   // Enables Spring Security with custom configuration.
public class SecurityConfig {

    // @Bean – creates a SecurityFilterChain bean that Spring Security uses.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF protection – not needed for stateless REST APIs.
            // REST APIs use Bearer tokens (in Authorization header) instead of cookies.
            .csrf(csrf -> csrf.disable())
            // Allow ALL requests without authentication (development mode).
            // In production, you would restrict endpoints by role:
            //   .requestMatchers("/api/admin/**").hasRole("ADMIN")
            //   .requestMatchers("/api/rooms/**").permitAll()
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // Allow everything without login.
            );
        // Build and return the security filter chain.
        return http.build();
    }
}
