import React from 'react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="relative">
      {/* Gradient fades to hint at horizontal scroll */}
      <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => onCategoryChange(category?.id)}
            style={{ touchAction: 'manipulation' }}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold transition-all duration-200 flex-shrink-0 cursor-pointer select-none ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground shadow-sm scale-[1.03]'
                : 'bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground'
            }`}
            aria-pressed={activeCategory === category?.id}
          >
            {category?.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
