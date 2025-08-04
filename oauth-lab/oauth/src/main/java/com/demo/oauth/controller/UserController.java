package com.demo.oauth.controller;

import com.demo.oauth.model.User;
import com.demo.oauth.service.UserService;
import com.demo.oauth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");
            
            if (name == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and password are required"));
            }
            
            User user = userService.registerUser(name, email, password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            
            Optional<User> userOpt = userService.authenticateUser(email, password);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail()
                ));
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "authProvider", user.getAuthProvider()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "authProvider", user.getAuthProvider()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/protected/profile")
    public ResponseEntity<?> getProtectedProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            
            String token = authHeader.substring(7);
            
            // Validate and decode the JWT token
            Map<String, Object> tokenClaims = jwtUtil.validateAndDecodeToken(token);
            
            // Extract user information from the validated token
            String email = jwtUtil.extractEmail(tokenClaims);
            String name = jwtUtil.extractName(tokenClaims);
            String sub = jwtUtil.extractSub(tokenClaims);
            String expirationInfo = jwtUtil.getTokenExpirationInfo(tokenClaims);
            
            // Create protected profile response
            Map<String, Object> profile = new HashMap<>();
            profile.put("message", "Access granted to protected resource!");
            profile.put("timestamp", System.currentTimeMillis());
            profile.put("token_validation", "VALID");
            profile.put("token_expiration", expirationInfo);
            profile.put("user_info", Map.of(
                "name", name != null ? name : "Unknown",
                "email", email != null ? email : "Unknown",
                "subject_id", sub != null ? sub : "Unknown"
            ));
            profile.put("token_claims", Map.of(
                "issuer", tokenClaims.get("iss"),
                "audience", tokenClaims.get("aud"),
                "issued_at", tokenClaims.get("iat"),
                "expires_at", tokenClaims.get("exp"),
                "token_type", tokenClaims.get("typ")
            ));
            profile.put("status", "authenticated");
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Token validation failed",
                "details", e.getMessage(),
                "status", "unauthorized"
            ));
        }
    }
} 