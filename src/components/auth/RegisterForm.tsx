// LUMINEX Next.js - Register Form Component
// Hasta ve Doktor kayıt formu

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import {
  registerPatientSchema,
  registerDoctorSchema,
  type RegisterPatientInput,
  type RegisterDoctorInput,
} from '@/lib/validations';
import { UserRole } from '@prisma/client';

type RegisterType = 'patient' | 'doctor';

export function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();

  const [registerType, setRegisterType] = useState<RegisterType>('patient');
  const [patientData, setPatientData] = useState<Partial<RegisterPatientInput>>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    tcKimlikNo: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    acceptTerms: false,
    acceptKvkk: false,
  });

  const [doctorData, setDoctorData] = useState<Partial<RegisterDoctorInput>>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    tcKimlikNo: '',
    phone: '',
    licenseNo: '',
    title: undefined,
    hospitalId: undefined,
    departmentId: undefined,
    experience: undefined,
    biography: '',
    consultationFee: undefined,
    acceptTerms: false,
    acceptKvkk: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const currentData = registerType === 'patient' ? patientData : doctorData;
  const setCurrentData = registerType === 'patient' ? setPatientData : setDoctorData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setCurrentData((prev) => ({
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

    try {
      // Validate based on type
      const schema = registerType === 'patient' ? registerPatientSchema : registerDoctorSchema;
      const result = schema.safeParse(currentData);

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

      // Call API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          role: registerType === 'patient' ? UserRole.PATIENT : UserRole.DOCTOR,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || t('errorOccurred'));
        setIsLoading(false);
        return;
      }

      // Success - redirect to login or dashboard
      router.push('/login?registered=true');
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
          <h1 className="auth-title">{t('registerTitle')}</h1>
          <p className="auth-subtitle">{t('registerSubtitle')}</p>
        </div>

        {/* Type Toggle */}
        <div className="register-type-toggle">
          <button
            type="button"
            className={`type-btn ${registerType === 'patient' ? 'active' : ''}`}
            onClick={() => setRegisterType('patient')}
          >
            {t('patientType')}
          </button>
          <button
            type="button"
            className={`type-btn ${registerType === 'doctor' ? 'active' : ''}`}
            onClick={() => setRegisterType('doctor')}
          >
            {t('doctorType')}
          </button>
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
          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                {t('firstNameLabel')} <span className="required">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder={t('firstNamePlaceholder')}
                value={currentData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="given-name"
              />
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                {t('lastNameLabel')} <span className="required">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder={t('lastNamePlaceholder')}
                value={currentData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="family-name"
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>

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
              value={currentData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('passwordLabel')} <span className="required">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={currentData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                {t('confirmPasswordLabel')} <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={currentData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* TC Kimlik No */}
          <div className="form-group">
            <label htmlFor="tcKimlikNo" className="form-label">
              {t('tcKimlikLabel')} <span className="required">*</span>
            </label>
            <input
              id="tcKimlikNo"
              name="tcKimlikNo"
              type="text"
              inputMode="numeric"
              maxLength={11}
              className={`form-input ${errors.tcKimlikNo ? 'error' : ''}`}
              placeholder={t('tcKimlikPlaceholder')}
              value={currentData.tcKimlikNo}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                handleChange({ ...e, target: { ...e.target, name: 'tcKimlikNo', value } });
              }}
              disabled={isLoading}
            />
            {errors.tcKimlikNo && <span className="form-error">{errors.tcKimlikNo}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">{t('phoneLabel')}</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder={t('phonePlaceholder')}
              value={currentData.phone}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="tel"
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* Doctor-specific fields */}
          {registerType === 'doctor' && (
            <>
              <div className="form-group">
                <label htmlFor="licenseNo" className="form-label">
                  {t('licenseNoLabel')} <span className="required">*</span>
                </label>
                <input
                  id="licenseNo"
                  name="licenseNo"
                  type="text"
                  className={`form-input ${errors.licenseNo ? 'error' : ''}`}
                  placeholder="12345"
                  value={doctorData.licenseNo}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.licenseNo && <span className="form-error">{errors.licenseNo}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">{t('titleLabel')}</label>
                  <select
                    id="title"
                    name="title"
                    className={`form-select ${errors.title ? 'error' : ''}`}
                    value={doctorData.title || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Seçiniz</option>
                    <option value="Prof. Dr.">{t('titleProf')}</option>
                    <option value="Doç. Dr.">{t('titleDoc')}</option>
                    <option value="Dr.">{t('titleAssoc')}</option>
                    <option value="Uzm. Dr.">{t('titleSpec')}</option>
                    <option value="Dr. Öğr. Üyesi">{t('titleLect')}</option>
                  </select>
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="experience" className="form-label">{t('experienceLabel')}</label>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    max="60"
                    className={`form-input ${errors.experience ? 'error' : ''}`}
                    placeholder="10"
                    value={doctorData.experience || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.experience && <span className="form-error">{errors.experience}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="biography" className="form-label">{t('biographyLabel')}</label>
                <textarea
                  id="biography"
                  name="biography"
                  className={`form-textarea ${errors.biography ? 'error' : ''}`}
                  placeholder={t('biographyPlaceholder')}
                  value={doctorData.biography}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={3}
                />
                {errors.biography && <span className="form-error">{errors.biography}</span>}
              </div>
            </>
          )}

          {/* Patient-specific fields */}
          {registerType === 'patient' && (
            <>
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">{t('dateOfBirthLabel')}</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                  value={patientData.dateOfBirth}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.dateOfBirth && <span className="form-error">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">{t('genderLabel')}</label>
                <select
                  id="gender"
                  name="gender"
                  className={`form-select ${errors.gender ? 'error' : ''}`}
                  value={patientData.gender || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Seçiniz</option>
                  <option value="MALE">{t('genderMale')}</option>
                  <option value="FEMALE">{t('genderFemale')}</option>
                  <option value="OTHER">{t('genderOther')}</option>
                </select>
                {errors.gender && <span className="form-error">{errors.gender}</span>}
              </div>
            </>
          )}

          {/* Terms & KVKK */}
          <div className="form-group">
            <label className={`checkbox-label ${errors.acceptTerms ? 'error' : ''}`}>
              <input
                name="acceptTerms"
                type="checkbox"
                checked={currentData.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>
                {t('acceptTerms')}{' '}
                <Link href="/terms" target="_blank" className="link">
                  {t('navTerms')}
                </Link>
              </span>
            </label>
            {errors.acceptTerms && <span className="form-error">{errors.acceptTerms}</span>}
          </div>

          <div className="form-group">
            <label className={`checkbox-label ${errors.acceptKvkk ? 'error' : ''}`}>
              <input
                name="acceptKvkk"
                type="checkbox"
                checked={currentData.acceptKvkk}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>
                {t('acceptKvkk')}{' '}
                <Link href="/kvkk" target="_blank" className="link">
                  {t('navKvkk')}
                </Link>
              </span>
            </label>
            {errors.acceptKvkk && <span className="form-error">{errors.acceptKvkk}</span>}
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
              t('registerButton')
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="auth-footer">
          <p>{t('hasAccount')}</p>
          <Link href="/login" className="link-register">
            {t('loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
