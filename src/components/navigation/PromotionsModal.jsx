import React from 'react';
import { X, Gift, TrendingDown, Clock, Star } from 'lucide-react';
import Icon from '../AppIcon';

const PromotionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const promotions = [
    {
      id: 1,
      title: 'Счастливые часы',
      description: 'Скидка 20% на все напитки с 14:00 до 16:00',
      icon: 'Clock',
      discount: '-20%',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 2,
      title: 'Недельная акция',
      description: 'Купите 2 десерта, получите 3-й в подарок',
      icon: 'Gift',
      discount: '2+1',
      color: 'from-rose-500 to-pink-600',
    },
    {
      id: 3,
      title: 'Специальное предложение',
      description: 'Комбо-набор: кофе + круассан со скидкой 15%',
      icon: 'TrendingDown',
      discount: '-15%',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 4,
      title: 'Программа лояльности',
      description: 'Накапливайте кешбэк и получайте бонусы',
      icon: 'Star',
      discount: '★',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  const handleOverlayClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotions-modal-title"
    >
      <div className="modal-content">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#d4a574] to-[#8a7560] p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2
              id="promotions-modal-title"
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              <Icon name="Gift" className="w-7 h-7" />
              Акции и скидки
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Закрыть модальное окно"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-white/90 text-sm mt-2">
            Не пропустите наши специальные предложения!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {promotions?.map((promo) => (
            <div
              key={promo?.id}
              className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${promo?.color} opacity-5`}
              />

              <div className="relative p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${promo?.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon name={promo?.icon} className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {promo?.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {promo?.description}
                    </p>
                  </div>

                  {/* Discount badge */}
                  <div
                    className={`flex-shrink-0 px-4 py-2 rounded-full bg-gradient-to-r ${promo?.color} text-white font-bold text-lg shadow-md`}
                  >
                    {promo?.discount}
                  </div>
                </div>
              </div>

              {/* Decorative line */}
              <div
                className={`h-1 w-full bg-gradient-to-r ${promo?.color}`}
              />
            </div>
          ))}

          {/* Footer note */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#d4a574]/10 to-[#8a7560]/10 rounded-lg border border-[#d4a574]/20">
            <p className="text-sm text-gray-700 text-center">
              <strong className="text-[#99836c]">Важно:</strong> Акции могут быть
              изменены. Уточняйте детали у наших сотрудников.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsModal;