import { useState, useEffect } from 'react'
import './App.css'

interface User {
  id: number;
  name: string;
  email: string;
  authProvider?: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    // Clear URL parameters immediately to prevent code reuse
    if (code || error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
      setError('OAuth error: ' + error);
      return;
    }
    
    if (code) {
      // Add a small delay to ensure URL is cleared before processing
      setTimeout(() => {
        exchangeCodeForToken(code);
      }, 100);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setSuccess('Login successful!');
        setError('');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Please login.');
        setActiveTab('login');
        setLoginForm({ ...loginForm, email: registerForm.email });
        setError('');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    setError('');

    // Clear any existing OAuth state first
    clearOAuthState();

    try {
      const response = await fetch('http://localhost:8081/oauth/authorize');
      const authUrl = await response.text();
      
      // Add a timestamp to ensure fresh authorization
      const separator = authUrl.includes('?') ? '&' : '?';
      const freshAuthUrl = `${authUrl}${separator}_t=${Date.now()}`;
      
      window.location.href = freshAuthUrl;
    } catch (error) {
      setError('Error starting OAuth flow. Please try again.');
      setIsLoading(false);
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8081/oauth/callback?code=${code}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      setCurrentUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setSuccess('OAuth login successful!');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      setError('Error completing OAuth flow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    
    // Clear all OAuth state thoroughly
    clearOAuthState();
    
    // Force a page reload to clear any cached OAuth state
    window.location.reload();
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const clearOAuthState = () => {
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Clear storage
    sessionStorage.clear();
    localStorage.removeItem('currentUser');
    
    // Clear any cookies that might be related to OAuth
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  };

  if (currentUser) {
  return (
      <div className="app">
        <div className="container">
          <div className="welcome-header">
            <h1>Welcome!</h1>
            <p>You've successfully signed in</p>
          </div>
          <div className="welcome-content">
            <div className="welcome-message">
              <h3>🎉 Welcome, {currentUser.name}!</h3>
              <p>You've successfully signed in to your account</p>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p><strong>Email:</strong> {currentUser.email}</p>
              {currentUser.authProvider && (
                <p><strong>Authentication:</strong> {currentUser.authProvider}</p>
              )}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account or create a new one</p>
        </div>

        <div className="form-container">
          <div className="tab-container">
            <button 
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                clearMessages();
              }}
            >
              Login
            </button>
            <button 
              className={`tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                clearMessages();
              }}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <input
                  type="text"
                  id="register-name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <input
                  type="password"
                  id="register-password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="register-confirm-password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="divider">
            <span>OR</span>
          </div>

          {currentUser && (
            <div className="info-message">
              You are already logged in. Please logout first to use Keycloak authentication.
            </div>
          )}

          <button 
            onClick={handleOAuthLogin} 
            className="btn btn-secondary"
            disabled={isLoading || !!currentUser}
          >
            {isLoading ? 'Processing...' : 'Continue with Keycloak'}
        </button>
        </div>
      </div>
    </div>
  )
}

export default App
