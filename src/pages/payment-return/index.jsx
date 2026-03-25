import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const result = searchParams.get('result'); // 'success' | 'error'
  const isSuccess = result === 'success';

  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('benedictOrderDetails');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.orderNumber) setOrderNumber(parsed.orderNumber);
      }
    } catch (_) {}
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isSuccess ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <Icon
              name={isSuccess ? 'CheckCircle2' : 'XCircle'}
              size={44}
              className={isSuccess ? 'text-success' : 'text-destructive'}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          {isSuccess ? 'Оплата прошла!' : 'Оплата не прошла'}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {isSuccess
            ? 'Ваш заказ принят и передан на кухню'
            : 'Не удалось провести оплату. Попробуйте снова или выберите другой способ.'}
        </p>

        {/* Order number */}
        {isSuccess && orderNumber && (
          <div className="bg-muted rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Hash" size={15} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Номер заказа</span>
            </div>
            <span className="text-base font-bold text-foreground">#{orderNumber}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isSuccess ? (
            <Button
              variant="default"
              fullWidth
              size="lg"
              className="rounded-xl"
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                fullWidth
                size="lg"
                className="rounded-xl"
                onClick={() => navigate('/food-ordering-menu')}
              >
                Вернуться к заказу
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="lg"
                className="rounded-xl"
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
