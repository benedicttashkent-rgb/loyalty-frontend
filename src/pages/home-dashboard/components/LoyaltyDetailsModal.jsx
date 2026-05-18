import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const faqs = [
  {
    q: 'Как накапливаются баллы?',
    a: 'После каждого закрытого чека баллы зачисляются автоматически в течение 10 минут. Процент кешбэка зависит от вашего уровня: Bronze — 2%, Silver — 3%, Gold — 5%, Platinum — 10%.',
  },
  {
    q: 'Как потратить баллы?',
    a: 'Скажите кассиру, что хотите оплатить часть счёта баллами — он спишет нужную сумму с вашего бонусного счёта.',
  },
  {
    q: 'Какую часть счёта можно оплатить баллами?',
    a: 'До 50% от суммы чека. Оставшуюся часть нужно оплатить наличными или картой.',
  },
  {
    q: 'Сколько хранятся баллы?',
    a: 'Баллы сгорают, если в течение 6 месяцев не было ни одной покупки. Любой визит обнуляет этот таймер.',
  },
  {
    q: 'Где можно тратить баллы?',
    a: 'Пока только в заведениях Benedict Café при оплате на кассе.',
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="flex-shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {a}
        </div>
      )}
    </div>
  );
};

const LoyaltyDetailsModal = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;

  const formatAmount = (amount) => {
    if (!amount) return '—';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} млн сум`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} тыс сум`;
    }
    return `${amount.toLocaleString('ru-RU')} сум`;
  };

  const tierLevels = [
    {
      name: 'Bronze',
      cashbackPercent: 2,
      minAmount: 0,
      maxAmount: 10000000,
      benefits: ['Кешбэк 2% с каждой покупки']
    },
    {
      name: 'Silver',
      cashbackPercent: 3,
      minAmount: 10000000,
      maxAmount: 30000000,
      benefits: ['Кешбэк 3% с каждой покупки']
    },
    {
      name: 'Gold',
      cashbackPercent: 5,
      minAmount: 30000000,
      maxAmount: 60000000,
      benefits: ['Кешбэк 5% с каждой покупки']
    },
    {
      name: 'Platinum',
      cashbackPercent: 10,
      minAmount: 60000000,
      maxAmount: null,
      benefits: ['Кешбэк 10% с каждой покупки']
    }
  ];


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Детали программы лояльности</h2>
        <button
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-smooth"
          onClick={onClose}
          aria-label="Close modal"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💰 <span className="font-semibold text-foreground">1 балл = 1 сум</span>
          </p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Уровни программы</h3>
          <div className="space-y-3">
            {tierLevels?.map((tier) => {
              const isCurrentTier = tier?.name === userData?.tier;
              
              return (
                <div
                  key={tier?.name}
                  className={`p-4 rounded-xl border-2 transition-smooth ${
                    isCurrentTier
                      ? 'border-primary bg-primary/5' :'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-foreground">{tier?.name}</div>
                      {isCurrentTier && (
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          Текущий
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier?.minAmount ? `от ${formatAmount(tier.minAmount)}` : '—'}
                      {tier?.cashbackPercent && ` • ${tier.cashbackPercent}% кешбэк`}
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {tier?.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>


        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Частые вопросы</h3>
          <div className="space-y-2">
            {faqs.map((item, i) => <FAQItem key={i} {...item} />)}
          </div>
        </div>

        <Button variant="outline" fullWidth onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  );
};

export default LoyaltyDetailsModal;