import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ModalOverlay from '../../../components/navigation/ModalOverlay';

const MapModal = ({ isOpen, onClose, coordinates, branchName }) => {
  if (!coordinates) return null;

  const mapUrl = `https://www.google.com/maps?q=${coordinates?.lat},${coordinates?.lng}&z=15&output=embed`;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">{branchName}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-smooth"
            aria-label="Закрыть карту"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="w-full h-96 rounded-lg overflow-hidden mb-4">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title={branchName}
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
            className="border-0"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={onClose}
            className="flex-1"
          >
            Закрыть
          </Button>
          <Button
            variant="default"
            size="default"
            iconName="Navigation"
            iconPosition="left"
            onClick={() => window.open(`https://www.google.com/maps?q=${coordinates?.lat},${coordinates?.lng}`, '_blank')}
            className="flex-1"
          >
            Открыть в картах
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default MapModal;