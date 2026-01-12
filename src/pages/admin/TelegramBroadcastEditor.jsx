import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';

const TelegramBroadcastEditor = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    includeWebAppButton: false,
    buttonText: 'Открыть приложение',
    visitFrequency: 'all',
    sendToAll: false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [testChatId, setTestChatId] = useState('');
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/broadcast/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: need either message or photo
    if ((!formData.message || formData.message.trim() === '') && !photoFile) {
      alert('Введите сообщение или загрузите фото для рассылки');
      return;
    }

    // Get count for confirmation
    let count = 0;
    if (formData.sendToAll) {
      count = stats?.telegramCustomers || 0;
    } else if (formData.visitFrequency !== 'all') {
      const frequencyKey = formData.visitFrequency;
      count = stats?.visitFrequency?.[frequencyKey] || 0;
    } else {
      count = stats?.telegramCustomers || 0;
    }

    if (count === 0) {
      alert('Нет клиентов для рассылки по выбранным критериям');
      return;
    }

    if (!confirm(`Отправить рассылку ${count} клиентам?`)) {
      return;
    }

    setSending(true);
    try {
      const formDataToSend = new FormData();
      
      if (formData.message) {
        formDataToSend.append('message', formData.message.trim());
      }
      formDataToSend.append('includeWebAppButton', formData.includeWebAppButton ? 'true' : 'false');
      formDataToSend.append('buttonText', formData.buttonText || 'Открыть приложение');
      formDataToSend.append('visitFrequency', formData.visitFrequency || 'all');
      formDataToSend.append('sendToAll', formData.sendToAll ? 'true' : 'false');
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await fetch('/api/admin/broadcast/send', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setLastResult(data.stats);
        alert(`✅ Рассылка отправлена!\n\nУспешно: ${data.stats.sent}\nОшибок: ${data.stats.failed}`);
        setFormData({ ...formData, message: '' });
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        alert(`❌ Ошибка: ${data.error || 'Не удалось отправить рассылку'}`);
      }
    } catch (error) {
      console.error('Send broadcast error:', error);
      alert('Ошибка соединения при отправке рассылки');
    } finally {
      setSending(false);
    }
  };

  const handleTestSend = async () => {
    if (!testChatId || testChatId.trim() === '') {
      alert('Введите Chat ID для тестовой отправки');
      return;
    }

    if (!formData.message || formData.message.trim() === '') {
      alert('Введите сообщение для тестовой отправки');
      return;
    }

    setTestSending(true);
    try {
      const response = await fetch('/api/admin/broadcast/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId: testChatId.trim(),
          message: formData.message.trim(),
          includeWebAppButton: formData.includeWebAppButton,
          buttonText: formData.buttonText || 'Открыть приложение',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Тестовое сообщение отправлено успешно!');
      } else {
        alert(`❌ Ошибка: ${data.error || 'Не удалось отправить тестовое сообщение'}`);
      }
    } catch (error) {
      console.error('Test send error:', error);
      alert('Ошибка соединения при отправке тестового сообщения');
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка статистики...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Рассылки через Telegram</h1>
          <p className="text-muted-foreground mt-1">
            Отправка сообщений клиентам через Telegram бот
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Icon name="RefreshCw" size={18} />
          Обновить статистику
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Всего клиентов</span>
                <Icon name="Users" size={20} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">С Telegram</span>
                <Icon name="MessageCircle" size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{stats.telegramCustomers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.percentage}% от общего числа
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Без Telegram</span>
                <Icon name="UserX" size={20} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-muted-foreground">{stats.withoutTelegram}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Статус бота</span>
                {stats.botConfigured ? (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                ) : (
                  <Icon name="XCircle" size={20} className="text-red-500" />
                )}
              </div>
              <p className={`text-lg font-semibold ${stats.botConfigured ? 'text-green-500' : 'text-red-500'}`}>
                {stats.botConfigured ? 'Настроен' : 'Не настроен'}
              </p>
              {stats.botInfo && (
                <p className="text-xs text-muted-foreground mt-1">
                  @{stats.botInfo.username}
                </p>
              )}
            </div>
          </div>

          {/* Visit Frequency Statistics */}
          {stats.visitFrequency && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Частота посещений</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Каждую неделю</span>
                  <p className="text-xl font-bold text-foreground">{stats.visitFrequency.weekly || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Раз в месяц</span>
                  <p className="text-xl font-bold text-foreground">{stats.visitFrequency.monthly || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Меньше</span>
                  <p className="text-xl font-bold text-foreground">{stats.visitFrequency.less || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Не вернулись</span>
                  <p className="text-xl font-bold text-foreground">{stats.visitFrequency.never || 0}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!stats?.botConfigured && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={24} className="text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Telegram бот не настроен</h3>
              <p className="text-sm text-muted-foreground">
                Для отправки рассылок необходимо настроить Telegram бот. Убедитесь, что в переменных окружения указан TELEGRAM_BOT_TOKEN.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">Результат последней рассылки</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Всего отправлено</span>
              <p className="text-xl font-bold text-foreground">{lastResult.totalCustomers}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Успешно</span>
              <p className="text-xl font-bold text-green-500">{lastResult.sent}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Ошибок</span>
              <p className="text-xl font-bold text-red-500">{lastResult.failed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Создать рассылку</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Фото (необязательно)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-w-xs max-h-48 rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Удалить фото
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Можно отправить только фото, только текст, или фото с текстом
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Сообщение {!photoFile && '*'}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Введите сообщение для рассылки..."
              rows={6}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
              required={!photoFile}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Поддерживается HTML форматирование (например: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;)
            </p>
          </div>

          {/* Visit Frequency Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Категория клиентов
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={formData.sendToAll}
                  onChange={(e) => setFormData({ ...formData, sendToAll: e.target.checked, visitFrequency: 'all' })}
                  className="w-4 h-4"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium cursor-pointer">
                  Отправить всем категориям за один раз
                </label>
              </div>
              
              {!formData.sendToAll && (
                <select
                  value={formData.visitFrequency}
                  onChange={(e) => setFormData({ ...formData, visitFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="all">Все клиенты</option>
                  <option value="weekly">Приходит каждую неделю ({stats?.visitFrequency?.weekly || 0})</option>
                  <option value="monthly">Раз в месяц ({stats?.visitFrequency?.monthly || 0})</option>
                  <option value="less">Меньше ({stats?.visitFrequency?.less || 0})</option>
                  <option value="never">Один раз пришел и не вернулся ({stats?.visitFrequency?.never || 0})</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeWebAppButton"
              checked={formData.includeWebAppButton}
              onChange={(e) => setFormData({ ...formData, includeWebAppButton: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="includeWebAppButton" className="text-sm font-medium cursor-pointer">
              Добавить кнопку "Открыть приложение"
            </label>
          </div>

          {formData.includeWebAppButton && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Текст кнопки
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Открыть приложение"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={sending || !stats?.botConfigured || stats?.telegramCustomers === 0}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={18} />
                  {formData.sendToAll ? (
                    <>Отправить всем ({stats?.telegramCustomers || 0} клиентов)</>
                  ) : formData.visitFrequency !== 'all' ? (
                    <>Отправить ({(() => {
                      const freq = stats?.visitFrequency?.[formData.visitFrequency] || 0;
                      return freq;
                    })()} клиентов)</>
                  ) : (
                    <>Отправить рассылку ({stats?.telegramCustomers || 0} клиентов)</>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Test Send */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Тестовая отправка</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Отправьте сообщение на конкретный Chat ID для тестирования перед массовой рассылкой
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Telegram Chat ID *
            </label>
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="123456789"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Chat ID пользователя, которому нужно отправить тестовое сообщение
            </p>
          </div>

          <button
            onClick={handleTestSend}
            disabled={testSending || !stats?.botConfigured || !testChatId || !formData.message}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testSending ? (
              <>
                <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="MessageSquare" size={18} />
                Отправить тестовое сообщение
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramBroadcastEditor;

