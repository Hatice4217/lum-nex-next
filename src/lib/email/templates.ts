// LUMINEX - Email Templates
// Türkçe ve İngilizce email template'leri

// ============================================
// TEMPLATE FUNCTIONS
// ============================================

export const emailTemplates = {
  // ============================================
  // WELCOME EMAIL
  // ============================================
  welcome: {
    subject: (data: { name: string }) => `LUMINEX'e Hoş Geldiniz, ${data.name}!`,
    text: (data: { name: string }) => `
Merhaba ${data.name},

LUMINEX ailesine hoş geldiniz!

Sağlık yönetiminizi kolaylaştırmak için buradayız. Uygulamamız ile:

• Randevu oluşturabilirsiniz
• Doktorlarınızla iletişim kurabilirsiniz
• Test sonuçlarınızı görüntüleyebilirsiniz
• Reçetelerinizi takip edebilirsiniz

Herhangi bir sorunuz için bize ulaşın.

Saygılarımızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LUMINEX'e Hoş Geldiniz</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LUMINEX</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hoş Geldiniz, ${data.name}! 👋</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Sağlık yönetiminizi kolaylaştırmak için buradayız. Uygulamamız ile:
              </p>
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #666666; line-height: 1.8;">
                <li>✅ Randevu oluşturabilirsiniz</li>
                <li>✅ Doktorlarınızla iletişim kurabilirsiniz</li>
                <li>✅ Test sonuçlarınızı görüntüleyebilirsiniz</li>
                <li>✅ Reçetelerinizi takip edebilirsiniz</li>
              </ul>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="https://luminex.com.tr/dashboard" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Dashboard'a Git</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2026 LUMINEX. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // EMAIL VERIFICATION
  // ============================================
  emailVerification: {
    subject: () => 'E-posta Adresinizi Doğrulayın',
    text: (data: { name: string; verificationUrl: string }) => `
Merhaba ${data.name},

E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:

${data.verificationUrl}

Bu bağlantı 24 saat geçerlidir.

Eğer bu talebi siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

Saygılarımızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string; verificationUrl: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-posta Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LUMINEX</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">E-posta Doğrulama</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.name}, e-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="${data.verificationUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">E-postayı Doğrula</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0; color: #999999; font-size: 12px;">
                Bu bağlantı 24 saat geçerlidir.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // PASSWORD RESET
  // ============================================
  passwordReset: {
    subject: () => 'Şifre Sıfırlama Talebi',
    text: (data: { name: string; resetUrl: string }) => `
Merhaba ${data.name},

Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:

${data.resetUrl}

Bu bağlantı 1 saat geçerlidir.

Eğer bu talebi siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string; resetUrl: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LUMINEX</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Şifre Sıfırlama</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.name}, şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="${data.resetUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Şifremi Sıfırla</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0; color: #999999; font-size: 12px;">
                Bu bağlantı 1 saat geçerlidir. Bu talebi siz oluşturmadıysanız, görmezden gelebilirsiniz.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // APPOINTMENT CONFIRMATION
  // ============================================
  appointmentConfirmation: {
    subject: (data: { appointmentNo: string }) => `Randevu Onayı #${data.appointmentNo}`,
    text: (data: { name: string; doctorName: string; hospitalName: string; date: string; time: string; appointmentNo: string }) => `
Merhaba ${data.name},

Randevunuz başarıyla oluşturuldu:

Randevu No: ${data.appointmentNo}
Doktor: ${data.doctorName}
Hastane: ${data.hospitalName}
Tarih: ${data.date}
Saat: ${data.time}

Randevu detaylarınızı dashboard&apos;ınızda görüntüleyebilirsiniz.

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string; doctorName: string; hospitalName: string; date: string; time: string; appointmentNo: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Randevu Onayı</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LUMINEX</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">✅ Randevu Onaylandı</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.name}, randevunuz başarıyla oluşturuldu:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <tr><td style="padding: 12px;"><strong>Randevu No:</strong></td><td style="padding: 12px;">${data.appointmentNo}</td></tr>
                <tr><td style="padding: 12px;"><strong>Doktor:</strong></td><td style="padding: 12px;">${data.doctorName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Hastane:</strong></td><td style="padding: 12px;">${data.hospitalName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Tarih:</strong></td><td style="padding: 12px;">${data.date}</td></tr>
                <tr><td style="padding: 12px;"><strong>Saat:</strong></td><td style="padding: 12px;">${data.time}</td></tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="https://luminex.com.tr/dashboard" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Randevularımı Görüntüle</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // APPOINTMENT REMINDER
  // ============================================
  appointmentReminder: {
    subject: () => 'Randevu Hatırlatması',
    text: (data: { name: string; doctorName: string; hospitalName: string; date: string; time: string }) => `
Merhaba ${data.name},

Yarınki randevunuzu hatırlatmak istedik:

Doktor: ${data.doctorName}
Hastane: ${data.hospitalName}
Tarih: ${data.date}
Saat: ${data.time}

Lütfen zamanında geliniz.

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string; doctorName: string; hospitalName: string; date: string; time: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Randevu Hatırlatması</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🔔 Hatırlatma</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Yarınki Randevunuz</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.name}, yarınki randevunuz:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <tr><td style="padding: 12px;"><strong>Doktor:</strong></td><td style="padding: 12px;">${data.doctorName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Hastane:</strong></td><td style="padding: 12px;">${data.hospitalName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Tarih:</strong></td><td style="padding: 12px;">${data.date}</td></tr>
                <tr><td style="padding: 12px;"><strong>Saat:</strong></td><td style="padding: 12px;">${data.time}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // APPOINTMENT CANCELLATION
  // ============================================
  appointmentCancellation: {
    subject: () => 'Randevu İptal Edildi',
    text: (data: { name: string; doctorName: string; date: string; time: string; reason?: string }) => `
Merhaba ${data.name},

Randevunuz iptal edildi:

Doktor: ${data.doctorName}
Tarih: ${data.date}
Saat: ${data.time}
${data.reason ? `Sebep: ${data.reason}` : ''}

Yeni bir randevu oluşturmak için dashboard&apos;ınızı kullanabilirsiniz.

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string; doctorName: string; date: string; time: string; reason?: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Randevu İptal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">❌ İptal</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Randevu İptal Edildi</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.name}, randevunuz iptal edildi:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <tr><td style="padding: 12px;"><strong>Doktor:</strong></td><td style="padding: 12px;">${data.doctorName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Tarih:</strong></td><td style="padding: 12px;">${data.date}</td></tr>
                <tr><td style="padding: 12px;"><strong>Saat:</strong></td><td style="padding: 12px;">${data.time}</td></tr>
                ${data.reason ? `<tr><td style="padding: 12px;"><strong>Sebep:</strong></td><td style="padding: 12px;">${data.reason}</td></tr>` : ''}
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="https://luminex.com.tr/appointment" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Yeni Randevu Al</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // PRESCRIPTION READY
  // ============================================
  prescriptionReady: {
    subject: (data: { prescriptionNo: string }) => `Reçeteniz Hazır #${data.prescriptionNo}`,
    text: (data: { patientName: string; doctorName: string; prescriptionNo: string; diagnosis: string; viewUrl: string }) => `
Merhaba ${data.patientName},

Reçeteniz hazır:

Reçete No: ${data.prescriptionNo}
Doktor: ${data.doctorName}
Teşhis: ${data.diagnosis}

Detayları görmek için:
${data.viewUrl}

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { patientName: string; doctorName: string; prescriptionNo: string; diagnosis: string; viewUrl: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçete Hazır</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">💊 Reçete</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Reçeteniz Hazır</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.patientName}, reçeteniz doktor tarafından oluşturuldu:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <tr><td style="padding: 12px;"><strong>Reçete No:</strong></td><td style="padding: 12px;">${data.prescriptionNo}</td></tr>
                <tr><td style="padding: 12px;"><strong>Doktor:</strong></td><td style="padding: 12px;">${data.doctorName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Teşhis:</strong></td><td style="padding: 12px;">${data.diagnosis}</td></tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="${data.viewUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Reçeteyi Görüntüle</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // TEST RESULT READY
  // ============================================
  testResultReady: {
    subject: () => 'Test Sonucunuz Hazır',
    text: (data: { patientName: string; testName: string; testDate: string; viewUrl: string }) => `
Merhaba ${data.patientName},

Test sonucunuz hazır:

Test: ${data.testName}
Tarih: ${data.testDate}

Detayları görmek için:
${data.viewUrl}

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { patientName: string; testName: string; testDate: string; viewUrl: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Sonucu Hazır</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">📋 Test Sonucu</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Sonucunuz Hazır</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.patientName}, test sonucunuz görüntülemeye hazır:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <tr><td style="padding: 12px;"><strong>Test:</strong></td><td style="padding: 12px;">${data.testName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Tarih:</strong></td><td style="padding: 12px;">${data.testDate}</td></tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="${data.viewUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Sonucu Görüntüle</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },

  // ============================================
  // SUBSCRIPTION RENEWAL
  // ============================================
  subscriptionRenewal: {
    subject: (data: { planName: string }) => `Abonelik Yenileme - ${data.planName}`,
    text: (data: { name: string; planName: string; renewalDate: string; amount: string; renewalUrl: string }) => `
Merhaba ${data.name},

Aboneliğiniz yakında yenileniyor:

Plan: ${data.planName}
Yenileme Tarihi: ${data.renewalDate}
Tutar: ${data.amount}

Aboneliğinizi yönetmek için:
${data.renewalUrl}

Saygılarızla,
LUMINEX Ekibi
    `.trim(),
    html: (data: { name: string; planName: string; renewalDate: string; amount: string; renewalUrl: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abonelik Yenileme</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LUMINEX</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Abonelik Yenileme</h2>
              <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
                Merhaba ${data.name}, aboneliğiniz yakında yenileniyor:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <tr><td style="padding: 12px;"><strong>Plan:</strong></td><td style="padding: 12px;">${data.planName}</td></tr>
                <tr><td style="padding: 12px;"><strong>Yenileme Tarihi:</strong></td><td style="padding: 12px;">${data.renewalDate}</td></tr>
                <tr><td style="padding: 12px;"><strong>Tutar:</strong></td><td style="padding: 12px;">${data.amount}</td></tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #667eea; border-radius: 6px;">
                    <a href="${data.renewalUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600;">Aboneliği Yönet</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }
};
