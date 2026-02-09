// LUMINEX Next.js - Messages Page
// Mesajlar sayfası - konuşmalar listesi

import { MessagesList } from '@/components/messages/MessagesList';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function MessagesPage() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Mesajlar</h1>
          <p className="page-subtitle">
            Doktorlarınızla iletişimde kalın, sorularını sorun
          </p>
        </div>

        <MessagesList />
      </main>
      <Footer />
    </>
  );
}
