// ═══════════════════════════════════════════════════════════════════════
// FILE : WebConfig.java
// ROLE : CORS (Cross-Origin Resource Sharing) configuration
//
// WHY IS THIS NEEDED?
//   The Spring Boot backend runs on http://localhost:8080.
//   The React frontend (Vite dev server) runs on http://localhost:5173.
//   By default, browsers BLOCK requests from one origin (domain:port)
//   to another origin – this is called the Same-Origin Policy.
//   CORS headers tell the browser: "It's okay, allow requests from
//   this other origin."
//
// WHAT DOES THIS CONFIG DO?
//   It allows the React frontend (any localhost port) to call
//   any /api/** endpoint using any HTTP method (GET, POST, PUT, DELETE, etc.).
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.config;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// @Configuration    – Marks this class as a Spring configuration class.
//                     Spring will read it at startup and apply the settings.
// CorsRegistry      – Used to register CORS mappings (which origins/methods are allowed).
// WebMvcConfigurer  – Interface that lets you customize Spring MVC behavior.
//                     Implementing addCorsMappings() adds CORS rules.
// ─────────────────────────────────────────────────────────────────────────
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration – Spring reads this class at startup.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // addCorsMappings() – configures which origins are allowed to call the API.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")                              // Apply to all /api/** URLs.
                .allowedOriginPatterns("http://localhost:*")         // Allow any localhost port.
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // Allowed HTTP methods.
                .allowedHeaders("*")                                // Allow all request headers.
                .allowCredentials(true);                            // Allow cookies/auth headers.
    }
}
