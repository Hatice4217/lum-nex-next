'use client';

// LUMINEX Next.js - Register Page
// Kayıt sayfası

import { RegisterForm } from '@/components/auth/RegisterForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-page-container">
          {/* Left Side - Image/Info */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h1 className="auth-info-title">LUMINEX\'e Katılın</h1>
              <p className="auth-info-description">
                Ücretsiz kayıt olun, binlerce doktora ulaşın ve randevunuzu kolayca oluşturun.
              </p>
              <div className="auth-info-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Ücretsiz kayıt</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Hızlı randevu</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Online görüşme</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Dijital reçete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="auth-form-wrapper">
            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
