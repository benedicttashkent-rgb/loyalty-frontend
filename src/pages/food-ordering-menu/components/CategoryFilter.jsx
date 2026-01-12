import React from 'react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories?.map((category) => (
        <button
          key={category?.id}
          onClick={() => onCategoryChange(category?.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-smooth ${
            activeCategory === category?.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-foreground border border-border hover:bg-muted'
          }`}
          aria-pressed={activeCategory === category?.id}
        >
          {category?.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;