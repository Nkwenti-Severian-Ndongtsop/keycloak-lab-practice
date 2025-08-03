# OAuth Authorization Code Flow Demo

This project demonstrates a complete OAuth 2.0 Authorization Code flow with Keycloak, including both backend and frontend components.

## 🏗️ Project Structure

```
oauth-lab/
├── oauth/                    # Spring Boot Backend
│   ├── src/main/java/com/demo/oauth/
│   │   ├── OauthBackendApplication.java
│   │   ├── controller/
│   │   │   ├── OAuthController.java
│   │   │   └── UserController.java
│   │   ├── model/
│   │   │   ├── TokenResponse.java
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── service/
│   │   │   └── UserService.java
│   │   └── config/
│   │       └── SecurityConfig.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── build.gradle
│   └── docker-compose.yml
└── oauth-client/            # React Frontend
    ├── src/
    │   ├── App.tsx
    │   ├── App.css
    │   └── main.tsx
    └── package.json
```

## 🌐 Network Architecture

This setup uses a **distributed architecture**:

- **Frontend (React)**: Runs locally on your machine at `localhost:5173`
- **Backend (Spring Boot)**: Runs locally on your machine at `localhost:8081`
- **Keycloak**: Runs on multipass instance at `10.216.68.222:7000`
- **Database (PostgreSQL)**: Runs on multipass instance at `10.216.68.222:5432`

## 🚀 Quick Start

### 1. Start Keycloak on Multipass Instance
```bash
# SSH into your multipass instance
ssh ubuntu@10.216.68.222

# Navigate to the oauth directory
cd oauth-lab/oauth

# Start Keycloak and PostgreSQL
docker-compose up -d
```

### 2. Start Spring Boot Backend (Local Machine)
```bash
# On your local machine
cd oauth-lab/oauth
./gradlew bootRun
```
Backend will be available at: http://localhost:8081

### 3. Start React Frontend (Local Machine)
```bash
# On your local machine
cd oauth-lab/oauth-client
npm install
npm run dev
```
Frontend will be available at: http://localhost:5173

## 🔧 Configuration

### Keycloak Setup (Multipass Instance)
1. Access Keycloak admin console: http://10.216.68.222:7000
2. Login with: `nkwenti` / `password`
3. Create a realm called `oauth-demo`
4. Create a client called `spring-client`
5. Set redirect URI to: `http://localhost:5173/callback`
6. Copy the client secret and update `application.yml`

### Backend Configuration
The `oauth/src/main/resources/application.yml` is already configured:
```yaml
keycloak:
  realm: oauth-demo
  auth-server-url: http://10.216.68.222:7000/realms/oauth-demo
  client-id: spring-client
  client-secret: your-client-secret-here
  redirect-uri: http://localhost:5173/callback
```

### Frontend Configuration
The React app is configured to connect to:
- Backend API: `http://localhost:8081`
- OAuth endpoints: `http://localhost:8081/oauth/*`

## 🎯 Features

### Backend Features
- **User Management**: JPA entities with H2 database
- **Password Encryption**: BCrypt hashing
- **OAuth Integration**: Token exchange with Keycloak
- **REST APIs**: User registration, login, and OAuth endpoints
- **Security**: CORS enabled, password encoding

### Frontend Features
- **Modern UI**: Beautiful React login page
- **Dual Authentication**: Local accounts + Keycloak OAuth
- **Form Validation**: Real-time validation and error handling
- **Responsive Design**: Works on all devices
- **Session Management**: Persistent login state

## 📡 API Endpoints

### User Management
```bash
# Register user
POST http://localhost:8081/api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Login user
POST http://localhost:8081/api/users/login
{
  "email": "john@example.com",
  "password": "password123"
}

# Get user by ID
GET http://localhost:8081/api/users/1

# Get user by email
GET http://localhost:8081/api/users/email/john@example.com
```

