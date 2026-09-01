import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';
import { TIER_OPTIONS } from './components/VisibilityPicker';

const TelegramBroadcastEditor = () => {
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    includeWebAppButton: false,
    buttonText: 'Открыть приложение',
    includeCustomButton: false,
    customButtonText: '',
    customButtonUrl: '',
    visitFrequency: 'all',
    loyaltyStatus: 'all',
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
    try {
      const response = await adminApiRequest('admin/broadcast/stats', {
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
      formDataToSend.append('includeCustomButton', formData.includeCustomButton ? 'true' : 'false');
      formDataToSend.append('customButtonText', formData.customButtonText || '');
      formDataToSend.append('customButtonUrl', formData.customButtonUrl || '');
      formDataToSend.append('visitFrequency', formData.visitFrequency || 'all');
      formDataToSend.append('loyaltyStatus', formData.loyaltyStatus || 'all');
      formDataToSend.append('sendToAll', formData.sendToAll ? 'true' : 'false');
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await adminApiRequest('admin/broadcast/send', {
        method: 'POST',
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

    if ((!formData.message || formData.message.trim() === '') && !photoFile) {
      alert('Введите сообщение или загрузите фото');
      return;
    }

    setTestSending(true);
    try {
      const fd = new FormData();
      fd.append('chatId', testChatId.trim());
      if (formData.message) fd.append('message', formData.message.trim());
      fd.append('includeWebAppButton', formData.includeWebAppButton ? 'true' : 'false');
      fd.append('buttonText', formData.buttonText || 'Открыть приложение');
      fd.append('includeCustomButton', formData.includeCustomButton ? 'true' : 'false');
      fd.append('customButtonText', formData.customButtonText || '');
      fd.append('customButtonUrl', formData.customButtonUrl || '');
      if (photoFile) fd.append('photo', photoFile);

      const response = await adminApiRequest('admin/broadcast/test', {
        method: 'POST',
        body: fd,
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

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Рассылки через Telegram</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Отправка сообщений клиентам через Telegram бот
        </p>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="rounded-2xl p-5 grid grid-cols-3 gap-4" style={{ background: '#f8efe0' }}>
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide -mb-1">
            Результат последней рассылки
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Всего отправлено</span>
            <p className="text-xl font-bold text-foreground">{lastResult.totalCustomers}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Успешно</span>
            <p className="text-xl font-bold" style={{ color: '#16a34a' }}>{lastResult.sent}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Ошибок</span>
            <p className="text-xl font-bold text-destructive">{lastResult.failed}</p>
          </div>
        </div>
      )}

      {/* Broadcast Form */}
      <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
        <h2 className="text-lg font-bold text-foreground mb-4">Создать рассылку</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <div>
            <label className={labelClass}>Фото (необязательно)</label>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px dashed var(--color-border)' }}>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="w-full object-cover" style={{ maxHeight: 160 }} />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <Icon name="X" size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 py-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Icon name="ImagePlus" size={22} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Нажмите для загрузки</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Можно отправить только фото, только текст, или фото с текстом
            </p>
          </div>

          <div>
            <label className={labelClass}>Сообщение {!photoFile && '*'}</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Введите сообщение для рассылки..."
              rows={6}
              className={inputClass}
              style={{ resize: 'none' }}
              required={!photoFile}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Поддерживается HTML форматирование (например: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;)
            </p>
          </div>

          {/* Visit Frequency Filter */}
          <div>
            <label className={labelClass}>Категория клиентов</label>
            <div className="space-y-2.5 p-4 rounded-xl" style={{ background: 'var(--color-muted)' }}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  className="w-10 h-6 rounded-full relative transition-colors flex-shrink-0"
                  style={{ background: formData.sendToAll ? 'var(--color-primary)' : 'var(--color-border)' }}
                  onClick={() => setFormData({ ...formData, sendToAll: !formData.sendToAll, visitFrequency: 'all' })}
                >
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: formData.sendToAll ? 22 : 4 }} />
                </div>
                <span className="text-xs font-medium text-foreground">Отправить всем категориям за один раз</span>
              </label>

              {!formData.sendToAll && (
                <select
                  value={formData.visitFrequency}
                  onChange={(e) => setFormData({ ...formData, visitFrequency: e.target.value })}
                  className={inputClass}
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

          {/* Loyalty status filter */}
          <div>
            <label className={labelClass}>Статус лояльности</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, loyaltyStatus: 'all' }))}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={formData.loyaltyStatus === 'all'
                  ? { background: 'var(--color-primary)', color: 'var(--color-primary-foreground)', borderColor: 'var(--color-primary)' }
                  : { background: 'var(--color-background)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }}
              >
                Все статусы
              </button>
              {TIER_OPTIONS.map(tier => {
                const active = formData.loyaltyStatus === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, loyaltyStatus: active ? 'all' : tier.id }))}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                    style={active
                      ? { background: tier.color, color: '#fff', borderColor: tier.color }
                      : { background: 'var(--color-background)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }}
                  >
                    {tier.label}
                    {stats?.loyaltyStatus?.[tier.id] != null && (
                      <span className="ml-1 opacity-70">({stats.loyaltyStatus[tier.id]})</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Фильтрует по уровню клиента в программе лояльности
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 p-4 rounded-xl" style={{ background: 'var(--color-muted)' }}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                className="w-10 h-6 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: formData.includeWebAppButton ? 'var(--color-primary)' : 'var(--color-border)' }}
                onClick={() => setFormData({ ...formData, includeWebAppButton: !formData.includeWebAppButton, includeCustomButton: false })}
              >
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: formData.includeWebAppButton ? 22 : 4 }} />
              </div>
              <span className="text-xs font-medium text-foreground">Добавить кнопку «Открыть приложение» (Mini App)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                className="w-10 h-6 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: formData.includeCustomButton ? 'var(--color-primary)' : 'var(--color-border)' }}
                onClick={() => setFormData({ ...formData, includeCustomButton: !formData.includeCustomButton, includeWebAppButton: false })}
              >
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: formData.includeCustomButton ? 22 : 4 }} />
              </div>
              <span className="text-xs font-medium text-foreground">Добавить кнопку со ссылкой</span>
            </label>
          </div>

          {formData.includeWebAppButton && (
            <div>
              <label className={labelClass}>Текст кнопки</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Открыть приложение"
                className={inputClass}
              />
            </div>
          )}

          {formData.includeCustomButton && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Текст кнопки *</label>
                <input
                  type="text"
                  value={formData.customButtonText}
                  onChange={(e) => setFormData({ ...formData, customButtonText: e.target.value })}
                  placeholder="Перейти на сайт"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ссылка (URL) *</label>
                <input
                  type="url"
                  value={formData.customButtonUrl}
                  onChange={(e) => setFormData({ ...formData, customButtonUrl: e.target.value })}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={sending || !stats?.botConfigured || stats?.telegramCustomers === 0}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      <div className="bg-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
        <h2 className="text-lg font-bold text-foreground mb-1">Тестовая отправка</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Отправляет то же сообщение, фото и кнопки на конкретный Chat ID
        </p>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Telegram Chat ID *</label>
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="123456789"
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Chat ID пользователя для теста
            </p>
          </div>

          {/* Preview what will be sent */}
          {(formData.message || photoPreview || formData.includeWebAppButton || formData.includeCustomButton) && (
            <div className="rounded-xl p-3.5 space-y-1.5" style={{ background: 'var(--color-muted)' }}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Будет отправлено:</p>
              {photoPreview && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Icon name="Image" size={14} className="text-muted-foreground" />
                  Фото прикреплено
                </div>
              )}
              {formData.message && (
                <div className="flex items-start gap-2 text-sm text-foreground">
                  <Icon name="MessageSquare" size={14} className="text-muted-foreground mt-0.5" />
                  <span className="truncate">{formData.message.slice(0, 60)}{formData.message.length > 60 ? '…' : ''}</span>
                </div>
              )}
              {formData.includeWebAppButton && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Icon name="AppWindow" size={14} className="text-muted-foreground" />
                  Кнопка: {formData.buttonText || 'Открыть приложение'}
                </div>
              )}
              {formData.includeCustomButton && formData.customButtonText && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Icon name="Link" size={14} className="text-muted-foreground" />
                  Кнопка: {formData.customButtonText} → {formData.customButtonUrl || '(нет URL)'}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleTestSend}
            disabled={testSending || !stats?.botConfigured || !testChatId || (!formData.message && !photoFile)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testSending ? (
              <>
                <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="MessageSquare" size={18} />
                Отправить тест
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramBroadcastEditor;

