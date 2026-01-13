import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import BrandLogo from '../../components/navigation/BrandLogo';
import ProfileButton from '../../components/navigation/ProfileButton';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import BranchCard from './components/BranchCard';

import SocialMediaSection from './components/SocialMediaSection';
import AboutSection from './components/AboutSection';
import MapModal from './components/MapModal';
import { useNavigate } from 'react-router-dom';

const AboutBranchLocations = () => {
  const navigate = useNavigate();
  const [mapModal, setMapModal] = useState({ isOpen: false, coordinates: null, branchName: '' });

  const branches = [
    {
      id: 1,
      name: "Benedict Нукус",
      district: "Ташкент",
      address: "ул. Нукус 31/2",
      phone: "+998 33 8888807",
      hours: {
        weekdays: "Ежедневно: 08:00 - 00:00",
      },
      coordinates: {
        lat: 41.3111,
        lng: 69.2797
      },
      features: [
        "Бесплатный Wi-Fi",
        "Места для работы с ноутбуком",
        "Терраса на 20 мест",
        "Детская площадка"
      ],
      isNew: false
    },
    {
      id: 2,
      name: "Benedict Мирабад",
      district: "Ташкент",
      address: "ул. Мирабад 60B",
      phone: "+998 33 5556601",
      hours: {
        weekdays: "Ежедневно: 08:00 - 00:00",
      },
      coordinates: {
        lat: 41.2995,
        lng: 69.2401
      },
      features: [
        "Живая музыка по выходным",
        "Винная карта",
        "Камерная атмосфера",
        "Банкетный зал"
      ],
      isNew: false
    }
  ];

  const socialMedia = [
    {
      platform: "Instagram",
      icon: "Instagram",
      followers: "23.5K",
      url: "https://www.instagram.com/benedict_cafe_tashkent"
    }
  ];

  const aboutInfo = {
    description: "Benedict - это не просто кафе, а пространство премиального комфорта, где каждая деталь создана для вашего удовольствия. Мы предлагаем изысканную кухню, приготовленную из отборных ингредиентов, безупречный сервис и атмосферу, располагающую к приятному времяпрепровождению. Наши филиалы в Ташкенте стали излюбленными местами для тех, кто ценит качество и стиль.",
    values: [
      "Премиальное качество продуктов",
      "Безупречный сервис",
      "Изысканная атмосфера",
      "Внимание к каждому гостю"
    ],
    stats: {
      locations: "2",
      customers: "50K+",
      years: "3+"
    }
  };

  const handleCallClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMapClick = (coordinates, branchName) => {
    setMapModal({ isOpen: true, coordinates, branchName });
  };

  const handleProfileClick = () => {
    navigate('/user-profile-management');
  };

  return (
    <>
      <Helmet>
        <title>О нас - Benedict Café</title>
        <meta name="description" content="Информация о локациях Benedict Café, контакты и социальные сети" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <BrandLogo />
            <ProfileButton onClick={handleProfileClick} />
          </div>
        </header>

        <main className="main-content max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">О нас</h1>
            <p className="text-sm text-muted-foreground">
              Премиальный ресторан с безупречным сервисом
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Наши филиалы</h2>
              <div className="space-y-4">
                {branches?.map((branch) => (
                  <BranchCard
                    key={branch?.id}
                    branch={branch}
                    onCallClick={handleCallClick}
                    onMapClick={(coords) => handleMapClick(coords, branch?.name)}
                  />
                ))}
              </div>
            </section>

            <SocialMediaSection socialMedia={socialMedia} />

            <AboutSection aboutInfo={aboutInfo} />
          </div>
        </main>

        <BottomTabNavigation />

        <MapModal
          isOpen={mapModal?.isOpen}
          onClose={() => setMapModal({ isOpen: false, coordinates: null, branchName: '' })}
          coordinates={mapModal?.coordinates}
          branchName={mapModal?.branchName}
        />
      </div>
    </>
  );
};

export default AboutBranchLocations;