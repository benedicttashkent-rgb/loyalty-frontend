import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QRCodeModal = ({ isOpen, onClose, userData }) => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    if (isOpen && userData?.id) {
      // Generate QR code from backend
      generateQRCode();
    } else {
      // Reset when modal closes
      setQrImage('');
      setQrCodeData('');
    }
  }, [isOpen, userData]);

  const generateQRCode = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setQrImage(null);
        return;
      }

      // Call backend QR generation endpoint
      const response = await fetch('/api/qr/generate', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.qrImage) {
          // qrImage is already a base64 data URL (data:image/png;base64,...)
          setQrImage(data.qrImage);
          setQrCodeData(data.qrData || '');
        } else {
          console.error('QR generation failed:', data);
          setQrImage(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('QR generation error:', errorData);
        setQrImage(null);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrImage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">QR-код для начисления</h2>
        <button
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-smooth"
          onClick={onClose}
          aria-label="Close modal"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="space-y-6">
        <div className="bg-card rounded-2xl p-6 border-2 border-primary">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 bg-white rounded-xl p-4 mb-4 flex items-center justify-center">
              {qrImage ? (
                <img src={qrImage} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="QrCode" size={64} className="text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Генерация QR-кода...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mb-4">
              <div className="text-base font-semibold text-foreground mb-1">{userData?.name || 'Гость'}</div>
              <div className="text-sm text-muted-foreground">{userData?.phone || ''}</div>
            </div>

            <div className="w-full p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Текущий баланс:</span>
                <span className="text-base font-bold text-primary">{(userData?.cashback || userData?.points || 0).toLocaleString('ru-RU')} сум</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Статус:</span>
                <span className="text-base font-semibold text-foreground">{userData?.tier} ({userData?.cashbackPercent || 2}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
          <div className="flex gap-3">
            <Icon name="Info" size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              Покажите этот QR-код кассиру при оплате для начисления кешбэка. Кешбэк будет зачислен автоматически после сканирования.
            </div>
          </div>
        </div>

        <Button variant="outline" fullWidth onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  );
};

export default QRCodeModal;