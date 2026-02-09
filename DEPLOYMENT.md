# LUMINEX - Deployment Rehberi

## 📋 İçindekiler

- [Giriş](#giriş)
- [Deployment Seçenekleri](#deployment-seçenekleri)
- [Docker Deployment (Production)](#docker-deployment-production)
- [Docker Deployment (Development)](#docker-deployment-development)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [SSL Sertifikası](#ssl-sertifikası)
- [Lisans Yönetimi](#lisans-yönetimi)
- [Yedekleme](#yedekleme)
- [İzleme ve Loglama](#izleme-ve-loglama)

---

## 🚀 Giriş

Bu rehber, LUMINEX uygulamasının production ortamına nasıl deploy edileceğini açıklar.

**Desteklenen Platformlar:**
- Docker Compose (Self-hosted, önerilen)
- Vercel (Cloud, opsiyonel)
- AWS/GCP/Azure (Docker ile)

---

## 🐳 Deployment Seçenekleri

### Özellik Karşılaştırması

| Özellik | Docker | Vercel |
|---------|--------|--------|
| Tam kontrol | ✅ | ❌ |
| SSL sertifikası | ✅ Manuel | ✅ Otomatik |
| Domain lisans kilidi | ✅ | ⚠️ Sınırlı |
| Özelleştirme | ✅ Tam | ❌ Sınırlı |
| Maliyet | Düşük | Orta-Yüksek |
| Bakım | Manuel | Otomatik |
| Ölçeklenebilirlik | Manuel | Otomatik |

### Tavsiye

**Kurumsal Kullanım İçin:** Docker Compose
- Tam kontrol
- Domain lisans kilidi
- Veri güvenliği
- Maliyet avantajı

**Hızlı Başlangıç İçin:** Vercel
- Otomatik SSL
- CI/CD entegrasyonu
- Global CDN

---

## 🐳 Docker Deployment (Production)

### 1. Gereksinimler

```bash
# Sistem gereksinimleri
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- 2 CPU çekirdeği (min)
- 4 GB RAM (min), 8 GB (önerilen)
- 20 GB disk alanı
- Docker 20.10+
- Docker Compose 2.0+
```

### 2. Docker Kurulumu (Ubuntu)

```bash
# 1. Mevcut kurulumları kaldır
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. Repository'yi ekle
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Docker'ı kur
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4. Servisi başlat
sudo systemctl start docker
sudo systemctl enable docker

# 5. Kurulumu doğrula
docker --version
docker compose version
```

### 3. PostgreSQL Kurulumu

```bash
# Docker Compose ile PostgreSQL
# docker-compose.yml dosyası zaten yapılandırılmış
```

### 4. Environment Variables

`.env.production` dosyasını oluşturun:

```bash
# Database
DATABASE_URL="postgresql://luminex:your_secure_password@localhost:5432/luminex?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Lisans
LICENSE_KEY="your-license-key"
LICENSE_DOMAIN="yourdomain.com"

# Email (opsiyonel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="production"
```

### 5. SSL Sertifikası (Let's Encrypt)

```bash
# 1. Certbot kur
sudo apt-get install certbot python3-certbot-nginx

# 2. Sertifika al (nginx kurulu olmalı)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Otomatik yenileme (cron)
sudo crontab -e
# Aşağıdaki satırı ekle:
0 0 * * * certbot renew --quiet
```

### 6. Deployment

```bash
# 1. Projeyi klonla
git clone https://your-repo/luminex-next.git
cd luminex-next

# 2. Environment dosyasını kopyala
cp .env.example .env.production
nano .env.production  # Düzenle

# 3. Docker image'ı build et
docker compose -f docker-compose.yml build

# 4. Migration'ları çalıştır
docker compose -f docker-compose.yml run --rm app npx prisma migrate deploy

# 5. Seed data (opsiyonel)
docker compose -f docker-compose.yml run --rm app npx prisma db seed

# 6. Uygulamayı başlat
docker compose -f docker-compose.yml up -d

# 7. Servisleri kontrol et
docker compose ps

# 8. Logları görüntüle
docker compose logs -f app
```

### 7. NGINX Reverse Proxy

`/etc/nginx/sites-available/luminex`:

```nginx
upstream luminex {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # HTTP'den HTTPS'e yönlendir
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL sertifikası
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL yapılandırması
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Güvenlik başlıkları
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy ayarları
    location / {
        proxy_pass http://luminex;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://luminex;
    }

    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://luminex;
    }
}
```

```bash
# Site'ı aktifleştir
sudo ln -s /etc/nginx/sites-available/luminex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐳 Docker Deployment (Development)

### Development Ortamı

```bash
# Development için docker-compose kullan
docker compose -f docker-compose.dev.yml up -d

# Development shell'e gir
docker compose -f docker-compose.dev.yml exec app bash

# İçiinde:
npm run dev
```

---

## ☁️ Vercel Deployment

### 1. Hazırlık

```bash
# 1. Vercel CLI kur
npm install -g vercel

# 2. Giriş yap
vercel login

# 3. PostgreSQL database hazırla
# Supabase / Neon / Railway kullanabilirsiniz
# DATABASE_URL alınacak
```

### 2. Environment Variables

Vercel dashboard'da veya CLI ile:

```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL_DIRECT production  # Prisma için
```

### 3. Deployment

```bash
# 1. Production build
vercel --prod

# 2. Domain yapılandırması
vercel domains add yourdomain.com

# 3. Migration'ları çalıştır (manuel)
# Vercel dashboard'da shell açın veya:
vercel exec -- npx prisma migrate deploy
```

### Vercel Hızlandırmaları

```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cleanup/expired-sessions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## 🔧 Environment Variables

### Gerekli Değişkenler

```bash
# ┌─────────────────────────────────────────────────────────┐
# │ ZORUNLU DEĞİŞKENLER                                    │
# └─────────────────────────────────────────────────────────┘

# Database Connection
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"  # Production URL
NEXTAUTH_SECRET="minimum-32-character-random-string"

# ┌─────────────────────────────────────────────────────────┐
# │ OPSİYONEL DEĞİŞKENLER                                  │
# └─────────────────────────────────────────────────────────┘

# Lisans (Domain kilidi için)
LICENSE_KEY="xxxx-xxxx-xxxx-xxxx"
LICENSE_DOMAIN="yourdomain.com"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="LUMINEX <noreply@yourdomain.com>"

# Storage (opsiyonel - gelecekte)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID ""

# Analytics (opsiyonel)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Sentry (opsiyonel - hata izleme)
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""

# ┌─────────────────────────────────────────────────────────┐
# │ ÖZEL DEĞİŞKENLER                                       │
# └─────────────────────────────────────────────────────────┘

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"

# Session
SESSION_MAX_AGE="604800"  # 7 gün
SESSION_UPDATE_AGE="86400"  # 1 gün

# Password
BCRYPT_ROUNDS="10"
PASSWORD_MIN_LENGTH="8"
PASSWORD_MAX_AGE="90"  # Gün

# Account Lockout
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION_MS="900000"  # 15 dakika

# Pagination
DEFAULT_PAGE_SIZE="10"
MAX_PAGE_SIZE="100"

# Appointment
APPOINTMENT_CANCELLATION_HOURS="24"
APPOINTMENT_REMINDER_HOURS="24"
```

### Secret Generation

```bash
# NEXTAUTH_SECRET generate
openssl rand -base64 32

# Veya Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# LICENSE_KEY generate (örnek)
uuidgen
```

---

## 🔐 SSL Sertifikası

### Let's Encrypt (Ücretsiz)

```bash
# Standart kurulum
sudo certbot --nginx -d yourdomain.com

# Wildcard sertifikası
sudo certbot certonly --manual --preferred-challenges=dns \
  -d "*.yourdomain.com" -d "yourdomain.com"

# Yenileme test
sudo certbot renew --dry-run
```

### Cloudflare (Ücretsiz)

1. Cloudflare'da domain'i ekle
2. Nameserver'ları değiştir
3. SSL/TLS → Full (strict) seç
4. Edge Certificates → Always HTTPS

### Commercial SSL

**Satın Alma:**
- Comodo SSL
- DigiCert
- GlobalSign
- Namecheap

**Kurulum:**
```bash
# CRT dosyasını /etc/ssl/certs/ kopyala
sudo cp yourdomain.crt /etc/ssl/certs/

# Key dosyasını /etc/ssl/private/ kopyala
sudo cp yourdomain.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/yourdomain.key

# Nginx config'de kullan
ssl_certificate /etc/ssl/certs/yourdomain.crt;
ssl_certificate_key /etc/ssl/private/yourdomain.key;
```

---

## 🔑 Lisans Yönetimi

### Lisans Doğrulama

Lisans sistemi domain ve key ile çalışır:

```typescript
// middleware.ts'de
const isValid = await validateLicense(request);

if (!isValid) {
  return NextResponse.redirect('/license-error');
}
```

### Lisans Key Oluşturma

```bash
# Örnek lisans key formatı
# XXXX-XXXX-XXXX-XXXX

# Production için
UUID + Domain hash ile oluştur
```

### Lisans Hataları

| Hata | Çözüm |
|------|-------|
| INVALID_LICENSE | Geçersiz lisans key |
| DOMAIN_MISMATCH | Domain ile lisans uyuşmazlığı |
| LICENSE_EXPIRED | Lisans süresi doldu |
| MAX_USERS_EXCEEDED | Maksimum kullanıcı sayısı aşıldı |

---

## 💾 Yedekleme

### Database Yedekleme

```bash
# 1. Manual backup
docker compose exec postgres pg_dump -U luminex luminex > backup_$(date +%Y%m%d).sql

# 2. Automated backup (cron)
crontab -e
# Her gün saat 03:00'de backup
0 3 * * * docker compose exec -T postgres pg_dump -U luminex luminex > /backups/luminex_$(date +\%Y\%m\%d).sql

# 3. Sıkıştırılmış backup
0 3 * * * docker compose exec -T postgres pg_dump -U luminex luminex | gzip > /backups/luminex_$(date +\%Y\%m\%d).sql.gz

# 4. Eski backup'ları temizle (30 günden eski)
0 4 * * * find /backups -name "luminex_*.sql.gz" -mtime +30 -delete
```

### Backup Script

`/usr/local/bin/backup-luminex.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Backup dizinini oluştur
mkdir -p $BACKUP_DIR

# Database backup
docker compose exec -T postgres pg_dump -U luminex luminex | gzip > $BACKUP_DIR/luminex_$DATE.sql.gz

# Eski backup'ları temizle
find $BACKUP_DIR -name "luminex_*.sql.gz" -mtime $RETENTION_DAYS -delete

# Log
echo "Backup completed: luminex_$DATE.sql.gz" >> /var/log/luminex-backup.log
```

```bash
# Script'e izin ver
chmod +x /usr/local/bin/backup-luminex.sh

# Cron'a ekle
crontab -e
# Her 6 saatte bir
0 */6 * * * /usr/local/bin/backup-luminex.sh
```

### Restore

```bash
# Backup'tan restore
gunzip < backup_20250208.sql.gz | docker compose exec -T postgres psql -U luminex luminex

# Veya
docker compose exec -T postgres psql -U luminex luminex < backup_20250208.sql
```

---

## 📊 İzleme ve Loglama

### Docker Container Logları

```bash
# Real-time loglar
docker compose logs -f app

# Son 100 satır
docker compose logs --tail=100 app

# Tüm servislerin logları
docker compose logs -f

# Logları temizle
docker compose down
docker compose up -d
```

### Nginx Logları

```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log

# Hata analizi
grep "error" /var/log/nginx/error.log | tail -20
```

### PostgreSQL Logları

```bash
# Docker içinde
docker compose exec postgres psql -U luminex -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Slow queries
docker compose exec postgres psql -U luminex -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### Application Monitoring

**Opsiyonel Araçlar:**

1. **Sentry** - Hata takibi
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

2. **Datadog** - APM ve loglama
3. **New Relic** - Performans monitoring
4. **Prometheus + Grafana** - Self-hosted monitoring

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const db = await prisma.$queryRaw`SELECT 1`;
  const uptime = process.uptime();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)} minutes`,
    database: db ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
  });
}
```

```bash
# Health check
curl https://yourdomain.com/api/health
```

---

## 🔧 Bakım İşlemleri

### Güncelleme

```bash
# 1. Yeni kodu çek
git pull origin main

# 2. Dependecy'leri güncelle
docker compose build

# 3. Migration'ları çalıştır
docker compose run --rm app npx prisma migrate deploy

# 4. Container'ları yeniden başlat
docker compose up -d

# 5. Eski image'ları temizle
docker image prune -a -f
```

### Log Rotation

`/etc/logrotate.d/luminex`:

```
/var/log/luminex/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Disk Temizliği

```bash
# Docker temizliği
docker system prune -a --volumes

# Eski container'ları sil
docker container prune

# Kullanılmayan image'ları sil
docker image prune -a

# Nginx loglarını temizle
> /var/log/nginx/access.log
> /var/log/nginx/error.log
```

---

## 🚨 Sorun Giderme

### Yaygın Sorunlar

**1. Container başlamıyor**
```bash
# Logları kontrol et
docker compose logs app

# Çakışan portları kontrol et
netstat -tulpn | grep LISTEN

# Port değiştir (docker-compose.yml)
ports:
  - "3001:3000"  # 3000 → 3001
```

**2. Database bağlanamıyor**
```bash
# PostgreSQL'i kontrol et
docker compose ps postgres

# Logları görüntüle
docker compose logs postgres

# Bağlantı test et
docker compose exec postgres psql -U luminex -d luminex
```

**3. Migration hatası**
```bash
# Migration durumunu kontrol et
docker compose exec app npx prisma migrate status

# Migration'ları reset et (DİKKAT: Veri siler)
docker compose exec app npx prisma migrate reset --force
```

**4. SSL sorunu**
```bash
# Sertifika durumunu kontrol et
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew

# Nginx'i yeniden başlat
sudo systemctl reload nginx
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables ayarlandı
- [ ] Database oluşturuldu
- [ ] Migration'lar çalıştırıldı
- [ ] SSL sertifikası yüklendi
- [ ] Lisans key yapılandırıldı
- [ ] Nginx yapılandırıldı
- [ ] Firewall kuralları ayarlandı
- [ ] Backup script kuruldu

### Post-Deployment

- [ ] Uygulama erişilebilir
- [ ] Tüm sayfalar çalışıyor
- [ ] Login/Register test edildi
- [ ] API endpoint'leri cevap veriyor
- [ ] Database bağlantısı başarılı
- [ ] SSL sertifikası geçerli
- [ ] Loglar düzgün kaydediliyor
- [ ] Health check endpoint çalışıyor
- [ ] Monitor sistemleri kuruldu

---

## 🎯 Performance Tuning

### Nginx Optimize

```nginx
# nginx.conf
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
types_hash_max_size 2048;

# Gzip compression
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json application/javascript;

# Cache
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=luminex:10m max_size=1g inactive=60m;

# Upstream
upstream luminex {
    least_conn;
    server localhost:3000 max_fails=3 fail_timeout=30s;
}
```

### PostgreSQL Optimize

```bash
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

---

*Deployment Rehberi boyu: ~500 satır*
*Son güncelleme: 8 Şubat 2025*
