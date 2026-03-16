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
    const isDelivery = data?.orderType === 'delivery';
    if (!data?.cartItems?.length) {
      navigate(menuPath, { replace: true });
      return;
    }
    if (!isDelivery && !data?.selectedBranch) {
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

    const { cartItems, selectedBranch, itemComments = {}, orderType = 'takeaway', deliveryAddress = null } = checkoutData;
    const orderNumber = `BEN${Date.now()?.toString()?.slice(-6)}`;
    const estimatedTime = orderType === 'delivery' ? '30-45 мин' : '15-20 мин';

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
        comments: itemComments,
        customerPhone,
        customerName,
        ...(orderType === 'delivery' && deliveryAddress ? { deliveryAddress: deliveryAddress.address, deliveryDetails: deliveryAddress.details } : {})
      };

      const endpoint = orderType === 'delivery' ? 'orders/delivery' : 'orders/takeaway';
      const response = await fetch(getApiUrl(endpoint), {
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
        comments: itemComments,
        status: 'NEW',
        orderType,
        deliveryAddress: deliveryAddress?.address || null
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

  if (!checkoutData) return null;

  const { cartItems, selectedBranch, itemComments = {}, orderType = 'takeaway', deliveryAddress = null } = checkoutData;
  const totalAmount = cartItems?.reduce((sum, item) => {
    const basePrice = item?.price || 0;
    const modifierPrice = item?.selectedModifier?.price || 0;
    return sum + ((basePrice + modifierPrice) * (item?.quantity || 1));
  }, 0) || 0;
  const totalItems = cartItems?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
  const hasComments = Object.values(itemComments || {}).some(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => navigate(menuPath)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Назад"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <h1 className="text-lg font-bold text-foreground">Оформление заказа</h1>
          </div>

          <div className="space-y-3">
            {/* Delivery / Branch card */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={orderType === 'delivery' ? 'Truck' : 'MapPin'} size={16} className="text-accent" />
                </div>
                <h2 className="font-semibold text-foreground text-sm">
                  {orderType === 'delivery' ? 'Адрес доставки' : 'Филиал'}
                </h2>
              </div>
              {orderType === 'delivery' ? (
                <p className="text-sm text-foreground pl-10.5">{deliveryAddress?.address || 'Адрес не указан'}</p>
              ) : (
                <div className="pl-10">
                  <p className="text-sm font-medium text-foreground">{selectedBranch?.name}</p>
                  {selectedBranch?.address && (
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedBranch.address}</p>
                  )}
                </div>
              )}
            </div>

            {/* Order items */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="ShoppingBag" size={16} className="text-primary" />
                </div>
                <h2 className="font-semibold text-foreground text-sm">Ваш заказ · {totalItems} шт.</h2>
              </div>
              <div className="space-y-3">
                {cartItems?.map((item) => (
                  <div key={item?.cartItemId || item?.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
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
                    <span className="text-sm font-bold text-foreground flex-shrink-0">
                      {formatPrice((item?.price + (item?.selectedModifier?.price || 0)) * (item?.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            {hasComments && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon name="MessageSquare" size={15} className="text-muted-foreground" />
                  </div>
                  <h2 className="font-semibold text-foreground text-sm">Комментарии</h2>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground pl-10">
                  {Object.entries(itemComments || {}).filter(([, v]) => v).map(([itemId, comment]) => {
                    const ci = cartItems?.find(i => (i?.id || i?.cartItemId)?.toString() === itemId);
                    return (
                      <li key={itemId}>
                        <span className="font-medium text-foreground">{ci?.name || 'Блюдо'}:</span>{' '}
                        {comment}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Total */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Товаров ({totalItems})</span>
                <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
              </div>
              <div className="h-px bg-border my-2.5" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Итого</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky confirm footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-safe" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="max-w-md mx-auto">
          <Button
            variant="default"
            fullWidth
            size="lg"
            iconName={isSubmitting ? undefined : 'Check'}
            iconPosition="left"
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            {isSubmitting ? 'Отправка...' : `Подтвердить · ${formatPrice(totalAmount)}`}
          </Button>
        </div>
      </div>

      <BottomTabNavigation />

      <CheckoutSuccessModal
        isOpen={successOpen}
        onClose={handleSuccessClose}
        orderNumber={orderResult.orderNumber}
        estimatedTime={orderResult.estimatedTime}
        orderType={orderType}
      />
    </div>
  );
};

export default CheckoutPage;
