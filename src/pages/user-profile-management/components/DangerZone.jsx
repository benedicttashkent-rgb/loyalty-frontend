import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DangerZone = ({ onDeleteAccount }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDeleteAccount();
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-error/5 rounded-xl p-6 border-2 border-error/20 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
          <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-error mb-1">Опасная Зона</h3>
          <p className="text-sm text-muted-foreground">
            Удаление аккаунта необратимо. Все ваши данные, кешбэк и история будут потеряны навсегда.
          </p>
        </div>
      </div>

      {!showConfirmation ? (
        <Button
          variant="destructive"
          iconName="Trash2"
          iconPosition="left"
          onClick={handleDeleteClick}
        >
          Удалить Аккаунт
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="bg-card p-4 rounded-lg border border-error">
            <p className="text-sm font-medium text-foreground mb-2">
              Вы уверены, что хотите удалить аккаунт?
            </p>
            <p className="text-xs text-muted-foreground">
              Это действие нельзя отменить. Все ваши данные будут удалены безвозвратно.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              fullWidth
              iconName="Trash2"
              iconPosition="left"
              onClick={handleConfirmDelete}
            >
              Да, Удалить
            </Button>
            <Button
              variant="outline"
              fullWidth
              iconName="X"
              iconPosition="left"
              onClick={handleCancelDelete}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZone;