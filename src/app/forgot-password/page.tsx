// LUMINEX Next.js - Forgot Password Page
// Şifremi unuttum sayfası

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-page-container">
          {/* Left Side - Image/Info */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h1 className="auth-info-title">Şifrenizi Mi Unuttunuz?</h1>
              <p className="auth-info-description">
                Endişelenmeyin! E-posta adresinizi girin, size şifre sıfırlama
                bağlantısı gönderelim.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-wrapper">
            <ForgotPasswordForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
