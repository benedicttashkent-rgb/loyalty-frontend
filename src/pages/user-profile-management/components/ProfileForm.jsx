import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProfileForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    birthDate: user?.birthDate,
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(formData?.email)) {
      newErrors.email = 'Неверный формат email';
    }

    const phoneRegex = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    if (!phoneRegex?.test(formData?.phone)) {
      newErrors.phone = 'Формат: +7 XXX XXX XX XX';
    }

    if (!formData?.birthDate) {
      newErrors.birthDate = 'Дата рождения обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors?.[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      birthDate: user?.birthDate,
    });
    setErrors({});
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Личная Информация</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit2"
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Полное Имя"
          type="text"
          name="name"
          value={formData?.name}
          onChange={handleChange}
          error={errors?.name}
          disabled={!isEditing}
          required
          placeholder="Введите ваше имя"
        />

        <Input
          label="Email Адрес"
          type="email"
          name="email"
          value={formData?.email}
          onChange={handleChange}
          error={errors?.email}
          disabled={!isEditing}
          required
          placeholder="example@email.com"
        />

        <Input
          label="Номер Телефона"
          type="tel"
          name="phone"
          value={formData?.phone}
          onChange={handleChange}
          error={errors?.phone}
          disabled={!isEditing}
          required
          placeholder="+7 XXX XXX XX XX"
        />

        <Input
          label="Дата Рождения"
          type="date"
          name="birthDate"
          value={formData?.birthDate}
          onChange={handleChange}
          error={errors?.birthDate}
          disabled={!isEditing}
          required
        />

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="default"
              fullWidth
              iconName="Check"
              iconPosition="left"
            >
              Сохранить Изменения
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              iconName="X"
              iconPosition="left"
              onClick={handleCancel}
            >
              Отмена
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;