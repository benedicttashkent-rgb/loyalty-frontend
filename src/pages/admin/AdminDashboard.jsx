import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setError('');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch statistics' }));
        setError(errorData.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Stats error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('ru-RU');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const statCards = [
    {
      title: 'Всего Клиентов',
      value: stats?.totalCustomers || 0,
      change: stats?.newCustomers7d ? `+${stats.newCustomers7d} за 7 дней` : null,
      icon: 'Users',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      link: null,
    },
    {
      title: 'Новых за 30 дней',
      value: stats?.newCustomers30d || 0,
      change: stats?.newCustomers7d ? `+${stats.newCustomers7d} за неделю` : null,
      icon: 'UserPlus',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      link: null,
    },
    {
      title: 'Активных Баннеров',
      value: stats?.activeNewsBanners || 0,
      change: stats?.totalNewsBanners ? `Всего: ${stats.totalNewsBanners}` : null,
      icon: 'Newspaper',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      link: '/admin/news',
    },
    {
      title: 'Активных Наград',
      value: stats?.activeRewards || 0,
      change: stats?.featuredRewards ? `${stats.featuredRewards} рекомендуемых` : null,
      icon: 'Gift',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      link: '/admin/rewards',
    },
    {
      title: 'События (7 дней)',
      value: stats?.upcomingEvents7d || 0,
      change: stats?.upcomingEvents30d ? `${stats.upcomingEvents30d} за месяц` : null,
      icon: 'Calendar',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      link: '/admin/events',
    },
    {
      title: 'Всего Заказов',
      value: stats?.totalOrders || 0,
      change: stats?.orders7d ? `${stats.orders7d} за неделю` : null,
      icon: 'ShoppingCart',
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      link: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <Icon name="AlertCircle" size={24} />
          <h3 className="font-semibold">Ошибка</h3>
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Дашборд</h1>
          <p className="text-muted-foreground">
            Обзор программы лояльности • Обновлено: {refreshTime.toLocaleTimeString('ru-RU')}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Icon name={loading ? 'Loader2' : 'RefreshCw'} size={20} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <Icon name="AlertTriangle" size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const CardContent = (
            <div
              className={`bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer ${
                card.link ? 'hover:border-primary/50' : ''
              }`}
              onClick={() => card.link && navigate(card.link)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} ${card.hoverColor} p-3 rounded-lg transition-colors`}>
                  <Icon name={card.icon} size={24} className="text-white" />
                </div>
                {card.link && (
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                )}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{formatNumber(card.value)}</h3>
              <p className="text-sm font-medium text-foreground mb-1">{card.title}</p>
              {card.change && (
                <p className="text-xs text-muted-foreground">{card.change}</p>
              )}
            </div>
          );

          return <div key={index}>{CardContent}</div>;
        })}
      </div>

      {/* Detailed Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers Statistics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Icon name="Users" size={24} className="text-blue-500" />
              Статистика Клиентов
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Всего клиентов</span>
              <span className="font-bold text-foreground">{formatNumber(stats?.totalCustomers || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">С интеграцией iiko</span>
              <span className="font-bold text-foreground">{formatNumber(stats?.iikoCustomers || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Новых за 7 дней</span>
              <span className="font-bold text-green-600">{formatNumber(stats?.newCustomers7d || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Новых за 30 дней</span>
              <span className="font-bold text-green-600">{formatNumber(stats?.newCustomers30d || 0)}</span>
            </div>
            {stats?.customersByTier && Object.keys(stats.customersByTier).length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">По статусу:</p>
                {Object.entries(stats.customersByTier).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">{tier}</span>
                    <span className="text-sm font-medium text-foreground">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Statistics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Icon name="FileText" size={24} className="text-purple-500" />
              Контент
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Баннеры (активных/всего)</span>
              <span className="font-bold text-foreground">
                {formatNumber(stats?.activeNewsBanners || 0)} / {formatNumber(stats?.totalNewsBanners || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Награды (активных/всего)</span>
              <span className="font-bold text-foreground">
                {formatNumber(stats?.activeRewards || 0)} / {formatNumber(stats?.totalRewards || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Рекомендуемых наград</span>
              <span className="font-bold text-pink-600">{formatNumber(stats?.featuredRewards || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">События (всего)</span>
              <span className="font-bold text-foreground">{formatNumber(stats?.totalEvents || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Предстоящих (30 дней)</span>
              <span className="font-bold text-orange-600">{formatNumber(stats?.upcomingEvents30d || 0)}</span>
            </div>
            {stats?.eventsByType && Object.keys(stats.eventsByType).length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">События по типам:</p>
                {Object.entries(stats.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground capitalize">{type}</span>
                    <span className="text-sm font-medium text-foreground">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity & Recent Registrations */}
      {stats?.recentRegistrations && stats.recentRegistrations.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={24} className="text-green-500" />
            Регистрации за последние 7 дней
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {stats.recentRegistrations.map((reg, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 rounded-lg p-3 mb-2">
                  <p className="text-2xl font-bold text-primary">{reg.count}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(reg.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/news')}
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-500 p-2 rounded-lg group-hover:bg-purple-600 transition-colors">
                <Icon name="Plus" size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Добавить Баннер</h3>
            </div>
            <p className="text-sm text-muted-foreground">Создать новый баннер новостей</p>
          </button>
          <button
            onClick={() => navigate('/admin/rewards')}
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-pink-500 p-2 rounded-lg group-hover:bg-pink-600 transition-colors">
                <Icon name="Gift" size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Добавить Награду</h3>
            </div>
            <p className="text-sm text-muted-foreground">Создать новую награду</p>
          </button>
          <button
            onClick={() => navigate('/admin/events')}
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-500 p-2 rounded-lg group-hover:bg-orange-600 transition-colors">
                <Icon name="Calendar" size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Добавить Событие</h3>
            </div>
            <p className="text-sm text-muted-foreground">Создать новое событие</p>
          </button>
        </div>
      </div>

      {/* Activity Stats */}
      {(stats?.otpUsage > 0 || stats?.qrScans > 0 || stats?.orders7d > 0) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Activity" size={24} className="text-blue-500" />
            Активность
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.otpUsage > 0 && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="MessageSquare" size={20} className="text-blue-500" />
                  <span className="text-sm font-medium text-foreground">SMS подтверждений</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(stats.otpUsage)}</p>
                <p className="text-xs text-muted-foreground mt-1">За последние 7 дней</p>
              </div>
            )}
            {stats.qrScans > 0 && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="QrCode" size={20} className="text-green-500" />
                  <span className="text-sm font-medium text-foreground">QR сканирований</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatNumber(stats.qrScans)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.qrScans7d > 0 ? `${formatNumber(stats.qrScans7d)} за неделю` : 'Всего'}
                </p>
              </div>
            )}
            {stats.orders7d > 0 && (
              <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="ShoppingCart" size={20} className="text-teal-500" />
                  <span className="text-sm font-medium text-foreground">Заказов за неделю</span>
                </div>
                <p className="text-2xl font-bold text-teal-600">{formatNumber(stats.orders7d)}</p>
                <p className="text-xs text-muted-foreground mt-1">Из {formatNumber(stats.totalOrders)} всего</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
