import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import AppImage from '../../../components/AppImage';

const BirthdayPartyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCall = () => {
    window.location.href = 'tel:+998338888807';
  };

  const handleOverlayClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="birthday-party-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        {/* Header with gradient background */}
        <div className="sticky top-0 bg-gradient-to-br from-[#d4a574] to-[#8a7560] p-6 rounded-t-2xl relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-smooth z-10"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} className="text-white" />
          </button>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon name="Coffee" size={40} className="text-white" />
              </div>
            </div>
            <h2
              id="birthday-party-modal-title"
              className="text-3xl font-bold text-white text-center drop-shadow-md"
            >
              Дарим Кофе За Регистрацию!
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Party Image */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <AppImage
              src="public/assets/images/111-1765536227863.jpg"
              alt="Benedict Nukus филиал празднует день рождения с воздушными шарами и праздничным декором"
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Main description */}
          <div className="space-y-4">
            <p className="text-gray-700 text-base leading-relaxed">
              Зарегистрируйтесь в нашей программе лояльности и получите бесплатный кофе на выбор! 
              Просто зарегистрируйтесь с фото и наслаждайтесь любым кофейным напитком из нашего меню совершенно бесплатно.
            </p>

            {/* Event Details Cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#d4a574]/10 to-[#8a7560]/10 rounded-xl px-4 py-3 border border-[#d4a574]/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8a7560] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Icon name="Coffee" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">Что вы получите</p>
                  <p className="text-sm font-semibold text-gray-900">Бесплатный кофе на выбор</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-[#d4a574]/10 to-[#8a7560]/10 rounded-xl px-4 py-3 border border-[#d4a574]/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8a7560] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Icon name="Camera" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">Условие</p>
                  <p className="text-sm font-semibold text-gray-900">Регистрация с фото</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-[#d4a574]/10 to-[#8a7560]/10 rounded-xl px-4 py-3 border border-[#d4a574]/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8a7560] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Icon name="UserPlus" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">Действие</p>
                  <p className="text-sm font-semibold text-gray-900">Зарегистрируйтесь сейчас</p>
                </div>
              </div>
            </div>

            {/* Special Offers Section */}
            <div className="bg-gradient-to-br from-[#d4a574]/20 to-[#8a7560]/20 rounded-xl p-5 border border-[#d4a574]/30">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Sparkles" size={20} className="text-[#99836c]" />
                Преимущества регистрации
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <Icon name="Check" size={18} className="mt-0.5 flex-shrink-0 text-[#99836c]" />
                  <span>Бесплатный кофе при регистрации</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <Icon name="Check" size={18} className="mt-0.5 flex-shrink-0 text-[#99836c]" />
                  <span>Накопление кешбэка за каждую покупку</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <Icon name="Check" size={18} className="mt-0.5 flex-shrink-0 text-[#99836c]" />
                  <span>Эксклюзивные предложения и скидки</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 text-sm">
                  <Icon name="Check" size={18} className="mt-0.5 flex-shrink-0 text-[#99836c]" />
                  <span>Участие в программе лояльности</span>
                </li>
              </ul>
            </div>

            {/* Instructions Section */}
            <div className="bg-gradient-to-br from-[#d4a574]/20 to-[#8a7560]/20 rounded-xl p-5 border border-[#d4a574]/30">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Info" size={20} className="text-[#99836c]" />
                Как получить бесплатный кофе
              </h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#99836c] text-white flex items-center justify-center font-bold text-xs">1</span>
                  <span>Зарегистрируйтесь в приложении с фото профиля</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#99836c] text-white flex items-center justify-center font-bold text-xs">2</span>
                  <span>Придите в любой филиал Benedict Café</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#99836c] text-white flex items-center justify-center font-bold text-xs">3</span>
                  <div>
                    <span>Скажите сотруднику ресторана:</span>
                    <div className="mt-1 bg-white rounded-lg p-3 border border-[#d4a574]/30">
                      <p className="text-[#99836c] font-semibold italic">
                        "Я зарегистрировался в приложении, хочу получить бесплатный кофе"
                      </p>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#99836c] text-white flex items-center justify-center font-bold text-xs">4</span>
                  <span>Выберите любой кофе из меню и наслаждайтесь!</span>
                </li>
              </ol>
            </div>

            {/* Call to Action Section */}
            <div className="text-center space-y-4 pt-4">
              <div className="bg-gradient-to-r from-[#d4a574] to-[#8a7560] rounded-xl p-4">
                <p className="text-white text-sm font-medium mb-3">
                  Зарегистрируйтесь прямо сейчас
                </p>
                <Button
                  onClick={() => {
                    onClose?.();
                    window.location.href = '/user-profile-management';
                  }}
                  className="w-full bg-white hover:bg-white/90 text-[#99836c] font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Icon name="UserPlus" size={20} />
                  <span>Зарегистрироваться</span>
                </Button>
              </div>

              <p className="text-xs text-gray-600 italic">
                Предложение действительно один раз при первой регистрации с фото профиля.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayPartyModal;