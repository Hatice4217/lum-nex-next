// LUMINEX - SendGrid Email Service
// Free Tier: 100 emails/day

import { emailTemplates } from './templates';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface TemplateEmailOptions {
  to: string | string[];
  templateName: keyof typeof emailTemplates;
  data?: Record<string, any>;
}

// ============================================
// CONFIGURATION
// ============================================

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@luminex.com.tr';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'LUMINEX';

// ============================================
// SERVICE CLASS
// ============================================

export class SendGridService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = SENDGRID_API_KEY;
    this.fromEmail = SENDGRID_FROM;
    this.fromName = SENDGRID_FROM_NAME;
    this.isEnabled = !!this.apiKey && this.apiKey !== 'your-sendgrid-key';

    if (!this.isEnabled) {
      console.warn('SendGrid is not configured. Emails will be logged to console.');
    }
  }

  /**
   * Tek bir e-posta gönder
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, html, text, from } = options;

    const emailData = {
      from: from || `${this.fromName} <${this.fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      content: [
        ...(html ? [{ type: 'text/html', value: html }] : []),
        ...(text ? [{ type: 'text/plain', value: text }] : [])
      ]
    };

    // Demo mode - console log
    if (!this.isEnabled) {
      console.log('📧 [EMAIL] SendGrid not configured. Email would be sent:', JSON.stringify(emailData, null, 2));
      return { success: true, messageId: `demo-${Date.now()}` };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        const messageId = response.headers.get('X-Message-ID');
        return { success: true, messageId: messageId || undefined };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('SendGrid error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Template kullanarak e-posta gönder
   */
  async sendTemplateEmail(options: TemplateEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, templateName, data = {} } = options;

    const template = emailTemplates[templateName];
    if (!template) {
      return { success: false, error: `Template not found: ${templateName}` };
    }

    // Template'i render et
    const html = template.html(data);
    const text = template.text(data);

    return this.sendEmail({
      to,
      subject: template.subject(data),
      html,
      text
    });
  }

  /**
   * Hoş geldin e-postası
   */
  async sendWelcomeEmail(to: string, data: { name: string; email?: string }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'welcome',
      data
    });
  }

  /**
   * Email doğrulama
   */
  async sendVerificationEmail(to: string, data: { name: string; verificationUrl: string }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'emailVerification',
      data
    });
  }

  /**
   * Şifre sıfırlama
   */
  async sendPasswordResetEmail(to: string, data: { name: string; resetUrl: string }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'passwordReset',
      data
    });
  }

  /**
   * Randevu onayı
   */
  async sendAppointmentConfirmationEmail(to: string, data: {
    name: string;
    doctorName: string;
    hospitalName: string;
    date: string;
    time: string;
    appointmentNo: string;
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'appointmentConfirmation',
      data
    });
  }

  /**
   * Randevu hatırlatma
   */
  async sendAppointmentReminderEmail(to: string, data: {
    name: string;
    doctorName: string;
    hospitalName: string;
    date: string;
    time: string;
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'appointmentReminder',
      data
    });
  }

  /**
   * Randevu iptal
   */
  async sendAppointmentCancellationEmail(to: string, data: {
    name: string;
    doctorName: string;
    date: string;
    time: string;
    reason?: string;
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'appointmentCancellation',
      data
    });
  }

  /**
   * Reçete hazır
   */
  async sendPrescriptionReadyEmail(to: string, data: {
    patientName: string;
    doctorName: string;
    prescriptionNo: string;
    diagnosis: string;
    viewUrl: string;
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'prescriptionReady',
      data
    });
  }

  /**
   * Test sonucu hazır
   */
  async sendTestResultReadyEmail(to: string, data: {
    patientName: string;
    testName: string;
    testDate: string;
    viewUrl: string;
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'testResultReady',
      data
    });
  }

  /**
   * Abonelik yenileme hatırlatma
   */
  async sendSubscriptionRenewalEmail(to: string, data: {
    name: string;
    planName: string;
    renewalDate: string;
    amount: string;
    renewalUrl: string;
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: 'subscriptionRenewal',
      data
    });
  }

  /**
   * Toplu e-posta gönder (newsletter vb.)
   */
  async sendBulkEmail(options: EmailEmailOptions & { batchSize?: number }): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const { to, subject, html, text, from, batchSize = 50 } = options;
    const recipients = Array.isArray(to) ? to : [to];

    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Batch'leri işle
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      for (const recipient of batch) {
        const result = await this.sendEmail({
          to: recipient,
          subject,
          html,
          text,
          from
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`${recipient}: ${result.error || 'Unknown error'}`);
        }

        // Rate limiting - 100ms gecikme
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (results.failed > 0) {
      results.success = false;
    }

    return results;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const emailService = new SendGridService();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Quick send - tek bir fonksiyonla e-posta gönder
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return emailService.sendEmail(options);
}

/**
 * Template send - template ile e-posta gönder
 */
export async function sendTemplateEmail(options: TemplateEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return emailService.sendTemplateEmail(options);
}
