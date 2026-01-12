import React, { useState } from 'react';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { formatPrice } from '../../../utils/formatPrice';

const CartModal = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onItemCommentChange }) => {
  const [itemComments, setItemComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);

  const totalAmount = cartItems?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0);
  const totalItems = cartItems?.reduce((sum, item) => sum + item?.quantity, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleCommentSave = (itemId, comment) => {
    setItemComments(prev => ({
      ...prev,
      [itemId]: comment
    }));
    if (onItemCommentChange) {
      onItemCommentChange(itemId, comment);
    }
    setEditingCommentId(null);
  };

  const handleCheckoutWithComments = () => {
    if (onCheckout) {
      onCheckout(itemComments);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Корзина</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-smooth"
            aria-label="Закрыть корзину"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {cartItems?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Icon name="ShoppingCart" size={32} color="var(--color-muted-foreground)" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Корзина пуста</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Добавьте блюда из меню, чтобы начать заказ
            </p>
            <Button variant="default" onClick={onClose}>
              Вернуться к меню
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {cartItems?.map((item) => (
                  <div key={item?.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item?.image}
                          alt={item?.imageAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-foreground">{item?.name}</h3>
                          <button
                            onClick={() => onRemoveItem(item?.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-destructive/10 transition-smooth flex-shrink-0 ml-2"
                            aria-label="Удалить из корзины"
                          >
                            <Icon name="Trash2" size={14} color="var(--color-destructive)" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item?.id, item?.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-card transition-smooth"
                              aria-label="Уменьшить количество"
                            >
                              <Icon name="Minus" size={14} />
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-border">
                              {item?.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item?.id, item?.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-card transition-smooth"
                              aria-label="Увеличить количество"
                            >
                              <Icon name="Plus" size={14} />
                            </button>
                          </div>

                          <span className="text-base font-bold text-foreground">
                            {formatPrice(item?.price * item?.quantity)}
                          </span>
                        </div>

                        {/* Comment Section */}
                        {editingCommentId === item?.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={itemComments?.[item?.id] || ''}
                              onChange={(e) => setItemComments(prev => ({
                                ...prev,
                                [item?.id]: e?.target?.value
                              }))}
                              placeholder="Например: без соли, без перца..."
                              className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCommentSave(item?.id, itemComments?.[item?.id] || '')}
                                className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent/90 transition-colors"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-3 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingCommentId(item?.id)}
                            className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                          >
                            <Icon name="MessageSquare" size={12} />
                            {itemComments?.[item?.id] ? 'Изменить комментарий' : 'Добавить комментарий'}
                          </button>
                        )}

                        {itemComments?.[item?.id] && editingCommentId !== item?.id && (
                          <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                            <div className="flex items-start gap-1">
                              <Icon name="MessageSquare" size={12} className="text-accent mt-0.5 flex-shrink-0" />
                              <span>{itemComments?.[item?.id]}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4 bg-card">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Товаров ({totalItems})</span>
                  <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
                </div>
                {/* Delivery removed for MVP - only takeaway */}
                <div className="h-px bg-border"></div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">Итого</span>
                  <span className="text-xl font-bold text-foreground">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Button
                variant="default"
                fullWidth
                iconName="CreditCard"
                iconPosition="left"
                onClick={handleCheckoutWithComments}
              >
                Оформить заказ
              </Button>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  );
};

export default CartModal;