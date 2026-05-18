import React from 'react';

export const TIER_OPTIONS = [
  { id: 'Bronze',   label: 'Bronze',   color: '#cd7f32', bg: '#fdf3e7' },
  { id: 'Silver',   label: 'Silver',   color: '#64748b', bg: '#f1f5f9' },
  { id: 'Gold',     label: 'Gold',     color: '#d97706', bg: '#fffbeb' },
  { id: 'Platinum', label: 'Platinum', color: '#7c3aed', bg: '#f5f3ff' },
];

// value: 'all' | comma-separated tier names e.g. 'Gold,Platinum'
const VisibilityPicker = ({ value = 'all', onChange }) => {
  const selected = value === 'all' ? [] : value.split(',').filter(Boolean);
  const allSelected = selected.length === 0;

  const toggle = (tierId) => {
    if (allSelected) {
      onChange(tierId);
      return;
    }
    const next = selected.includes(tierId)
      ? selected.filter(t => t !== tierId)
      : [...selected, tierId];
    onChange(next.length === 0 || next.length === TIER_OPTIONS.length ? 'all' : next.join(','));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('all')}
        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        style={allSelected
          ? { background: 'var(--color-primary)', color: 'var(--color-primary-foreground)', borderColor: 'var(--color-primary)' }
          : { background: 'var(--color-background)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }}
      >
        Все
      </button>
      {TIER_OPTIONS.map(tier => {
        const active = selected.includes(tier.id);
        return (
          <button
            key={tier.id}
            type="button"
            onClick={() => toggle(tier.id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
            style={active
              ? { background: tier.color, color: '#fff', borderColor: tier.color }
              : { background: 'var(--color-background)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }}
          >
            {tier.label}
          </button>
        );
      })}
    </div>
  );
};

export default VisibilityPicker;
