import React, { useState } from 'react';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { formatPrice } from '../../../utils/formatPrice';

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  selectedBranch,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onProceedToCheckout,
  onItemCommentChange,
  orderType = 'takeaway',
  deliveryAddress = null
}) => {
  const [itemComments, setItemComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const useCheckoutPage = !!onProceedToCheckout;
  const isDelivery = orderType === 'delivery';
  const canProceed = isDelivery ? !!deliveryAddress?.address : !!selectedBranch;

  const totalAmount = cartItems?.reduce((sum, item) => {
    const basePrice = item?.price || 0;
    const modifierPrice = item?.selectedModifier?.price || 0;
    return sum + ((basePrice + modifierPrice) * item?.quantity);
  }, 0);
  const totalItems = cartItems?.reduce((sum, item) => sum + item?.quantity, 0);

  const itemCountLabel = (n) => {
    if (n === 1) return '1 товар';
    if (n >= 2 && n <= 4) return `${n} товара`;
    return `${n} товаров`;
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleCommentSave = (itemId, comment) => {
    setItemComments(prev => ({ ...prev, [itemId]: comment }));
    if (onItemCommentChange) onItemCommentChange(itemId, comment);
    setEditingCommentId(null);
  };

  const handleCheckoutWithComments = async () => {
    if (useCheckoutPage && onProceedToCheckout) {
      onProceedToCheckout(itemComments);
      onClose();
      return;
    }
    if (!onCheckout || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onCheckout(itemComments);
    } catch (e) {
      console.error('Checkout error:', e);
      setIsSubmitting(false);
      alert(e?.message || 'Не удалось оформить заказ. Попробуйте ещё раз.');
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Корзина</h2>
            {totalItems > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{itemCountLabel(totalItems)}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
            aria-label="Закрыть корзину"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {cartItems?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Icon name="ShoppingCart" size={28} color="var(--color-muted-foreground)" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Корзина пуста</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Добавьте блюда из меню
            </p>
            <Button variant="default" onClick={onClose} size="sm">
              Вернуться к меню
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-border">
                {cartItems?.map((item) => {
                  const itemId = item?.cartItemId || item?.id;
                  return (
                    <div key={itemId} className="px-5 py-3.5">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                          <Image
                            src={item?.image}
                            alt={item?.imageAlt}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground leading-snug">{item?.name}</h3>
                              {item?.selectedModifier && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.selectedModifier.name}
                                  {item.selectedModifier.price > 0 && (
                                    <span className="ml-1 text-accent">+{formatPrice(item.selectedModifier.price)}</span>
                                  )}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => onRemoveItem(itemId)}
                              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 cursor-pointer"
                              aria-label="Удалить из корзины"
                            >
                              <Icon name="Trash2" size={14} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Qty pill */}
                            <div className="flex items-center gap-1 bg-muted rounded-full px-1 py-0.5">
                              <button
                                onClick={() => handleQuantityChange(itemId, item?.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-card transition-colors cursor-pointer"
                                aria-label="Уменьшить"
                              >
                                <Icon name="Minus" size={12} />
                              </button>
                              <span className="text-sm font-semibold min-w-[20px] text-center">{item?.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(itemId, item?.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-card transition-colors cursor-pointer"
                                aria-label="Увеличить"
                              >
                                <Icon name="Plus" size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              {formatPrice((item?.price + (item?.selectedModifier?.price || 0)) * item?.quantity)}
                            </span>
                          </div>

                          {/* Comment */}
                          {editingCommentId === itemId ? (
                            <div className="mt-2 space-y-1.5">
                              <textarea
                                value={itemComments?.[itemId] || ''}
                                onChange={(e) => setItemComments(prev => ({ ...prev, [itemId]: e?.target?.value }))}
                                placeholder="Без соли, без перца..."
                                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCommentSave(itemId, itemComments?.[itemId] || '')}
                                  className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
                                >
                                  Сохранить
                                </button>
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-3 py-1 text-xs bg-muted text-foreground rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingCommentId(itemId)}
                              className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                            >
                              <Icon name="MessageSquare" size={11} />
                              {itemComments?.[itemId] ? (
                                <span className="text-foreground/70 truncate max-w-[160px]">{itemComments[itemId]}</span>
                              ) : (
                                <span>Добавить комментарий</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 pt-4 pb-5 bg-card">
              {useCheckoutPage && !canProceed && (
                <div className="flex items-start gap-2 mb-3 p-2.5 bg-warning/10 rounded-xl">
                  <Icon name="AlertCircle" size={14} className="text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {isDelivery ? 'Укажите адрес доставки' : 'Выберите филиал для самовывоза'}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{itemCountLabel(totalItems)}</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(totalAmount)}</span>
              </div>
              <Button
                variant="default"
                fullWidth
                size="lg"
                iconName={useCheckoutPage ? 'ArrowRight' : 'CreditCard'}
                iconPosition="right"
                onClick={handleCheckoutWithComments}
                disabled={isSubmitting || (useCheckoutPage && !canProceed)}
                className="rounded-xl"
              >
                {isSubmitting ? 'Отправка...' : useCheckoutPage ? 'Оформить заказ' : 'Подтвердить'}
              </Button>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  );
};

export default CartModal;
