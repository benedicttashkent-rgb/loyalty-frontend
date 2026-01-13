import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ModalOverlay from '../../components/navigation/ModalOverlay';
import { loyaltyService } from '../../services/loyalty/loyaltyService';
import { formatPhoneForAPI } from '../../utils/iikoLoyaltyHelpers';
import { getApiUrl } from '../../config/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Personal Info
  const [formData, setFormData] = useState({
    phone: '+998 ', // Start with +998 prefix
    otp: '',
    name: '',
    surName: '',
    birthDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Detect Telegram Web App
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  // Debug: Log API URL on component mount
  useEffect(() => {
    console.log('🔍 Signup Page - API Configuration:');
    console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');
    console.log('   Environment:', import.meta.env.MODE);
    console.log('   API Base URL:', getApiUrl(''));
  }, []);

  useEffect(() => {
    // Check if opened from Telegram
    if (window.Telegram?.WebApp) {
      setIsTelegram(true);
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser(user);
        // Pre-fill phone if available
        if (user.phone_number) {
          // Extract digits from Telegram phone (usually +998XXXXXXXXX)
          const digits = user.phone_number.replace(/\D/g, '');
          // Remove 998 prefix if present, keep only 9 digits
          const phoneDigits = digits.startsWith('998') ? digits.slice(3, 12) : digits.slice(0, 9);
          // Format for display
          let formatted = '';
          if (phoneDigits.length <= 2) {
            formatted = phoneDigits;
          } else if (phoneDigits.length <= 5) {
            formatted = `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2)}`;
          } else if (phoneDigits.length <= 7) {
            formatted = `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 5)} ${phoneDigits.slice(5)}`;
          } else {
            formatted = `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 5)} ${phoneDigits.slice(5, 7)} ${phoneDigits.slice(7)}`;
          }
          setFormData(prev => ({
            ...prev,
            phone: '+998 ' + formatted,
          }));
        }
      }
    }
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone: extract only digits and format as +998 XX XXX XX XX
  const formatPhoneDisplay = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 9 digits (after +998)
    const limitedDigits = digits.slice(0, 9);
    
    // Format: +998 XX XXX XX XX
    if (limitedDigits.length === 0) {
      return '+998 ';
    } else if (limitedDigits.length <= 2) {
      return `+998 ${limitedDigits}`;
    } else if (limitedDigits.length <= 5) {
      return `+998 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`;
    } else if (limitedDigits.length <= 7) {
      return `+998 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5)}`;
    } else {
      return `+998 ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5, 7)} ${limitedDigits.slice(7)}`;
    }
  };

  // Get clean phone for API (998XXXXXXXXX)
  const getCleanPhone = (phoneValue) => {
    // Extract only digits
    const digits = phoneValue.replace(/\D/g, '');
    // Should be 998 + 9 digits = 12 digits total
    if (digits.startsWith('998')) {
      return digits.slice(0, 12); // 998 + 9 digits
    } else {
      // If user somehow entered without 998, add it
      return '998' + digits.slice(0, 9);
    }
  };

  const validatePhone = () => {
    const digits = formData.phone.replace(/\D/g, '');
    // Should have 998 + 9 digits = 12 digits total
    if (digits.length !== 12 || !digits.startsWith('998')) {
      setErrors({ phone: 'Введите 9 цифр номера (901234567)' });
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Get clean phone (998XXXXXXXXX)
      const cleanPhone = getCleanPhone(formData.phone);
      
      // Call backend API to send OTP
      const apiUrl = getApiUrl('auth/send-otp');
      
      // Debug logging
      console.log('🔍 Sending OTP request:');
      console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET (using fallback)');
      console.log('   Full API URL:', apiUrl);
      console.log('   Phone:', cleanPhone);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setErrors({ phone: errorData.error || `Ошибка ${response.status}: ${errorText}` });
        } catch {
          setErrors({ phone: `Ошибка ${response.status}: ${errorText || 'Неизвестная ошибка'}` });
        }
        return;
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (data.success) {
        setOtpSent(true);
        setStep(2);
        setCountdown(60); // 60 seconds countdown
      } else {
        setErrors({ phone: data.error || 'Ошибка отправки SMS' });
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      setErrors({ phone: `Ошибка соединения: ${error.message}. Проверьте, что backend доступен.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: 'Введите 6-значный код' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get clean phone (998XXXXXXXXX)
      const cleanPhone = getCleanPhone(formData.phone);
      
      // Build API URL using config
      const apiUrl = getApiUrl('auth/verify-otp');
      
      console.log('🔍 Verifying OTP:');
      console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET (using fallback)');
      console.log('   API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store JWT token for subsequent requests
        localStorage.setItem('authToken', data.token);
        
        // Check if customer already exists (quick check - no iiko API call)
        try {
          // Build API URL using config
          const checkUrl = getApiUrl('customers/check');
          
          console.log('🔍 Checking customer:');
          console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET (using fallback)');
          console.log('   Check URL:', checkUrl);
          
          const customerResponse = await fetch(checkUrl, {
            headers: {
              'Authorization': `Bearer ${data.token}`,
            },
          });

          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            if (customerData.success && customerData.exists && customerData.customer) {
              // ✅ Customer EXISTS - store data and redirect to dashboard immediately (LOGIN)
              localStorage.setItem('customerId', customerData.customer.id);
              localStorage.setItem('customerPhone', customerData.customer.phone || formData.phone);
              localStorage.setItem('customerName', `${customerData.customer.name || ''} ${customerData.customer.surName || ''}`.trim());
              localStorage.setItem('isNewCustomer', 'false');
              
              // Redirect to dashboard - user is logged in (no need to fill registration form)
              navigate('/home-dashboard');
              return;
            }
          } else if (customerResponse.status === 404) {
            // ❌ Customer DOESN'T EXIST - show registration form (step 3)
            setStep(3);
            return;
          }
        } catch (error) {
          console.error('Error checking customer:', error);
          // If error checking customer, assume customer doesn't exist and show registration form
          setStep(3);
          return;
        }
        
        // Fallback: Customer doesn't exist - show registration form
        setStep(3);
      } else {
        setErrors({ otp: data.error || 'Неверный код' });
      }
    } catch (error) {
      setErrors({ otp: 'Ошибка верификации' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.surName?.trim()) newErrors.surName = 'Фамилия обязательна';
    
    // Validate date format DD/MM/YYYY
    if (!formData.birthDate) {
      newErrors.birthDate = 'Дата рождения обязательна';
    } else {
      const digits = formData.birthDate.replace(/\D/g, '');
      if (digits.length !== 8) {
        newErrors.birthDate = 'Введите дату в формате ДД/ММ/ГГГГ';
      } else {
        const day = parseInt(digits.slice(0, 2), 10);
        const month = parseInt(digits.slice(2, 4), 10);
        const year = parseInt(digits.slice(4, 8), 10);
        
        if (day < 1 || day > 31) {
          newErrors.birthDate = 'Неверный день (1-31)';
        } else if (month < 1 || month > 12) {
          newErrors.birthDate = 'Неверный месяц (1-12)';
        } else if (year < 1900 || year > new Date().getFullYear()) {
          newErrors.birthDate = 'Неверный год';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get JWT token from previous step (stored after OTP verification)
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setErrors({ submit: 'Сессия истекла. Пожалуйста, начните заново.' });
        return;
      }

      // Register customer via backend API
      const registerUrl = getApiUrl('customers/register');
      
      console.log('🔍 Registering customer:');
      console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET (using fallback)');
      console.log('   Register URL:', registerUrl);
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: getCleanPhone(formData.phone),
          name: formData.name,
          surName: formData.surName,
          birthDate: formatDateForAPI(formData.birthDate),
          email: telegramUser?.email || null,
        }),
      });

      console.log('🔍 Registration response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Registration failed:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setErrors({ submit: errorData.error || `Ошибка регистрации: ${response.status}` });
        } catch {
          setErrors({ submit: `Ошибка регистрации: ${response.status} - ${errorText || 'Неизвестная ошибка'}` });
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Registration response data:', data);

      if (data.success) {
        // Store customer data
        if (data.customer && data.customer.id) {
          localStorage.setItem('customerId', data.customer.id);
          localStorage.setItem('customerPhone', formData.phone);
          localStorage.setItem('customerName', `${formData.name} ${formData.surName}`);
          localStorage.setItem('isNewCustomer', (data.customer.isNewCustomer !== undefined ? data.customer.isNewCustomer : true).toString());
          
          console.log('✅ Customer data stored, navigating to dashboard...');
          // Navigate to home dashboard
          navigate('/home-dashboard');
        } else {
          console.error('❌ Registration response missing customer data:', data);
          setErrors({ submit: 'Ошибка: данные клиента не получены' });
        }
      } else {
        console.error('❌ Registration failed:', data);
        setErrors({ submit: data.error || 'Ошибка регистрации' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Ошибка соединения' });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date input as DD/MM/YYYY
  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Limit to 8 digits (DDMMYYYY)
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    // Format as DD/MM/YYYY
    let formatted = value;
    if (value.length > 2) {
      formatted = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length > 4) {
      formatted = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
    }
    
    setFormData((prev) => ({
      ...prev,
      birthDate: formatted,
    }));
    
    if (errors.birthDate) {
      setErrors((prev) => ({
        ...prev,
        birthDate: '',
      }));
    }
  };

  // Keep DD/MM/YYYY format for API (iiko expects DD/MM/YYYY)
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    
    // Remove slashes and get digits only
    const digits = dateStr.replace(/\D/g, '');
    if (digits.length !== 8) return dateStr; // Invalid format, return as is
    
    // Ensure DD/MM/YYYY format
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    
    // Return in DD/MM/YYYY format (iiko API expects this)
    return `${day}/${month}/${year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone input is handled separately in its own onChange
    if (name === 'phone') {
      return;
    }
    
    // Date input is handled separately
    if (name === 'birthDate') {
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="UserPlus" size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {step === 3 ? 'Регистрация в программе лояльности' : 'Вход в программу лояльности'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 && 'Введите номер телефона для начала'}
              {step === 2 && 'Введите код из SMS'}
              {step === 3 && 'Заполните личные данные для регистрации'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <Icon name="Check" size={16} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Phone */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Номер телефона
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Fixed +998 prefix */}
                    <div className="flex items-center justify-center px-4 py-2.5 rounded-l-lg border border-r-0 border-border bg-muted text-foreground font-medium select-none">
                      +998
                    </div>
                    {/* Phone number input */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone.replace(/^\+998\s*/, '')} // Show only digits part
                      onChange={(e) => {
                        // Only allow digits
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        // Format for display
                        let formatted = '';
                        if (digits.length <= 2) {
                          formatted = digits;
                        } else if (digits.length <= 5) {
                          formatted = `${digits.slice(0, 2)} ${digits.slice(2)}`;
                        } else if (digits.length <= 7) {
                          formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
                        } else {
                          formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
                        }
                        // Update formData with full phone (+998 + formatted)
                        setFormData(prev => ({
                          ...prev,
                          phone: '+998 ' + formatted,
                        }));
                        // Clear error
                        if (errors.phone) {
                          setErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="90 123 45 67"
                      className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                        errors.phone
                          ? 'border-destructive focus:border-destructive'
                          : 'border-border focus:border-primary'
                      } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`}
                      required
                      disabled={isTelegram && telegramUser?.phone_number}
                      maxLength={13} // XX XXX XX XX = 13 chars (with spaces)
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Введите 9 цифр номера (например: 901234567)
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  fullWidth
                  className="mt-4"
                >
                  {isLoading ? 'Отправка...' : 'Отправить код'}
                </Button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-4">
                <Input
                  label="Код подтверждения"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  error={errors.otp}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <div className="text-center text-sm text-muted-foreground">
                  {countdown > 0 ? (
                    <span>Повторная отправка через {countdown} сек</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-primary hover:underline"
                    >
                      Отправить код повторно
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || formData.otp.length !== 6}
                  fullWidth
                  className="mt-4"
                >
                  {isLoading ? 'Проверка...' : 'Подтвердить'}
                </Button>
              </div>
            )}

            {/* Step 3: Personal Info */}
            {step === 3 && (
              <div className="space-y-4">
                <Input
                  label="Имя"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Введите ваше имя"
                  required
                />
                <Input
                  label="Фамилия"
                  type="text"
                  name="surName"
                  value={formData.surName}
                  onChange={handleChange}
                  error={errors.surName}
                  placeholder="Введите вашу фамилию"
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Дата рождения *
                  </label>
                  <input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleDateChange}
                    placeholder="ДД/ММ/ГГГГ"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.birthDate
                        ? 'border-destructive focus:border-destructive'
                        : 'border-border focus:border-primary'
                    } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`}
                    required
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-destructive">{errors.birthDate}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Формат: ДД/ММ/ГГГГ (например: 09/12/2006)
                  </p>
                </div>
                {errors.submit && (
                  <div className="text-sm text-destructive text-center">
                    {errors.submit}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  className="mt-4"
                >
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

