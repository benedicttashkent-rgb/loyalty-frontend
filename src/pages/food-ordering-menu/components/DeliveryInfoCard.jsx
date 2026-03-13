import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const DeliveryInfoCard = ({ onOrderTypeSelect, defaultOrderType, onTakeawayClick, onBranchSelect, selectedBranch, onDeliveryAddressChange }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [useHighAccuracy, setUseHighAccuracy] = useState(true);
  const [selectedOrderType, setSelectedOrderType] = useState(defaultOrderType || 'takeaway');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    building: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    additionalInfo: ''
  });
  const MAX_RETRIES = 2;

  const requestLocation = (highAccuracy = true) => {
    if (navigator?.geolocation) {
      setIsLoadingLocation(true);
      setLocationError(null);

      const options = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 20000 : 10000,
        maximumAge: highAccuracy ? 0 : 5000
      };

      navigator.geolocation?.getCurrentPosition(
        (position) => {
          const location = {
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude,
            accuracy: position?.coords?.accuracy
          };
          setUserLocation(location);
          setIsLoadingLocation(false);
          setRetryCount(0);
          setUseHighAccuracy(true);
          reverseGeocode(location);
        },
        (error) => {
          let errorMessage = 'Не удалось определить ваше местоположение';
          let canRetry = false;

          switch (error?.code) {
            case 1:
              errorMessage = 'Доступ к геолокации запрещен. Пожалуйста, разрешите доступ в настройках браузера';
              canRetry = false;
              setIsLoadingLocation(false);
              break;
            case 2:
              errorMessage = 'Местоположение недоступно. Проверьте настройки GPS и подключение к интернету';
              canRetry = retryCount < MAX_RETRIES;

              if (canRetry) {
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  setUseHighAccuracy(false);
                  requestLocation(false);
                }, 2000);
                return;
              }
              setIsLoadingLocation(false);
              break;
            case 3:
              if (retryCount < MAX_RETRIES) {
                const nextHighAccuracy = retryCount === 0 ? highAccuracy : false;
                canRetry = true;

                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  setUseHighAccuracy(nextHighAccuracy);
                  requestLocation(nextHighAccuracy);
                }, 2000);

                errorMessage = `Превышено время ожидания. Повторная попытка ${retryCount + 1}/${MAX_RETRIES}...`;
                setLocationError({
                  message: errorMessage,
                  code: error?.code,
                  canRetry: true,
                  isRetrying: true
                });
                return;
              } else {
                errorMessage = 'Не удалось определить местоположение после нескольких попыток. Попробуйте позже или укажите адрес вручную';
                canRetry = false;
                setIsLoadingLocation(false);
              }
              break;
            default:
              errorMessage = `Ошибка геолокации: ${error?.message || 'Неизвестная ошибка'}`;
              canRetry = retryCount < MAX_RETRIES;

              if (canRetry) {
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  requestLocation(false);
                }, 2000);
                return;
              }
              setIsLoadingLocation(false);
          }

          setLocationError({
            message: errorMessage,
            code: error?.code,
            canRetry: canRetry && retryCount < MAX_RETRIES,
            isRetrying: false
          });
        },
        options
      );
    } else {
      setLocationError({
        message: 'Геолокация не поддерживается вашим браузером',
        code: null,
        canRetry: false,
        isRetrying: false
      });
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    const initialType = defaultOrderType || 'takeaway';
    setSelectedOrderType(initialType);
    if (onOrderTypeSelect) {
      onOrderTypeSelect(initialType);
    }
  }, []);

  // Notify parent when delivery address changes
  useEffect(() => {
    if (onDeliveryAddressChange) {
      onDeliveryAddressChange(selectedOrderType === 'delivery' ? userLocation : null);
    }
  }, [userLocation, selectedOrderType]);

  const handleRetry = () => {
    setRetryCount(0);
    setUseHighAccuracy(true);
    requestLocation(true);
  };

  const handleOrderTypeChange = (type) => {
    setSelectedOrderType(type);
    if (onOrderTypeSelect) {
      onOrderTypeSelect(type);
    }
    if (type === 'delivery' && !userLocation && !isLoadingLocation) {
      requestLocation(true);
    }
  };

  const handleAddressInputChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualAddressSubmit = () => {
    if (deliveryAddress?.street?.trim() && deliveryAddress?.building?.trim()) {
      const fullAddress = [
        `${deliveryAddress?.street}, д. ${deliveryAddress?.building}`,
        deliveryAddress?.apartment && `кв. ${deliveryAddress?.apartment}`,
        deliveryAddress?.entrance && `подъезд ${deliveryAddress?.entrance}`,
        deliveryAddress?.floor && `этаж ${deliveryAddress?.floor}`,
        deliveryAddress?.intercom && `домофон ${deliveryAddress?.intercom}`,
        deliveryAddress?.additionalInfo
      ]?.filter(Boolean)?.join(', ');

      const locationData = {
        ...(userLocation || {}),
        address: fullAddress,
        isManual: true,
        details: deliveryAddress
      };

      setUserLocation(locationData);
      setIsAddressModalOpen(false);
      setDeliveryAddress({
        street: '',
        building: '',
        apartment: '',
        entrance: '',
        floor: '',
        intercom: '',
        additionalInfo: ''
      });
      setLocationError(null);
    }
  };

  const reverseGeocode = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location?.lat}&lon=${location?.lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BenedictCafeApp/1.0'
          }
        }
      );

      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }

      const data = await response?.json();

      if (data?.address) {
        const address = [
          data?.address?.road,
          data?.address?.house_number,
          data?.address?.suburb || data?.address?.neighbourhood,
          data?.address?.city || data?.address?.town
        ]?.filter(Boolean)?.join(', ');

        setUserLocation((prev) => ({
          ...prev,
          address: address || 'Адрес не определен'
        }));
      } else {
        setUserLocation((prev) => ({
          ...prev,
          address: `Координаты: ${location?.lat?.toFixed(6)}, ${location?.lng?.toFixed(6)}`
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error?.message || error);
      setUserLocation((prev) => ({
        ...prev,
        address: `Координаты: ${location?.lat?.toFixed(6)}, ${location?.lng?.toFixed(6)}`
      }));
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 card-shadow-sm border border-border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="MapPin" size={20} className="text-accent" />
        <h3 className="font-semibold text-foreground">Тип заказа</h3>
      </div>

      {/* Order Type Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleOrderTypeChange('takeaway')}
          className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedOrderType === 'takeaway'
              ? 'bg-accent text-white shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          <Icon name="ShoppingBag" size={18} />
          <span>С собой</span>
        </button>
        <button
          type="button"
          onClick={() => handleOrderTypeChange('delivery')}
          className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedOrderType === 'delivery'
              ? 'bg-accent text-white shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          <Icon name="Truck" size={18} />
          <span>Доставка</span>
        </button>
      </div>

      {/* Branch Selection - shown for takeaway */}
      {selectedOrderType === 'takeaway' && (
        <button
          type="button"
          onClick={() => {
            if (onBranchSelect) {
              onBranchSelect();
            }
          }}
          className="w-full p-3 rounded-lg bg-card border-2 border-border hover:border-accent/50 transition-all duration-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={18} className="text-accent" />
            <span className="font-medium text-foreground">
              {selectedBranch ? selectedBranch.name : 'Выберите филиал'}
            </span>
          </div>
          <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
        </button>
      )}

      {/* Delivery Address Section */}
      {selectedOrderType === 'delivery' && (
        <div className="space-y-3">
          {isLoadingLocation ? (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Icon name="Loader2" size={16} className="animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Определяем ваш адрес...</span>
            </div>
          ) : userLocation?.address ? (
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Icon name="MapPin" size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{userLocation.address}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs text-accent hover:underline whitespace-nowrap flex-shrink-0"
                >
                  Изменить
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {locationError && !locationError.isRetrying && (
                <p className="text-xs text-destructive">{locationError.message}</p>
              )}
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full p-3 rounded-lg border-2 border-dashed border-border hover:border-accent/50 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="MapPin" size={18} />
                <span>Указать адрес доставки</span>
              </button>
              {locationError?.canRetry && !locationError.isRetrying && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full text-xs text-accent hover:underline text-center"
                >
                  Определить местоположение автоматически
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Address Input Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Адрес доставки</h3>
              <button
                onClick={() => {
                  setIsAddressModalOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Улица <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryAddress?.street}
                  onChange={(e) => handleAddressInputChange('street', e?.target?.value)}
                  placeholder="Например: ул. Амира Темура"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Дом <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress?.building}
                    onChange={(e) => handleAddressInputChange('building', e?.target?.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Квартира
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress?.apartment}
                    onChange={(e) => handleAddressInputChange('apartment', e?.target?.value)}
                    placeholder="42"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Подъезд
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress?.entrance}
                    onChange={(e) => handleAddressInputChange('entrance', e?.target?.value)}
                    placeholder="2"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Этаж
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress?.floor}
                    onChange={(e) => handleAddressInputChange('floor', e?.target?.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Домофон
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress?.intercom}
                    onChange={(e) => handleAddressInputChange('intercom', e?.target?.value)}
                    placeholder="42"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Дополнительная информация
                </label>
                <textarea
                  value={deliveryAddress?.additionalInfo}
                  onChange={(e) => handleAddressInputChange('additionalInfo', e?.target?.value)}
                  placeholder="Ориентиры, комментарии для курьера..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsAddressModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={handleManualAddressSubmit}
                  disabled={!deliveryAddress?.street?.trim() || !deliveryAddress?.building?.trim()}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryInfoCard;
