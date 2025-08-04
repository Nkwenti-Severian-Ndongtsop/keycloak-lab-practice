# JWT Token Validation Explained

## Overview
When a client makes a request to a protected endpoint with a Bearer token, the application performs comprehensive validation to ensure the token is legitimate and valid. Here's exactly how it works:

## The Validation Process

### Step 1: Token Extraction
```java
// In UserController.getProtectedProfile()
String token = authHeader.substring(7); // Remove "Bearer " prefix
```
**What happens:** Extracts the JWT token from the Authorization header by removing the "Bearer " prefix.

**Example:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9.signature
```
**Extracted token:** `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9.signature`

---

### Step 2: JWT Format Validation
```java
private void validateJwtFormat(String token) {
    // Check if token is null or empty
    if (token == null || token.trim().isEmpty()) {
        throw new RuntimeException("Token is null or empty");
    }
    
    // Split into 3 parts: header.payload.signature
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
```

**What happens:** Validates the basic JWT structure.

**Checks:**
- ✅ Token is not null or empty
- ✅ Token has exactly 3 parts separated by dots
- ✅ Each part is not empty

**Example valid JWT structure:**
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9.signature
│                                                                                                 │
├─ Header (eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9)                                               │
├─ Payload (eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9) │
└─ Signature (signature)                                                                        │
```

---

### Step 3: Token Decoding
```java
public Map<String, Object> decodeToken(String token) {
    String[] parts = token.split("\\.");
    String payload = parts[1]; // Get the payload part
    
    // Handle padding for base64 decoding
    while (payload.length() % 4 != 0) {
        payload += "=";
    }
    
    // Decode base64 URL encoding
    String decodedPayload = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
    
    // Parse JSON into Map
    return objectMapper.readValue(decodedPayload, Map.class);
}
```

**What happens:** Decodes the JWT payload to extract the claims.

**Process:**
1. **Extract payload** (second part of JWT)
2. **Add padding** if needed for base64 decoding
3. **Decode base64** URL encoding
4. **Parse JSON** into a Map object

**Example:**
```
Encoded payload: eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9

Decoded payload: {"sub":"1234567890","name":"John Doe","exp":1703123756,"iss":"http://10.216.68.222:7000/realms/oauth-demo","aud":"Spring-Client"}

Parsed Map: {
  "sub": "1234567890",
  "name": "John Doe", 
  "exp": 1703123756,
  "iss": "http://10.216.68.222:7000/realms/oauth-demo",
  "aud": "Spring-Client"
}
```

---

### Step 4: Claims Validation
```java
private void validateTokenClaims(Map<String, Object> claims) {
    // Check required claims exist
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
    long currentTime = System.currentTimeMillis() / 1000;
    
    if (currentTime > expirationTime) {
        throw new RuntimeException("Token has expired. Expired at: " + expirationTime + ", Current time: " + currentTime);
    }
    
    // Validate issuer
    String issuer = (String) claims.get("iss");
    String expectedIssuer = authServerUrl.replace("/protocol/openid-connect/token", "");
    if (!issuer.equals(expectedIssuer)) {
        throw new RuntimeException("Invalid token issuer. Expected: " + expectedIssuer + ", Got: " + issuer);
    }
    
    // Validate audience
    String audience = (String) claims.get("aud");
    if (!"Spring-Client".equals(audience)) {
        throw new RuntimeException("Invalid token audience. Expected: Spring-Client, Got: " + audience);
    }
    
    // Check not issued in future
    if (claims.containsKey("iat")) {
        long issuedAt = Long.parseLong(claims.get("iat").toString());
        if (issuedAt > currentTime) {
            throw new RuntimeException("Token issued in the future. Issued at: " + issuedAt + ", Current time: " + currentTime);
        }
    }
}
```

**What happens:** Validates each claim in the token.

**Validation Checks:**

#### 4.1 Required Claims Check
- ✅ **exp** (expiration) - Must be present
- ✅ **iss** (issuer) - Must be present  
- ✅ **aud** (audience) - Must be present

#### 4.2 Expiration Validation
```java
long expirationTime = 1703123756; // From token
long currentTime = System.currentTimeMillis() / 1000; // Current time in seconds

if (currentTime > expirationTime) {
    // Token has expired
}
```

**Example:**
- Token expires: `1703123756` (Dec 21, 2023 15:35:56 UTC)
- Current time: `1703124000` (Dec 21, 2023 15:40:00 UTC)
- **Result:** ❌ Token expired (current time > expiration time)

#### 4.3 Issuer Validation
```java
String issuer = "http://10.216.68.222:7000/realms/oauth-demo"; // From token
String expectedIssuer = "http://10.216.68.222:7000/realms/oauth-demo"; // From config

if (!issuer.equals(expectedIssuer)) {
    // Invalid issuer
}
```

**Example:**
- Token issuer: `http://10.216.68.222:7000/realms/oauth-demo`
- Expected issuer: `http://10.216.68.222:7000/realms/oauth-demo`
- **Result:** ✅ Valid issuer

#### 4.4 Audience Validation
```java
String audience = "Spring-Client"; // From token
String expectedAudience = "Spring-Client"; // Hardcoded client ID

if (!"Spring-Client".equals(audience)) {
    // Invalid audience
}
```

**Example:**
- Token audience: `Spring-Client`
- Expected audience: `Spring-Client`
- **Result:** ✅ Valid audience

#### 4.5 Issued At Validation
```java
long issuedAt = 1703123456; // From token
long currentTime = System.currentTimeMillis() / 1000;

if (issuedAt > currentTime) {
    // Token issued in the future
}
```

**Example:**
- Token issued: `1703123456` (Dec 21, 2023 15:30:56 UTC)
- Current time: `1703124000` (Dec 21, 2023 15:40:00 UTC)
- **Result:** ✅ Valid (issued in past)

---

## Complete Validation Flow Example

### Input Request:
```bash
curl -X GET 'http://localhost:8081/api/users/protected/profile' \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9.signature'
```

### Validation Steps:

1. **Extract Token:** `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzAzMTIzNzU2LCJpc3MiOiJodHRwOi8vMTAuMjE2LjY4LjIyMjo3MDAwL3JlYWxtcy9vYXV0aC1kZW1vIiwiYXVkIjoiU3ByaW5nLUNsaWVudCJ9.signature`

2. **Format Check:** ✅ 3 parts, all non-empty

3. **Decode Payload:** 
   ```json
   {
     "sub": "1234567890",
     "name": "John Doe",
     "exp": 1703123756,
     "iss": "http://10.216.68.222:7000/realms/oauth-demo",
     "aud": "Spring-Client",
     "iat": 1703123456
   }
   ```

4. **Claims Validation:**
   - ✅ **exp** present: `1703123756`
   - ✅ **iss** present: `http://10.216.68.222:7000/realms/oauth-demo`
   - ✅ **aud** present: `Spring-Client`
   - ✅ **Not expired:** Current time < expiration time
   - ✅ **Valid issuer:** Matches Keycloak realm
   - ✅ **Valid audience:** Matches client ID
   - ✅ **Not future-dated:** Issued in past

5. **Extract User Info:**
   - Name: `John Doe`
   - Email: `john.doe@example.com` (if present)
   - Subject ID: `1234567890`

### Success Response:
```json
{
  "message": "Access granted to protected resource!",
  "timestamp": 1703123456789,
  "token_validation": "VALID",
  "token_expiration": "4 minutes, 30 seconds remaining",
  "user_info": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject_id": "1234567890"
  },
  "token_claims": {
    "issuer": "http://10.216.68.222:7000/realms/oauth-demo",
    "audience": "Spring-Client",
    "issued_at": 1703123456,
    "expires_at": 1703123756,
    "token_type": "Bearer"
  },
  "status": "authenticated"
}
```

---

## Common Validation Failures

### 1. Expired Token
```json
{
  "error": "Token validation failed",
  "details": "Token has expired. Expired at: 1703123756, Current time: 1703124000",
  "status": "unauthorized"
}
```

### 2. Invalid Issuer
```json
{
  "error": "Token validation failed", 
  "details": "Invalid token issuer. Expected: http://10.216.68.222:7000/realms/oauth-demo, Got: http://malicious-server.com",
  "status": "unauthorized"
}
```

### 3. Invalid Audience
```json
{
  "error": "Token validation failed",
  "details": "Invalid token audience. Expected: Spring-Client, Got: Different-Client",
  "status": "unauthorized"
}
```

### 4. Malformed Token
```json
{
  "error": "Token validation failed",
  "details": "Invalid JWT token format - expected 3 parts, got 2",
  "status": "unauthorized"
}
```

---

## Security Benefits

This validation ensures:

1. **Token Integrity:** Valid JWT format and structure
2. **Token Authenticity:** Issued by the correct Keycloak realm
3. **Token Authorization:** Intended for the correct client application
4. **Token Freshness:** Not expired and not issued in the future
5. **User Identification:** Extracts verified user information from claims

The validation happens **server-side** and **before** any protected resource access, ensuring only valid, legitimate tokens can access protected endpoints. 