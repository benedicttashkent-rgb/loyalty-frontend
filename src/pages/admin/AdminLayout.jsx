import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { getApiUrl } from '../../config/api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Don't check auth if we're on the login page
    if (location.pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const apiUrl = getApiUrl('admin/auth/me');
      
      // Check for stored token - prioritize token over cookies for cross-origin
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔍 Auth check - Token in localStorage:', adminToken ? 'EXISTS' : 'MISSING');
      console.log('🔍 Auth check - Token value:', adminToken ? `${adminToken.substring(0, 20)}...` : 'none');
      
      const headers = {};
      
      // Always use token if available (for cross-origin support)
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
        console.log('🔍 Using stored admin token for auth');
      } else {
        console.warn('⚠️ No admin token found in localStorage - will rely on cookies');
      }
      
      console.log('🔍 Auth check request headers:', headers);
      console.log('🔍 Auth check URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include', // Still include for cookie fallback
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      console.log('🔍 Auth check response:', {
        status: response.status,
        ok: response.ok,
        url: apiUrl,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: document.cookie
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Auth check data:', data);
        if (data.success && data.admin) {
          setAdmin(data.admin);
          console.log('✅ Auth check passed, admin:', data.admin);
        } else {
          console.warn('⚠️ Auth check failed - no admin data:', data);
          // Only redirect if we're not already on login page
          if (location.pathname !== '/admin/login') {
            navigate('/admin/login');
          }
        }
      } else {
        console.warn('⚠️ Auth check failed - response not ok:', response.status);
        // Only redirect if we're not already on login page
        if (location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      // Only redirect if we're not already on login page
      if (location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      
      await fetch(getApiUrl('admin/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
      
      // Clear stored tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminSessionId');
      
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear stored tokens even on error
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminSessionId');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
    { path: '/admin/customers', label: 'Клиенты', icon: 'Users' },
    { path: '/admin/menu-items', label: 'Блюда', icon: 'Utensils' },
    { path: '/admin/news', label: 'Баннеры Новостей', icon: 'Newspaper' },
    { path: '/admin/rewards', label: 'Награды', icon: 'Gift' },
    { path: '/admin/events', label: 'События', icon: 'Calendar' },
    { path: '/admin/broadcast', label: 'Рассылки Telegram', icon: 'Send' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-xl font-bold text-foreground">Админ Панель</h2>
                <p className="text-xs text-muted-foreground">{admin?.username || 'Администратор'}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Menu" size={24} className="text-foreground" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            <Icon name="LogOut" size={20} />
            {sidebarOpen && <span className="font-medium">Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

