# OAuth 2.0 Authorization Code Flow - Step by Step Guide

## Overview
This guide demonstrates the complete OAuth 2.0 authorization code flow using curl commands. The flow involves authenticating with Keycloak and exchanging an authorization code for access tokens.

## Prerequisites
- Keycloak server running at `http://10.216.68.222:7000`
- OAuth client configured in Keycloak realm `oauth-demo`
- Client ID: `Spring-Client`
- Client Secret: `dMXAhibrhlOGXwxcDXZMxhwyDacaYkGG`
- Redirect URI: `http://localhost:5173/callback`

---

## Step 1: Generate Authorization URL

First, we need to construct the authorization URL that will redirect the user to Keycloak for authentication.

```bash
# Construct the authorization URL manually
AUTH_URL="http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/auth"
CLIENT_ID="Spring-Client"
REDIRECT_URI="http://localhost:5173/callback"
SCOPE="openid profile email"
RESPONSE_TYPE="code"
STATE="random-state-value-$(date +%s)"

# Build the complete authorization URL
FULL_AUTH_URL="${AUTH_URL}?response_type=${RESPONSE_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}"

echo "Authorization URL:"
echo "$FULL_AUTH_URL"
```

**Expected Output:**
```
Authorization URL:
http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/auth?response_type=code&client_id=Spring-Client&redirect_uri=http://localhost:5173/callback&scope=openid profile email&state=random-state-value-1703123456
```

---

## Step 2: User Authentication (Automated)

We can automate the authentication process using curl with form-based login. This bypasses the need for manual browser interaction.

```bash
# Keycloak login endpoint
LOGIN_URL="http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/auth"

# User credentials (replace with actual credentials)
USERNAME="your_username"
PASSWORD="your_password"

# First, get the login form to extract any required tokens
LOGIN_FORM_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt "$LOGIN_URL?response_type=code&client_id=Spring-Client&redirect_uri=http://localhost:5173/callback&scope=openid profile email&state=random-state-value")

# Extract the execution token (Keycloak specific)
EXECUTION_TOKEN=$(echo "$LOGIN_FORM_RESPONSE" | grep -o 'name="execution" value="[^"]*"' | cut -d'"' -f4)

# Perform the login
LOGIN_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt -X POST "$LOGIN_URL?response_type=code&client_id=Spring-Client&redirect_uri=http://localhost:5173/callback&scope=openid profile email&state=random-state-value" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD" \
  -d "execution=$EXECUTION_TOKEN" \
  -d "client_id=Spring-Client" \
  -d "tab_id=" \
  -w "%{redirect_url}")

# Extract the authorization code from the redirect URL
AUTHORIZATION_CODE=$(echo "$LOGIN_RESPONSE" | grep -o 'code=[^&]*' | cut -d'=' -f2)

echo "Authorization Code: $AUTHORIZATION_CODE"
```



---

## Step 3: Exchange Authorization Code for Tokens

Now we'll exchange the authorization code for access tokens using the token endpoint.

```bash
# Set your authorization code (replace with the actual code from Step 2)
AUTHORIZATION_CODE="your_authorization_code_here"

# Token endpoint
TOKEN_URL="http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/token"

# Client credentials
CLIENT_ID="Spring-Client"
CLIENT_SECRET="dMXAhibrhlOGXwxcDXZMxhwyDacaYkGG"
REDIRECT_URI="http://localhost:5173/callback"

# Exchange code for tokens
curl -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=$AUTHORIZATION_CODE" \
  -d "redirect_uri=$REDIRECT_URI" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "not-before-policy": 0,
  "session_state": "12345678-1234-1234-1234-123456789012",
  "scope": "openid profile email"
}
```

---

## Step 4: Decode and Verify the ID Token

Let's decode the ID token to see the user information.

```bash
# Extract the ID token from the previous response
ID_TOKEN="your_id_token_here"

# Decode the JWT (this shows the payload without verification)
echo "$ID_TOKEN" | cut -d'.' -f2 | base64 -d | jq .
```

**Expected Output:**
```json
{
  "exp": 1703123756,
  "iat": 1703123456,
  "jti": "12345678-1234-1234-1234-123456789012",
  "iss": "http://10.216.68.222:7000/realms/oauth-demo",
  "aud": "Spring-Client",
  "sub": "12345678-1234-1234-1234-123456789012",
  "typ": "ID",
  "azp": "Spring-Client",
  "nonce": "random-nonce",
  "auth_time": 1703123456,
  "session_state": "12345678-1234-1234-1234-123456789012",
  "acr": "1",
  "email_verified": true,
  "name": "John Doe",
  "preferred_username": "johndoe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john.doe@example.com"
}
```

---

## Step 5: Use the Access Token to Access Protected Resources

Now you can use the access token to make authenticated requests to protected endpoints.

