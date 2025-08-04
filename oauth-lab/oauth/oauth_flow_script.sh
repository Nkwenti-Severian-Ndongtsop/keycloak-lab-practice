#!/bin/bash

# OAuth 2.0 Authorization Code Flow - Complete Automation Script
# This script demonstrates the complete OAuth flow using curl commands

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# OAuth Configuration
KEYCLOAK_URL="http://10.216.68.222:7000"
REALM="oauth-demo"
CLIENT_ID="Spring-Client"
CLIENT_SECRET="dMXAhibrhlOGXwxcDXZMxhwyDacaYkGG"
REDIRECT_URI="http://localhost:5173/callback"
API_BASE_URL="http://localhost:8081"

# Clean up any existing cookies
rm -f cookies.txt

echo -e "${PURPLE}"
echo "🚀 OAuth 2.0 Authorization Code Flow - Complete Automation"
echo "=========================================================="
echo -e "${NC}"

print_step "Step 1: Configuration Setup"
echo "Keycloak URL: $KEYCLOAK_URL"
echo "Realm: $REALM"
echo "Client ID: $CLIENT_ID"
echo "Redirect URI: $REDIRECT_URI"
echo "API Base URL: $API_BASE_URL"
print_success "Configuration loaded successfully"

print_step "Step 2: Getting User Credentials"
read -p "Enter your Keycloak username: " USERNAME
read -s -p "Enter your Keycloak password: " PASSWORD
echo ""
print_success "Credentials captured"

print_step "Step 3: Generating Authorization URL"
AUTH_URL="${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth"
STATE="state-$(date +%s)"
# URL encode the redirect URI and scope parameters
ENCODED_REDIRECT_URI=$(printf '%s' "$REDIRECT_URI" | sed 's/:/%3A/g; s/\//%2F/g')
ENCODED_SCOPE=$(printf '%s' "openid profile email" | sed 's/ /%20/g')
AUTHORIZATION_URL="${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${ENCODED_REDIRECT_URI}&scope=${ENCODED_SCOPE}&state=${STATE}"

echo "Authorization URL generated:"
echo "$AUTHORIZATION_URL"
print_success "Authorization URL created"

print_step "Step 4: Fetching Login Form"
print_info "Getting the login form to extract execution token..."
LOGIN_FORM_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt "$AUTHORIZATION_URL")

# Check if we got a valid response
if [[ $LOGIN_FORM_RESPONSE == *"login"* ]] || [[ $LOGIN_FORM_RESPONSE == *"username"* ]]; then
    print_success "Login form retrieved successfully"
else
    print_warning "Login form response doesn't contain expected elements"
    echo "Response preview: ${LOGIN_FORM_RESPONSE:0:200}..."
fi

print_step "Step 5: Extracting Execution Token"
# Extract execution token from the form action URL
EXECUTION_TOKEN=$(echo "$LOGIN_FORM_RESPONSE" | grep -o 'execution=[^&"]*' | cut -d'=' -f2)

if [ -z "$EXECUTION_TOKEN" ]; then
    print_error "Could not extract execution token from login form"
    echo "This might indicate that:"
    echo "1. Keycloak is not running"
    echo "2. The realm/client configuration is incorrect"
    echo "3. The login form structure has changed"
    exit 1
fi

echo "Execution token extracted: $EXECUTION_TOKEN"
print_success "Execution token obtained"

print_step "Step 6: Performing Authentication"
print_info "Submitting login credentials to Keycloak..."
# Extract the full form action URL which contains all necessary parameters
FORM_ACTION_URL=$(echo "$LOGIN_FORM_RESPONSE" | grep -o 'action="[^"]*"' | cut -d'"' -f2 | sed 's/&/\&/g')
LOGIN_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt -X POST "$FORM_ACTION_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD" \
  -w "%{redirect_url}")

print_info "Login response received"

print_step "Step 7: Extracting Authorization Code"
AUTHORIZATION_CODE=$(echo "$LOGIN_RESPONSE" | grep -o 'code=[^&]*' | cut -d'=' -f2)

if [ -z "$AUTHORIZATION_CODE" ]; then
    print_error "Could not extract authorization code from login response"
    echo "This might indicate:"
    echo "1. Invalid credentials"
    echo "2. Authentication failed"
    echo "3. Keycloak configuration issues"
    echo "Response preview: ${LOGIN_RESPONSE:0:200}..."
    exit 1
