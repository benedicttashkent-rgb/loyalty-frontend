import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { formatDateDDMMYYYY } from '../../utils/formatDate';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';

const CustomersEditor = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailTab, setDetailTab] = useState('info');
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [includeBalance, setIncludeBalance] = useState(true);
  const [showAll, setShowAll] = useState(true); // Show all customers by default
  const [limit, setLimit] = useState(1000); // Large limit to show all

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [page, search, sortBy, sortOrder, includeBalance, showAll, limit]);

  const fetchStats = async () => {
    try {
      const response = await adminApiRequest('admin/customers/stats', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: showAll ? '1' : page.toString(),
        limit: showAll ? '999999' : limit.toString(), // Very large limit to get all customers
        search: search.trim(),
        sortBy,
        sortOrder,
        includeBalance: includeBalance.toString(),
      });

      const response = await adminApiRequest(`admin/customers?${params}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const customersList = data.customers || [];
          setCustomers(customersList);
          setPagination(data.pagination);
          console.log(`✅ Загружено клиентов: ${customersList.length} из ${data.pagination?.total || 0}`);
          console.log(`📊 Новых: ${customersList.filter(c => c.is_new_customer).length}, Существующих: ${customersList.filter(c => !c.is_new_customer).length}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Ошибка загрузки клиентов:', errorData);
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCustomerClick = async (customer) => {
    try {
      const response = await adminApiRequest(`admin/customers/${customer.id}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedCustomer(data.customer);
          setDetailTab('info');
          setInsights(null);
          setShowDetails(true);
        }
      }
    } catch (error) {
      console.error('Fetch customer details error:', error);
    }
  };

  const fetchInsights = async (customerId) => {
    if (insights) return; // already loaded
    setInsightsLoading(true);
    try {
      const response = await adminApiRequest(`admin/customers/${customerId}/insights`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setInsights(data.insights);
      }
    } catch (e) {
      console.error('Fetch insights error:', e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('998') && phone.length === 12) {
      const digits = phone.slice(3);
      return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
    }
    return phone;
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '—';
    return balance.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getVisitFrequency = (lastVisitDate, visitCount) => {
    if (!lastVisitDate) {
      return { label: 'Не вернулся', color: 'text-red-500' };
    }

    const now = new Date();
    const lastVisit = new Date(lastVisitDate);
    const daysSinceLastVisit = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

    if (daysSinceLastVisit <= 7) {
      return { label: 'Каждую неделю', color: 'text-green-500' };
    } else if (daysSinceLastVisit <= 30) {
      return { label: 'Раз в месяц', color: 'text-blue-500' };
    } else if (daysSinceLastVisit <= 90) {
      return { label: 'Меньше', color: 'text-yellow-500' };
    } else {
      return { label: 'Не вернулся', color: 'text-red-500' };
    }
  };


  const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;

  if (loading && customers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка клиентов...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Клиенты</h1>
          <p className="text-muted-foreground mt-1">
            Список всех зарегистрированных клиентов
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAll(!showAll);
              setPage(1);
              // Fetch will happen automatically via useEffect
            }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <Icon name={showAll ? "List" : "Grid"} size={18} />
            {showAll ? 'Все клиенты' : 'С пагинацией'}
          </button>
          <button
            onClick={() => {
              setIncludeBalance(!includeBalance);
              fetchCustomers();
            }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <Icon name={includeBalance ? "RefreshCw" : "Eye"} size={18} />
            {includeBalance ? 'Обновить балансы' : 'Показать балансы'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Всего клиентов</span>
              <Icon name="Users" size={20} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Новые</span>
              <Icon name="UserPlus" size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.newCustomers}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">С iiko</span>
              <Icon name="CheckCircle" size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.withIiko}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">С Telegram</span>
              <Icon name="MessageCircle" size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.withTelegram}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Поиск</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, фамилии, телефону, карте..."
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-2">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="created_at">Дата регистрации</option>
              <option value="name">Имя</option>
              <option value="sur_name">Фамилия</option>
              <option value="phone">Телефон</option>
              <option value="last_visit_date">Последний визит</option>
              <option value="visit_count">Количество визитов</option>
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-2">Порядок</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="DESC">По убыванию</option>
              <option value="ASC">По возрастанию</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Icon name="Search" size={18} />
            Поиск
          </button>
        </form>
      </div>

      {/* Customers List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Имя</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Дата регистрации</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Баланс</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Карта</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Визиты</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">
                    Клиенты не найдены
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const visitFreq = getVisitFrequency(customer.last_visit_date, customer.visit_count);
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {customer.name || ''} {customer.sur_name || ''}
                        </div>
                        {customer.email && (
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">{formatPhone(customer.phone)}</td>
                      <td className="px-4 py-3 text-foreground">
                        {formatDateDDMMYYYY(customer.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary">
                          {formatBalance(customer.balance)} сум
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            customer.is_new_customer
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}
                        >
                          {customer.is_new_customer ? 'Новый' : 'Существующий'}
                        </span>
                        {customer.tier && (
                          <div className="text-xs text-muted-foreground mt-1">{customer.tier}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {customer.card_number || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-foreground">
                          {customer.visit_count || 0} раз
                        </div>
                        {customer.last_visit_date && (
                          <div className={`text-xs ${visitFreq.color}`}>
                            {visitFreq.label}
                          </div>
                        )}
                        {customer.last_visit_date && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDateDDMMYYYY(customer.last_visit_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCustomerClick(customer);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Icon name="Eye" size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - only show if not showing all */}
        {!showAll && pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Показано {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} из {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPage(page - 1);
                  fetchCustomers();
                }}
                disabled={page === 1}
                className="px-3 py-1 border border-input rounded-lg bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Назад
              </button>
              <span className="px-3 py-1 text-sm text-foreground">
                Страница {page} из {pagination.totalPages}
              </span>
              <button
                onClick={() => {
                  setPage(page + 1);
                  fetchCustomers();
                }}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1 border border-input rounded-lg bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
        
        {/* Show total count when showing all */}
        {showAll && pagination && (
          <div className="px-4 py-3 border-t border-border">
            <div className="text-sm text-muted-foreground text-center">
              Показано всех клиентов: <span className="font-semibold text-foreground">{pagination.total}</span>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCustomer.name || ''} {selectedCustomer.sur_name || ''}
                </h2>
                <p className="text-sm text-muted-foreground">{formatPhone(selectedCustomer.phone)}</p>
              </div>
              <button
                onClick={() => { setShowDetails(false); setSelectedCustomer(null); setInsights(null); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-border">
              {[
                { id: 'info', label: 'Профиль', icon: 'User' },
                { id: 'insights', label: 'Аналитика', icon: 'BarChart2' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setDetailTab(tab.id);
                    if (tab.id === 'insights') fetchInsights(selectedCustomer.id);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    detailTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'info' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Имя', value: selectedCustomer.name || '—' },
                    { label: 'Фамилия', value: selectedCustomer.sur_name || '—' },
                    { label: 'Телефон', value: formatPhone(selectedCustomer.phone) },
                    { label: 'Email', value: selectedCustomer.email || '—' },
                    { label: 'Дата рождения', value: formatDateDDMMYYYY(selectedCustomer.birth_date) || '—' },
                    { label: 'Дата регистрации', value: formatDateDDMMYYYY(selectedCustomer.created_at) },
                    { label: 'Последний визит', value: selectedCustomer.last_visit_date ? formatDateDDMMYYYY(selectedCustomer.last_visit_date) : '—' },
                    { label: 'Количество визитов', value: selectedCustomer.visit_count || 0 },
                    { label: 'Карта лояльности', value: selectedCustomer.card_number || '—' },
                    { label: 'Тир', value: selectedCustomer.tier || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
                      <p className="text-foreground">{value}</p>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Баланс</label>
                    <p className="text-primary font-semibold text-lg">{formatBalance(selectedCustomer.balance)} сум</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Статус</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${selectedCustomer.is_new_customer ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {selectedCustomer.is_new_customer ? 'Новый' : 'Существующий'}
                    </span>
                  </div>
                  {selectedCustomer.iiko_customer_id && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">iiko ID</label>
                      <p className="text-xs text-foreground font-mono">{selectedCustomer.iiko_customer_id}</p>
                    </div>
                  )}
                  {selectedCustomer.telegram_chat_id && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Telegram Chat ID</label>
                      <p className="text-xs text-foreground font-mono">{selectedCustomer.telegram_chat_id}</p>
                    </div>
                  )}
                  {selectedCustomer.iikoInfo?.walletBalances?.length > 0 && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Кошельки iiko</label>
                      <div className="space-y-1">
                        {selectedCustomer.iikoInfo.walletBalances.map((w, i) => (
                          <div key={i} className="text-xs text-foreground">
                            <span className="font-medium">{w.name}:</span>{' '}
                            <span className="text-primary">{(w.balance || 0).toLocaleString('ru-RU')} сум</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'insights' && (
                <div>
                  {insightsLoading && (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}

                  {!insightsLoading && !insights && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Icon name="ShoppingBag" size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Нет завершённых заказов</p>
                    </div>
                  )}

                  {!insightsLoading && insights && (
                    <div className="space-y-6">
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Заказов всего', value: insights.totalOrders, icon: 'ShoppingBag', color: 'text-primary' },
                          { label: 'За последние 30 дней', value: insights.ordersLast30, icon: 'Calendar', color: 'text-blue-500' },
                          { label: 'Общий чек', value: `${insights.totalSpend.toLocaleString('ru-RU')} сум`, icon: 'TrendingUp', color: 'text-green-500' },
                          { label: 'Средний чек', value: `${insights.avgOrderValue.toLocaleString('ru-RU')} сум`, icon: 'Receipt', color: 'text-yellow-500' },
                        ].map(({ label, value, icon, color }) => (
                          <div key={label} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name={icon} size={15} className={color} />
                              <span className="text-xs text-muted-foreground">{label}</span>
                            </div>
                            <p className={`text-lg font-bold ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Favourite day & time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon name="Star" size={15} className="text-yellow-500" />
                            <span className="text-xs text-muted-foreground">Любимый день</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{DAY_NAMES[insights.favoriteDay]}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon name="Clock" size={15} className="text-blue-400" />
                            <span className="text-xs text-muted-foreground">Любимое время</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{formatHour(insights.favoriteHour)}</p>
                        </div>
                      </div>

                      {/* Top dishes */}
                      {insights.topItems.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                            <Icon name="Utensils" size={15} />
                            Любимые блюда
                          </h3>
                          <div className="space-y-2">
                            {insights.topItems.map((item, i) => {
                              const maxQty = insights.topItems[0].totalQty;
                              const pct = Math.round((item.totalQty / maxQty) * 100);
                              return (
                                <div key={item.name}>
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-sm text-foreground flex items-center gap-1.5">
                                      {i === 0 && <Icon name="Trophy" size={13} className="text-yellow-500" />}
                                      {item.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">×{item.totalQty}</span>
                                  </div>
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Ratings */}
                      {insights.ratings.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                            <Icon name="Star" size={15} />
                            Оценки блюд
                          </h3>
                          <div className="space-y-1.5">
                            {insights.ratings.map((r, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-foreground truncate flex-1 mr-2">{r.item_name}</span>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  {Array.from({ length: 5 }).map((_, s) => (
                                    <Icon
                                      key={s}
                                      name="Star"
                                      size={11}
                                      className={s < r.rating ? 'text-yellow-400' : 'text-muted'}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersEditor;

