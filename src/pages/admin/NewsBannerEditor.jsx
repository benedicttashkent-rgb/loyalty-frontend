import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';

const NewsBannerEditor = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'coffee',
    icon: 'Coffee',
    gradient: 'from-[#d4a574] via-[#c89864] to-[#8a7560]',
    backgroundColor: '#d4a574',
    showButton: false,
    buttonText: '',
    buttonAction: '',
    isActive: true,
    displayOrder: 0,
  });
  const [iconImageFile, setIconImageFile] = useState(null);
  const [iconImagePreview, setIconImagePreview] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await adminApiRequest('admin/news', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBanners(data.banners);
        }
      }
    } catch (error) {
      console.error('Fetch banners error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = editingBanner
        ? `admin/news/${editingBanner.id}`
        : 'admin/news';
      
      const method = editingBanner ? 'PUT' : 'POST';

      // Use FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add icon image file if selected
      if (iconImageFile) {
        formDataToSend.append('iconImage', iconImageFile);
      }

      const response = await adminApiRequest(endpoint, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        await fetchBanners();
        setShowModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save banner');
    }
  };

  const handleIconImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await adminApiRequest(`admin/news/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      type: banner.type || 'coffee',
      icon: banner.icon || 'Coffee',
      gradient: banner.gradient || 'from-[#d4a574] via-[#c89864] to-[#8a7560]',
      backgroundColor: banner.background_color || '#d4a574',
      showButton: banner.show_button || false,
      buttonText: banner.button_text || '',
      buttonAction: banner.button_action || '',
      isActive: banner.is_active !== undefined ? banner.is_active : true,
      displayOrder: banner.display_order || 0,
    });
    // Set preview if icon image exists
    if (banner.icon_image_url) {
      setIconImagePreview(banner.icon_image_url);
    } else {
      setIconImagePreview(null);
    }
    setIconImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      type: 'coffee',
      icon: 'Coffee',
      gradient: 'from-[#d4a574] via-[#c89864] to-[#8a7560]',
      backgroundColor: '#d4a574',
      showButton: false,
      buttonText: '',
      buttonAction: '',
      isActive: true,
      displayOrder: 0,
    });
    setIconImageFile(null);
    setIconImagePreview(null);
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">News Banners</h1>
          <p className="text-muted-foreground">Manage news banners for the home page</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Icon name="Plus" size={20} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => {
          const backgroundColor = banner.background_color || '#d4a574';
          const gradientStyle = banner.gradient ? `bg-gradient-to-br ${banner.gradient}` : '';
          const solidStyle = !banner.gradient ? { backgroundColor } : {};
          
          return (
            <div key={banner.id} className="bg-card border border-border rounded-lg p-4">
              <div 
                className={`${gradientStyle} rounded-lg p-4 mb-4`}
                style={solidStyle}
              >
                <div className="flex items-center gap-3 mb-2">
                  {banner.icon_image_url ? (
                    <img 
                      src={banner.icon_image_url} 
                      alt={banner.title} 
                      className="w-12 h-12 object-cover rounded-lg border-2 border-white/30"
                    />
                  ) : (
                    <Icon name={banner.icon} size={24} className="text-white" />
                  )}
                  <h3 className="text-white font-bold">{banner.title}</h3>
                </div>
                <p className="text-white/90 text-sm">{banner.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded ${banner.is_active ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
                  {banner.is_active ? 'Активен' : 'Неактивен'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Icon name="Edit" size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  >
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBanner ? 'Редактировать Баннер' : 'Добавить Баннер'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">Описание *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    placeholder="Coffee"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Background Color *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-16 h-10 border border-input rounded-lg bg-background cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-input rounded-lg bg-background"
                      placeholder="#d4a574"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Icon Image (Upload Photo)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconImageChange}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                  {iconImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={iconImagePreview} 
                        alt="Icon preview" 
                        className="w-24 h-24 object-cover rounded-lg border border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Градиент (Опционально - для продвинутого стиля)</label>
                <input
                  type="text"
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  placeholder="from-[#d4a574] via-[#c89864] to-[#8a7560]"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showButton}
                    onChange={(e) => setFormData({ ...formData, showButton: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Показать кнопку</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Активен</span>
                </label>
              </div>

              {formData.showButton && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Текст кнопки</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                      placeholder="Нажмите здесь"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Действие кнопки (URL)</label>
                    <input
                      type="text"
                      value={formData.buttonAction}
                      onChange={(e) => setFormData({ ...formData, buttonAction: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                      placeholder="/page или https://example.com"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Порядок отображения</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  min="0"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {editingBanner ? 'Обновить' : 'Создать'}
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

export default NewsBannerEditor;

