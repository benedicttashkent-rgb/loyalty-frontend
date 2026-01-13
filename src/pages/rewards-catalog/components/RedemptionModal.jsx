import React from 'react';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RedemptionModal = ({ isOpen, onClose, reward, userPoints, onConfirm }) => {
  if (!reward) return null;

  const handleConfirm = () => {
    onConfirm(reward);
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Подтверждение обмена</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-smooth"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="relative h-48 rounded-xl overflow-hidden bg-muted mb-4">
            <Image
              src={reward?.imageUrl}
              alt={reward?.title || 'Reward image'}
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {reward?.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {reward?.description}
          </p>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Стоимость:</span>
              <span className="text-base font-semibold text-foreground flex items-center gap-1">
                <Icon name="Award" size={16} color="var(--color-primary)" />
                {reward?.pointsCost?.toLocaleString('ru-RU')} баллов
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Текущий баланс:</span>
              <span className="text-base font-semibold text-foreground">
                {userPoints?.toLocaleString('ru-RU')} баллов
              </span>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Остаток после обмена:</span>
                <span className="text-lg font-bold text-primary">
                  {(userPoints - reward?.pointsCost)?.toLocaleString('ru-RU')} баллов
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <Icon name="Info" size={20} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Инструкции по получению
              </p>
              <p className="text-sm text-muted-foreground">
                После подтверждения обмена, покажите QR-код из вашего профиля на кассе любого кафе Benedict для получения награды.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            variant="default"
            fullWidth
            onClick={handleConfirm}
            iconName="Gift"
            iconPosition="left"
          >
            Подтвердить обмен
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default RedemptionModal;