import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatPrice } from '../../../utils/formatPrice';

const MenuItemDetailModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifierId, setSelectedModifierId] = useState(null);
  const [modifierError, setModifierError] = useState('');

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

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => { if (quantity > 1) setQuantity(prev => prev - 1); };

  const handleAddToCart = () => {
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

  const nutritionalInfo = item.nutritionalInfo || {};
  const calories = item.calories || nutritionalInfo.calories || null;
  const proteins = item.proteins || nutritionalInfo.proteins || null;
  const fats = item.fats || nutritionalInfo.fats || null;
  const carbohydrates = item.carbohydrates || nutritionalInfo.carbohydrates || null;
  const hasNutritionalInfo = calories || proteins || fats || carbohydrates;

  const cleanDescription = item?.description
    ?.replace(/Ingredients?:?\s*/i, '')
    ?.replace(/Ingridients?:?\s*/i, '')
    ?.replace(/Ингредиенты?:?\s*/i, '')
    ?.replace(/Состав:?\s*/i, '')
    ?.trim();

  const totalPrice = item?.price + (
    selectedModifierId
      ? (modifiers.find(m => m.id === selectedModifierId)?.price || 0)
      : 0
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative h-56 overflow-hidden sm:rounded-t-2xl rounded-t-2xl flex-shrink-0">
          <Image
            src={item?.image}
            alt={item?.imageAlt || item?.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <Icon name="X" size={18} className="text-white" />
          </button>
          {item?.isNew && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Новинка
            </span>
          )}
          {item?.weight && (
            <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {item.weight}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground leading-tight flex-1">{item?.name}</h2>
            <span className="text-xl font-bold text-primary whitespace-nowrap">{formatPrice(item?.price)}</span>
          </div>

          {/* Description */}
          {cleanDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {cleanDescription}
            </p>
          )}

          {/* Nutritional info */}
          {hasNutritionalInfo && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">КБЖУ</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Ккал', value: calories },
                  { label: 'Белки', value: proteins },
                  { label: 'Жиры', value: fats },
                  { label: 'Углев.', value: carbohydrates },
                ].filter(n => n.value).map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl p-2.5 text-center">
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className="text-sm font-bold text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modifiers */}
          {hasModifiers && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Выберите вариант</p>
              <div className="flex flex-wrap gap-2">
                {modifiers.map((modifier) => (
                  <button
                    key={modifier.id}
                    onClick={() => {
                      setSelectedModifierId(modifier.id);
                      setModifierError('');
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                      selectedModifierId === modifier.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    <span>{modifier.name}</span>
                    {modifier.price > 0 && (
                      <span className={`text-xs ${selectedModifierId === modifier.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        +{formatPrice(modifier.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {modifierError && (
                <p className="text-xs text-destructive mt-2">{modifierError}</p>
              )}
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center bg-muted rounded-xl overflow-hidden">
              <button
                onClick={handleDecrement}
                className="w-11 h-11 flex items-center justify-center hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label="Уменьшить количество"
              >
                <Icon name="Minus" size={16} />
              </button>
              <span className="w-10 text-center text-base font-semibold">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-11 h-11 flex items-center justify-center hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label="Увеличить количество"
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>
            <Button
              variant="default"
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              className="rounded-xl flex-1"
            >
              В корзину · {formatPrice(totalPrice * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailModal;
