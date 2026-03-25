import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckoutSuccessModal from './components/CheckoutSuccessModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Image from '../../components/AppImage';
import { formatPrice } from '../../utils/formatPrice';
import { getApiUrl } from '../../config/api';
import menuScraper from '../../services/menu/menuScraper';
import multicardService from '../../services/payment/multicardService';

const STORAGE_KEY = 'benedictCheckoutData';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutData, setCheckoutData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [orderResult, setOrderResult] = useState({ orderNumber: '', estimatedTime: '' });
  const [addOnItems, setAddOnItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'online'

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

  // Fetch add-on suggestions from the branch menu (uses cached data if already loaded)
  useEffect(() => {
    const branchId = checkoutData?.selectedBranch?.id;
    if (!branchId) return;
    menuScraper.fetchMenu(branchId)
      .then(data => {
        const items = menuScraper.transformMenuData(data);
        const additions = items.filter(item => item.category === 'additions').slice(0, 12);
        setAddOnItems(additions);
      })
      .catch(() => {});
  }, [checkoutData?.selectedBranch?.id]);

  const handleAddAddon = (item) => {
    setCheckoutData(prev => {
      const existing = prev.cartItems.find(ci => (ci.cartItemId || ci.id) === item.id);
      const newCartItems = existing
        ? prev.cartItems.map(ci =>
            (ci.cartItemId || ci.id) === item.id
              ? { ...ci, quantity: ci.quantity + 1 }
              : ci
          )
        : [...prev.cartItems, { ...item, quantity: 1, cartItemId: item.id, selectedModifier: null }];
      const updated = { ...prev, cartItems: newCartItems };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleConfirmOrder = async () => {
    if (!checkoutData || isSubmitting) return;

    const { cartItems, selectedBranch, itemComments = {}, orderType = 'takeaway', deliveryAddress = null } = checkoutData;
    const orderNumber = `BEN${Date.now()?.toString()?.slice(-6)}`;
    const estimatedTime = orderType === 'delivery' ? '30-45 мин' : '15-20 мин';

    setSubmitError('');
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
        paymentMethod,
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

      // TEST: call Multicard directly from frontend (move to backend for production)
      if (paymentMethod === 'online') {
        const checkoutUrl = await multicardService.createInvoice({
          invoiceId: orderNumber,
          amountUzs: totalAmount,
          returnUrl: `${window.location.origin}/payment/return?result=success`,
          returnErrorUrl: `${window.location.origin}/payment/return?result=error`,
        });
        window.location.href = checkoutUrl;
        return;
      }

      setOrderResult({ orderNumber, estimatedTime });
      setSuccessOpen(true);
    } catch (e) {
      console.error('Checkout error:', e);
      setSubmitError(e?.message || 'Не удалось оформить заказ. Попробуйте ещё раз.');
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
      {/* Scrollable content area — pb accounts for the sticky confirm footer (~80px) */}
      <div className="flex-1 overflow-y-auto pb-24">
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
                <p className="text-sm text-foreground pl-10">{deliveryAddress?.address || 'Адрес не указан'}</p>
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

            {/* Add-ons / Recommendations */}
            {addOnItems.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Sparkles" size={16} className="text-accent" />
                  </div>
                  <h2 className="font-semibold text-foreground text-sm">Добавить к заказу</h2>
                </div>
                <div
                  className="flex gap-2.5 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {addOnItems.map(item => {
                    const addedQty = checkoutData?.cartItems?.filter(ci => ci.id === item.id).reduce((s, ci) => s + (ci.quantity || 0), 0) || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-28 bg-muted/60 rounded-xl overflow-hidden border border-border/60 flex flex-col"
                      >
                        <div className="w-full h-20 overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.imageAlt || item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 flex flex-col flex-1">
                          <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 flex-1 mb-1.5">{item.name}</p>
                          <p className="text-xs font-bold text-primary mb-2">{formatPrice(item.price)}</p>
                          <button
                            onClick={() => handleAddAddon(item)}
                            style={{ touchAction: 'manipulation' }}
                            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                          >
                            <Icon name="Plus" size={12} />
                            {addedQty > 0 ? `×${addedQty + 1}` : 'Добавить'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* Payment method */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="CreditCard" size={16} className="text-primary" />
                </div>
                <h2 className="font-semibold text-foreground text-sm">Способ оплаты</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  style={{ touchAction: 'manipulation' }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <Icon name="Banknote" size={20} className={paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'} />
                  <span className={`text-xs font-medium ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`}>
                    При получении
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  style={{ touchAction: 'manipulation' }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'online'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <Icon name="Smartphone" size={20} className={paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'} />
                  <span className={`text-xs font-medium ${paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Онлайн
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky confirm footer — no tab bar on checkout (focused flow) */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 pt-3 z-40"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="max-w-md mx-auto space-y-2">
          {submitError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-xl">
              <Icon name="AlertCircle" size={15} className="text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive leading-snug">{submitError}</p>
            </div>
          )}
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
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon name="Loader2" size={16} className="animate-spin" />
                {paymentMethod === 'online' ? 'Переход к оплате...' : 'Отправка...'}
              </span>
            ) : paymentMethod === 'online'
              ? `Оплатить онлайн · ${formatPrice(totalAmount)}`
              : `Подтвердить · ${formatPrice(totalAmount)}`
            }
          </Button>
        </div>
      </div>

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
