import React from 'react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="relative">
      {/* Gradient fade on right edge to hint at scroll */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pr-6">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => onCategoryChange(category?.id)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all duration-200 flex-shrink-0 cursor-pointer ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground shadow-sm'
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
