import React from 'react';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CheckoutSuccessModal = ({ isOpen, onClose, orderNumber, estimatedTime, orderType = 'takeaway' }) => {
  const isDelivery = orderType === 'delivery';

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <Icon name={isDelivery ? 'Truck' : 'CheckCircle2'} size={36} color="var(--color-success)" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-sm">
              <Icon name="Sparkles" size={14} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Заказ принят!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isDelivery
              ? 'Курьер скоро выедет к вам'
              : 'Ваш заказ передан на кухню'}
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-muted rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Hash" size={15} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Номер заказа</span>
            </div>
            <span className="text-base font-bold text-foreground">#{orderNumber}</span>
          </div>
          {estimatedTime && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={15} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Примерное время</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Cashback hint */}
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3.5 mb-6 border border-accent/20">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Icon name="Gift" size={16} color="var(--color-accent)" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-0.5">Кешбэк за заказ</p>
            <p className="text-xs text-muted-foreground">
              {isDelivery
                ? 'Начислится после доставки'
                : 'Подойдите к кассе для начисления'}
            </p>
          </div>
        </div>

        <Button variant="default" fullWidth size="lg" onClick={onClose} className="rounded-xl">
          Отлично
        </Button>
      </div>
    </ModalOverlay>
  );
};

export default CheckoutSuccessModal;
