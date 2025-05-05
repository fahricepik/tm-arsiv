# THM Arşiv Projesi

Bu proje, Türk Halk Müziği (THM) sözlü arşivini barındıran ve filtrelenebilir bir arayüz ile kullanıcıya sunan bir web uygulamasıdır.

## 📁 Proje Yapısı

```
tm-arsiv/
├── frontend/      ← React + Vite ile arayüz
├── backend/       ← FastAPI ile JSON veri servisi
```

---

## 🚀 Yayınlama Rehberi

### 1. GitHub
Projeyi GitHub üzerinde barındırın:  
https://github.com/fahricepik/tm-arsiv

---

### 2. Frontend: Vercel ile Yayınlama

- GitHub hesabını Vercel’e bağla → https://vercel.com
- Yeni proje ekle: `tm-arsiv` reposunu seç
- **Ayarlar:**

| Ayar               | Değer                |
|--------------------|----------------------|
| Framework          | Vite                 |
| Root Directory     | `frontend`           |
| Build Command      | `npm run build`      |
| Output Directory   | `dist`               |

- **Environment Variable** ekle:

| Name           | Value                                   |
|----------------|-------------------------------------------|
| VITE_API_URL   | `https://tm-arsiv-backend.onrender.com` |

---

### 3. Backend: Render ile Yayınlama

- Render hesabı aç: https://render.com
- Yeni **Web Service** oluştur
- **Repo**: `tm-arsiv`
- **Root Directory**: `backend`
- **Ayarlar:**

| Ayar             | Değer                                            |
|------------------|--------------------------------------------------|
| Runtime          | Python 3.11                                      |
| Build Command    | `pip install -r requirements.txt`                |
| Start Command    | `uvicorn main:app --host 0.0.0.0 --port 10000`   |

---

## 🔗 Bağlantılar

- **Frontend (Vercel)**: https://tm-arsiv.vercel.app
- **Backend (Render)**: https://tm-arsiv-backend.onrender.com/sarkilar

---

## 🔍 Özellikler

- Filtreleme (temel ve detaylı)
- Sayfalama
- PDF ve Excel dışa aktarma
- MP3 oynatma ve nota gösterimi

---

## 👨‍💻 Geliştirici: Fahri Çepik
