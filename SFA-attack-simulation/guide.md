# Session Fixation Attack Lab Guide

## Overview
This lab demonstrates a **Session Fixation** vulnerability in a Flask web application. Session fixation is an attack where an attacker can predict or set a user's session ID, allowing them to hijack the user's session after authentication.

## What is Session Fixation?
Session fixation occurs when an application doesn't regenerate the session ID after a user logs in. This means:
- The session ID remains the same before and after login
- An attacker can predict or steal the session ID
- Once the user logs in, the attacker can use that same session ID to access the user's account

## Setup Instructions

### 1. Install Dependencies
```bash
cd keycloak-lab-practice/SFA-attack-simulation
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

## Demo Credentials
- **Admin User**: username: `admin`, password: `admin123`
- **Regular User**: username: `user`, password: `user123`

## How to Demonstrate the Vulnerability

### Step 1: Understand the Vulnerability
1. Open your browser and go to `http://localhost:5000`
2. Notice the warning message about session fixation vulnerability
3. Open browser developer tools (F12) and go to the Application/Storage tab
4. Look for the session cookie (usually named `session`)

### Step 2: Demonstrate Session Fixation Attack

#### Method 1: Using Browser Developer Tools

1. **Get a Session ID Before Login:**
   - Go to `http://localhost:5000/login`
   - Open Developer Tools → Application → Cookies
   - Note the session cookie value (this is your session ID)

2. **Login as Admin:**
   - Login with admin credentials (admin/admin123)
   - Check the session cookie again - **IT'S THE SAME!**
   - This is the vulnerability - the session ID didn't change after login

3. **Demonstrate Session Hijacking:**
   - Copy the session cookie value
   - Open a new incognito/private window
   - Go to `http://localhost:5000`
   - Set the session cookie to the value you copied
   - Refresh the page - you're now logged in as admin!

#### Method 2: Using curl (Command Line)

1. **Get Session ID:**
   ```bash
   curl -c cookies.txt http://localhost:5000/login
   ```

2. **Login with that session:**
   ```bash
   curl -b cookies.txt -d "username=admin&password=admin123" http://localhost:5000/login
   ```

3. **Access protected area:**
   ```bash
   curl -b cookies.txt http://localhost:5000/admin
   ```

### Step 3: Show the Impact

1. **Access Admin Panel:**
   - With the hijacked session, go to `http://localhost:5000/admin`
   - You now have admin access without knowing the password!

2. **Access User Profile:**
   - Go to `http://localhost:5000/profile`
   - You can see the user's private information

## The Vulnerability in Code

Look at the `login()` function in `app.py`:

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in users and users[username]['password'] == hashlib.sha256(password.encode()).hexdigest():
            # VULNERABILITY: Session fixation - we don't regenerate session ID after login
            session['user_id'] = username
            session['role'] = users[username]['role']
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
```

**The Problem:** The code doesn't regenerate the session ID after successful authentication. It just adds user data to the existing session.

## How to Fix the Vulnerability

### Solution: Regenerate Session ID After Login

Replace the vulnerable login code with:

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in users and users[username]['password'] == hashlib.sha256(password.encode()).hexdigest():
            # FIX: Regenerate session ID after successful login
            session.clear()  # Clear old session
            session.regenerate()  # Generate new session ID
            session['user_id'] = username
            session['role'] = users[username]['role']
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
```

### Additional Security Measures

1. **Set Secure Cookie Flags:**
   ```python
   app.config.update(
       SESSION_COOKIE_SECURE=True,  # Only send over HTTPS
       SESSION_COOKIE_HTTPONLY=True,  # Prevent XSS access
       SESSION_COOKIE_SAMESITE='Lax'  # Prevent CSRF
   )
   ```

2. **Set Session Timeout:**
   ```python
   app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
   ```

## Why This Matters

Session fixation attacks are dangerous because:
- **Stealthy**: The user doesn't know their session has been compromised
- **Persistent**: The attack works even after the user changes their password
- **High Impact**: Can lead to complete account takeover
- **Common**: Many applications still have this vulnerability

## Real-World Examples

- **Banking Applications**: Attackers could access financial accounts
- **E-commerce Sites**: Attackers could make purchases on behalf of users
- **Social Media**: Attackers could post content or access private messages
- **Corporate Systems**: Attackers could access sensitive business data

## Prevention Checklist

- [ ] Always regenerate session ID after login
- [ ] Use secure, HttpOnly, and SameSite cookie flags
- [ ] Implement session timeout
- [ ] Use HTTPS in production
- [ ] Validate session data on each request
- [ ] Log suspicious session activities

## Testing Your Understanding

1. **Question**: Why doesn't changing the password prevent session fixation attacks?
   **Answer**: Because the session ID remains the same, so the attacker's stolen session is still valid.

2. **Question**: How can you detect if your session has been hijacked?
   **Answer**: It's very difficult to detect. The best defense is prevention through proper session management.

3. **Question**: What's the difference between session fixation and session hijacking?
   **Answer**: Session fixation is the vulnerability that enables session hijacking. Session hijacking is the actual attack where an attacker uses a stolen session ID.

## Next Steps

1. Try the attack with different browsers
2. Experiment with the fixed version of the code
3. Research other session-related vulnerabilities
4. Learn about modern authentication methods (JWT, OAuth, etc.)

---

**Remember**: This lab is for educational purposes only. Never test these attacks on real applications without permission! 