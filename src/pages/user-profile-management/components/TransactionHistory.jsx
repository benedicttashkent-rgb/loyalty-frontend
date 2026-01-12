import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionHistory = ({ transactions }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedTransactions = showAll ? transactions : transactions?.slice(0, 5);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return { name: 'Plus', color: 'var(--color-success)' };
      case 'redeemed':
        return { name: 'Minus', color: 'var(--color-error)' };
      case 'bonus':
        return { name: 'Gift', color: 'var(--color-accent)' };
      default:
        return { name: 'Circle', color: 'var(--color-muted-foreground)' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">История Транзакций</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Icon name="History" size={16} />
          <span>{transactions?.length} записей</span>
        </div>
      </div>
      <div className="space-y-3">
        {displayedTransactions && displayedTransactions.length > 0 ? (
          displayedTransactions.map((transaction) => {
          const icon = getTransactionIcon(transaction?.type);
          return (
            <div
              key={transaction?.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                  <Icon name={icon?.name} size={18} color={icon?.color} />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{transaction?.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(transaction?.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold text-sm ${
                    transaction?.type === 'earned' || transaction?.type === 'bonus' ?'text-success' :'text-error'
                  }`}
                >
                  {transaction?.type === 'earned' || transaction?.type === 'bonus' ? '+' : '-'}
                  {(transaction?.amount || transaction?.cashback || transaction?.points || 0).toLocaleString('ru-RU')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">сум</p>
              </div>
            </div>
          );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="History" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">История транзакций пуста</p>
            <p className="text-xs mt-1">Транзакции появятся после покупок</p>
          </div>
        )}
      </div>
      {transactions?.length > 5 && (
        <Button
          variant="ghost"
          fullWidth
          iconName={showAll ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
          onClick={() => setShowAll(!showAll)}
          className="mt-4"
        >
          {showAll ? 'Показать Меньше' : `Показать Все (${transactions?.length})`}
        </Button>
      )}
    </div>
  );
};

export default TransactionHistory;