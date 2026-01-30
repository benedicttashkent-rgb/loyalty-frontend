import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import ProfileButton from '../../components/navigation/ProfileButton';
import ModalOverlay from '../../components/navigation/ModalOverlay';
import BrandLogo from '../../components/navigation/BrandLogo';
import LoyaltyPointsCard from '../home-dashboard/components/LoyaltyPointsCard';
import QRCodeButton from '../home-dashboard/components/QRCodeButton';
import NewsBanner from '../home-dashboard/components/NewsBanner';
import OrderSection from '../home-dashboard/components/OrderSection';
import LoyaltyDetailsModal from '../home-dashboard/components/LoyaltyDetailsModal';
import QRCodeModal from '../home-dashboard/components/QRCodeModal';
import BookTableModal from '../home-dashboard/components/BookTableModal';

// Mock user data for demo (no registration)
const MOCK_USER_DATA = {
  id: 'demo',
  name: 'Демо Пользователь',
  email: 'demo@benedict.uz',
  phone: '+998 90 123 45 67',
  cashback: 1250,
  cashbackPercent: 2,
  points: 1250,
  tier: 'Bronze',
  progress: {
    current: 500000,
    next: 10000000,
    remaining: 9500000,
    percentage: 5,
  },
};

const TestHome = () => {
  const navigate = useNavigate();
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBookTable, setShowBookTable] = useState(false);
  const [showNewsBanner, setShowNewsBanner] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const userData = MOCK_USER_DATA;

  useEffect(() => {
    const savedCart = localStorage.getItem('benedictCart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        const totalItems = cart?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    }
  }, []);

  const handleProfileClick = () => {
    // In test mode, profile could show a "Demo mode" message; for now do nothing or show toast
    return;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="main-content max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BrandLogo />
          <ProfileButton onClick={handleProfileClick} />
        </div>

        <div className="space-y-6">
          <LoyaltyPointsCard
            cashback={userData?.cashback}
            cashbackPercent={userData?.cashbackPercent}
            tier={userData?.tier}
            progress={userData?.progress}
            onDetailsClick={() => setShowLoyaltyDetails(true)}
          />

          <QRCodeButton onClick={() => setShowQRCode(true)} />

          {showNewsBanner && (
            <NewsBanner onClose={() => setShowNewsBanner(false)} />
          )}

          <OrderSection onBookTableClick={() => setShowBookTable(true)} />
        </div>
      </div>
      <BottomTabNavigation cartCount={cartCount} />
      <ModalOverlay isOpen={showLoyaltyDetails} onClose={() => setShowLoyaltyDetails(false)}>
        <LoyaltyDetailsModal
          isOpen={showLoyaltyDetails}
          onClose={() => setShowLoyaltyDetails(false)}
          userData={userData}
        />
      </ModalOverlay>
      <ModalOverlay isOpen={showQRCode} onClose={() => setShowQRCode(false)}>
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => setShowQRCode(false)}
          userData={userData}
        />
      </ModalOverlay>
      <ModalOverlay isOpen={showBookTable} onClose={() => setShowBookTable(false)}>
        <BookTableModal
          isOpen={showBookTable}
          onClose={() => setShowBookTable(false)}
        />
      </ModalOverlay>
    </div>
  );
};

export default TestHome;
