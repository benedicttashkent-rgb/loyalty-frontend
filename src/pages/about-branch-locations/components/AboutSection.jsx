import React from 'react';

const AboutSection = ({ aboutInfo }) => {
  const stats = [
    { value: aboutInfo?.stats?.locations, label: 'филиала' },
    { value: aboutInfo?.stats?.customers, label: 'гостей' },
    { value: aboutInfo?.stats?.years, label: 'года работы' },
  ];

  return (
    <section>
      <h2 className="font-display text-2xl text-foreground mb-3">О Benedict</h2>
      <p className="text-muted-foreground leading-relaxed">{aboutInfo?.description}</p>

      <div className="grid grid-cols-3 mt-6 rounded-2xl bg-muted/60 py-4">
        {stats.map(({ value, label }, index) => (
          <div key={label} className={`text-center ${index > 0 ? 'border-l border-border' : ''}`}>
            <div className="font-display text-3xl text-foreground leading-none">{value}</div>
            <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;
