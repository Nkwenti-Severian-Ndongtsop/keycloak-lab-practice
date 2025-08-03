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

import java.util.HashMap;
import java.util.Map;

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

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestParam String code) {
        try {
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
        String authUrl = UriComponentsBuilder.fromHttpUrl(authServerUrl + "/protocol/openid-connect/auth")
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", "openid profile email")
                .queryParam("state", "random-state-value")
                .build()
                .toUriString();

        return ResponseEntity.ok(authUrl);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OAuth Backend is running!");
    }
}
