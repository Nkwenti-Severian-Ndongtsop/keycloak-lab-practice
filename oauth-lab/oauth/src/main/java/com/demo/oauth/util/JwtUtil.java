package com.demo.oauth.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Component
public class JwtUtil {
    
    @Value("${keycloak.auth-server-url}")
    private String authServerUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Validates and decodes a JWT token
     * @param token The JWT token to validate
     * @return Map containing the token claims if valid
     * @throws RuntimeException if token is invalid
     */
    public Map<String, Object> validateAndDecodeToken(String token) {
        try {
            // Step 1: Basic JWT format validation
            validateJwtFormat(token);
            
            // Step 2: Decode the token to get claims
            Map<String, Object> claims = decodeToken(token);
            
            // Step 3: Validate token claims
            validateTokenClaims(claims);
            
            return claims;
            
        } catch (Exception e) {
            throw new RuntimeException("Token validation failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Validates the basic JWT format
     */
    private void validateJwtFormat(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Token is null or empty");
        }
        
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new RuntimeException("Invalid JWT token format - expected 3 parts, got " + parts.length);
        }
        
        // Check if parts are not empty
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].trim().isEmpty()) {
                throw new RuntimeException("JWT token part " + i + " is empty");
            }
        }
    }
    
    /**
     * Decodes the JWT token payload
     */
    public Map<String, Object> decodeToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String payload = parts[1];
            
            // Handle padding for base64 decoding
            while (payload.length() % 4 != 0) {
                payload += "=";
            }
            
            String decodedPayload = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
            return objectMapper.readValue(decodedPayload, Map.class);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode JWT token: " + e.getMessage(), e);
        }
    }
    
    /**
     * Validates token claims (expiration, issuer, audience, etc.)
     */
    private void validateTokenClaims(Map<String, Object> claims) {
        // Check if token has required claims
        if (!claims.containsKey("exp")) {
            throw new RuntimeException("Token missing expiration claim");
        }
        
        if (!claims.containsKey("iss")) {
            throw new RuntimeException("Token missing issuer claim");
        }
        
        if (!claims.containsKey("aud")) {
            throw new RuntimeException("Token missing audience claim");
        }
        
        // Validate expiration
        long expirationTime = Long.parseLong(claims.get("exp").toString());
        long currentTime = System.currentTimeMillis() / 1000; // Convert to seconds
        
        if (currentTime > expirationTime) {
            throw new RuntimeException("Token has expired. Expired at: " + expirationTime + ", Current time: " + currentTime);
        }
        
        // Validate issuer (should match Keycloak realm)
        String issuer = (String) claims.get("iss");
        String expectedIssuer = authServerUrl.replace("/protocol/openid-connect/token", "");
        if (!issuer.equals(expectedIssuer)) {
            throw new RuntimeException("Invalid token issuer. Expected: " + expectedIssuer + ", Got: " + issuer);
        }
        
        // Validate audience (should match client ID or be "account" for Keycloak)
        Object audienceObj = claims.get("aud");
        String audience = null;
        
        if (audienceObj instanceof String) {
            audience = (String) audienceObj;
        } else if (audienceObj instanceof java.util.List) {
            // Handle case where audience is an array
            java.util.List<?> audienceList = (java.util.List<?>) audienceObj;
            if (!audienceList.isEmpty()) {
                audience = audienceList.get(0).toString();
            }
        }
        
        // Accept either "Spring-Client" or "account" as valid audiences
        if (audience == null || (!audience.equals("Spring-Client") && !audience.equals("account"))) {
            throw new RuntimeException("Invalid token audience. Expected: Spring-Client or account, Got: " + audience);
        }
        
        // Check if token is not issued in the future
        if (claims.containsKey("iat")) {
            long issuedAt = Long.parseLong(claims.get("iat").toString());
            if (issuedAt > currentTime) {
                throw new RuntimeException("Token issued in the future. Issued at: " + issuedAt + ", Current time: " + currentTime);
            }
        }
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
    
    /**
     * Gets token expiration time in a readable format
     */
    public String getTokenExpirationInfo(Map<String, Object> claims) {
        if (claims.containsKey("exp")) {
            long exp = Long.parseLong(claims.get("exp").toString());
            long currentTime = System.currentTimeMillis() / 1000;
            long remainingSeconds = exp - currentTime;
            
            if (remainingSeconds <= 0) {
                return "EXPIRED";
            } else {
                long minutes = remainingSeconds / 60;
                long seconds = remainingSeconds % 60;
                return String.format("%d minutes, %d seconds remaining", minutes, seconds);
            }
        }
        return "Unknown";
    }
} 