import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../../components/navigation/BrandLogo';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import CheckoutSuccessModal from './components/CheckoutSuccessModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Image from '../../components/AppImage';
import { formatPrice } from '../../utils/formatPrice';
import { getApiUrl } from '../../config/api';

const STORAGE_KEY = 'benedictCheckoutData';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutData, setCheckoutData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [orderResult, setOrderResult] = useState({ orderNumber: '', estimatedTime: '' });

  const menuPath = '/food-ordering-menu';

  useEffect(() => {
    const fromState = location.state;
    const fromStorage = (() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    const data = fromState || fromStorage;
    if (!data?.cartItems?.length || !data?.selectedBranch) {
      navigate(menuPath, { replace: true });
      return;
    }
    setCheckoutData(data);
    if (fromState && !fromStorage) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [location.state, location.pathname, navigate, menuPath]);

  const handleConfirmOrder = async () => {
    if (!checkoutData || isSubmitting) return;

    const { cartItems, selectedBranch, itemComments = {} } = checkoutData;
    const orderNumber = `BEN${Date.now()?.toString()?.slice(-6)}`;
    const estimatedTime = '15-20 мин';
    const orderComments = itemComments;

    setIsSubmitting(true);
    try {
      const totalAmount = cartItems.reduce((sum, item) => {
        const basePrice = item?.price || 0;
        const modifierPrice = item?.selectedModifier?.price || 0;
        return sum + ((basePrice + modifierPrice) * (item?.quantity || 1));
      }, 0);

      let customerPhone = null;
      let customerName = null;
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const meRes = await fetch(getApiUrl('customers/me'), {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (meRes.ok) {
            const data = await meRes.json();
            if (data.success && data.customer) {
              customerPhone = data.customer.phone;
              customerName = `${data.customer.name || ''} ${data.customer.surName || ''}`.trim() || null;
            }
          }
        } catch (e) {
          console.error('Error fetching customer:', e);
        }
      }

      const orderData = {
        orderNumber,
        branch: selectedBranch,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifier: item.selectedModifier ? {
            id: item.selectedModifier.id,
            name: item.selectedModifier.name,
            price: item.selectedModifier.price || 0
          } : null
        })),
        totalAmount,
        comments: orderComments,
        customerPhone,
        customerName
      };

      const response = await fetch(getApiUrl('orders/takeaway'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'Не удалось отправить заказ';
        try {
          const errJson = JSON.parse(errText);
          if (errJson?.error) errMsg = errJson.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      sessionStorage.removeItem(STORAGE_KEY);

      const newOrderDetails = {
        orderNumber,
        estimatedTime,
        branch: selectedBranch,
        comments: orderComments,
        status: 'NEW'
      };
      localStorage.setItem('benedictOrderDetails', JSON.stringify(newOrderDetails));

      setOrderResult({ orderNumber, estimatedTime });
      setSuccessOpen(true);
    } catch (e) {
      console.error('Checkout error:', e);
      alert(e?.message || 'Не удалось оформить заказ. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate(menuPath);
  };

  const handleBack = () => {
    navigate(menuPath);
  };

  if (!checkoutData) {
    return null;
  }

  const { cartItems, selectedBranch, itemComments = {} } = checkoutData;
  const totalAmount = cartItems?.reduce((sum, item) => {
    const basePrice = item?.price || 0;
    const modifierPrice = item?.selectedModifier?.price || 0;
    return sum + ((basePrice + modifierPrice) * (item?.quantity || 1));
  }, 0) || 0;
  const totalItems = cartItems?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
  const hasComments = Object.values(itemComments || {}).some(Boolean);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="main-content max-w-md mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Назад"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <BrandLogo />
          <div className="w-10" />
        </div>

        <h1 className="text-xl font-bold text-foreground mb-6">Оформление заказа</h1>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="MapPin" size={20} className="text-accent" />
              <h2 className="font-semibold text-foreground">Филиал</h2>
            </div>
            <p className="text-foreground font-medium">{selectedBranch?.name}</p>
            {selectedBranch?.address && (
              <p className="text-sm text-muted-foreground mt-1">{selectedBranch.address}</p>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="font-semibold text-foreground mb-3">Заказ ({totalItems} шт.)</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {cartItems?.map((item) => (
                <div key={item?.cartItemId || item?.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={item?.image}
                      alt={item?.imageAlt || item?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item?.name}</p>
                    {item?.selectedModifier && (
                      <p className="text-xs text-muted-foreground">{item.selectedModifier.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item?.quantity} × {formatPrice(item?.price + (item?.selectedModifier?.price || 0))}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice((item?.price + (item?.selectedModifier?.price || 0)) * (item?.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {hasComments && (
            <div className="bg-muted/50 rounded-lg border border-border p-4">
              <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Icon name="MessageSquare" size={16} />
                Комментарии
              </h2>
              <ul className="text-sm text-muted-foreground space-y-1">
                {Object.entries(itemComments || {}).filter(([, v]) => v).map(([itemId, comment]) => {
                  const item = cartItems?.find(i => (i?.id || i?.cartItemId)?.toString() === itemId);
                  return (
                    <li key={itemId}>
                      <span className="font-medium text-foreground">{item?.name || 'Блюдо'}:</span> {comment}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Товаров ({totalItems})</span>
              <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Итого</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <Button
            variant="default"
            fullWidth
            size="lg"
            iconName="Check"
            iconPosition="left"
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Подтвердить заказ'}
          </Button>
        </div>
      </div>

      <BottomTabNavigation />

      <CheckoutSuccessModal
        isOpen={successOpen}
        onClose={handleSuccessClose}
        orderNumber={orderResult.orderNumber}
        estimatedTime={orderResult.estimatedTime}
      />
    </div>
  );
};

export default CheckoutPage;
