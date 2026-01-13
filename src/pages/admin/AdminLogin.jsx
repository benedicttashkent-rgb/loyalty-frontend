import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { getApiUrl } from '../../config/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = getApiUrl('admin/auth/login');
      console.log('🔍 Attempting login to:', apiUrl);
      console.log('🔍 Credentials:', { username, password: '***' });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sessions (cookies)
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify({ username, password }),
      });
      
      console.log('🔍 Login response status:', response.status);
      console.log('🔍 Login response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        setError(errorData.error || `Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      console.log('🔍 Login response:', {
        success: data.success,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });

      // Check for Set-Cookie header
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('🔍 Set-Cookie header:', setCookieHeader);

      if (data.success) {
        // Store token if provided (for token-based auth)
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          console.log('✅ Admin token stored in localStorage:', data.token.substring(0, 20) + '...');
        } else {
          console.warn('⚠️ Login successful but no token in response! Backend must return token for cross-origin auth.');
          console.warn('⚠️ Response data:', data);
        }
        
        // Store session info if provided
        if (data.sessionId) {
          localStorage.setItem('adminSessionId', data.sessionId);
        }
        
        // Verify token was stored
        const storedToken = localStorage.getItem('adminToken');
        if (!storedToken) {
          console.error('❌ CRITICAL: Token was not stored in localStorage!');
          setError('Login successful but authentication token was not received. Please contact support.');
          setLoading(false);
          return;
        }
        
        console.log('✅ Login successful, navigating to dashboard...');
        // Small delay to ensure cookies are processed
        await new Promise(resolve => setTimeout(resolve, 200));
        // Navigate to dashboard - AdminLayout will check auth
        // Use replace to avoid back button issues
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.error('❌ Login failed:', data.error);
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      // More detailed error message
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        setError('Cannot connect to backend server. Please make sure the backend is running on port 3001.');
      } else {
        setError(`Connection error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Icon name="ShieldCheck" size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Benedict Cafe Loyalty</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <Icon name="AlertCircle" size={20} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={20} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Default credentials:</p>
            <p className="font-mono">Username: Benedict200010</p>
            <p className="font-mono">Password: 10203010</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

