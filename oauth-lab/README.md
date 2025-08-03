# OAuth Lab - Spring Boot + React + Keycloak

A complete OAuth 2.0 implementation with Spring Boot backend, React frontend, and Keycloak identity provider.

## 📋 Prerequisites

- **Java 21** (or Java 17+)
- **Node.js 18+** and npm
- **Docker** and Docker Compose

## 🚀 Quick Start

### Step 0: Clone and Setup Project

1. **Clone the repository on your VM**:
   - Run: `git clone https://github.com/Nkwenti-Severian-Ndongtsop/keycloak-lab-practice.git`
   - Navigate to: `cd keycloak-lab-practice/oauth-lab`
   - Verify you see: `oauth/`, `oauth-client/`, `docker-compose.yml`, `README.md`

### Step 1: Start Keycloak and PostgreSQL

1. **Start the services**:
   - Run: `cd oauth && docker compose up -d`
   - Verify with: `docker ps`

### Step 2: Configure Keycloak

1. **Access Keycloak Admin Console**:
   - Open: `http://localhost:7000/admin`
   - Login with: 
      - user: `ankwenti` 
      - password: `password`

2. **Create Realm**:
   - Click "Create Realm"
   - Name: `oauth-demo`
   - Click "Create"

3. **Create Client**:
   - Go to "Clients" → "Create"
   - Client ID: `Spring-Client`
   - Client Protocol: `openid-connect`
   - Click "Save"

4. **Configure Client Settings**:
   - **Valid Redirect URIs**: `http://localhost:5173/callback`
   - **Web Origins**: `http://localhost:5173`
   - Click "Save"

5. **Get Client Secret**:
   - Go to "Credentials" tab
   - Copy the client secret (you'll need this for the backend)

6. **Create User**:
   - Go to "Users" → "Add User"
   - Username: `testuser`
   - Email: `test@example.com`
   - First Name: `Test`
   - Last Name: `User`
   - Click "Save"
   - Go to "Credentials" tab
   - Set password: `password123`
   - Turn off "Temporary"
   - Click "Save"

### Step 3: Configure Backend

1. **Update application.yml**:
   - File: `oauth/src/main/resources/application.yml`
   - Update these fields:
     - `spring.datasource.url`: Change to `jdbc:postgresql://localhost:5432/oauth-demo`
     - `keycloak.auth-server-url`: Change to `http://localhost:7000/realms/oauth-demo`
     - `keycloak.client-secret`: Replace with your actual client secret from Keycloak

2. **Start the Spring Boot backend**:
   - Navigate to: `cd oauth`
   - Run: `./gradlew bootRun`

3. **Verify backend is running**:
   - Run: `curl http://localhost:8081/oauth/health`
   - Should return: `OAuth Backend is running!`

### Step 4: Start Frontend

1. **Install dependencies**:
   - Navigate to: `cd oauth-client`
   - Run: `npm install`

2. **Start the React app**:
   - Run: `npm run dev`

3. **Access the application**:
   - Open: `http://localhost:5173`

## 🧪 Testing the Application

### Test Local Authentication

1. **Register a new account**:
   - Click "Register" tab
   - Fill in: Name, Email, Password
   - Click "Create Account"

2. **Login with local account**:
   - Click "Login" tab
   - Enter email and password
   - Click "Sign In"

### Test Keycloak OAuth

1. **Logout first** (if logged in):
   - Click "Sign Out"

2. **Login with Keycloak**:
   - Click "Continue with Keycloak"
   - You'll be redirected to Keycloak login page
   - Login with: `testuser` / `password123`
   - You'll be redirected back with real user data

## 🎯 Quick Setup Checklist

- [ ] Cloned the repository
- [ ] Started Keycloak and PostgreSQL
- [ ] Created Keycloak realm and client
- [ ] Updated `application.yml` with localhost and client secret
- [ ] Started Spring Boot backend
- [ ] Started React frontend
- [ ] Tested local authentication
- [ ] Tested Keycloak OAuth flow

## 🔧 Troubleshooting

### Common Issues

#### 1. **401 Unauthorized Error**
**Cause**: Client ID or secret mismatch
**Solution**:
- Verify client ID in Keycloak matches the one in `application.yml`
- Check client secret in `application.yml` matches Keycloak
- Ensure client is `confidential` type

#### 2. **Database Connection Error**
**Cause**: PostgreSQL not accessible
**Solution**:
```bash
# Check if PostgreSQL port is exposed
telnet localhost 5432

# Restart Docker containers
docker-compose down && docker-compose up -d
```


### Debug Commands

```bash
# Test Keycloak connectivity
curl -X GET "http://localhost:7000/realms/oauth-demo/.well-known/openid_configuration"

# Test backend authorization URL
curl -X GET "http://localhost:8081/oauth/authorize"

# Check backend health
curl -X GET "http://localhost:8081/oauth/health"

# Test database connection
telnet localhost 5432
```


## 🔐 Security Features

- **OAuth 2.0 Authorization Code Flow**
- **JWT Token Decoding**
- **BCrypt Password Hashing**
- **CORS Configuration**
- **Database User Persistence**