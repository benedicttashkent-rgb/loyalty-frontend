import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import { getApiUrl } from '../../../config/api';

const OrderStatusButton = ({ orderNumber, estimatedTime, branch, status, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!orderNumber) return null;

  // Status mapping to display text and icons
  const getStatusInfo = (status) => {
    switch (status) {
      case 'NEW':
        return { text: 'Новый заказ', icon: 'Package', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'ACCEPTED':
        return { text: 'Заказ принят', icon: 'CheckCircle', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      case 'IN_PROGRESS':
        return { text: 'Готовится', icon: 'Clock', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'READY':
        return { text: 'Готов к выдаче', icon: 'CheckCircle2', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' };
      case 'CLOSED':
        return { text: 'Выполнен', icon: 'Check', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
      case 'CANCELLED':
        return { text: 'Отменен', icon: 'X', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { text: 'Готовится', icon: 'Clock', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' };
    }
  };

  const statusInfo = getStatusInfo(status);

  // Check if order can be cancelled (only NEW or ACCEPTED)
  const canCancel = status === 'NEW' || status === 'ACCEPTED';

  const handleCancelOrder = async () => {
    if (!orderNumber) return;
    
    setIsCancelling(true);
    try {
      const response = await fetch(getApiUrl(`orders/${orderNumber}/cancel`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Order cancelled successfully
        setShowCancelConfirm(false);
        setIsOpen(false);
        // Clear order from localStorage
        localStorage.removeItem('benedictOrderDetails');
        if (onClose) {
          onClose();
        }
        // Show success message (optional)
        alert('Заказ успешно отменен');
      } else {
        alert(data.error || 'Ошибка при отмене заказа');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Ошибка при отмене заказа. Попробуйте позже.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {/* Floating Order Status Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground rounded-full shadow-lg p-4 hover:bg-primary/90 transition-all flex items-center gap-2 animate-pulse"
        aria-label="Статус заказа"
      >
        <Icon name="Package" size={20} />
        <span className="text-sm font-medium">Заказ #{orderNumber?.slice(-4)}</span>
      </button>

      {/* Order Status Modal */}
      <ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Статус заказа</h2>
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Закрыть"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Order Number */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Номер заказа</span>
                <span className="text-base font-bold text-foreground">#{orderNumber}</span>
              </div>
            </div>

            {/* Status */}
            <div className={`${statusInfo.bg} rounded-lg p-4 border ${statusInfo.border}`}>
              <div className="flex items-center gap-3 mb-2">
                <Icon name={statusInfo.icon} size={20} className={statusInfo.color} />
                <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-7">
                {status === 'NEW' && 'Ожидание принятия заказа кассиром'}
                {status === 'ACCEPTED' && 'Заказ принят. Создание заказа в iiko...'}
                {status === 'IN_PROGRESS' && `Кухня готовит ваш заказ. Приблизительное время готовности: ${estimatedTime || '15-20 мин'}`}
                {status === 'READY' && 'Заказ готов! Заберите в филиале.'}
                {!status && 'Приблизительное время готовности: ' + (estimatedTime || '15-20 мин')}
              </p>
            </div>

            {/* Branch Info */}
            {branch && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={20} className="text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{branch.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground text-center">
                Когда заказ будет готов, мы уведомим вас. Заберите заказ в филиале.
              </p>
            </div>

            {/* Cancel Order Button - only show for NEW or ACCEPTED orders */}
            {canCancel && (
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2"
                  disabled={isCancelling}
                >
                  <Icon name="X" size={18} />
                  <span>{isCancelling ? 'Отмена...' : 'Отменить заказ'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </ModalOverlay>

      {/* Cancel Confirmation Modal */}
      <ModalOverlay isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)}>
        <div className="p-6 max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Отменить заказ?</h2>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Закрыть"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Вы уверены, что хотите отменить заказ #{orderNumber?.slice(-4)}?
            </p>
            <p className="text-xs text-muted-foreground">
              После отмены заказ нельзя будет восстановить.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-lg py-2 px-4 font-medium transition-colors"
                disabled={isCancelling}
              >
                Нет, оставить
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4 font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span>Отмена...</span>
                  </>
                ) : (
                  <>
                    <Icon name="X" size={16} />
                    <span>Да, отменить</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </ModalOverlay>
    </>
  );
};

export default OrderStatusButton;
