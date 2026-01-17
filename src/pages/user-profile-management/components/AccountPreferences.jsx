import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const AccountPreferences = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    promotions: true,
  });


  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-4">
      <h3 className="text-lg font-semibold text-foreground mb-6">Настройки Аккаунта</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Icon name="Bell" size={16} />
            Уведомления
          </h4>
          <div className="space-y-3 pl-6">
            <Checkbox
              label="Push уведомления"
              description="Мгновенные уведомления в приложении"
              checked={notifications?.push}
              onChange={() => handleNotificationChange('push')}
            />
            <Checkbox
              label="SMS уведомления"
              description="Важные обновления по SMS"
              checked={notifications?.sms}
              onChange={() => handleNotificationChange('sms')}
            />
            <Checkbox
              label="Рекламные предложения"
              description="Специальные акции и скидки"
              checked={notifications?.promotions}
              onChange={() => handleNotificationChange('promotions')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPreferences;