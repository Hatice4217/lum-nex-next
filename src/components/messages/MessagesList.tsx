// LUMINEX Next.js - Messages Page Component
// Mesajlar sayfası - konuşmalar listesi

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  id: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    role: string;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount: number;
}

export function MessagesList() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!session?.user) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [session]);

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session?.user) {
    return (
      <div className="messages-page">
        <div className="auth-required">
          <div className="auth-required-icon">🔒</div>
          <h2>Mesajlar için giriş yapmalısınız</h2>
          <p>Mesajlaşma özelliği için lütfen giriş yapın veya kayıt olun.</p>
          <div className="auth-actions">
            <Link href="/login" className="btn btn-primary">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn btn-outline">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {/* Header */}
      <div className="messages-header">
        <h1 className="messages-title">Mesajlar</h1>
        <Link
          href="/doctors"
          className="btn btn-primary"
        >
          + Yeni Mesaj
        </Link>
      </div>

      {/* Search */}
      <div className="messages-search">
        <input
          type="text"
          className="search-input"
          placeholder="İsim ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conversations List */}
      {isLoading ? (
        <div className="messages-loading">
          <div className="skeleton-message"></div>
          <div className="skeleton-message"></div>
          <div className="skeleton-message"></div>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Mesaj Bulunmuyor</h3>
          <p>
            {searchQuery
              ? 'Arama kriterinize uygun mesaj bulunamadı.'
              : 'Henüz mesajınız yok. Doktorunuzla iletişime geçin.'}
          </p>
          {!searchQuery && (
            <Link href="/doctors" className="btn btn-primary">
              Doktorları Keşfet
            </Link>
          )}
        </div>
      ) : (
        <div className="conversations-list">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.participant.id}`}
              className="conversation-card"
            >
              <div className="conversation-avatar">
                {conversation.participant.avatar ? (
                  <img
                    src={conversation.participant.avatar}
                    alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
                  />
                ) : (
                  <span className="avatar-placeholder">
                    {conversation.participant.firstName[0]}
                    {conversation.participant.lastName[0]}
                  </span>
                )}
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">{conversation.unreadCount}</span>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <h3 className="conversation-name">
                    {conversation.participant.role === 'DOCTOR'
                      ? 'Dr. '
                      : ''}
                    {conversation.participant.firstName}{' '}
                    {conversation.participant.lastName}
                  </h3>
                  {conversation.participant.role === 'DOCTOR' && (
                    <span className="conversation-badge">Doktor</span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <p className="conversation-preview">
                    {conversation.lastMessage.content}
                  </p>
                )}

                {conversation.lastMessage && (
                  <span className="conversation-time">
                    {getMessageTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString('tr-TR');
}
