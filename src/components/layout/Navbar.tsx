// LUMINEX Next.js - Navbar Component
// Ana navigasyon barı - Mevcut tasarım korunur

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { useSession } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nav links
  const navLinks = [
    { href: '/', label: t('navHome') },
    { href: '/doctors', label: t('navDoctors') },
    { href: '/hospitals', label: t('navHospitals') },
    { href: '/departments', label: t('navDepartments') },
  ];

  const authLinks = session
    ? [
        { href: '/dashboard', label: t('navDashboard') },
        { href: '/messages', label: t('navMessages') },
        { href: '/notifications', label: t('navNotifications') },
      ]
    : [
        { href: '/login', label: t('navLogin') },
        { href: '/register', label: t('navRegister') },
      ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">LUMINEX</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions desktop-actions">
          {/* Language Switcher */}
          <button
            className="lang-switcher"
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            aria-label="Switch language"
          >
            {language === 'tr' ? 'EN' : 'TR'}
          </button>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Auth Links */}
          <div className="auth-links">
            {session ? (
              <>
                <Link href="/dashboard" className="btn btn-primary">
                  {t('navDashboard')}
                </Link>
                <Link href="/profile" className="user-avatar">
                  <img
                    src={session.user.avatar || '/images/default-avatar.png'}
                    alt={session.user.firstName}
                  />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline">
                  {t('navLogin')}
                </Link>
                <Link href="/register" className="btn btn-primary">
                  {t('navRegister')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mobile-divider"></div>

          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mobile-actions">
            <button
              className="mobile-lang-btn"
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            >
              {language === 'tr' ? '🇺🇸 English' : '🇹🇷 Türkçe'}
            </button>
            <button
              className="mobile-theme-btn"
              onClick={toggleTheme}
            >
              {theme === 'light' ? '🌙 Karanlık Mod' : '☀️ Aydınlık Mod'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
