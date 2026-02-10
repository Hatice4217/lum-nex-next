'use client';

// LUMINEX Next.js - Login Page
// Giriş sayfası

import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-page-container">
          {/* Left Side - Image/Info */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h1 className="auth-info-title">Tekrar Hoş Geldiniz</h1>
              <p className="auth-info-description">
                LUMINEX ile randevunuzu oluşturun, doktorunuzla görüşün.
                Sağlığınız için en iyi çözüm.
              </p>
              <div className="auth-info-features">
                <div className="feature-item">
                  <span className="feature-icon">📅</span>
                  <span>Kolay Randevu</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">👨‍⚕️</span>
                  <span>Uzman Doktorlar</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💬</span>
                  <span>Online Görüşme</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="auth-form-wrapper">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
