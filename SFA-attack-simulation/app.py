from flask import Flask, render_template, request, redirect, url_for, session, flash
import secrets
import hashlib
import os

app = Flask(__name__)
app.secret_key = 'super-secret-key-change-in-production'

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
    if 'user_id' in session:
        return render_template('dashboard.html', user=session.get('user_id'), role=session.get('role'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if user exists and password is correct
        if username in users and users[username]['password'] == hashlib.sha256(password.encode()).hexdigest():
            # VULNERABILITY: Session fixation - we don't regenerate session ID after login
            session['user_id'] = username
            session['role'] = users[username]['role']
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
    app.run(debug=True, host='0.0.0.0', port=5000) 