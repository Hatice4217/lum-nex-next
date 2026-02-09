// LUMINEX Next.js - Forgot Password Form Component
// Şifre sıfırlama formu

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { forgotPasswordSchema } from '@/lib/validations';

export function ForgotPasswordForm() {
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate with Zod
    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        formattedErrors[path] = error.message;
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Call API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.data.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.error || t('errorOccurred') });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      setErrors({ email: t('errorOccurred') });
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-success">
            <div className="success-icon">✉️</div>
            <h2 className="success-title">E-posta Gönderildi</h2>
            <p className="success-message">
              Şifre sıfırlama bağlantısı {email} adresine gönderildi.
              Lütfen e-postanızı kontrol edin.
            </p>
            <div className="success-actions">
              <Link href="/login" className="btn btn-primary">
                Giriş Sayfasına Dön
              </Link>
            </div>
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
          <h1 className="auth-title">{t('forgotPassword')}</h1>
          <p className="auth-subtitle">
            E-posta adresinizi girin, şifre sıfırlama bağlantısını gönderelim.
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('emailLabel')} <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({});
                }
              }}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {t('loading')}
              </>
            ) : (
              'Bağlantı Gönder'
            )}
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
