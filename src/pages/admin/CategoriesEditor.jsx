import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';

const CategoriesEditor = () => {
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center min-h-screen">
        <Icon name="Loader2" size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <Icon name="ArrowLeft" size={20} />
          <span>Назад к дашборду</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground">Управление категориями</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Активируйте или деактивируйте категории для отображения в меню. Нажмите на кнопку справа от каждой категории.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Folder" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Категории не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-accent transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon 
                    name={category.is_active ? "CheckCircle2" : "XCircle"} 
                    size={20} 
                    className={category.is_active ? "text-green-500" : "text-gray-500"} 
                  />
                  <h3 className="font-semibold text-foreground">{category.category_name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ID: {category.category_id}</p>
              </div>
              <button
                onClick={() => handleToggleCategory(category.category_id, category.is_active)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  category.is_active
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg'
                }`}
                title={category.is_active ? 'Нажмите, чтобы деактивировать' : 'Нажмите, чтобы активировать'}
              >
                <Icon 
                  name={category.is_active ? "Power" : "PowerOff"} 
                  size={18} 
                />
                {category.is_active ? 'Активна' : 'Неактивна'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesEditor;
