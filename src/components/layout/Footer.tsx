// LUMINEX Next.js - Footer Component
// Alt bilgi barı - Mevcut tasarım korunur

'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';

export function Footer() {
  const { t, language, setLanguage } = useLanguage();

  const footerLinks = {
    company: [
      { href: '/about', label: t('footerAbout') },
      { href: '/contact', label: t('footerContact') },
    ],
    legal: [
      { href: '/privacy', label: t('footerPrivacy') },
      { href: '/terms', label: t('footerTerms') },
      { href: '/kvkk', label: t('footerKvkk') },
      { href: '/cookies', label: t('footerCookies') },
    ],
    services: [
      { href: '/doctors', label: t('navDoctors') },
      { href: '/hospitals', label: t('navHospitals') },
      { href: '/appointment', label: t('navAppointment') },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Logo & Description */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <span className="logo-icon">✨</span>
              <span className="logo-text">LUMINEX</span>
            </Link>
            <p className="footer-description">
              {t('appName')} - Sağlık randevu sistemi ile doktorunuza kolayca ulaşın.
            </p>
            <div className="footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="social-link"
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="footer-links">
            <h3 className="footer-links-title">Şirket</h3>
            <ul className="footer-links-list">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-links">
            <h3 className="footer-links-title">Yasal</h3>
            <ul className="footer-links-list">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-links">
            <h3 className="footer-links-title">Hizmetler</h3>
            <ul className="footer-links-list">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h3 className="footer-links-title">İletişim</h3>
            <ul className="contact-list">
              <li className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:info@luminex.com">info@luminex.com</a>
              </li>
              <li className="contact-item">
                <span className="contact-icon">📞</span>
                <a href="tel:+908501234567">+90 850 123 45 67</a>
              </li>
              <li className="contact-item">
                <span className="contact-icon">📍</span>
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="copyright">
              © {new Date().getFullYear()} {t('appName')}. {t('footerCopyright')}.
            </p>
          </div>

          <div className="footer-bottom-right">
            {/* Language Switcher */}
            <div className="footer-lang">
              <button
                className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
                onClick={() => setLanguage('tr')}
              >
                🇹🇷 TR
              </button>
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
