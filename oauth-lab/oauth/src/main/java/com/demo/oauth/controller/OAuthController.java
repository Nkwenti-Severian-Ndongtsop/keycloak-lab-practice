package com.demo.oauth.controller;

import com.demo.oauth.model.TokenResponse;
import com.demo.oauth.model.User;
import com.demo.oauth.service.UserService;
import com.demo.oauth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/oauth")
@CrossOrigin(origins = "*")
public class OAuthController {

    @Value("${keycloak.auth-server-url}")
    private String authServerUrl;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @Value("${keycloak.redirect-uri}")
    private String redirectUri;

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    private final RestTemplate restTemplate = new RestTemplate();
    
    // In-memory store for state values (in production, use Redis or database)
    private final Map<String, Long> stateStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();
    
    // State expiration time: 10 minutes
    private static final long STATE_EXPIRATION_MS = 10 * 60 * 1000;

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestParam String code, @RequestParam(required = false) String state) {
        try {
            // Validate state parameter
            if (state == null || state.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Missing state parameter"));
            }
            
            if (!isValidState(state)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid or expired state parameter"));
            }
            
            // Remove used state to prevent replay attacks
            stateStore.remove(state);
            
            String tokenUrl = authServerUrl + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String body = UriComponentsBuilder.newInstance()
                    .queryParam("grant_type", "authorization_code")
                    .queryParam("code", code)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("client_id", clientId)
                    .queryParam("client_secret", clientSecret)
                    .build()
                    .toUriString()
                    .substring(1);

            // Debug logging
            System.out.println("Token URL: " + tokenUrl);
            System.out.println("Client ID: " + clientId);
            System.out.println("Redirect URI: " + redirectUri);
            System.out.println("Request body: " + body);

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<TokenResponse> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    entity,
                    TokenResponse.class
            );

            TokenResponse tokenData = response.getBody();
            
            // Decode JWT to get real user information from Keycloak
            Map<String, Object> userClaims = jwtUtil.decodeToken(tokenData.getIdToken());
            
            String email = jwtUtil.extractEmail(userClaims);
            String name = jwtUtil.extractName(userClaims);
            String externalId = jwtUtil.extractSub(userClaims);
            
            // Use real Keycloak user data
            User oauthUser = userService.createOrUpdateOAuthUser(name, email, externalId);

            Map<String, Object> result = new HashMap<>();
            result.put("tokens", tokenData);
            result.put("user", Map.of(
                "id", oauthUser.getId(),
                "name", oauthUser.getName(),
                "email", oauthUser.getEmail(),
                "authProvider", oauthUser.getAuthProvider()
            ));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error exchanging authorization code for tokens: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to exchange code for tokens: " + e.getMessage()));
        }
    }

    @GetMapping("/authorize")
    public ResponseEntity<String> getAuthorizationUrl() {
        // Generate unique state value
        String state = generateState();
        
        // Store state with timestamp for validation
        stateStore.put(state, System.currentTimeMillis());
        
        // Clean up expired states
        cleanupExpiredStates();
        
        String authUrl = UriComponentsBuilder.fromHttpUrl(authServerUrl + "/protocol/openid-connect/auth")
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", "openid profile email")
                .queryParam("state", state)
                .build()
                .toUriString();

        return ResponseEntity.ok(authUrl);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OAuth Backend is running!");
    }
    
    /**
     * Generate a cryptographically secure random state value
     */
    private String generateState() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    /**
     * Validate if the state parameter is valid and not expired
     */
    private boolean isValidState(String state) {
        Long timestamp = stateStore.get(state);
        if (timestamp == null) {
            return false;
        }
        
        long currentTime = System.currentTimeMillis();
        return (currentTime - timestamp) <= STATE_EXPIRATION_MS;
    }
    
    /**
     * Clean up expired state values to prevent memory leaks
     */
    private void cleanupExpiredStates() {
        long currentTime = System.currentTimeMillis();
        stateStore.entrySet().removeIf(entry ->
            (currentTime - entry.getValue()) > STATE_EXPIRATION_MS
        );
    }
}