```bash
# Extract the access token from the token response
ACCESS_TOKEN="your_access_token_here"

# Make a request to a protected resource
curl -X GET "http://localhost:8081/api/protected-resource" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Step 6: Refresh Token (Optional)

If the access token expires, you can use the refresh token to get a new one.

```bash
# Extract the refresh token from the token response
REFRESH_TOKEN="your_refresh_token_here"

# Refresh the access token
curl -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

---

## Step 7: Logout (Optional)

To end the session, you can call the logout endpoint.

```bash
# Logout URL
LOGOUT_URL="http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/logout"

# Logout with redirect
curl -X GET "$LOGOUT_URL?client_id=$CLIENT_ID&post_logout_redirect_uri=http://localhost:5173"
```

---

## Complete Example Script

Here's a complete bash script that demonstrates the entire flow:

```bash
#!/bin/bash

# OAuth Configuration
KEYCLOAK_URL="http://10.216.68.222:7000"
REALM="oauth-demo"
CLIENT_ID="Spring-Client"
CLIENT_SECRET="dMXAhibrhlOGXwxcDXZMxhwyDacaYkGG"
REDIRECT_URI="http://localhost:5173/callback"

# Step 1: Generate Authorization URL
echo "=== Step 1: Generating Authorization URL ==="
AUTH_URL="${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth"
STATE="state-$(date +%s)"
AUTHORIZATION_URL="${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email&state=${STATE}"

echo "Authorization URL:"
echo "$AUTHORIZATION_URL"
echo ""
echo "Please open this URL in your browser, authenticate, and copy the authorization code from the redirect URL."
echo ""

# Step 2: Automated authentication
echo ""
echo "=== Step 2: Automated Authentication ==="

# Get user credentials
read -p "Enter your Keycloak username: " USERNAME
read -s -p "Enter your Keycloak password: " PASSWORD
echo ""

# Get the login form to extract execution token
LOGIN_FORM_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt "$AUTH_URL?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email&state=${STATE}")

# Extract the execution token
EXECUTION_TOKEN=$(echo "$LOGIN_FORM_RESPONSE" | grep -o 'name="execution" value="[^"]*"' | cut -d'"' -f4)

if [ -z "$EXECUTION_TOKEN" ]; then
    echo "Error: Could not extract execution token from login form"
    exit 1
fi

echo "Extracted execution token: $EXECUTION_TOKEN"

# Perform the login and get authorization code
LOGIN_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt -X POST "$AUTH_URL?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email&state=${STATE}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD" \
  -d "execution=$EXECUTION_TOKEN" \
  -d "client_id=$CLIENT_ID" \
  -d "tab_id=" \
  -w "%{redirect_url}")

# Extract the authorization code from the redirect URL
AUTHORIZATION_CODE=$(echo "$LOGIN_RESPONSE" | grep -o 'code=[^&]*' | cut -d'=' -f2)

if [ -z "$AUTHORIZATION_CODE" ]; then
    echo "Error: Could not extract authorization code. Login may have failed."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "Successfully obtained authorization code: $AUTHORIZATION_CODE"

# Step 3: Exchange code for tokens
echo ""
echo "=== Step 3: Exchanging Authorization Code for Tokens ==="
TOKEN_URL="${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token"

TOKEN_RESPONSE=$(curl -s -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=$AUTHORIZATION_CODE" \
  -d "redirect_uri=$REDIRECT_URI" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET")

echo "Token Response:"
echo "$TOKEN_RESPONSE" | jq .

# Extract tokens
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.id_token')
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token')

echo ""
echo "=== Step 4: Decoded ID Token ==="
echo "$ID_TOKEN" | cut -d'.' -f2 | base64 -d | jq .

echo ""
echo "=== Step 5: Using Access Token ==="
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "You can now use this token to access protected resources."

echo ""
echo "=== OAuth Flow Complete ==="
```

---

## Complete Automated Script

I've created a comprehensive script that automates the entire OAuth flow from start to finish. The script is located at `oauth_flow_script.sh` and includes:

### Features:
- ✅ **Fully automated** - No manual browser interaction required
- ✅ **Colored output** - Easy to follow progress indicators
- ✅ **Error handling** - Comprehensive error checking and reporting
- ✅ **Protected resource testing** - Automatically tests the access token
- ✅ **Token decoding** - Shows user information from ID tokens
- ✅ **Cleanup** - Removes temporary files

### Running the Script:

```bash
# Make the script executable (if not already done)
chmod +x oauth_flow_script.sh

# Run the complete OAuth flow
./oauth_flow_script.sh
```

### What the Script Does:

1. **Configuration Setup** - Loads OAuth settings
2. **User Authentication** - Prompts for credentials and authenticates with Keycloak
3. **Authorization Code Flow** - Handles the complete OAuth 2.0 authorization code flow
4. **Token Exchange** - Exchanges authorization code for access tokens
5. **Token Decoding** - Decodes and displays user information
6. **Protected Resource Access** - Tests the access token against a protected endpoint
7. **Cleanup** - Removes temporary files

### Sample Output:

