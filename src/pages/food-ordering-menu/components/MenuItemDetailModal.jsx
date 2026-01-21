import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatPrice } from '../../../utils/formatPrice';

const MenuItemDetailModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifierId, setSelectedModifierId] = useState(null);
  const [modifierError, setModifierError] = useState('');

  // Reset state when modal opens/closes or item changes
  React.useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setSelectedModifierId(null);
      setModifierError('');
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const modifiers = item?.modifiers || [];
  const hasModifiers = modifiers.length > 0;

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    // Validate modifier selection if required
    if (hasModifiers && !selectedModifierId) {
      setModifierError('Выберите необходимые модификаторы');
      return;
    }

    const selectedModifier = selectedModifierId 
      ? modifiers.find(m => m.id === selectedModifierId)
      : null;

    onAddToCart(item, quantity, selectedModifier);
    setQuantity(1);
    setSelectedModifierId(null);
    setModifierError('');
    onClose();
  };

  // Extract nutritional info - could be in different formats
  const nutritionalInfo = item.nutritionalInfo || {};
  const calories = item.calories || nutritionalInfo.calories || null;
  const proteins = item.proteins || nutritionalInfo.proteins || null;
  const fats = item.fats || nutritionalInfo.fats || null;
  const carbohydrates = item.carbohydrates || nutritionalInfo.carbohydrates || null;

  const hasNutritionalInfo = calories || proteins || fats || carbohydrates;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={item?.image}
            alt={item?.imageAlt || item?.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} className="text-white" />
          </button>
          {item?.isNew && (
            <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
              Новинка
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name and Price */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{item?.name}</h2>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{formatPrice(item?.price)}</span>
              {item?.weight && (
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {item.weight}
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          {item?.categoryName && (
            <div className="text-sm text-muted-foreground">
              Категория: <span className="font-medium text-foreground">{item.categoryName}</span>
            </div>
          )}

          {/* Description */}
          {item?.description && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Описание</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description.replace(/Ingredients?:?\s*/i, '').replace(/Ingridients?:?\s*/i, '').replace(/Ингредиенты?:?\s*/i, '').replace(/Состав:?\s*/i, '').trim()}
              </p>
            </div>
          )}

          {/* Nutritional Info (КБЖУ) */}
          {hasNutritionalInfo && (
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Пищевая ценность (КБЖУ)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {calories && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Калории</div>
                    <div className="text-lg font-bold text-foreground">{calories}</div>
                    <div className="text-xs text-muted-foreground">ккал</div>
                  </div>
                )}
                {proteins && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Белки</div>
                    <div className="text-lg font-bold text-foreground">{proteins}</div>
                    <div className="text-xs text-muted-foreground">г</div>
                  </div>
                )}
                {fats && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Жиры</div>
                    <div className="text-lg font-bold text-foreground">{fats}</div>
                    <div className="text-xs text-muted-foreground">г</div>
                  </div>
                )}
                {carbohydrates && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Углеводы</div>
                    <div className="text-lg font-bold text-foreground">{carbohydrates}</div>
                    <div className="text-xs text-muted-foreground">г</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modifiers Selection */}
          {hasModifiers && (
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Выберите вариант</h3>
              <div className="space-y-2">
                {modifiers.map((modifier) => (
                  <label
                    key={modifier.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name={`modifier-${item.id}`}
                        value={modifier.id}
                        checked={selectedModifierId === modifier.id}
                        onChange={() => {
                          setSelectedModifierId(modifier.id);
                          setModifierError('');
                        }}
                        className="w-5 h-5 text-accent focus:ring-accent focus:ring-2"
                      />
                      <span className="text-sm font-medium text-foreground">{modifier.name}</span>
                    </div>
                    {modifier.price > 0 && (
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(modifier.price)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {modifierError && (
                <p className="text-sm text-destructive">{modifierError}</p>
              )}
            </div>
          )}

          {/* Quantity Selector and Add to Cart */}
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Количество</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Уменьшить количество"
                >
                  <Icon name="Minus" size={18} />
                </button>
                <span className="w-12 h-12 flex items-center justify-center text-base font-semibold border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Увеличить количество"
                >
                  <Icon name="Plus" size={18} />
                </button>
              </div>
            </div>

            <Button
              variant="default"
              fullWidth
              size="lg"
              iconName="ShoppingCart"
              iconPosition="left"
              onClick={handleAddToCart}
              className="text-base py-3"
            >
              Добавить в корзину
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailModal;
