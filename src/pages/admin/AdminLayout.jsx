import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (admin?.role === 'marketing' && !marketingPaths.includes(location.pathname)) {
      navigate('/admin/news', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, admin]);

  const checkAuth = async () => {
    try {
      const response = await adminApiRequest('admin/auth/me', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          setAdmin(data.admin);
          if (data.admin.role === 'marketing' && !marketingPaths.includes(location.pathname)) {
            navigate('/admin/news', { replace: true });
          }
        } else if (location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      } else if (location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApiRequest('admin/auth/logout', {
        method: 'POST',
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

  const allMenuItems = [
    { path: '/admin/dashboard', label: 'Дашборд', icon: 'LayoutDashboard', marketing: false },
    { path: '/admin/customers', label: 'Клиенты', icon: 'Users', marketing: false },
    // { path: '/admin/menu-items', label: 'Блюда', icon: 'Utensils' },   // hidden: menu now comes from iiko
    // { path: '/admin/categories', label: 'Категории', icon: 'Folder' }, // hidden: menu now comes from iiko
    { path: '/admin/news', label: 'Баннеры Новостей', icon: 'Newspaper', marketing: true },
    { path: '/admin/rewards', label: 'Награды', icon: 'Gift', marketing: true },
    { path: '/admin/events', label: 'События', icon: 'Calendar', marketing: true },
    { path: '/admin/broadcast', label: 'Рассылки Telegram', icon: 'Send', marketing: true },
    { path: '/admin/special-offers', label: 'Спецпредложения', icon: 'Tag', marketing: true },
    { path: '/admin/promo-codes', label: 'Промокоды', icon: 'Ticket', marketing: true },
  ];

  const marketingPaths = allMenuItems.filter((item) => item.marketing).map((item) => item.path);
  const menuItems = admin?.role === 'marketing'
    ? allMenuItems.filter((item) => item.marketing)
    : allMenuItems;

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

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">Админ Панель</h2>
              <p className="text-xs text-muted-foreground truncate">{admin?.username || 'Администратор'}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors hidden lg:flex flex-shrink-0"
          >
            <Icon name="Menu" size={20} className="text-foreground" />
          </button>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors flex lg:hidden flex-shrink-0"
          >
            <Icon name="X" size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/admin/dashboard' && location.pathname === '/admin');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground hover:bg-muted font-medium'
              }`}
            >
              <Icon name={item.icon} size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Icon name="LogOut" size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Выйти</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 hidden lg:flex flex-col`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (drawer + backdrop) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-card border-r border-border flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Icon name="Menu" size={22} className="text-foreground" />
          </button>
          <span className="font-semibold text-foreground">Админ Панель</span>
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

