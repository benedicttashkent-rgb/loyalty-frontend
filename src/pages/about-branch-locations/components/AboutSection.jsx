import React from 'react';
import Icon from '../../../components/AppIcon';

const AboutSection = ({ aboutInfo }) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">О Benedict</h2>
        <p className="text-muted-foreground leading-relaxed">
          {aboutInfo?.description}
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">Наши ценности</h3>
        <ul className="space-y-2">
          {aboutInfo?.values?.map((value, index) => (
            <li key={index} className="flex items-start gap-2">
              <Icon name="Check" size={20} className="text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {aboutInfo?.stats?.locations}
          </div>
          <div className="text-xs text-muted-foreground">Филиала</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {aboutInfo?.stats?.customers}
          </div>
          <div className="text-xs text-muted-foreground">Гостей</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {aboutInfo?.stats?.years}
          </div>
          <div className="text-xs text-muted-foreground">Лет работы</div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;