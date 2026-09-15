package com.hotel.reservationsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the plain HTML/JS frontend (opened as a local file, or served from
 * a different port than 8080) to call our REST API.
 *
 * NOTE FOR THE TEAM: if someone else already added CORS config (e.g. as part
 * of the Spring Security setup for UC-01), don't add a second one — merge
 * into a single CorsConfig / SecurityConfig instead, having two can conflict.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}

