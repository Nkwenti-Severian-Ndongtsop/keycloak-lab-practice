# Session Fixation Attack Lab

A simple Flask application demonstrating session fixation vulnerabilities and how to fix them.

## 🎯 Learning Objectives

- Understand what session fixation attacks are
- See how session IDs remain the same before and after login (vulnerability)
- Learn how to exploit this vulnerability
- Understand how to fix it with proper session management
- Practice security testing techniques

## 📁 Project Structure

```
SFA-attack-simulation/
├── app.py                 # Vulnerable Flask application
├── app_fixed.py          # Fixed version with proper session management
├── attack_demo.py        # Python script to demonstrate the attack
├── requirements.txt      # Python dependencies
├── guide.md             # Comprehensive lab guide
├── README.md            # This file
└── templates/           # HTML templates
    ├── base.html
    ├── login.html
    ├── dashboard.html
    ├── profile.html
    └── admin.html
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Vulnerable Application
```bash
python app.py
```
Visit: http://localhost:5000

### 3. Run the Attack Demo
```bash
python attack_demo.py
```

### 4. Test the Fixed Version
```bash
python app_fixed.py
```
Visit: http://localhost:5001

## 🔑 Demo Credentials

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

## 🎭 Attack Demonstration

### Method 1: Browser Developer Tools
1. Go to http://localhost:5000/login
2. Open Developer Tools → Application → Cookies
3. Note the session cookie value
4. Login with admin credentials
5. Check the session cookie again - it's the same!
6. Copy the session cookie value
7. Open incognito window and set the same cookie
8. Refresh - you're logged in as admin!

### Method 2: Automated Script
```bash
python attack_demo.py
```

## 🔒 Security Fixes

The fixed version (`app_fixed.py`) implements:

- ✅ Session ID regeneration after login
- ✅ HttpOnly cookies
- ✅ SameSite cookie protection
- ✅ Session timeout (30 minutes)
- ✅ Secure cookie flags

## 📚 Learning Resources

- Read `guide.md` for detailed explanations
- Compare `app.py` vs `app_fixed.py` to see the differences
- Use `attack_demo.py` to understand the attack process

## ⚠️ Important Notes

- This is for educational purposes only
- Never test these attacks on real applications
- The vulnerable version is intentionally insecure
- Always use the fixed version as a reference for secure development

## 🎓 What You'll Learn

1. **Session Management**: How web sessions work
2. **Vulnerability Analysis**: Identifying security flaws
3. **Attack Techniques**: Understanding the attacker's perspective
4. **Defense Strategies**: Implementing proper security measures
5. **Security Testing**: How to test for session vulnerabilities

## 🔍 Key Concepts

- **Session Fixation**: When session IDs don't change after login
- **Session Hijacking**: Using stolen session IDs to access accounts
- **Cookie Security**: HttpOnly, Secure, and SameSite flags
- **Session Regeneration**: Creating new session IDs after authentication

---

**Happy Learning! 🎓🔒** 