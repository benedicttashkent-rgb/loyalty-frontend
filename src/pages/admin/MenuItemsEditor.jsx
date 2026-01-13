import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';

const MenuItemsEditor = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('mirabad');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
      const response = await adminApiRequest(`admin/menu-items?branchId=${selectedBranch}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMenuItems(data.menuItems || []);
        }
      }
    } catch (error) {
      console.error('Fetch menu items error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    menuItems.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [menuItems]);

  // Filter and paginate items
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  }, [menuItems, searchQuery, selectedCategory]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.slice(start, end);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = editingItem
        ? `admin/menu-items/${editingItem.id}`
        : 'admin/menu-items';
      
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

      const response = await adminApiRequest(endpoint, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModal(false);
          setEditingItem(null);
          resetForm();
          fetchMenuItems();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert('Ошибка при сохранении: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при сохранении: ' + error.message);
    }
  };

  const resetForm = () => {
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
      const response = await adminApiRequest(`admin/menu-items/${id}`, {
        method: 'DELETE',
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

  const handleToggleStatus = async (item) => {
    try {
      const updates = { isAvailable: !item.isAvailable };
      const response = await adminApiRequest(`admin/menu-items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Ошибка при изменении статуса: ' + error.message);
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

  const formatPrice = (price) => {
    if (!price) return '0';
    return parseFloat(price).toLocaleString('ru-RU');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {selectedCategory !== 'all' ? selectedCategory : 'Все блюда'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredItems.length} {filteredItems.length === 1 ? 'блюдо' : 'блюд'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Icon name="Plus" size={20} />
            Добавить блюдо
          </button>
        </div>
      </div>

      {/* Branch Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            setSelectedBranch('mirabad');
            setCurrentPage(1);
            setSearchQuery('');
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedBranch === 'mirabad'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Мирабад
        </button>
        <button
          onClick={() => {
            setSelectedBranch('nukus');
            setCurrentPage(1);
            setSearchQuery('');
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedBranch === 'nukus'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Нукус
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Поиск по названию блюда"
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">Все категории</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Название блюда</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Категория</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Стоимость</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Дата создания</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Статус</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery ? 'Блюда не найдены' : 'Нет блюд'}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={item.id || item.iikoProductId} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (() => {
                            // Convert relative URL to full URL
                            let imageSrc = item.imageUrl;
                            if (imageSrc && imageSrc.startsWith('/uploads/')) {
                              const apiBase = getApiUrl('').replace('/api', '');
                              imageSrc = `${apiBase}${imageSrc}`;
                            }
                            return (
                              <img
                                src={imageSrc}
                                alt={item.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            );
                          })() : null}
                          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                            <Icon name="Image" size={20} className="text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{item.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{item.category || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground">
                          {formatPrice(item.price)} сум
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => item.id && handleToggleStatus(item)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.isAvailable ? 'bg-primary' : 'bg-muted'
                          }`}
                          disabled={!item.id}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.isAvailable ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {item.isAvailable ? 'Активировано' : 'Неактивный'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.id && (
                            <>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Редактировать"
                              >
                                <Icon name="Edit" size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Удалить"
                              >
                                <Icon name="Trash2" size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Отобразить</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-border rounded bg-background text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                Показаны с {(currentPage - 1) * itemsPerPage + 1} по {Math.min(currentPage * itemsPerPage, filteredItems.length)} из {filteredItems.length} записей
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Первая страница"
                >
                  <span className="text-sm">««</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Предыдущая страница"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Следующая страница"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Последняя страница"
                >
                  <span className="text-sm">»»</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowModal(false);
          setEditingItem(null);
          resetForm();
        }}>
          <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingItem ? 'Изменить продукт' : 'Добавить продукт'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase">Загруженные изображения</h3>
                  <div className="flex gap-4">
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setFormData({ ...formData, imageUrl: '' });
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Icon name="Camera" size={24} className="text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center px-2">Загрузка изображения</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Загрузите изображение в формате JPEG, PNG или WEBP. Максимальный размер файла – 10 МБ.
                  </p>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Название продукта *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Категория</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    rows={4}
                    placeholder="Введите описание блюда..."
                  />
                </div>

                {/* Price and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Стоимость *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">UZS</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-16 pr-3 py-2 border border-border rounded-lg bg-background"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Единица измерения</label>
                    <select
                      value={formData.weight || 'порция'}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="порция">порция</option>
                      <option value="г">г</option>
                      <option value="мл">мл</option>
                      <option value="шт">шт</option>
                    </select>
                  </div>
                </div>

                {/* Nutritional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Калории</label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Белки (г)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.proteins}
                      onChange={(e) => setFormData({ ...formData, proteins: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Жиры (г)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fats}
                      onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Углеводы (г)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.carbohydrates}
                      onChange={(e) => setFormData({ ...formData, carbohydrates: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>

                {/* Hidden fields */}
                {formData.iikoProductId && (
                  <input type="hidden" value={formData.iikoProductId} />
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingItem ? 'Редактировать' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemsEditor;
