import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BranchCard = ({ branch, onCallClick, onMapClick }) => {
  return (
    <div className="bg-card rounded-xl p-6 card-shadow transition-smooth hover:card-shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{branch?.name}</h3>
          <p className="text-sm text-muted-foreground">{branch?.district}</p>
        </div>
        {branch?.isNew && (
          <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
            Новый
          </span>
        )}
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <Icon name="MapPin" size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">{branch?.address}</p>
        </div>

        <div className="flex items-center gap-3">
          <Icon name="Phone" size={18} className="text-primary flex-shrink-0" />
          <a href={`tel:${branch?.phone}`} className="text-sm text-foreground hover:text-primary transition-smooth">
            {branch?.phone}
          </a>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="Clock" size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-foreground">
            <p className="font-medium mb-1">Часы работы:</p>
            <p>{branch?.hours?.weekdays}</p>
            <p>{branch?.hours?.weekend}</p>
          </div>
        </div>

        {branch?.features && branch?.features?.length > 0 && (
          <div className="flex items-start gap-3">
            <Icon name="Star" size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-foreground">
              <p className="font-medium mb-1">Особенности:</p>
              <ul className="space-y-1">
                {branch?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="default"
          iconName="Phone"
          iconPosition="left"
          onClick={() => onCallClick(branch?.phone)}
          className="flex-1"
        >
          Позвонить
        </Button>
        <Button
          variant="default"
          size="default"
          iconName="MapPin"
          iconPosition="left"
          onClick={() => onMapClick(branch?.coordinates)}
          className="flex-1"
        >
          На карте
        </Button>
      </div>
    </div>
  );
};

export default BranchCard;