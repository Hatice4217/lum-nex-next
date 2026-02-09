// LUMINEX - KVKK Consent Component
// KVKK 6698 sayılı kanun kapsamında açık rıza yönetimi

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, FileText, Eye, EyeOff } from 'lucide-react';

interface KvkkConsent {
  marketing: boolean;
  dataSharing: boolean;
  profiling: boolean;
  timestamp?: number;
  version: string;
}

const KVKK_VERSION = '1.0';
const KVKK_KEY = 'luminex-kvkk-consent';

export function KvkkConsent() {
  const [consent, setConsent] = useState<KvkkConsent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Sayfa yüklendiğinde consent'i kontrol et
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KVKK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as KvkkConsent;
        if (parsed.version === KVKK_VERSION) {
          setConsent(parsed);
        } else {
          // Versiyon değişirse tekrar sor
          setIsOpen(true);
        }
      } else {
        // Hiç consent yoksa, kullanıcı kayıt olduktan sonra sor
        // Bu component sadece dashboard'da gösterilecek
        const hasRegistered = sessionStorage.getItem('just-registered');
        if (hasRegistered) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('KVKK consent read error:', error);
    }
  }, []);

  // Tümünü kabul et
  const acceptAll = () => {
    const newConsent: KvkkConsent = {
      marketing: true,
      dataSharing: true,
      profiling: true,
      timestamp: Date.now(),
      version: KVKK_VERSION
    };

    try {
      localStorage.setItem(KVKK_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
      setIsOpen(false);
    } catch (error) {
      console.error('KVKK consent save error:', error);
    }
  };

  // Seçili olanları kabul et
  const acceptSelected = () => {
    const form = document.getElementById('kvkk-consent-form') as HTMLFormElement;
    const formData = new FormData(form);

    const newConsent: KvkkConsent = {
      marketing: formData.get('marketing') === 'on',
      dataSharing: formData.get('dataSharing') === 'on',
      profiling: formData.get('profiling') === 'on',
      timestamp: Date.now(),
      version: KVKK_VERSION
    };

    try {
      localStorage.setItem(KVKK_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
      setIsOpen(false);
    } catch (error) {
      console.error('KVKK consent save error:', error);
    }
  };

  // Reddet
  const decline = () => {
    const newConsent: KvkkConsent = {
      marketing: false,
      dataSharing: false,
      profiling: false,
      timestamp: Date.now(),
      version: KVKK_VERSION
    };

    try {
      localStorage.setItem(KVKK_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
      setIsOpen(false);
    } catch (error) {
      console.error('KVKK consent save error:', error);
    }
  };

  // Modal açık değilse gösterme
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  KVKK Aydınlatma Metni
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              <strong className="font-semibold">Veri Sorumlusu:</strong> LUMINEX Teknoloji A.Ş.
              <br />
              Kişisel verileriniz, 6698 sayılı KVKK kapsamında işlenmektedir. Aşağıdaki konularda açık rızanız gerekmektedir.
            </p>
          </div>

          <form id="kvkk-consent-form">
            {/* Marketing Consents */}
            <div className="space-y-4">
              {/* Marketing */}
              <label className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  name="marketing"
                  defaultChecked={false}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">Pazarlama İletişimi</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      Opsiyonel
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kampanya, promosyon ve özel fırsatlardan haberdar olmak için elektronik ileti almayı kabul ediyorum.
                  </p>
                </div>
              </label>

              {/* Data Sharing */}
              <label className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  name="dataSharing"
                  defaultChecked={false}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">Veri Paylaşımı</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      Opsiyonel
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hizmet kalitesini artırmak için iş ortaklarımızla anonim veri paylaşımını kabul ediyorum.
                  </p>
                </div>
              </label>

              {/* Profiling */}
              <label className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  name="profiling"
                  defaultChecked={false}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">Profilleme</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      Opsiyonel
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kişiselleştirilmiş hizmet sunumu için tercihlerimin analiz edilmesini kabul ediyorum.
                  </p>
                </div>
              </label>
            </div>
          </form>

          {/* Warning */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Önemli:</strong> Burada ret hakkınızı kullanabilir veya daha sonra{' '}
              <Link href="/kvkk" className="underline font-medium">
                KVKK sayfası
              </Link>
              {' '}üzerinden tercihlerinizi değiştirebilirsiniz.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptSelected}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Seçili Olanları Kabul Et
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Tümünü Kabul Et
            </button>
            <button
              onClick={decline}
              className="flex-1 sm:w-auto sm:min-w-[140px] border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Reddet
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Detaylı bilgi için{' '}
            <Link href="/kvkk" className="text-blue-600 dark:text-blue-400 hover:underline">
              KVKK Aydınlatma Metni
            </Link>
            {' '}ve{' '}
            <Link href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Gizlilik Politikası
            </Link>
            {' '}sayfalarını inceleyebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * KVKK consent durumunu kontrol et
 */
export function getKvkkConsent(): KvkkConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(KVKK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as KvkkConsent;
      if (parsed.version === KVKK_VERSION) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('KVKK consent read error:', error);
  }

  return null;
}

/**
 * Marketing izni var mı?
 */
export function hasMarketingConsent(): boolean {
  const consent = getKvkkConsent();
  return consent?.marketing === true;
}

/**
 * Veri paylaşımı izni var mı?
 */
export function hasDataSharingConsent(): boolean {
  const consent = getKvkkConsent();
  return consent?.dataSharing === true;
}

/**
 * Profilleme izni var mı?
 */
export function hasProfilingConsent(): boolean {
  const consent = getKvkkConsent();
  return consent?.profiling === true;
}

/**
 * KVKK consent'ini temizle (Test için)
 */
export function clearKvkkConsent() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KVKK_KEY);
  }
}

/**
 * KVKK modal'ını manuel aç (Dashboard'da kullanılabilir)
 */
export function showKvkkConsent() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('just-registered', 'true');
    window.location.reload();
  }
}
