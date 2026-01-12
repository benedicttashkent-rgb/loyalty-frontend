import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const FilterSection = ({ 
  selectedCategory, 
  onCategoryChange, 
  selectedSort, 
  onSortChange,
  selectedAvailability,
  onAvailabilityChange 
}) => {
  const categoryOptions = [
    { value: 'all', label: 'Все категории' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'food', label: 'Еда' },
    { value: 'merchandise', label: 'Мерч' },
    { value: 'experiences', label: 'Впечатления' }
  ];

  const sortOptions = [
    { value: 'points-asc', label: 'Баллы: по возрастанию' },
    { value: 'points-desc', label: 'Баллы: по убыванию' },
    { value: 'name-asc', label: 'Название: А-Я' },
    { value: 'name-desc', label: 'Название: Я-А' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'Все награды' },
    { value: 'available', label: 'Доступные' },
    { value: 'can-redeem', label: 'Могу обменять' }
  ];

  return (
    <div className="bg-card rounded-xl p-4 card-shadow mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Filter" size={20} color="var(--color-primary)" />
        <h2 className="text-lg font-semibold text-foreground">Фильтры</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Категория"
          options={categoryOptions}
          value={selectedCategory}
          onChange={onCategoryChange}
          className="w-full"
        />

        <Select
          label="Сортировка"
          options={sortOptions}
          value={selectedSort}
          onChange={onSortChange}
          className="w-full"
        />

        <Select
          label="Доступность"
          options={availabilityOptions}
          value={selectedAvailability}
          onChange={onAvailabilityChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default FilterSection;