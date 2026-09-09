/**
 * Shared form primitives for the admin panel.
 *
 * Every create/edit form in src/pages/admin (banners, events, rewards, promo
 * codes, special offers, menu items, categories, telegram broadcast) should
 * import these instead of redefining ad-hoc `inputClass` / `labelClass`
 * string literals. Keeping one source means padding, radius, focus ring,
 * label casing, and spacing stay identical across every editor.
 */

// Standard text/number/textarea/select field.
export const inputClass =
  'w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

// Compact variant for inline filter bars / toolbars (still keeps the focus ring).
export const inputClassCompact =
  'px-3 py-2 rounded-lg text-sm text-foreground bg-background border border-border ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

export const textareaClass = `${inputClass} resize-none`;

export const selectClass = inputClass;

// Field label: uppercase, tracked, muted — used above every input/select/textarea.
export const labelClass =
  'block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5';

// Append to labelClass text when the field is required, e.g. `Название{requiredMark}`.
export const requiredMark = ' *';

export const errorTextClass = 'text-xs text-destructive mt-1';
export const hintTextClass = 'text-xs text-muted-foreground mt-1';

// Primary / secondary action buttons used in modal footers.
export const primaryButtonClass =
  'flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground bg-primary ' +
  'hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryButtonClass =
  'flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground ' +
  'hover:bg-muted active:scale-[0.98] transition-all';

// Toggle switch (used for isActive / isFeatured / isHighlighted style booleans).
export const toggleTrackClass = 'w-10 h-6 rounded-full relative transition-colors flex-shrink-0';
export const toggleThumbClass = 'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all';
export const toggleGroupClass = 'flex items-center gap-6 py-4 px-4 rounded-xl';

/**
 * dd/mm/yyyy auto-slash formatter for date text inputs. Reuse this in every
 * onChange handler instead of re-implementing the slash-insertion logic per
 * file (EventsEditor / RewardsEditor already do this correctly).
 */
export const autoSlashDate = (raw) => {
  let value = raw.replace(/[^\d/]/g, '');
  if (value.length === 2 && !value.includes('/')) value = value + '/';
  else if (value.length === 5 && value.split('/').length === 2) value = value + '/';
  return value.length <= 10 ? value : value.slice(0, 10);
};
