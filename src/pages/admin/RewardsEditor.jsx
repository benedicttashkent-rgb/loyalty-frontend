import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { formatDateDDMMYYYY, formatDateForInput, parseDateDDMMYYYY, ALL_TIERS } from '../../utils/formatDate';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';

const RewardsEditor = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    pointsCost: 0,
    tier: 'Bronze',
    category: '',
    isActive: true,
    isFeatured: false,
    stockQuantity: null,
    redemptionLimit: null,
    validFrom: '',
    validUntil: '',
    displayOrder: 0,
  });
  const [rewardImageFile, setRewardImageFile] = useState(null);
  const [rewardImagePreview, setRewardImagePreview] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await adminApiRequest('admin/rewards', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRewards(data.rewards || []);
        }
      }
    } catch (error) {
      console.error('Fetch rewards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      alert('Название награды обязательно. Введите название.');
      return;
    }

    try {
      const endpoint = editingReward
        ? `admin/rewards/${editingReward.id}`
        : 'admin/rewards';
      
      const method = editingReward ? 'PUT' : 'POST';

      // Use FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields explicitly
      formDataToSend.append('title', (formData.title || '').trim());
      formDataToSend.append('description', (formData.description || '').trim());
      
      // Parse and send dates in dd/mm/yyyy format - backend will parse them
      if (formData.validFrom && formData.validFrom.trim() !== '') {
        const parsedDate = parseDateDDMMYYYY(formData.validFrom);
        if (parsedDate) {
          formDataToSend.append('validFrom', formData.validFrom.trim());
        } else {
          alert('Неверный формат даты "Действительна с". Используйте формат dd/mm/yyyy (например: 15/12/2024)');
          return;
        }
      }

      if (formData.validUntil && formData.validUntil.trim() !== '') {
        const parsedDate = parseDateDDMMYYYY(formData.validUntil);
        if (parsedDate) {
          formDataToSend.append('validUntil', formData.validUntil.trim());
        } else {
          alert('Неверный формат даты "Действительна до". Используйте формат dd/mm/yyyy (например: 15/12/2024)');
          return;
        }
      }

      // Add numeric fields
      formDataToSend.append('pointsCost', String(parseInt(formData.pointsCost) || 0));
      formDataToSend.append('tier', formData.tier || 'Bronze');
      formDataToSend.append('category', (formData.category || '').trim());
      formDataToSend.append('isActive', formData.isActive !== false ? 'true' : 'false');
      formDataToSend.append('isFeatured', formData.isFeatured ? 'true' : 'false');
      
      if (formData.stockQuantity && formData.stockQuantity !== '') {
        formDataToSend.append('stockQuantity', String(parseInt(formData.stockQuantity)));
      }
      
      if (formData.redemptionLimit && formData.redemptionLimit !== '') {
        formDataToSend.append('redemptionLimit', String(parseInt(formData.redemptionLimit)));
      }
      
      formDataToSend.append('displayOrder', String(parseInt(formData.displayOrder) || 0));

      // Add image URL if exists (for existing images)
      if (formData.imageUrl && !rewardImageFile) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }

      // Add reward image file if selected
      if (rewardImageFile) {
        formDataToSend.append('rewardImage', rewardImageFile);
      }

      console.log('[RewardsEditor] Sending FormData:', {
        title: formData.title,
        description: formData.description,
        pointsCost: formData.pointsCost,
        tier: formData.tier,
        hasImageFile: !!rewardImageFile,
        imageUrl: formData.imageUrl
      });

      const response = await adminApiRequest(endpoint, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        const responseData = await response.json();
        await fetchRewards();
        setShowModal(false);
        resetForm();
      } else {
        let errorMessage = 'Failed to save reward';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Reward save error:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        alert(`Ошибка: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Ошибка соединения: ${error.message || 'Failed to save reward'}`);
    }
  };

  const handleRewardImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRewardImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setRewardImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await adminApiRequest(`admin/rewards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRewards();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete reward');
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title || '',
      description: reward.description || '',
      imageUrl: reward.image_url || '',
      pointsCost: reward.points_cost || 0,
      tier: reward.tier || 'Bronze',
      category: reward.category || '',
      isActive: reward.is_active !== undefined ? reward.is_active : true,
      isFeatured: reward.is_featured || false,
      stockQuantity: reward.stock_quantity || null,
      redemptionLimit: reward.redemption_limit || null,
      validFrom: reward.valid_from ? formatDateDDMMYYYY(reward.valid_from) : '',
      validUntil: reward.valid_until ? formatDateDDMMYYYY(reward.valid_until) : '',
      displayOrder: reward.display_order || 0,
    });
    // Set preview if image exists
    if (reward.image_url) {
      setRewardImagePreview(reward.image_url);
    } else {
      setRewardImagePreview(null);
    }
    setRewardImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingReward(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      pointsCost: 0,
      tier: 'Bronze',
      category: '',
      isActive: true,
      isFeatured: false,
      stockQuantity: null,
      redemptionLimit: null,
      validFrom: '',
      validUntil: '',
      displayOrder: 0,
    });
    setRewardImageFile(null);
    setRewardImagePreview(null);
  };

  const tiers = ALL_TIERS.filter(t => ['Bronze', 'Silver', 'Gold', 'Platinum'].includes(t));

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Награды</h1>
          <p className="text-muted-foreground">Управление каталогом наград</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Icon name="Plus" size={20} />
          Добавить Награду
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            {reward.image_url && (
              <div className="w-full h-48 bg-muted rounded-lg mb-4 overflow-hidden">
                <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-foreground">{reward.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  reward.is_active ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'
                }`}>
                  {reward.is_active ? 'Активна' : 'Неактивна'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{reward.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-sm font-bold text-primary">{reward.points_cost} баллов</p>
                  <p className="text-xs text-muted-foreground">Тир: {reward.tier}</p>
                </div>
                {reward.is_featured && (
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-600 rounded text-xs font-medium">
                    Рекомендуется
                  </span>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleEdit(reward)}
                  className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Edit" size={16} />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Icon name="Gift" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-foreground mb-2">Нет наград</p>
          <p className="text-sm text-muted-foreground mb-4">Создайте первую награду для каталога</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Добавить Награду
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingReward ? 'Редактировать Награду' : 'Добавить Награду'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Стоимость (баллы) *</label>
                  <input
                    type="number"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Изображение Награды (Загрузить Фото) *</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRewardImageChange}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    required={!formData.imageUrl && !rewardImagePreview}
                  />
                  {rewardImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={rewardImagePreview} 
                        alt="Reward preview" 
                        className="w-48 h-48 object-cover rounded-lg border border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Preview</p>
                    </div>
                  )}
                  {formData.imageUrl && !rewardImagePreview && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Current image:</p>
                      <img 
                        src={formData.imageUrl} 
                        alt="Current reward" 
                        className="w-48 h-48 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тир/Статус *</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    required
                  >
                    {ALL_TIERS.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    placeholder="Например: Еда, Напитки"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Количество на складе</label>
                  <input
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value || null })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    min="0"
                    placeholder="Оставьте пустым для безлимита"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Лимит выкупа</label>
                  <input
                    type="number"
                    value={formData.redemptionLimit || ''}
                    onChange={(e) => setFormData({ ...formData, redemptionLimit: e.target.value || null })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    min="0"
                    placeholder="Оставьте пустым для безлимита"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Действительна с (dd/mm/yyyy)</label>
                  <input
                    type="text"
                    value={formData.validFrom}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d/]/g, ''); // Only allow digits and /
                      setFormData({ ...formData, validFrom: value });
                    }}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: dd/mm/yyyy</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Действительна до (dd/mm/yyyy)</label>
                  <input
                    type="text"
                    value={formData.validUntil}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d/]/g, ''); // Only allow digits and /
                      setFormData({ ...formData, validUntil: value });
                    }}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: dd/mm/yyyy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Порядок отображения</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Активна</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Рекомендуемая</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {editingReward ? 'Обновить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-muted"
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

export default RewardsEditor;

