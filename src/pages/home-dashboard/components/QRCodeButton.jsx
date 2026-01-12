import React from 'react';
import Icon from '../../../components/AppIcon';

const QRCodeButton = ({ onClick }) => {
  return (
    <button
      className="w-full bg-card rounded-xl p-6 flex items-center justify-between border-2 border-primary hover:bg-primary/5 transition-smooth"
      onClick={onClick}
      aria-label="Show QR code for point collection"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="QrCode" size={28} color="var(--color-primary)" />
        </div>
        <div className="text-left">
          <div className="text-base font-semibold text-foreground">Показать QR-код</div>
          <div className="text-sm text-muted-foreground">Для начисления кешбэка</div>
        </div>
      </div>
      <Icon name="ChevronRight" size={24} color="var(--color-primary)" />
    </button>
  );
};

export default QRCodeButton;