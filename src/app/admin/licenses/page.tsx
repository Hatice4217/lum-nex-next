// LUMINEX - Admin Licenses Management Page
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, Key, Check, X, Copy } from 'lucide-react';

interface License {
  id: string;
  key: string;
  domain: string;
  isActive: boolean;
  expiresAt: Date;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseType: string;
  maxUsers?: number;
  maxDoctors?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/admin/licenses');
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses);
      }
    } catch (error) {
      console.error('Licenses fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLicense) return;

    try {
      const res = await fetch(`/api/admin/licenses/${selectedLicense.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setLicenses(licenses.filter(l => l.id !== selectedLicense.id));
        setShowDeleteModal(false);
        setSelectedLicense(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateNewLicense = async () => {
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'new-' + Date.now() + '.com',
          licenseType: 'STANDARD',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      if (res.ok) {
        fetchLicenses();
      }
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const toggleLicenseStatus = async (license: License) => {
    try {
      const res = await fetch(`/api/admin/licenses/${license.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !license.isActive })
      });

      if (res.ok) {
        setLicenses(licenses.map(l =>
          l.id === license.id ? { ...l, isActive: !l.isActive } : l
        ));
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const filteredLicenses = licenses.filter(license =>
    license.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const isExpiringSoon = (expiresAt: Date) => {
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lisans Yönetimi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Müşteri lisanslarını görüntüleyin ve yönetin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateNewLicense}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Key className="w-5 h-5" />
              Yeni Lisans Oluştur
            </button>
            <Link
              href="/admin/licenses/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Manuel Ekle
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Lisans anahtarı, domain veya şirket ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Lisans</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{licenses.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{licenses.filter(l => l.isActive).length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Süresi Dolan</p>
            <p className="text-2xl font-bold text-red-600">{licenses.filter(l => isExpired(l.expiresAt)).length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Yakında Dolacak</p>
            <p className="text-2xl font-bold text-orange-600">{licenses.filter(l => isExpiringSoon(l.expiresAt)).length}</p>
          </div>
        </div>

        {/* Licenses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {filteredLicenses.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Lisans bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lisans Anahtarı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Şirket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Son Kullanma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLicenses.map((license) => {
                    const expired = isExpired(license.expiresAt);
                    const expiringSoon = isExpiringSoon(license.expiresAt);

                    return (
                      <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                              {license.key.slice(0, 8)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(license.key)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Kopyala"
                            >
                              {copiedKey === license.key ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {license.companyName || '-'}
                            </p>
                            {license.contactName && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{license.contactName}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{license.domain}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            license.licenseType === 'ENTERPRISE'
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              : license.licenseType === 'PROFESSIONAL'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {license.licenseType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className={`${expired ? 'text-red-600 font-medium' : expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-900 dark:text-white'}`}>
                              {new Date(license.expiresAt).toLocaleDateString('tr-TR')}
                            </p>
                            {expired && (
                              <span className="text-xs text-red-500">Süresi doldu</span>
                            )}
                            {expiringSoon && !expired && (
                              <span className="text-xs text-orange-500">Yakında doluyor</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleLicenseStatus(license)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                              license.isActive
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                            }`}
                          >
                            {license.isActive ? (
                              <>
                                <Check className="w-3 h-3" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                Pasif
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/licenses/${license.id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedLicense(license);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && selectedLicense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lisansı Sil</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <strong>{selectedLicense.companyName || selectedLicense.domain}</strong> lisansını silmek
                istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLicense(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
