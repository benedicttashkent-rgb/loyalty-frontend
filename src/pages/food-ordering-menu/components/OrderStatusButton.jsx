import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ModalOverlay from '../../../components/navigation/ModalOverlay';

const OrderStatusButton = ({ orderNumber, estimatedTime, branch, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!orderNumber) return null;

  return (
    <>
      {/* Floating Order Status Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground rounded-full shadow-lg p-4 hover:bg-primary/90 transition-all flex items-center gap-2 animate-pulse"
        aria-label="Статус заказа"
      >
        <Icon name="Package" size={20} />
        <span className="text-sm font-medium">Заказ #{orderNumber?.slice(-4)}</span>
      </button>

      {/* Order Status Modal */}
      <ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Статус заказа</h2>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Закрыть"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Order Number */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Номер заказа</span>
                <span className="text-base font-bold text-foreground">#{orderNumber}</span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Clock" size={20} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">Готовится</span>
              </div>
              <p className="text-xs text-muted-foreground ml-7">
                Ваш заказ принят на кухню. Приблизительное время готовности: {estimatedTime || '15-20 мин'}
              </p>
            </div>

            {/* Branch Info */}
            {branch && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={20} className="text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{branch.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground text-center">
                Когда заказ будет готов, мы уведомим вас. Заберите заказ в филиале.
              </p>
            </div>
          </div>
        </div>
      </ModalOverlay>
    </>
  );
};

export default OrderStatusButton;
