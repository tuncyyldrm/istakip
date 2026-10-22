# 3D Baskı İş Takip, Maliyet & Finans Yönetim Sistemi (Next.js + Turso)

Google E-Tablolar'daki **"3D baskı"** projesinin tüm sayfaları, formülleri ve matematiksel kurallarıyla baştan aşağı **Next.js (App Router)** ve **Turso (Serverless SQLite)** mimarisiyle yeniden inşa edilmiş profesyonel versiyonu.

---

## 🌟 Öne Çıkan Özellikler

1. **Vercel & Mobil İçin Kusursuz Mimari:**
   - Next.js 16 App Router ve Tailwind CSS v4 ile geliştirildi.
   - Masaüstü, tablet ve cep telefonlarından tam uyumlu çalışır.
   - Vercel'e sıfır yapılandırmayla (*zero-config*) doğrudan deploy edilir.
2. **Turso (Serverless SQLite) Veritabanı:**
   - Yerelde hiçbir ayar yapmadan `data/local.db` üzerinde çalışır.
   - Canlıda (Vercel) Turso Cloud URL ve Token'ı ile bulut veritabanına bağlanır; verileriniz asla silinmez.
3. **Google Sheets Veri ve Formül Bütünlüğü:**
   - **`Sipariş` Sayfası:** Kanban ve Tablo görünümleri, renk rozetleri, aşama yönetimi.
   - **`tanımlar` Sayfası:** Anycubic Kobra 2 Plus saatlik maliyet motoru (27 ₺/saat), kademeli çarpan kuralı, Trendyol fiyat formülü, çoklu parça montaj süre toplayıcı.
   - **`trendyol satış` Sayfası:** Net hakediş, net KDV borcu, gelir vergisi (%20), iş ortağı payı, sizin kalan alacağınız ve net kârınız.
   - **`Nakit Kasa` Sayfası:** 200, 100, 50, 20, 10, 5 TL kupür sayımı ve kasa mevcudu.
   - **`ayarlar` Sayfası:** Kategori ve kanal yönetimi.

---

## 🚀 Yerel Olarak Çalıştırma

### 1. Kolay Başlatma (Windows)
Klasördeki **[`baslat.bat`](file:///c:/Users/Administrator/proje/istakip/baslat.bat)** dosyasına çift tıklayın. Otomatik olarak sunucuyu çalıştırıp tarayıcınızda açacaktır:
👉 **`http://localhost:3001`**

*(Aynı yerel ağdaki telefonunuzdan girmek için ağ adresini kullanabilirsiniz: `http://192.168.1.65:3001`)*

### 2. Komut Satırından Başlatma
```bash
# Canlı modu başlat
npm start

# Geliştirici modunu başlat
npm run dev
```

---

## 🌐 GitHub ve Vercel İle Canlıya Alma Rehberi (0 TL Maliyet)

### Adım 1: GitHub Reposu Oluşturma
Terminalde şu komutları çalıştırarak projenizi GitHub'a gönderin:
```bash
git add .
git commit -m "feat: 3D baskı iş takip sistemi (Next.js + Turso)"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/istakip.git
git push -u origin main
```

### Adım 2: Turso'da Ücretsiz Veritabanı Açma (1 Dakika)
1. [turso.tech](https://turso.tech) sitesine gidip GitHub ile ücretsiz giriş yapın.
2. **Create Database** butonuna basıp veritabanınıza bir isim verin (örn: `istakip-db`).
3. Size verilen **Database URL** (`libsql://...`) ve **Auth Token** değerlerini kopyalayın.

### Adım 3: Vercel'e Canlıya Alma (1 Tık)
1. [vercel.com](https://vercel.com) sitesine gidip GitHub ile giriş yapın.
2. **Add New... $\rightarrow$ Project** seçip `istakip` reponuzu seçin.
3. **Environment Variables** bölümüne Turso'dan aldığınız 2 değeri ekleyin:
   - `TURSO_DATABASE_URL` = `libsql://istakip-db-...turso.io`
   - `TURSO_AUTH_TOKEN` = `eyJhbGci...`
4. **Deploy** butonuna basın!
5. 1 dakika içinde size özel ücretsiz bir linkiniz olacak (örn: `https://istakip-baski.vercel.app`).

Tebrikler! Artık dünyanın her yerinden cebinizden veya bilgisayarınızdan kendi atölye takip sisteminizi kullanabilirsiniz.
