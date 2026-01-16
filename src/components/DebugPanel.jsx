import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';

/**
 * Debug Panel Component
 * Shows console logs and debug information in the UI
 * Useful for debugging in Telegram Web App where console is not accessible
 */
const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      setLogs(prev => [...prev.slice(-49), { // Keep last 50 logs
        type,
        message,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
      }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    // Collect debug info
    const collectDebugInfo = () => {
      const info = {
        isTelegram: !!window.Telegram?.WebApp,
        telegramChatId: window.Telegram?.WebApp?.initDataUnsafe?.chat?.id || 
                        window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 
                        'Not detected',
        telegramUser: window.Telegram?.WebApp?.initDataUnsafe?.user || null,
        apiUrl: import.meta.env.VITE_API_BASE_URL || 'Not set',
        authToken: localStorage.getItem('authToken') ? 'Present' : 'Missing',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      setDebugInfo(info);
    };

    collectDebugInfo();
    const interval = setInterval(collectDebugInfo, 5000); // Update every 5 seconds

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      clearInterval(interval);
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors"
        title="Открыть панель отладки"
        aria-label="Debug Panel"
      >
        <Icon name="Terminal" size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Панель отладки</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Очистить
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground mb-2">Информация о системе</h3>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telegram Web App:</span>
              <span className={debugInfo.isTelegram ? 'text-green-500' : 'text-red-500'}>
                {debugInfo.isTelegram ? 'Да' : 'Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chat ID:</span>
              <span className="text-foreground">{String(debugInfo.telegramChatId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API URL:</span>
              <span className="text-foreground truncate max-w-xs" title={debugInfo.apiUrl}>
                {debugInfo.apiUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth Token:</span>
              <span className={debugInfo.authToken === 'Present' ? 'text-green-500' : 'text-red-500'}>
                {debugInfo.authToken}
              </span>
            </div>
            {debugInfo.telegramUser && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telegram User:</span>
                <span className="text-foreground">
                  {debugInfo.telegramUser.first_name} {debugInfo.telegramUser.last_name || ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <h3 className="text-sm font-semibold text-foreground mb-2">Логи ({logs.length})</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Логи появятся здесь...
            </p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs font-mono ${
                    log.type === 'error' ? 'bg-red-500/10 text-red-500' :
                    log.type === 'warn' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-muted/30 text-foreground'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
                    <span className="text-[10px] uppercase">{log.type}</span>
                  </div>
                  <div className="mt-1 break-words whitespace-pre-wrap">{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Панель отладки для Telegram Web App
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
