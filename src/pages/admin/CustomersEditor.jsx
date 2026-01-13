import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { formatDateDDMMYYYY } from '../../utils/formatDate';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';
import { bulkAddCardsToCustomers } from '../../utils/bulkAddCards';
import { syncCardsToIiko } from '../../utils/syncCardsToIiko';

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
  const [includeBalance, setIncludeBalance] = useState(true);
  const [showAll, setShowAll] = useState(true); // Show all customers by default
  const [limit, setLimit] = useState(1000); // Large limit to show all
  const [bulkAddingCards, setBulkAddingCards] = useState(false);
  const [syncingCards, setSyncingCards] = useState(false);

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
          setShowDetails(true);
        }
      }
    } catch (error) {
      console.error('Fetch customer details error:', error);
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

  const handleBulkAddCards = async () => {
    if (!confirm('Вы уверены, что хотите добавить карты всем клиентам без карт? Это действие может занять некоторое время.')) {
      return;
    }

    setBulkAddingCards(true);
    try {
      const result = await bulkAddCardsToCustomers();
      if (result.success) {
        alert(`✅ Успешно! ${result.message}\n${result.stats ? `Добавлено карт: ${result.stats.added || 0}\nОбработано клиентов: ${result.stats.processed || 0}` : ''}`);
        fetchCustomers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        alert(`❌ Ошибка: ${result.message}`);
      }
    } catch (error) {
      console.error('Bulk add cards error:', error);
      alert(`❌ Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setBulkAddingCards(false);
    }
  };

  const handleSyncCardsToIiko = async () => {
    if (!confirm('Вы уверены, что хотите синхронизировать карты клиентов с iiko? Это действие синхронизирует карты из нашей базы данных в iiko для клиентов, у которых есть карта в БД, но нет в iiko. Это может занять некоторое время.')) {
      return;
    }

    setSyncingCards(true);
    try {
      const result = await syncCardsToIiko();
      if (result.success) {
        alert(`✅ Успешно! ${result.message}\n${result.stats ? `Синхронизировано карт: ${result.stats.synced || 0}\nОбработано клиентов: ${result.stats.processed || 0}\nОшибок: ${result.stats.failed || 0}` : ''}`);
        fetchCustomers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        alert(`❌ Ошибка: ${result.message}`);
      }
    } catch (error) {
      console.error('Sync cards to iiko error:', error);
      alert(`❌ Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setSyncingCards(false);
    }
  };

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
            onClick={handleSyncCardsToIiko}
            disabled={syncingCards || bulkAddingCards}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncingCards ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Синхронизация с iiko...
              </>
            ) : (
              <>
                <Icon name="RefreshCw" size={18} />
                Синхронизировать карты с iiko
              </>
            )}
          </button>
          <button
            onClick={handleBulkAddCards}
            disabled={bulkAddingCards || syncingCards}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkAddingCards ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Добавление карт...
              </>
            ) : (
              <>
                <Icon name="CreditCard" size={18} />
                Добавить карты клиентам без карт
              </>
            )}
          </button>
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
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Детали клиента</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedCustomer(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Имя</label>
                  <p className="text-foreground font-medium">
                    {selectedCustomer.name || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Фамилия</label>
                  <p className="text-foreground font-medium">
                    {selectedCustomer.sur_name || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Телефон</label>
                  <p className="text-foreground">{formatPhone(selectedCustomer.phone)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <p className="text-foreground">{selectedCustomer.email || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Дата рождения</label>
                  <p className="text-foreground">
                    {formatDateDDMMYYYY(selectedCustomer.birth_date) || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Дата регистрации</label>
                  <p className="text-foreground">
                    {formatDateDDMMYYYY(selectedCustomer.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Баланс</label>
                  <p className="text-foreground font-semibold text-primary text-lg">
                    {formatBalance(selectedCustomer.balance)} сум
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Статус</label>
                  <p className="text-foreground">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedCustomer.is_new_customer
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}
                    >
                      {selectedCustomer.is_new_customer ? 'Новый' : 'Существующий'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Карта лояльности</label>
                  <p className="text-foreground">{selectedCustomer.card_number || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Тир</label>
                  <p className="text-foreground">{selectedCustomer.tier || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Последний визит</label>
                  <p className="text-foreground">
                    {selectedCustomer.last_visit_date
                      ? formatDateDDMMYYYY(selectedCustomer.last_visit_date)
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Количество визитов</label>
                  <p className="text-foreground">{selectedCustomer.visit_count || 0}</p>
                </div>
                {selectedCustomer.iiko_customer_id && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">iiko ID</label>
                    <p className="text-xs text-foreground font-mono">
                      {selectedCustomer.iiko_customer_id}
                    </p>
                  </div>
                )}
                {selectedCustomer.telegram_chat_id && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Telegram Chat ID</label>
                    <p className="text-xs text-foreground font-mono">
                      {selectedCustomer.telegram_chat_id}
                    </p>
                  </div>
                )}
                {selectedCustomer.iikoInfo && (
                  <>
                    {selectedCustomer.iikoInfo.categories && selectedCustomer.iikoInfo.categories.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Категории iiko</label>
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomer.iikoInfo.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCustomer.iikoInfo.walletBalances && selectedCustomer.iikoInfo.walletBalances.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Кошельки iiko</label>
                        <div className="space-y-1">
                          {selectedCustomer.iikoInfo.walletBalances.map((wallet, idx) => (
                            <div key={idx} className="text-xs text-foreground">
                              <span className="font-medium">{wallet.name}:</span>{' '}
                              <span className="text-primary">{(wallet.balance || 0).toLocaleString('ru-RU')} сум</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersEditor;