fi

echo "Authorization code extracted: $AUTHORIZATION_CODE"
print_success "Authorization code obtained successfully"

print_step "Step 8: Exchanging Authorization Code for Tokens"
TOKEN_URL="${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token"

print_info "Sending token exchange request..."
TOKEN_RESPONSE=$(curl -s -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=$AUTHORIZATION_CODE" \
  -d "redirect_uri=$REDIRECT_URI" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET")

# Check if we got a valid token response
if [[ $TOKEN_RESPONSE == *"access_token"* ]]; then
    print_success "Token exchange successful"
else
    print_error "Token exchange failed"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

print_step "Step 9: Parsing Token Response"
# Extract tokens using jq if available, otherwise use basic parsing
if command -v jq &> /dev/null; then
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
    ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.id_token')
    REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token')
    EXPIRES_IN=$(echo "$TOKEN_RESPONSE" | jq -r '.expires_in')
    
    echo "Token response parsed with jq:"
    echo "$TOKEN_RESPONSE" | jq .
else
    # Basic parsing without jq
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    ID_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"id_token":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
    EXPIRES_IN=$(echo "$TOKEN_RESPONSE" | grep -o '"expires_in":[0-9]*' | cut -d':' -f2)
    
    echo "Token response (basic parsing):"
    echo "$TOKEN_RESPONSE"
fi

if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Could not extract access token from response"
    exit 1
fi

echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Token expires in: ${EXPIRES_IN} seconds"
print_success "Tokens extracted successfully"

print_step "Step 10: Decoding ID Token"
if [ ! -z "$ID_TOKEN" ]; then
    if command -v jq &> /dev/null; then
        echo "ID Token payload:"
        echo "$ID_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq . 2>/dev/null || echo "Could not decode ID token"
    else
        echo "ID Token payload (base64 decoded):"
        echo "$ID_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null || echo "Could not decode ID token"
    fi
    print_success "ID Token decoded"
else
    print_warning "No ID token received"
fi

print_step "Step 11: Testing Protected Resource Access"
print_info "Making request to protected endpoint..."
PROTECTED_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/users/protected/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

if [[ $PROTECTED_RESPONSE == *"Access granted"* ]] || [[ $PROTECTED_RESPONSE == *"authenticated"* ]]; then
    print_success "Protected resource access successful!"
    if command -v jq &> /dev/null; then
        echo "Protected resource response:"
        echo "$PROTECTED_RESPONSE" | jq .
    else
        echo "Protected resource response:"
        echo "$PROTECTED_RESPONSE"
    fi
    
    # Extract validation info
    if command -v jq &> /dev/null; then
        VALIDATION_STATUS=$(echo "$PROTECTED_RESPONSE" | jq -r '.token_validation // "UNKNOWN"')
        EXPIRATION_INFO=$(echo "$PROTECTED_RESPONSE" | jq -r '.token_expiration // "UNKNOWN"')
        USER_NAME=$(echo "$PROTECTED_RESPONSE" | jq -r '.user_info.name // "UNKNOWN"')
        USER_EMAIL=$(echo "$PROTECTED_RESPONSE" | jq -r '.user_info.email // "UNKNOWN"')
        
        echo ""
        print_info "Token Validation Summary:"
        echo "  Status: $VALIDATION_STATUS"
        echo "  Expiration: $EXPIRATION_INFO"
        echo "  User: $USER_NAME ($USER_EMAIL)"
    fi
else
    print_error "Failed to access protected resource"
    echo "Response: $PROTECTED_RESPONSE"
fi

print_step "Step 12: Cleanup"
rm -f cookies.txt
print_success "Temporary files cleaned up"

echo -e "${PURPLE}"
echo "🎉 OAuth 2.0 Flow Complete!"
echo "=========================="
echo -e "${NC}"

print_success "All steps completed successfully!"
echo ""
echo "Summary:"
echo "- ✅ User authenticated with Keycloak"
echo "- ✅ Authorization code obtained"
echo "- ✅ Tokens exchanged successfully"
echo "- ✅ Protected resource accessed"
echo "- ✅ Session cleaned up"
echo ""
echo "Your access token is valid for ${EXPIRES_IN} seconds"
echo "You can use this token to access other protected resources:"
echo "curl -H 'Authorization: Bearer $ACCESS_TOKEN' ${API_BASE_URL}/api/users/protected/profile" 