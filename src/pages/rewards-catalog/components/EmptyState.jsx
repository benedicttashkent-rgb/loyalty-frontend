import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="SearchX" size={48} color="var(--color-muted-foreground)" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        Награды не найдены
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        По выбранным фильтрам награды не найдены. Попробуйте изменить параметры поиска.
      </p>

      <Button
        variant="outline"
        onClick={onReset}
        iconName="RotateCcw"
        iconPosition="left"
      >
        Сбросить фильтры
      </Button>
    </div>
  );
};

export default EmptyState;