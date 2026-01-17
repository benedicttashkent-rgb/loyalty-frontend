import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import AppImage from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import ModalOverlay from '../../../components/navigation/ModalOverlay';

const BranchSelectionModal = ({ isOpen, onClose, onBranchSelect }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const branches = [
  {
    id: 'nukus',
    name: 'Benedict Нукус',
    address: 'ул. Нукус 31/2',
    phone: '+998 33 8888807',
    menuUrl: 'https://benedictnuk.myresto.online',
    image: "/IMG_2272.JPG",
    imageAlt: 'Benedict Нукус branch exterior',
    workingHours: 'Ежедневно: 08:00 - 00:00',
    features: ['Бесплатный Wi-Fi', 'Места для работы с ноутбуком', 'Терраса на 20 мест', 'Детская площадка']
  },
  {
    id: 'mirabad',
    name: 'Benedict Мирабад',
    address: 'ул. Мирабад 60B',
    phone: '+998 33 5556601',
    menuUrl: 'https://benedictmir.myresto.online',
    image: "/IMG_3311.JPG",
    imageAlt: 'Benedict Мирабад branch exterior',
    workingHours: 'Ежедневно: 08:00 - 00:00',
    features: ['Живая музыка по выходным', 'Винная карта', 'Камерная атмосфера', 'Банкетный зал']
  }];


  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
  };

  const handleConfirm = () => {
    if (selectedBranch) {
      onBranchSelect(selectedBranch);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Выберите филиал</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-smooth"
              aria-label="Закрыть">

              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {branches?.map((branch) =>
          <div
            key={branch?.id}
            onClick={() => handleBranchClick(branch)}
            className={`rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
            selectedBranch?.id === branch?.id ?
            'border-accent shadow-lg scale-[1.02]' :
            'border-border hover:border-accent/50'}`
            }>

              <div className="relative h-48">
                <AppImage
                src={branch?.image}
                alt={branch?.imageAlt}
                className="w-full h-full object-cover" />

                {selectedBranch?.id === branch?.id &&
              <div className="absolute top-3 right-3 bg-accent text-white rounded-full p-2">
                    <Icon name="Check" size={20} />
                  </div>
              }
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-lg font-bold text-foreground">{branch?.name}</h3>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Icon name="MapPin" size={16} className="text-accent mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{branch?.address}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon name="Phone" size={16} className="text-accent flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{branch?.phone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon name="Clock" size={16} className="text-accent flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{branch?.workingHours}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {branch?.features?.map((feature, index) =>
                <span
                  key={index}
                  className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground">

                      {feature}
                    </span>
                )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <Button
            variant="default"
            fullWidth
            onClick={handleConfirm}
            disabled={!selectedBranch}>

            Продолжить
          </Button>
        </div>
      </div>
    </ModalOverlay>);

};

export default BranchSelectionModal;