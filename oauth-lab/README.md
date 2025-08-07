# OAuth Lab

A simple overview of OAuth 2.0 authorization code flow.

## Steps

1. User starts login (redirect to Keycloak)  
2. Keycloak authenticates  
3. Keycloak returns code  
4. Client exchanges code for tokens  
5. Client uses token for API request  

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Keycloak as Keycloak Authorization Server
    participant Supabase as Supabase

    User->>Client: Request to access protected resource
    Client->>Keycloak: Redirect to Authorization Endpoint with parameters (client_id, redirect_uri, response_type=code, scope=openid)
    Keycloak->>User: Display login page
    User->>Keycloak: Enter credentials
    Keycloak->>Client: Redirect back with Authorization Code
    Client->>Supabase: Call signInWithOAuth with provider='keycloak' and redirectTo URL
    Supabase->>Keycloak: Initiate OAuth flow with the Authorization Code
    Keycloak->>Supabase: Exchange Authorization Code for Access Token, ID Token, and Refresh Token
    Supabase->>Client: Return user session data
    Client->>User: Redirect to application with authenticated session   