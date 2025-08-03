package com.demo.oauth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class JwtUtil {
    
    // For demo purposes, we'll use a simple approach
    // In production, you should verify the token signature with Keycloak's public key
    public Map<String, Object> decodeToken(String token) {
        try {
            // Split the token to get the payload part
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid JWT token format");
            }
            
            // Decode the payload (second part)
            String payload = parts[1];
            String decodedPayload = new String(java.util.Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
            
            // Parse as JSON (simplified approach)
            // In production, use a proper JSON parser
            return parseJwtPayload(decodedPayload);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode JWT token", e);
        }
    }
    
    private Map<String, Object> parseJwtPayload(String payload) {
        // Simple JSON parsing for demo
        // In production, use Jackson ObjectMapper
        Map<String, Object> claims = new java.util.HashMap<>();
        
        // Remove JSON braces
        payload = payload.replaceAll("[{}]", "");
        
        // Parse key-value pairs
        String[] pairs = payload.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2) {
                String key = keyValue[0].replaceAll("\"", "").trim();
                String value = keyValue[1].replaceAll("\"", "").trim();
                claims.put(key, value);
            }
        }
        
        return claims;
    }
    
    public String extractEmail(Map<String, Object> claims) {
        return (String) claims.get("email");
    }
    
    public String extractName(Map<String, Object> claims) {
        String name = (String) claims.get("name");
        if (name == null || name.isEmpty()) {
            // Fallback to preferred_username or sub
            name = (String) claims.get("preferred_username");
            if (name == null || name.isEmpty()) {
                name = (String) claims.get("sub");
            }
        }
        return name;
    }
    
    public String extractSub(Map<String, Object> claims) {
        return (String) claims.get("sub");
    }
} 