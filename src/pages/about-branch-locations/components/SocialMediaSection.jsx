import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SocialMediaSection = ({ socialMedia }) => {
  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card rounded-xl p-6 card-shadow">
      <h2 className="text-xl font-semibold text-foreground mb-2">Мы в социальных сетях</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Следите за новостями, акциями и специальными предложениями
      </p>
      <div className="space-y-4">
        {socialMedia?.map((social) => (
          <div
            key={social?.platform}
            className="flex items-center justify-between p-4 bg-muted rounded-lg transition-smooth hover:bg-muted/80"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name={social?.icon} size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{social?.platform}</p>
                <p className="text-xs text-muted-foreground">{social?.followers} подписчиков</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="ExternalLink"
              iconPosition="right"
              onClick={() => handleSocialClick(social?.url)}
            >
              Перейти
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaSection;