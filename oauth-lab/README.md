# OAuth Lab - Spring Boot + React + Keycloak

A complete OAuth 2.0 implementation with Spring Boot backend, React frontend, and Keycloak identity provider.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Spring Boot    │    │    Keycloak     │
│  (localhost:5173)│◄──►│  (localhost:8081)│◄──►│ (10.216.68.222:7000)│
│                 │    │                 │    │                 │
│ - Login/Register│    │ - OAuth Handler │    │ - Identity      │
│ - OAuth Flow    │    │ - User Mgmt     │    │ - User Store    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │(10.216.68.222:5432)│
                       │                 │
                       │ - User Data     │
                       │ - Keycloak Data │
                       └─────────────────┘
```

## 📋 Prerequisites

- **Java 21** (or Java 17+)
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Multipass VM** (for Keycloak and PostgreSQL)

## 🚀 Quick Start

### Step 1: Start Keycloak and PostgreSQL

1. **SSH into your Multipass VM**:
   ```bash
   multipass shell your-vm-name
   ```

2. **Navigate to the project directory**:
   ```bash
   cd /home/ubuntu/demo-data
   ```

3. **Start the services**:
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**:
   ```bash
   docker ps
   ```
   You should see Keycloak and PostgreSQL containers running.

### Step 2: Configure Keycloak

1. **Access Keycloak Admin Console**:
   - Open: `http://10.216.68.222:7000/admin`
   - Login with: `admin` / `admin123`

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
   - **Access Type**: `confidential`
   - **Valid Redirect URIs**: `http://localhost:5173/callback`
   - **Web Origins**: `http://localhost:5173`
   - Click "Save"

5. **Get Client Secret**:
   - Go to "Credentials" tab
   - Copy the client secret (e.g., `EdBAUx47IccjgWjtV8HxhrmKjq3s9bQ9`)

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
   ```yaml
   keycloak:
     realm: oauth-demo
     auth-server-url: http://10.216.68.222:7000/realms/oauth-demo
     client-id: Spring-Client
     client-secret: YOUR_CLIENT_SECRET_HERE
     redirect-uri: http://localhost:5173/callback
   ```

2. **Start the Spring Boot backend**:
   ```bash
   cd /home/nkwentiseverian/projects/keycloak-lab-practice/oauth-lab/oauth
   ./gradlew bootRun
   ```

3. **Verify backend is running**:
   ```bash
   curl http://localhost:8081/oauth/health
   ```
   Should return: `OAuth Backend is running!`

### Step 4: Start Frontend

1. **Install dependencies**:
   ```bash
   cd /home/nkwentiseverian/projects/keycloak-lab-practice/oauth-lab/oauth-client
   npm install
   ```

2. **Start the React app**:
   ```bash
   npm run dev
   ```

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

## 🔧 Troubleshooting

### Common Issues

#### 1. **401 Unauthorized Error**
**Cause**: Client ID or secret mismatch
**Solution**:
- Verify client ID in Keycloak matches `application.yml`
- Check client secret is correct
- Ensure client is `confidential` type

#### 2. **Database Connection Error**
**Cause**: PostgreSQL not accessible
**Solution**:
```bash
# Check if PostgreSQL port is exposed
telnet 10.216.68.222 5432

# Restart Docker containers
docker-compose down && docker-compose up -d
```

#### 3. **OAuth Button Not Working**
**Cause**: User already logged in
**Solution**:
- Click "Sign Out" first
- Clear browser cache
- Try again

#### 4. **Mock User Data Instead of Real Data**
**Cause**: JWT decoding not working
**Solution**:
- Check backend logs for JWT errors
- Verify Keycloak user has email and name
- Restart backend after configuration changes

### Debug Commands

```bash
# Test Keycloak connectivity
curl -X GET "http://10.216.68.222:7000/realms/oauth-demo/.well-known/openid_configuration"

# Test backend authorization URL
curl -X GET "http://localhost:8081/oauth/authorize"

# Check backend health
curl -X GET "http://localhost:8081/oauth/health"

# Test database connection
telnet 10.216.68.222 5432
```

## 📁 Project Structure

```
oauth-lab/
├── oauth/                          # Spring Boot Backend
│   ├── src/main/java/com/demo/oauth/
│   │   ├── controller/             # REST Controllers
│   │   ├── model/                  # JPA Entities
│   │   ├── repository/             # Data Access
│   │   ├── service/                # Business Logic
│   │   ├── config/                 # Security Config
│   │   └── util/                   # JWT Utilities
│   ├── src/main/resources/
│   │   └── application.yml         # Configuration
│   └── build.gradle               # Dependencies
├── oauth-client/                   # React Frontend
│   ├── src/
│   │   ├── App.tsx                # Main Component
│   │   ├── App.css                # Styles
│   │   └── index.css              # Global Styles
│   └── package.json               # Frontend Dependencies
└── docker-compose.yml             # Keycloak + PostgreSQL
```

## 🔐 Security Features

- **OAuth 2.0 Authorization Code Flow**
- **JWT Token Decoding**
- **BCrypt Password Hashing**
- **CORS Configuration**
- **Database User Persistence**

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),           -- NULL for OAuth users
    auth_provider VARCHAR(50),       -- 'local' or 'keycloak'
    external_id VARCHAR(255),        -- Keycloak user ID
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚀 Deployment

### Production Considerations

1. **HTTPS**: Use HTTPS in production
2. **Environment Variables**: Move secrets to environment variables
3. **Database**: Use production PostgreSQL
4. **Keycloak**: Configure proper SSL certificates
5. **CORS**: Restrict origins to production domains

### Environment Variables

```bash
# Backend
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/db
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=password
KEYCLOAK_CLIENT_SECRET=your-secret

# Frontend
REACT_APP_API_URL=http://localhost:8081
```

## 📝 API Endpoints

### Backend APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/oauth/authorize` | GET | Get Keycloak authorization URL |
| `/oauth/callback` | POST | Exchange code for tokens |
| `/oauth/health` | GET | Health check |
| `/api/users/register` | POST | Register local user |
| `/api/users/login` | POST | Login local user |
| `/api/users/{id}` | GET | Get user by ID |
| `/api/users/email/{email}` | GET | Get user by email |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all services are running
3. Check backend logs for errors
4. Ensure Keycloak configuration is correct
5. Clear browser cache and try again

---

**Happy OAuth-ing! 🎉** 