```
🚀 OAuth 2.0 Authorization Code Flow - Complete Automation
==========================================================

=== Step 1: Configuration Setup ===
Keycloak URL: http://10.216.68.222:7000
Realm: oauth-demo
Client ID: Spring-Client
Redirect URI: http://localhost:5173/callback
API Base URL: http://localhost:8081
✅ Configuration loaded successfully

=== Step 2: Getting User Credentials ===
Enter your Keycloak username: testuser
Enter your Keycloak password: 
✅ Credentials captured

=== Step 3: Generating Authorization URL ===
Authorization URL generated:
http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/auth?response_type=code&client_id=Spring-Client&redirect_uri=http://localhost:5173/callback&scope=openid profile email&state=state-1703123456
✅ Authorization URL created

=== Step 4: Fetching Login Form ===
ℹ️ Getting the login form to extract execution token...
✅ Login form retrieved successfully

=== Step 5: Extracting Execution Token ===
Execution token extracted: 12345678-1234-1234-1234-123456789012
✅ Execution token obtained

=== Step 6: Performing Authentication ===
ℹ️ Submitting login credentials to Keycloak...
ℹ️ Login response received

=== Step 7: Extracting Authorization Code ===
Authorization code extracted: abc123def456ghi789
✅ Authorization code obtained successfully

=== Step 8: Exchanging Authorization Code for Tokens ===
ℹ️ Sending token exchange request...
✅ Token exchange successful

=== Step 9: Parsing Token Response ===
Token response parsed with jq:
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "not-before-policy": 0,
  "session_state": "12345678-1234-1234-1234-123456789012",
  "scope": "openid profile email"
}
Access Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Token expires in: 300 seconds
✅ Tokens extracted successfully

=== Step 10: Decoding ID Token ===
ID Token payload:
{
  "exp": 1703123756,
  "iat": 1703123456,
  "jti": "12345678-1234-1234-1234-123456789012",
  "iss": "http://10.216.68.222:7000/realms/oauth-demo",
  "aud": "Spring-Client",
  "sub": "12345678-1234-1234-1234-123456789012",
  "typ": "ID",
  "azp": "Spring-Client",
  "nonce": "random-nonce",
  "auth_time": 1703123456,
  "session_state": "12345678-1234-1234-1234-123456789012",
  "acr": "1",
  "email_verified": true,
  "name": "John Doe",
  "preferred_username": "johndoe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john.doe@example.com"
}
✅ ID Token decoded

=== Step 11: Testing Protected Resource Access ===
ℹ️ Making request to protected endpoint...
✅ Protected resource access successful!
Protected resource response:
{
  "message": "Access granted to protected resource!",
  "timestamp": 1703123456789,
  "token_preview": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_info": "This is a protected endpoint that requires a valid OAuth token",
  "status": "authenticated"
}

=== Step 12: Cleanup ===
✅ Temporary files cleaned up

🎉 OAuth 2.0 Flow Complete!
==========================

✅ All steps completed successfully!

Summary:
- ✅ User authenticated with Keycloak
- ✅ Authorization code obtained
- ✅ Tokens exchanged successfully
- ✅ Protected resource accessed
- ✅ Session cleaned up

Your access token is valid for 300 seconds
You can use this token to access other protected resources:
curl -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' http://localhost:8081/api/users/protected/profile
```

### Prerequisites:

1. **Keycloak server** running at `http://10.216.68.222:7000`
2. **Spring Boot application** running at `http://localhost:8081`
3. **User account** created in Keycloak realm `oauth-demo`
4. **jq** (optional) - for better JSON formatting

---

## Troubleshooting

### Common Issues:

1. **Invalid authorization code**: Make sure you're using the code immediately after receiving it, as codes expire quickly.

2. **Invalid redirect URI**: Ensure the redirect URI in your request matches exactly what's configured in Keycloak.

3. **Invalid client credentials**: Verify your client ID and client secret are correct.

4. **Token expiration**: Access tokens typically expire in 5-15 minutes. Use refresh tokens to get new access tokens.

### Error Responses:

```json
{
  "error": "invalid_grant",
  "error_description": "Code not valid"
}
```

```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

---

## Security Considerations

1. **Never expose client secrets** in client-side code
2. **Always use HTTPS** in production
3. **Validate tokens** on the server side
4. **Store tokens securely** and never in localStorage for production apps
5. **Implement proper logout** to invalidate sessions
6. **Use state parameter** to prevent CSRF attacks

---

## Summary

This guide demonstrates the complete OAuth 2.0 authorization code flow:

1. ✅ Generate authorization URL
2. ✅ User authenticates with Keycloak
3. ✅ Exchange authorization code for tokens
4. ✅ Decode and verify tokens
5. ✅ Use access token for API calls
6. ✅ Refresh tokens when needed
7. ✅ Logout to end session

The authorization code flow is the most secure OAuth 2.0 flow for web applications, as it keeps the client secret secure on the server side while providing a good user experience. 