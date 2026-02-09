// LUMINEX Next.js - Reset Password Form Component
// Şifre sıfırlama onayı formu

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { resetPasswordSchema } from '@/lib/validations';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = resetPasswordSchema.safeParse({
      token: token || '',
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        formattedErrors[path] = error.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || t('errorOccurred'));
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login?password-reset=true');
      }, 3000);
    } catch (error) {
      setServerError(t('errorOccurred'));
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-success">
            <div className="success-icon">🔐</div>
            <h2 className="success-title">Şifre Sıfırlandı!</h2>
            <p className="success-message">
              Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.
            </p>
            <p className="success-redirect">Yönlendiriliyorsunuz...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Yeni Şifre Oluştur</h1>
          <p className="auth-subtitle">
            Güvenli bir şifre belirleyin
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        {!token && (
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            <span>Geçersiz veya süresi dolmuş bağlantı. Lütfen şifre sıfırlama isteği yeniden yapın.</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Yeni Şifre <span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="En az 8 karakter"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Şifre Tekrar <span className="required">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          {/* Password Requirements */}
          <div className="password-requirements">
            <p className="requirements-title">Şifre şunları:</p>
            <ul className="requirements-list">
              <li className={formData.password.length >= 8 ? 'met' : ''}>
                En az 8 karakter
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                En az 1 büyük harf
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                En az 1 küçük harf
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
                En az 1 rakam
              </li>
              <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'met' : ''}>
                En az 1 özel karakter (!@#$%^&*)
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading || !token}
          >
            {isLoading ? 'İşleniyor...' : 'Şifreyi Sıfırla'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="auth-footer">
          <Link href="/login" className="link-back">
            ← Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
