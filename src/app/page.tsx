// LUMINEX Next.js - Ana Sayfa
// Landing page - Mevcut tasarım %100 korunur

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/components/providers/language-provider';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="landing-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Sağlığınız İçin <span className="highlight">Modern Çözümler</span>
              </h1>
              <p className="hero-subtitle">
                LUMINEX ile randevunuzu kolayca oluşturun, doktorunuzla online görüşün.
                Türkiye\'nin en büyük sağlık platformu.
              </p>
              <div className="hero-actions">
                <Link href="/appointment" className="btn btn-primary btn-lg">
                  Randevu Al
                </Link>
                <Link href="/doctors" className="btn btn-outline btn-lg">
                  Doktorları İncele
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">10.000+</span>
                  <span className="stat-label">Doktor</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Hastane</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1M+</span>
                  <span className="stat-label">Randevu</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4.9</span>
                  <span className="stat-label">⭐ Puan</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <img src="/images/hero-doctor.png" alt="Doktor" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Neden LUMINEX?</h2>
            <p className="section-subtitle">
              Sağlık hizmetlerine erişimi kolaylaştırıyoruz
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3 className="feature-title">Kolay Randevu</h3>
                <p className="feature-description">
                  Saniyeler içinde randevunuzu oluşturun, takip edin ve yönetin.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👨‍⚕️</div>
                <h3 className="feature-title">Uzman Doktorlar</h3>
                <p className="feature-description">
                  Türkiye\'nin en iyi doktorlarına ulaşın, değerlendirmeleri okuyun.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3 className="feature-title">Online Görüşme</h3>
                <p className="feature-description">
                  Evden çıkmadan doktorunuzla görüntülü görüşme yapın.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Güvenli Veri</h3>
                <p className="feature-description">
                  Sağlık verileriniz KVKK uyumlu olarak korunmaktadır.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3 className="feature-title">Reçete & Tahlil</h3>
                <p className="feature-description">
                  Reçetelerinizi ve tahlil sonuçlarınızı tek yerden yönetin.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⏰</div>
                <h3 className="feature-title">7/24 Erişim</h3>
                <p className="feature-description">
                  Her zaman, her yerden sağlık hizmetlerine erişin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section className="departments-section">
          <div className="container">
            <h2 className="section-title">Popüler Bölümler</h2>
            <p className="section-subtitle">
              İhtiyacınız olan uzmanlığı bulun
            </p>
            <div className="departments-grid">
              {[
                { name: 'Kardiyoloji', icon: '❤️', slug: 'kardiyoloji' },
                { name: 'Dahiliye', icon: '🩺', slug: 'dahiliye' },
                { name: 'Çocuk Sağlığı', icon: '👶', slug: 'cocuk-sagligi' },
                { name: 'Kadın Doğum', icon: '👩‍⚕️', slug: 'kadin-dogum' },
                { name: 'Ortopedi', icon: '🦴', slug: 'ortopedi' },
                { name: 'Göz Hastalıkları', icon: '👁️', slug: 'goz' },
                { name: 'Kulak Burun Boğaz', icon: '👂', slug: 'kbb' },
                { name: 'Cildiye', icon: '🧴', slug: 'cildiye' },
                { name: 'Nöroloji', icon: '🧠', slug: 'noroloji' },
                { name: 'Üroloji', icon: '🏥', slug: 'uroloji' },
                { name: 'Diş Hekimliği', icon: '🦷', slug: 'dis' },
                { name: 'Psikiyatri', icon: '🧘', slug: 'psikiyatri' },
              ].map((dept) => (
                <Link
                  key={dept.slug}
                  href={`/departments/${dept.slug}`}
                  className="department-card"
                >
                  <span className="department-icon">{dept.icon}</span>
                  <span className="department-name">{dept.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <div className="container">
            <h2 className="section-title">Nasıl Çalışır?</h2>
            <p className="section-subtitle">
              3 basit adımda randevunuzu oluşturun
            </p>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3 className="step-title">Doktor Seçin</h3>
                <p className="step-description">
                  Bölüm, hastane veya doktor adı arayarak size en uygun doktoru bulun.
                </p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3 className="step-title">Randevu Alın</h3>
                <p className="step-description">
                  Müsait saatlerden size uygun olanı seçin ve randevunuzu oluşturun.
                </p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3 className="step-title">Görüşün</h3>
                <p className="step-description">
                  Randevu saatinde hastaneye gidin veya online görüşme yapın.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <h2 className="cta-title">Hemen Başlayın</h2>
            <p className="cta-subtitle">
              Ücretsiz kayıt olun, binlerce doktora ulaşın
            </p>
            <div className="cta-actions">
              <Link href="/register" className="btn btn-light btn-lg">
                Ücretsiz Kayıt Ol
              </Link>
              <Link href="/doctors" className="btn btn-outline-light btn-lg">
                Doktorları Keşfet
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
