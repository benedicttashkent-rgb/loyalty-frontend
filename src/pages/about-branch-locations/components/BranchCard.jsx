import React from 'react';
import SmoothImage from '../../../components/SmoothImage';
import Icon from '../../../components/AppIcon';

const BranchCard = ({ branch, onCallClick, onMapClick }) => {
  return (
    <article className="rounded-2xl border border-border overflow-hidden">
      {branch?.image && (
        <div className="h-40 bg-muted">
          <SmoothImage src={branch.image} alt={branch.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5">
        <h3 className="font-display text-2xl text-foreground leading-tight">{branch?.name}</h3>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex gap-3">
            <dt className="sr-only">Адрес</dt>
            <Icon name="MapPin" size={18} className="text-primary flex-shrink-0 mt-px" />
            <dd className="text-foreground">{branch?.address}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="sr-only">Часы работы</dt>
            <Icon name="Clock" size={18} className="text-primary flex-shrink-0 mt-px" />
            <dd className="text-foreground space-y-0.5">
              {branch?.hours?.map((line) => <p key={line}>{line}</p>)}
            </dd>
          </div>
        </dl>

        {branch?.features?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {branch.features.map((feature) => (
              <span key={feature} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground/80">
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={() => onCallClick(branch?.phone)}
            className="h-11 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="Phone" size={16} />
            Позвонить
          </button>
          <button
            type="button"
            onClick={() => onMapClick(branch?.coordinates)}
            className="h-11 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="Map" size={16} />
            На карте
          </button>
        </div>
      </div>
    </article>
  );
};

export default BranchCard;
