import React from 'react';
import Icon from '../../../components/AppIcon';

const SocialMediaLinks = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: 'Instagram',
      url: 'https://www.instagram.com/benedict_cafe_tashkent',
      color: '#E4405F'
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      url: 'https://facebook.com/benedictcafe',
      color: '#1877F2'
    }
  ];

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="text-base font-semibold text-foreground mb-4 text-center">
        Следите за нами
      </div>
      <div className="flex items-center justify-center gap-4">
        {socialLinks?.map((social) => (
          <button
            key={social?.name}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-smooth hover:scale-110"
            style={{ backgroundColor: `${social?.color}15` }}
            onClick={() => handleSocialClick(social?.url)}
            aria-label={`Visit our ${social?.name} page`}
          >
            <Icon name={social?.icon} size={24} color={social?.color} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaLinks;