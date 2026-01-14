import React, { useState, useEffect } from 'react';

export default function TelegramTest() {
  const [telegramData, setTelegramData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        const data = {
          isAvailable: true,
          initData: tg.initData,
          initDataUnsafe: tg.initDataUnsafe,
          version: tg.version,
          platform: tg.platform,
          colorScheme: tg.colorScheme,
          viewportHeight: tg.viewportHeight,
          viewportStableHeight: tg.viewportStableHeight,
          headerColor: tg.headerColor,
          backgroundColor: tg.backgroundColor,
          isExpanded: tg.isExpanded,
          
          // User data
          user: tg.initDataUnsafe?.user,
          chat: tg.initDataUnsafe?.chat,
          
          // Chat ID extraction
          chatIdFromChat: tg.initDataUnsafe?.chat?.id,
          chatIdFromUser: tg.initDataUnsafe?.user?.id,
          selectedChatId: tg.initDataUnsafe?.chat?.id || tg.initDataUnsafe?.user?.id || null,
        };

        setTelegramData(data);
      } else {
        setError('Telegram Web App API not available');
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Telegram Web App Test</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {telegramData ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Telegram Web App Data</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(telegramData, null, 2)}
              </pre>
            </div>

            {telegramData.user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">User Info</h3>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {telegramData.user.id}</p>
                  <p><strong>First Name:</strong> {telegramData.user.first_name}</p>
                  <p><strong>Last Name:</strong> {telegramData.user.last_name || 'N/A'}</p>
                  <p><strong>Username:</strong> {telegramData.user.username || 'N/A'}</p>
                  <p><strong>Language:</strong> {telegramData.user.language_code || 'N/A'}</p>
                </div>
              </div>
            )}

            {telegramData.chat && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Chat Info</h3>
                <div className="space-y-2">
                  <p><strong>Chat ID:</strong> {telegramData.chat.id}</p>
                  <p><strong>Type:</strong> {telegramData.chat.type || 'N/A'}</p>
                  <p><strong>Title:</strong> {telegramData.chat.title || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className={`${telegramData.selectedChatId ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
              <h3 className="text-lg font-semibold mb-2">Selected Chat ID</h3>
              <p className="text-2xl font-mono">
                {telegramData.selectedChatId || 'NULL'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {telegramData.selectedChatId 
                  ? `This will be saved as telegram_chat_id: ${telegramData.selectedChatId}` 
                  : 'No chat ID available - this is the problem!'}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">How to test:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open this page from Telegram bot (not from browser directly)</li>
                <li>Check if "Selected Chat ID" shows a number</li>
                <li>If NULL, the bot integration is not configured correctly</li>
                <li>If shows a number, registration should save telegram_chat_id</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Loading Telegram data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
