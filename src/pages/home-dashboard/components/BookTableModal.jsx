import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookTableModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const branches = [
    {
      id: 1,
      name: "Benedict Нукус",
      address: "ул. Нукус 31/2",
      phone: "+998 33 8888807",
      hours: "Ежедневно: 08:00 - 00:00",
    coordinates: { lat: 41.293115, lng: 69.281112 },
    },
    {
      id: 2,
      name: "Benedict Мирабад",
      address: "ул. Мирабад 60B",
      phone: "+998 33 5556601",
      hours: "Ежедневно: 08:00 - 00:00",
    coordinates: { lat: 41.293377, lng: 69.268479 },
    },
  ];

  const handleCallClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleLocationClick = (coordinates) => {
    const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col mb-6">
            <p className="text-xl font-bold text-foreground">
              Выберите филиал и позвоните для бронирования стола
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-background rounded-xl p-5 border border-border hover:border-primary/50 transition-colors"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    {branch.name}
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" size={18} className="text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{branch.address}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Icon name="Phone" size={18} className="text-muted-foreground" />
                      <a
                        href={`tel:${branch.phone}`}
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

                    <Button
                      variant="default"
                      fullWidth
                      onClick={() => handleCallClick(branch.phone)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Icon name="Phone" size={16} />
                      Позвонить
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
      </div>
    </div>
  );
};

export default BookTableModal;
