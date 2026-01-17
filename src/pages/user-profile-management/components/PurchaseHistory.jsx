import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { getApiUrl } from '../../../config/api';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPurchaseHistory();
  }, []);

  const loadPurchaseHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const response = await fetch(getApiUrl('orders/purchase-history'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Purchase history response:', data);
        if (data.success) {
          const purchases = data.purchases || [];
          console.log('📦 Purchases loaded:', purchases.length);
          setPurchases(purchases);
        } else {
          console.error('❌ Purchase history error:', data.error);
          setError(data.error || 'Ошибка загрузки истории');
        }
      } else if (response.status === 401) {
        setError('Требуется авторизация');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Purchase history HTTP error:', response.status, errorData);
        setError(errorData.error || 'Ошибка загрузки истории покупок');
      }
    } catch (err) {
      console.error('Error loading purchase history:', err);
      setError('Ошибка загрузки истории покупок');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Загрузка истории...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadPurchaseHistory}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="ShoppingBag" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">История покупок пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => {
        // Safely parse items
        let items = [];
        try {
          if (typeof purchase.items === 'string') {
            items = JSON.parse(purchase.items);
          } else if (Array.isArray(purchase.items)) {
            items = purchase.items;
          } else if (purchase.items && typeof purchase.items === 'object') {
            items = [purchase.items];
          }
        } catch (parseError) {
          console.error('Error parsing purchase items:', parseError);
          items = [];
        }

        return (
          <div
            key={purchase.id || purchase.order_number}
            className="bg-card rounded-lg p-4 border border-border"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="Package" size={18} className="text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    Заказ #{purchase.order_number || 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {purchase.branch_name || 'Филиал не указан'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {purchase.order_date ? formatDate(purchase.order_date) : 'Дата не указана'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">
                  {formatPrice(purchase.total_amount || 0)}
                </p>
                {purchase.cashback_amount > 0 && (
                  <p className="text-sm text-primary font-medium mt-1">
                    +{formatPrice(purchase.cashback_amount)} кешбэк
                  </p>
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  purchase.status === 'CLOSED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {purchase.status === 'CLOSED' ? 'Завершен' : (purchase.status || 'Неизвестно')}
                </span>
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm font-medium text-foreground mb-2">Блюда:</p>
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name || 'Блюдо'} × {item.quantity || 1}
                      </span>
                      <span className="text-foreground">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseHistory;
