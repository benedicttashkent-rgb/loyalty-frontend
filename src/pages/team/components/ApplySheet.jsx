import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import { submitVacancyApplication } from '../../../services/vacancies/vacanciesService';

const emptyForm = {
  name: '',
  age: '',
  hobbies: '',
  position: '',
  maritalStatus: '',
  instagram: '',
  telegram: '',
  phone: '',
};

const fields = [
  { key: 'name', label: 'Как вас зовут?', required: true, autoComplete: 'name' },
  { key: 'phone', label: 'Номер телефона', required: true, type: 'tel', placeholder: '+998 90 123 45 67', autoComplete: 'tel' },
  { key: 'telegram', label: 'Ник в Telegram', required: true, placeholder: '@username' },
  { key: 'position', label: 'Кем хотите работать?' },
  { key: 'age', label: 'Возраст', type: 'number', inputMode: 'numeric' },
  { key: 'maritalStatus', label: 'Семейное положение' },
  { key: 'instagram', label: 'Instagram', placeholder: '@username' },
  { key: 'hobbies', label: 'Чем увлекаетесь?', multiline: true },
];

const inputClass =
  'w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors';

const ApplySheet = ({ isOpen, onClose, position }) => {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  // Start fresh each time the sheet opens, prefilled with the chosen vacancy
  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, position: position || '' });
      setStatus('idle');
    }
  }, [isOpen, position]);

  const handleClose = () => {
    if (status !== 'sending') onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitVacancyApplication(form);
      setStatus('sent');
    } catch (err) {
      console.error('Vacancy application failed:', err);
      setStatus('error');
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-2xl text-foreground leading-tight">
              {status === 'sent' ? 'Анкета отправлена' : 'Анкета'}
            </h2>
            {status !== 'sent' && (
              <p className="text-sm text-muted-foreground mt-1">
                {position ? `Вакансия: ${position}` : 'Расскажите о себе — мы напишем в Telegram'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
            aria-label="Закрыть"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="pb-2">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mb-4">
              <Icon name="Check" size={28} className="text-success" />
            </div>
            <p className="text-foreground leading-relaxed mb-6">
              Спасибо! Мы прочитаем анкету и свяжемся с вами в Telegram.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
            >
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, required, multiline, ...inputProps }) => (
              <label key={key} className="block">
                <span className="block text-sm font-medium text-foreground mb-1.5">
                  {label}
                  {required && <span className="text-primary"> *</span>}
                </span>
                {multiline ? (
                  <textarea
                    rows={2}
                    className={`${inputClass} resize-none`}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={inputClass}
                    required={required}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    {...inputProps}
                  />
                )}
              </label>
            ))}

            {status === 'error' && (
              <p className="text-sm text-error">
                Не удалось отправить анкету. Проверьте интернет и попробуйте ещё раз.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {status === 'sending' ? 'Отправляем…' : 'Отправить анкету'}
            </button>
          </form>
        )}
      </div>
    </ModalOverlay>
  );
};

export default ApplySheet;
