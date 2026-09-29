import React from 'react';
import Icon from '../../../components/AppIcon';

const SocialMediaSection = ({ socialMedia }) => {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground mb-4">Instagram</h2>
      <div className="rounded-2xl border border-border divide-y divide-border">
        {socialMedia?.map((social) => (
          <a
            key={social?.url}
            href={social?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 active:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Icon name={social?.icon} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{social?.platform}</p>
              <p className="text-sm text-muted-foreground">{social?.followers} подписчиков</p>
            </div>
            <Icon name="ArrowUpRight" size={18} className="text-muted-foreground flex-shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
};

export default SocialMediaSection;
