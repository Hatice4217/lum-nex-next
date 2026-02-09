// LUMINEX Next.js - Reset Password Page
// Şifre sıfırlama sayfası

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-page-container">
          {/* Left Side - Image/Info */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h1 className="auth-info-title">Yeni Şifre Belirleyin</h1>
              <p className="auth-info-description">
                Güvenli ve hatırlaması kolay bir şifre oluşturun.
                Hesabınızın güvenliği için düzenli olarak şifrenizi
                değiştirmenizi öneririz.
              </p>
              <div className="auth-info-tips">
                <div className="tip-item">
                  <span className="tip-icon">🔒</span>
                  <span>En az 8 karakter kullanın</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔑</span>
                  <span>Büyük, küçük harf ve rakam ekleyin</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🛡️</span>
                  <span>Özel karakterler kullanın (!@#$%^&*)</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">⚠️</span>
                  <span>Kolay tahmin edilebilir şifreler kullanmayın</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-wrapper">
            <ResetPasswordForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
