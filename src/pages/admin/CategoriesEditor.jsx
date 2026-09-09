import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';

const CategoriesEditor = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminApiRequest('admin/categories', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = async (categoryId, currentStatus) => {
    try {
      const endpoint = currentStatus 
        ? `admin/categories/${categoryId}/deactivate`
        : `admin/categories/${categoryId}/activate`;
      
      const response = await adminApiRequest(endpoint, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setCategories(prev => 
            prev.map(cat => 
              cat.category_id === categoryId 
                ? { ...cat, is_active: !currentStatus }
                : cat
            )
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert('Ошибка: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Toggle category error:', error);
      alert('Ошибка: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Категории</h1>
        <p className="text-sm text-muted-foreground mt-1">{categories.length} категорий в меню</p>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center rounded-2xl" style={{ background: '#f8efe0' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#eedcbe' }}>
            <Icon name="LayoutGrid" size={24} style={{ color: '#8b6a4e' }} />
          </div>
          <p className="text-lg text-foreground mb-1">Нет категорий</p>
          <p className="text-sm text-muted-foreground">Категории появятся здесь после синхронизации с меню</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="flex items-center justify-between p-4 rounded-xl bg-card transition-colors"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <div>
                <h3 className="font-semibold text-sm text-foreground">{category.category_name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">ID: {category.category_id}</p>
              </div>
              <button
                onClick={() => handleToggleCategory(category.category_id, category.is_active)}
                className={`text-[10px] tracking-widest uppercase px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  category.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {category.is_active ? 'Активна' : 'Скрыта'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesEditor;
