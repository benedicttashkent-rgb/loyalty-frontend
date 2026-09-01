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

  const TIER_COLORS = {
    Bronze:   '#cd7f32',
    Silver:   '#9ca3af',
    Gold:     '#d4a574',
    Platinum: '#8b6a4e',
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Награды</h1>
          <p className="text-sm text-muted-foreground mt-1">{rewards.length} наград в каталоге</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Добавить награду
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="group bg-card rounded-2xl overflow-hidden transition-all hover:shadow-md" style={{ border: '1px solid var(--color-border)' }}>
            <div className="w-full h-40 relative overflow-hidden" style={{ background: 'var(--color-muted)' }}>
              {reward.image_url ? (
                <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="Gift" size={28} className="text-muted-foreground opacity-40" />
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm"
                  style={reward.is_active
                    ? { background: 'rgba(240,253,244,0.9)', color: '#16a34a' }
                    : { background: 'rgba(243,244,246,0.9)', color: '#6b7280' }}
                >
                  {reward.is_active ? 'Активна' : 'Неактивна'}
                </span>
                {reward.is_featured && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1" style={{ background: 'rgba(253,240,240,0.9)', color: '#c17b7b' }}>
                    <Icon name="Star" size={10} />
                    Рекомендуем
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              <h3 className="font-semibold text-foreground leading-tight">{reward.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{reward.description}</p>
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-sm font-bold" style={{ color: '#8b6a4e' }}>{reward.points_cost} баллов</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${TIER_COLORS[reward.tier] || '#8b6a4e'}20`, color: TIER_COLORS[reward.tier] || '#8b6a4e' }}
                >
                  {reward.tier}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleEdit(reward)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                  style={{ background: 'var(--color-muted)', color: 'var(--color-foreground)' }}
                >
                  <Icon name="Pencil" size={13} />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="px-3 py-2 rounded-xl transition-colors hover:bg-destructive/10"
                >
                  <Icon name="Trash2" size={13} className="text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="py-20 text-center rounded-2xl" style={{ background: '#f8efe0' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#eedcbe' }}>
            <Icon name="Gift" size={24} style={{ color: '#8b6a4e' }} />
          </div>
          <p className="text-lg text-foreground mb-1">Нет наград</p>
          <p className="text-sm text-muted-foreground mb-5">Создайте первую награду для каталога</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-5 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Добавить награду
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-card w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl overflow-y-auto shadow-2xl p-6" style={{ maxHeight: '92vh' }}>
            <h2 className="text-xl text-foreground mb-4">
              {editingReward ? 'Редактировать награду' : 'Новая награда'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Название *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Стоимость (баллы) *</label>
                  <input
                    type="number"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Описание *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Изображение Награды (Загрузить Фото) *</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRewardImageChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Тир/Статус *</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    required
                  >
                    {ALL_TIERS.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    placeholder="Например: Еда, Напитки"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Количество на складе</label>
                  <input
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value || null })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    min="0"
                    placeholder="Оставьте пустым для безлимита"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Лимит выкупа</label>
                  <input
                    type="number"
                    value={formData.redemptionLimit || ''}
                    onChange={(e) => setFormData({ ...formData, redemptionLimit: e.target.value || null })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    min="0"
                    placeholder="Оставьте пустым для безлимита"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Действительна с (dd/mm/yyyy)</label>
                  <input
                    type="text"
                    value={formData.validFrom}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d/]/g, ''); // Only allow digits and /
                      setFormData({ ...formData, validFrom: value });
                    }}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: dd/mm/yyyy</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Действительна до (dd/mm/yyyy)</label>
                  <input
                    type="text"
                    value={formData.validUntil}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d/]/g, ''); // Only allow digits and /
                      setFormData({ ...formData, validUntil: value });
                    }}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: dd/mm/yyyy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Порядок отображения</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 py-4 px-4 rounded-xl" style={{ background: 'var(--color-muted)' }}>
                {[
                  { key: 'isActive', label: 'Активна' },
                  { key: 'isFeatured', label: 'Рекомендуемая' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <div
                      className="w-10 h-6 rounded-full relative transition-colors flex-shrink-0"
                      style={{ background: formData[key] ? 'var(--color-primary)' : 'var(--color-border)' }}
                      onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                        style={{ left: formData[key] ? 22 : 4 }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  {editingReward ? 'Сохранить' : 'Создать'}
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

