import React from 'react';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CheckoutSuccessModal = ({ isOpen, onClose, orderNumber, estimatedTime }) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Icon name="CheckCircle2" size={32} color="var(--color-success)" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Заказ оформлен!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ваш заказ успешно принят и передан на кухню
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Номер заказа</span>
            <span className="text-base font-bold text-foreground">#{orderNumber}</span>
          </div>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Icon name="Gift" size={20} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Кешбэк</h3>
              <p className="text-xs text-muted-foreground">
                Чтобы получить кешбэк, подойдите к кассе
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="default" fullWidth onClick={onClose}>
            Отлично
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default CheckoutSuccessModal;