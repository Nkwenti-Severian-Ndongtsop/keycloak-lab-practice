import { useState, useEffect } from 'react'
import './App.css'

// Configuration - Update these values for your setup
const API_BASE_URL = 'http://localhost:8081'
const ENDPOINTS = {
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  OAUTH_AUTHORIZE: '/oauth/authorize',
  OAUTH_CALLBACK: '/oauth/callback',
  OAUTH_HEALTH: '/oauth/health'
}

const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

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
  // Check for OAuth callback immediately to prevent flash
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthCallback = urlParams.get('code') || urlParams.get('error');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthProcessing, setIsOAuthProcessing] = useState(!!hasOAuthCallback);
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

  // Check for OAuth callback and user session on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    // Handle OAuth callback first (before checking saved user)
    if (code || error) {
      // Clear URL parameters immediately to prevent code reuse
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (error) {
        setError('OAuth error: ' + error);
        return;
      }
      
      if (code) {
        // Set OAuth processing state immediately to prevent flash
        setIsOAuthProcessing(true);
        // Process the code
        setTimeout(() => {
          exchangeCodeForToken(code);
        }, 100);
        return; // Don't check saved user if processing OAuth
      }
    }
    
    // Only check saved user if not processing OAuth
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.LOGIN), {
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
      const response = await fetch(buildApiUrl(ENDPOINTS.REGISTER), {
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
      const response = await fetch(buildApiUrl(ENDPOINTS.OAUTH_AUTHORIZE));
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
      const response = await fetch(`${buildApiUrl(ENDPOINTS.OAUTH_CALLBACK)}?code=${code}`, {
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
      setIsOAuthProcessing(false);
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
    
    // Redirect to Keycloak logout to clear OAuth session
    const logoutUrl = `http://10.216.68.222:7000/realms/oauth-demo/protocol/openid-connect/logout?client_id=Spring-Client&post_logout_redirect_uri=${encodeURIComponent('http://localhost:5173')}`;
    window.location.href = logoutUrl;
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

  // Show loading state during OAuth processing
  if (isOAuthProcessing) {
    return (
      <div className="app">
        <div className="container">
          <div className="welcome-header">
            <h1>🔄 Processing</h1>
            <p>Completing your Keycloak authentication</p>
          </div>
          <div className="welcome-content">
            <div className="welcome-message">
              <h3>Authenticating with Keycloak</h3>
              <p>Please wait while we verify your credentials and set up your session...</p>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '4px solid #f3f3f3', 
                  borderTop: '4px solid #4f46e5', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
