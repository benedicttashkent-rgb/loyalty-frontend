import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

const MenuItemsEditor = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('mirabad');
  const [formData, setFormData] = useState({
    iikoProductId: '',
    branchId: 'mirabad',
    name: '',
    description: '',
    price: '',
    category: '',
    weight: '',
    imageUrl: '',
    calories: '',
    proteins: '',
    fats: '',
    carbohydrates: '',
    isAvailable: true,
    displayOrder: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedBranch]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      console.log(`[MenuItemsEditor] Fetching menu items for branch: ${selectedBranch}`);
      const response = await fetch(`/api/admin/menu-items?branchId=${selectedBranch}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[MenuItemsEditor] Response:`, {
          success: data.success,
          total: data.total,
          itemsCount: data.menuItems?.length || 0
        });
        if (data.success) {
          setMenuItems(data.menuItems || []);
          console.log(`[MenuItemsEditor] Set ${data.menuItems?.length || 0} menu items`);
        } else {
          console.error('[MenuItemsEditor] API returned success=false:', data.error);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[MenuItemsEditor] API error:', response.status, errorData);
      }
    } catch (error) {
      console.error('[MenuItemsEditor] Fetch menu items error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? `/api/admin/menu-items/${editingItem.id}`
        : '/api/admin/menu-items';
      
      const method = editingItem ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      
      if (formData.iikoProductId && formData.iikoProductId.trim()) {
        formDataToSend.append('iikoProductId', formData.iikoProductId.trim());
      }
      formDataToSend.append('branchId', formData.branchId.trim());
      formDataToSend.append('name', formData.name.trim());
      if (formData.description) formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price || '0');
      if (formData.category) formDataToSend.append('category', formData.category.trim());
      if (formData.weight) formDataToSend.append('weight', formData.weight.trim());
      if (formData.calories) formDataToSend.append('calories', formData.calories);
      if (formData.proteins) formDataToSend.append('proteins', formData.proteins);
      if (formData.fats) formDataToSend.append('fats', formData.fats);
      if (formData.carbohydrates) formDataToSend.append('carbohydrates', formData.carbohydrates);
      formDataToSend.append('isAvailable', formData.isAvailable ? 'true' : 'false');
      if (formData.displayOrder) formDataToSend.append('displayOrder', formData.displayOrder);
      if (formData.imageUrl && !imageFile) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          setEditingItem(null);
          setFormData({
            iikoProductId: '',
            branchId: selectedBranch,
            name: '',
            description: '',
            price: '',
            category: '',
            weight: '',
            imageUrl: '',
            calories: '',
            proteins: '',
            fats: '',
            carbohydrates: '',
            isAvailable: true,
            displayOrder: 0
          });
          setImageFile(null);
          setImagePreview(null);
          fetchMenuItems();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error saving menu item:', errorData);
        alert('Ошибка при сохранении: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при сохранении: ' + error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      iikoProductId: item.iikoProductId || '',
      branchId: item.branchId || selectedBranch,
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      weight: item.weight || '',
      imageUrl: item.imageUrl || '',
      calories: item.calories || '',
      proteins: item.proteins || '',
      fats: item.fats || '',
      carbohydrates: item.carbohydrates || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      displayOrder: item.displayOrder || 0
    });
    setImagePreview(item.imageUrl || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchMenuItems();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert('Ошибка при удалении: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка при удалении: ' + error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Редактор блюд</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              iikoProductId: '',
              branchId: selectedBranch,
              name: '',
              description: '',
              imageUrl: '',
              calories: '',
              proteins: '',
              fats: '',
              carbohydrates: ''
            });
            setImageFile(null);
            setImagePreview(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Icon name="Plus" size={20} />
          Добавить блюдо
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setSelectedBranch('mirabad')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedBranch === 'mirabad'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Мирабад
        </button>
        <button
          onClick={() => setSelectedBranch('nukus')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedBranch === 'nukus'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Нукус
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id || item.iikoProductId}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.category && <span className="mr-2">Категория: {item.category}</span>}
                  {item.weight && <span className="mr-2">| {item.weight}</span>}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  Цена: {item.price || 0} сум {item.isAvailable === false && '(Недоступно)'}
                </p>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {(item.calories || item.proteins || item.fats || item.carbohydrates) && (
                  <div className="text-xs text-muted-foreground mt-2">
                    КБЖУ: {item.calories && `${item.calories} ккал`}
                    {item.proteins && `, Б: ${item.proteins}г`}
                    {item.fats && `, Ж: ${item.fats}г`}
                    {item.carbohydrates && `, У: ${item.carbohydrates}г`}
                  </div>
                )}
              </div>
              {item.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                {editingItem ? 'Редактировать блюдо' : 'Добавить блюдо'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID продукта из iiko (опционально)</label>
                <input
                  type="text"
                  value={formData.iikoProductId}
                  onChange={(e) => setFormData({ ...formData, iikoProductId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder="Оставьте пустым для ручного добавления"
                  disabled={!!editingItem}
                />
                <p className="text-xs text-muted-foreground mt-1">Оставьте пустым, если добавляете блюдо вручную</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Филиал *</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                  disabled={!!editingItem}
                >
                  <option value="mirabad">Мирабад</option>
                  <option value="nukus">Нукус</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Цена (сум) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Например: Напитки, Десерты"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Вес/Размер</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Например: 300мл, 250г"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Доступность</label>
                  <select
                    value={formData.isAvailable ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="true">Доступно</option>
                    <option value="false">Недоступно</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Фото</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Калории</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Белки (г)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.proteins}
                    onChange={(e) => setFormData({ ...formData, proteins: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Жиры (г)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Углеводы (г)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.carbohydrates}
                    onChange={(e) => setFormData({ ...formData, carbohydrates: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingItem ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemsEditor;
