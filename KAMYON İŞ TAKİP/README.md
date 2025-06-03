# Kamyon İş Takip Sistemi

Bu proje, kamyon işletmeciliği için geliştirilmiş bir iş takip sistemidir. Sistem, aşağıdaki özellikleri içermektedir:

- Sanayi ziyaretleri ve yapılan işlerin kaydı
- Satın alınan parçaların takibi
- Yakıt tüketimi takibi
- Sefer sayısı ve mesafe takibi
- Vergi ödemeleri takibi

## Gereksinimler

- Node.js
- MongoDB
- npm veya yarn

## Kurulum

1. MongoDB'yi yerel bilgisayarınıza kurun ve çalıştırın.

2. Projeyi klonlayın ve bağımlılıkları yükleyin:

```bash
# Backend için
cd backend
npm install

# Frontend için
cd ../frontend
npm install
```

## Çalıştırma

1. Backend'i başlatın:
```bash
cd backend
npm run dev
```

2. Frontend'i başlatın:
```bash
cd frontend
npm start
```

3. Tarayıcınızda `http://localhost:3000` adresine gidin.

## Özellikler

- Yeni kayıt ekleme
- Kayıtları listeleme ve filtreleme
- Detaylı kayıt görüntüleme
- Kayıt silme
- Responsive tasarım

## Teknolojiler

- Frontend: React, TypeScript, Material-UI
- Backend: Node.js, Express.js
- Veritabanı: MongoDB 