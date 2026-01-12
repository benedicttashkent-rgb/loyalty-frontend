import React from 'react';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SuccessModal = ({ isOpen, onClose, reward, newBalance }) => {
  if (!reward) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle2" size={40} color="var(--color-success)" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          Обмен успешен!
        </h2>
        <p className="text-muted-foreground mb-6">
          Ваша награда готова к получению
        </p>

        <div className="bg-muted rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Gift" size={24} color="var(--color-primary)" />
            <h3 className="text-lg font-semibold text-foreground">
              {reward?.name}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Потрачено баллов:</span>
              <span className="text-base font-semibold text-foreground">
                {reward?.pointsCost?.toLocaleString('ru-RU')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Новый баланс:</span>
              <span className="text-lg font-bold text-primary">
                {newBalance?.toLocaleString('ru-RU')} баллов
              </span>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3">
            <Icon name="MapPin" size={20} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Как получить награду
              </p>
              <p className="text-sm text-muted-foreground">
                Посетите любое кафе Benedict и покажите QR-код из вашего профиля на кассе. Награда будет выдана немедленно.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="default"
          fullWidth
          onClick={onClose}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Отлично
        </Button>
      </div>
    </ModalOverlay>
  );
};

export default SuccessModal;