import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';


const TIER_CONFIG = {
  Bronze:   { label: 'Bronze',   color: '#cd7f32', bg: '#fdf3e7' },
  Silver:   { label: 'Silver',   color: '#9ca3af', bg: '#f3f4f6' },
  Gold:     { label: 'Gold',     color: '#d4a574', bg: '#fef9f0' },
  Platinum: { label: 'Platinum', color: '#8b6a4e', bg: '#f8efe0' },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApiRequest('admin/dashboard/stats', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) { setStats(data.stats); setError(''); }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Ошибка загрузки');
      }
    } catch {
      setError('Нет соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => (n == null ? '0' : Number(n).toLocaleString('ru-RU'));
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : '';

  const tierEntries = ['Platinum', 'Gold', 'Silver', 'Bronze'].map(tier => [
    tier,
    stats?.customersByTier?.[tier] || 0,
  ]);
  const totalByTier = tierEntries.reduce((s, [, v]) => s + v, 0);

  const maxReg = stats?.recentRegistrations
    ? Math.max(...stats.recentRegistrations.map(r => r.count), 1)
    : 1;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="py-20 text-center rounded-2xl" style={{ background: '#fff5f5' }}>
        <Icon name="AlertCircle" size={32} className="mx-auto mb-3 text-destructive" />
        <p className="text-foreground font-medium mb-1">Ошибка загрузки</p>
        <p className="text-sm text-muted-foreground mb-5">{error}</p>
        <button onClick={fetchStats} className="px-5 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Обновлено в {refreshTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
        >
          <Icon name="RefreshCw" size={15} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: '#fef9f0', color: '#92600a' }}>
          <Icon name="AlertTriangle" size={16} />
          {error}
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Клиентов',
            value: fmt(stats?.totalCustomers),
            sub: stats?.newCustomers7d ? `+${stats.newCustomers7d} за неделю` : null,
            icon: 'Users',
            accent: '#8b6a4e',
            bg: '#f8efe0',
          },
          {
            label: 'Новых за месяц',
            value: fmt(stats?.newCustomers30d),
            sub: stats?.newCustomers7d ? `${stats.newCustomers7d} за 7 дней` : null,
            icon: 'UserPlus',
            accent: '#7c9885',
            bg: '#f0f7f3',
          },
          {
            label: 'Событий (7 дней)',
            value: fmt(stats?.upcomingEvents7d),
            sub: stats?.upcomingEvents30d ? `${stats.upcomingEvents30d} за месяц` : null,
            icon: 'Calendar',
            accent: '#9d7bb5',
            bg: '#f5f0fb',
            link: '/admin/events',
          },
          {
            label: 'Активных наград',
            value: fmt(stats?.activeRewards),
            sub: stats?.featuredRewards ? `${stats.featuredRewards} рекомендуемых` : null,
            icon: 'Gift',
            accent: '#c17b7b',
            bg: '#fdf0f0',
            link: '/admin/rewards',
          },
        ].map(({ label, value, sub, icon, accent, bg, link }) => (
          <div
            key={label}
            onClick={() => link && navigate(link)}
            className={`rounded-2xl p-5 transition-all ${link ? 'cursor-pointer hover:shadow-md' : ''}`}
            style={{ background: bg }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
                <Icon name={icon} size={18} style={{ color: accent }} />
              </div>
              {link && <Icon name="ChevronRight" size={16} className="text-muted-foreground" />}
            </div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
            {sub && <div className="text-xs mt-1" style={{ color: accent }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Tiers + Recent regs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Customer tiers */}
        <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">Клиенты по статусу</h2>
            <span className="text-xs text-muted-foreground">{fmt(stats?.totalCustomers)} всего</span>
          </div>
          {tierEntries.length > 0 ? (
            <div className="space-y-3">
              {tierEntries.map(([tier, count]) => {
                const pct = totalByTier > 0 ? (count / totalByTier) * 100 : 0;
                const cfg = TIER_CONFIG[tier] || { label: tier, color: '#99836c' };
                return (
                  <div key={tier}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{cfg.label}</span>
                      <span className="text-muted-foreground">{fmt(count)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Данные о статусах не поступают с сервера</p>
          )}
        </div>

        {/* Registrations chart */}
        {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
          <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-semibold text-foreground mb-5">Регистрации за 7 дней</h2>
            <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
              {stats.recentRegistrations.map((reg, i) => {
                const h = maxReg > 0 ? Math.max(8, (reg.count / maxReg) * 80) : 8;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{reg.count > 0 ? reg.count : ''}</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: h, background: reg.count > 0 ? '#c89864' : 'var(--color-muted)' }}
                    />
                    <span className="text-[10px] text-muted-foreground">{fmtDate(reg.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Banners + rewards summary if no reg data */
          <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-semibold text-foreground mb-5">Контент</h2>
            <div className="space-y-3">
              {[
                { label: 'Активных баннеров', value: stats?.activeNewsBanners, total: stats?.totalNewsBanners, link: '/admin/news' },
                { label: 'Активных наград', value: stats?.activeRewards, total: stats?.totalRewards, link: '/admin/rewards' },
                { label: 'Предстоящих событий', value: stats?.upcomingEvents30d, total: stats?.totalEvents, link: '/admin/events' },
              ].map(({ label, value, total, link }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 cursor-pointer hover:text-primary transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onClick={() => navigate(link)}
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{fmt(value)} <span className="text-muted-foreground font-normal">/ {fmt(total)}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content summary (when reg chart is shown) */}
      {stats?.recentRegistrations && stats.recentRegistrations.length > 0 && (
        <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
          <h2 className="text-base font-semibold text-foreground mb-4">Контент</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Баннеров', value: stats?.activeNewsBanners, total: stats?.totalNewsBanners, icon: 'Megaphone', link: '/admin/news', accent: '#9d7bb5' },
              { label: 'Наград', value: stats?.activeRewards, total: stats?.totalRewards, icon: 'Gift', link: '/admin/rewards', accent: '#c17b7b' },
              { label: 'Событий', value: stats?.upcomingEvents30d, total: stats?.totalEvents, icon: 'Calendar', link: '/admin/events', accent: '#8b6a4e' },
            ].map(({ label, value, total, icon, link, accent }) => (
              <div
                key={label}
                onClick={() => navigate(link)}
                className="flex flex-col gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={icon} size={15} style={{ color: accent }} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {fmt(value)}
                </span>
                <span className="text-xs text-muted-foreground">из {fmt(total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Добавить баннер', icon: 'Megaphone', link: '/admin/news', accent: '#9d7bb5', bg: '#f5f0fb' },
          { label: 'Добавить награду', icon: 'Gift', link: '/admin/rewards', accent: '#c17b7b', bg: '#fdf0f0' },
          { label: 'Добавить событие', icon: 'Calendar', link: '/admin/events', accent: '#8b6a4e', bg: '#f8efe0' },
        ].map(({ label, icon, link, accent, bg }) => (
          <button
            key={label}
            onClick={() => navigate(link)}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all hover:shadow-md active:scale-[0.98]"
            style={{ background: bg }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}20` }}>
              <Icon name={icon} size={18} style={{ color: accent }} />
            </div>
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <Icon name="ArrowRight" size={15} className="ml-auto text-muted-foreground" />
          </button>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
