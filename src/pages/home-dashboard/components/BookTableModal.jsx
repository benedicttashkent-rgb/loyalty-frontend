import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatTelUrl, openPhoneDialer } from '../../../utils/openPhoneDialer';

const BookTableModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const branches = [
    {
      id: 1,
      name: 'Benedict Нукус',
      address: 'ул. Нукус 31/2',
      phone: '+998 33 8888807',
      hours: 'Ежедневно: 08:00 - 00:00',
      coordinates: { lat: 41.293115, lng: 69.281112 },
    },
    {
      id: 2,
      name: 'Benedict Мирабад',
      address: 'ул. Мирабад 60B',
      phone: '+998 33 5556601',
      hours: 'Ежедневно: 08:00 - 00:00',
      coordinates: { lat: 41.293377, lng: 69.268479 },
    },
  ];

  const handleLocationClick = (coordinates) => {
    const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(mapsUrl);
      return;
    }
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = (e, phone) => {
    e.preventDefault();
    e.stopPropagation();
    openPhoneDialer(phone);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col mb-6">
        <p className="text-xl font-bold text-foreground">
          Выберите филиал и позвоните чтобы узнать доступность
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-background rounded-xl p-5 border border-border hover:border-primary/50 transition-colors"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">{branch.name}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={18} className="text-muted-foreground mt-0.5" />
                  <span className="text-foreground">{branch.address}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Icon name="Phone" size={18} className="text-muted-foreground" />
                  <a
                    href={formatTelUrl(branch.phone)}
                    onClick={(e) => handlePhoneClick(e, branch.phone)}
                    className="text-primary hover:underline font-medium"
                  >
                    {branch.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Icon name="Clock" size={18} className="text-muted-foreground" />
                  <span className="text-foreground">{branch.hours}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleLocationClick(branch.coordinates)}
                  className="flex items-center justify-center gap-2"
                >
                  <Icon name="MapPin" size={16} />
                  Локация
                </Button>

                <Button variant="default" fullWidth asChild>
                  <a
                    href={formatTelUrl(branch.phone)}
                    onClick={(e) => handlePhoneClick(e, branch.phone)}
                    className="flex items-center justify-center gap-2"
                  >
                    <Icon name="Phone" size={16} />
                    Позвонить
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" fullWidth onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  );
};

export default BookTableModal;
