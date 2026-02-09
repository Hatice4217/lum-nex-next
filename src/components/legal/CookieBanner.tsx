// LUMINEX - Cookie Banner Component
// localStorage ile consent yönetimi

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface CookieConsent {
  accepted: boolean;
  timestamp?: number;
  version: string;
}

const CONSENT_VERSION = '1.0';
const CONSENT_KEY = 'luminex-cookie-consent';

export function CookieBanner() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Sayfa yüklendiğinde consent'i kontrol et
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookieConsent;
        // Versiyon kontrolü - versiyon değişirse tekrar sor
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
        } else {
          setIsOpen(true);
        }
      } else {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Cookie consent read error:', error);
      setIsOpen(true);
    }
  }, []);

  // Kabul et
  const acceptAll = () => {
    const newConsent: CookieConsent = {
      accepted: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
      setIsOpen(false);
    } catch (error) {
      console.error('Cookie consent save error:', error);
    }
  };

  // Sadece gerekli çerezleri kabul et
  const acceptNecessary = () => {
    const newConsent: CookieConsent = {
      accepted: false, // Sadece gerekli
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
      setIsOpen(false);
    } catch (error) {
      console.error('Cookie consent save error:', error);
    }
  };

  // Reddet ve kapat
  const decline = () => {
    const newConsent: CookieConsent = {
      accepted: false,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
      setIsOpen(false);
    } catch (error) {
      console.error('Cookie consent save error:', error);
    }
  };

  // Banner açık değilse gösterme
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Çerez Kullanımı
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            LUMINEX olarak, size daha iyi hizmet sunmak ve deneyiminizi iyileştirmek için çerezleri kullanıyoruz.
            Çerezler, kişisel verilerinizi işlemeksizin web sitemizin çalışmasına yardımcı olur.
            Detaylı bilgi için{' '}
            <Link href="/cookie-policy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Çerez Politikası
            </Link>
            {' '}sayfamızı ziyaret edebilirsiniz.
          </p>

          {/* Cookie Types Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white text-sm">Gerekli Çerezler</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sitenin çalışması için zorunlu olan çerezler. Devam ederek bu çerezleri kabul etmiş sayılırsınız.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white text-sm">Analitik Çerezler</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Kullanım deneyimini iyileştirmek için anonim veri toplar.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptAll}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Tüm Çerezleri Kabul Et
            </button>
            <button
              onClick={acceptNecessary}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Sadece Gerekli Çerezler
            </button>
            <Link
              href="/cookie-policy"
              className="sm:w-auto sm:min-w-[140px] flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Daha Fazla Bilgi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cookie consent durumunu kontrol et
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CookieConsent;
      if (parsed.version === CONSENT_VERSION) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Cookie consent read error:', error);
  }

  return null;
}

/**
 * Analytics izni var mı?
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent();
  return consent?.accepted === true;
}

/**
 * Consent'i temizle (Test için)
 */
export function clearCookieConsent() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CONSENT_KEY);
  }
}
