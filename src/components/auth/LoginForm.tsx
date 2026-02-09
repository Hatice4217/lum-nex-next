// LUMINEX Next.js - Login Form Component
// Kullanıcı giriş formu - Mevcut tasarım korunur

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { loginSchema, type LoginInput } from '@/lib/validations';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
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
    setIsLoading(true);

    // Validate with Zod
    const result = loginSchema.safeParse(formData);

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
      // Sign in with NextAuth
      const signInResult = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setServerError(signInResult.error);
        setIsLoading(false);
        return;
      }

      if (!signInResult?.ok) {
        setServerError(t('errorOccurred'));
        setIsLoading(false);
        return;
      }

      // Redirect to callback URL or dashboard
      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || '/dashboard');
      router.refresh();
    } catch (error) {
      setServerError(t('errorOccurred'));
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">{t('loginTitle')}</h1>
          <p className="auth-subtitle">{t('loginSubtitle')}</p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

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
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('passwordLabel')} <span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-row">
            <label className="checkbox-label">
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>{t('rememberMe')}</span>
            </label>
            <Link href="/forgot-password" className="link-forgot">
              {t('forgotPassword')}
            </Link>
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
              t('loginButton')
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="auth-footer">
          <p>{t('noAccount')}</p>
          <Link href="/register" className="link-register">
            {t('registerLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