### OAuth Flow
```bash
# Get authorization URL
GET http://localhost:8081/oauth/authorize

# Exchange code for tokens + user data
POST http://localhost:8081/oauth/callback?code=AUTHORIZATION_CODE

# Health check
GET http://localhost:8081/oauth/health
```

## 🔄 OAuth Flow

1. **User visits** http://localhost:5173
2. **User clicks** "Continue with Keycloak"
3. **Frontend calls** backend `/oauth/authorize`
4. **Backend returns** Keycloak authorization URL
5. **Frontend redirects** to Keycloak at `10.216.68.222:7000`
6. **User authenticates** with Keycloak
7. **Keycloak redirects** to frontend with authorization code
8. **Frontend calls** backend `/oauth/callback` with code
9. **Backend exchanges** code for tokens with Keycloak
10. **Backend creates/updates** user in database
11. **Backend returns** tokens + user data to frontend
12. **Frontend shows** welcome screen with user name

## 🛠️ Development

### Backend Development (Local Machine)
```bash
cd oauth

# Run with hot reload
./gradlew bootRun

# Build JAR
./gradlew build

# Run tests
./gradlew test

# Access H2 Console
# http://localhost:8081/h2-console
```

### Frontend Development (Local Machine)
```bash
cd oauth-client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Keycloak Management (Multipass Instance)
```bash
# SSH into multipass
ssh ubuntu@10.216.68.222

# Check Keycloak logs
docker-compose logs keycloak

# Restart Keycloak
docker-compose restart keycloak

# Stop all services
docker-compose down
```

## 🔍 Testing

### Test Local Authentication
1. Visit http://localhost:5173
2. Click "Register" tab
3. Create an account with name, email, password
4. Switch to "Login" tab
5. Login with your credentials
6. See welcome message: "Welcome, [Name]!"

### Test OAuth Flow
1. Visit http://localhost:5173
2. Click "Continue with Keycloak"
3. Login with Keycloak credentials
4. See welcome message: "Welcome, OAuth User!"

## 🗄️ Database

- **H2 In-Memory Database**: For development (runs locally)
- **PostgreSQL**: For Keycloak (runs on multipass instance)
- **JPA/Hibernate**: Object-relational mapping
- **Auto-create tables**: On application startup
- **H2 Console**: Available at http://localhost:8081/h2-console

## 🌐 Network Configuration

### Docker Network (Multipass Instance)
- **Network Name**: `oauth-network`
- **Services**: Keycloak and PostgreSQL communicate via container names
- **External Access**: Keycloak accessible at `10.216.68.222:7000`

### CORS Configuration
- **Backend**: CORS enabled for all origins (`*`)
- **Frontend**: Connects to `localhost:8081` for API calls
- **Keycloak**: Accessible from any origin for OAuth flow

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors**: Backend has CORS enabled for all origins
2. **Keycloak connection**: Ensure Keycloak is running on multipass at port 7000
3. **Client secret**: Update the client secret in `application.yml`
4. **Port conflicts**: Ensure ports 5173 and 8081 are available locally
5. **Network connectivity**: Ensure multipass instance is accessible at `10.216.68.222`

### Logs
- **Backend logs**: Check console output from `./gradlew bootRun`
- **Frontend logs**: Check browser console and terminal
- **Keycloak logs**: SSH to multipass and run `docker-compose logs keycloak`

### Network Testing
```bash
# Test Keycloak connectivity
curl http://10.216.68.222:7000

# Test backend connectivity
curl http://localhost:8081/oauth/health

# Test frontend
curl http://localhost:5173
```

## 📝 Notes

- **Database**: H2 in-memory database (data lost on restart)
- **Password security**: BCrypt encryption for local users
- **Session storage**: User data stored in browser localStorage
- **OAuth tokens**: Stored in localStorage (demo purposes)
- **Production**: Implement proper security measures for production use
- **Multipass**: Keycloak data persisted in `/home/ubuntu/demo-data` 