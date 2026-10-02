import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageHeader from '../../components/navigation/PageHeader';
import Icon from '../../components/AppIcon';
import BranchCard from './components/BranchCard';

import SocialMediaSection from './components/SocialMediaSection';
import AboutSection from './components/AboutSection';
import MapModal from './components/MapModal';
import { openPhoneDialer } from '../../utils/openPhoneDialer';

const BOOKING_URL = 'https://www.benedict-cafe.uz/#contact';

const AboutBranchLocations = () => {
  const [mapModal, setMapModal] = useState({ isOpen: false, coordinates: null, branchName: '' });

  const branches = [
    {
      id: 1,
      name: "Benedict Нукус",
      district: "Ташкент",
      address: "ул. Нукус 31/2",
      phone: "+998 33 8888807",
      image: "/branch-nukus.webp",
      hours: ["Пн–Чт: 08:00–00:00", "Пт–Сб: 08:00–02:00", "Вс: 08:00–00:00"],
      coordinates: {
        lat: 41.293115,
        lng: 69.281112
      },
      features: [
        "Бесплатный Wi-Fi",
        "Места для работы с ноутбуком",
        "Детская площадка"
      ],
      isNew: false
    },
    {
      id: 2,
      name: "Benedict Мирабад",
      district: "Ташкент",
      address: "ул. Мирабад, 60",
      phone: "+998 33 5556601",
      image: "/branch-mirabad.webp",
      hours: ["Ежедневно: 08:00–00:00"],
      coordinates: {
        lat: 41.293377,
        lng: 69.268479
      },
      features: [
        "Живая музыка",
        "Банкетный зал на 40 персон",
        "Круглогодичная терраса"
      ],
      isNew: false
    }
  ];

  const socialMedia = [
    {
      platform: "Instagram — Мирабад",
      icon: "Instagram",
      followers: "25K",
      url: "https://www.instagram.com/benedict_mirabad_tashkent?stkn=dWdsaDVlYTZ6Yjhr"
    },
    {
      platform: "Instagram — Нукус",
      icon: "Instagram",
      followers: "200",
      url: "https://www.instagram.com/benedict_nukus_tashkent?stkn=MTE2dW5zeHRsMWhhbA=="
    }
  ];

  const aboutInfo = {
    description: "Benedict - это не просто кафе, а пространство премиального комфорта, где каждая деталь создана для вашего удовольствия. Мы предлагаем изысканную кухню, приготовленную из отборных ингредиентов, безупречный сервис и атмосферу, располагающую к приятному времяпрепровождению. Наши филиалы в Ташкенте стали излюбленными местами для тех, кто ценит качество и стиль.",
    stats: {
      locations: "2",
      customers: "50K+",
      years: "3+"
    }
  };

  const handleCallClick = (phone) => {
    openPhoneDialer(phone);
  };

  const handleMapClick = (coordinates, branchName) => {
    setMapModal({ isOpen: true, coordinates, branchName });
  };

  const handleBookTable = () => {
    const tg = window.Telegram?.WebApp;
    // Inside Telegram, openLink opens the site in the in-app browser
    if (tg?.openLink) tg.openLink(BOOKING_URL);
    else window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>О нас - Benedict Café</title>
        <meta name="description" content="Информация о локациях Benedict Café, контакты и социальные сети" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <main className="main-content max-w-md mx-auto">
          <PageHeader title="О нас" subtitle="Два филиала в Ташкенте" />

          <button
            type="button"
            onClick={handleBookTable}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-between px-5 active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <Icon name="CalendarDays" size={24} />
              <span className="text-left">
                <span className="block text-lg font-semibold leading-tight">Забронировать стол</span>
                <span className="block text-sm text-primary-foreground/75">На сайте benedict-cafe.uz</span>
              </span>
            </span>
            <Icon name="ArrowUpRight" size={22} />
          </button>

          <div className="space-y-10 mt-8">
            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Филиалы</h2>
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