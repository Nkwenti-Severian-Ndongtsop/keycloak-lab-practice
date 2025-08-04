from flask import Flask, render_template, request, redirect, url_for, session, flash
import secrets
import hashlib
import os
from datetime import timedelta

app = Flask(__name__)
app.secret_key = 'super-secret-key-change-in-production'

# VULNERABILITY: No security configurations - cookies are not secure

# Simulated user database
users = {
    'admin': {
        'password': hashlib.sha256('admin123'.encode()).hexdigest(),
        'role': 'admin'
    },
    'user': {
        'password': hashlib.sha256('user123'.encode()).hexdigest(),
        'role': 'user'
    }
}

@app.route('/')
def index():
    # VULNERABILITY: Create session ID even for anonymous users to demonstrate session fixation
    if 'session_id' not in session:
        session['session_id'] = secrets.token_hex(16)
        print(f"🔍 New session created: {session['session_id']}")
    
    if 'user_id' in session:
        return render_template('dashboard.html', user=session.get('user_id'), role=session.get('role'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # VULNERABILITY: Ensure session exists before login
    if 'session_id' not in session:
        session['session_id'] = secrets.token_hex(16)
        print(f"🔍 Session created at login page: {session['session_id']}")
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        print(f"🔍 Session ID before login: {session.get('session_id')}")
        
        # Check if user exists and password is correct
        if username in users and users[username]['password'] == hashlib.sha256(password.encode()).hexdigest():
            # VULNERABILITY: Session fixation - we don't regenerate session ID after login
            session['user_id'] = username
            session['role'] = users[username]['role']
            print(f"🔍 Session ID after login: {session.get('session_id')} - SAME AS BEFORE!")
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully', 'success')
    return redirect(url_for('index'))

@app.route('/admin')
def admin():
    if 'user_id' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    
    if session.get('role') != 'admin':
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('index'))
    
    return render_template('admin.html', user=session.get('user_id'))

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    
    return render_template('profile.html', user=session.get('user_id'), role=session.get('role'))

if __name__ == '__main__':
    print("⚠️  Running VULNERABLE version of the application")
    print("   - Session IDs are NOT regenerated after login")
    print("   - No cookie security flags")
    print("   - Session fixation vulnerability present")
    print("   - Use for educational purposes only!")
    app.run(debug=True, host='0.0.0.0', port=5000) 