import React from 'react';
import Icon from '../../../components/AppIcon';

const ContactSection = ({ contactInfo }) => {
  return (
    <div className="bg-card rounded-xl p-6 card-shadow">
      <h2 className="text-xl font-semibold text-foreground mb-6">Контактная информация</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Icon name="Mail" size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Email</p>
            <a href={`mailto:${contactInfo?.email}`} className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              {contactInfo?.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="Phone" size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Служба поддержки</p>
            <a href={`tel:${contactInfo?.supportPhone}`} className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              {contactInfo?.supportPhone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="MessageCircle" size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Часы поддержки</p>
            <p className="text-sm text-muted-foreground">{contactInfo?.supportHours}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="Building2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Юридический адрес</p>
            <p className="text-sm text-muted-foreground">{contactInfo?.legalAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;