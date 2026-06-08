# 🔥 FF Giveaway — Free Fire Giveaway Website

Website giveaway Free Fire modern dengan desain **Neo Brutalism**, dibangun dengan **Next.js 15**, **TypeScript**, **Tailwind CSS**, dan **Supabase**.

![FF Giveaway](https://placehold.co/1200x630/FFE600/0A0A0A?text=FF+GIVEAWAY)

---

## 🚀 Fitur

- ✅ **Halaman Login** — Daftar dengan email & username
- ✅ **Halaman Hadiah** — Tampilkan & ikuti giveaway
- ✅ **Admin Dashboard** — Kelola hadiah, user, & peserta
- ✅ **Dark Mode** — Toggle light/dark
- ✅ **Responsive** — Mobile-first design
- ✅ **Neo Brutalism** — Desain tebal, kontras, & bold
- ✅ **Search & Filter** — Di semua halaman list
- ✅ **Pagination** — Untuk daftar panjang
- ✅ **Loading Skeleton** — Saat data dimuat
- ✅ **Toast Notification** — Feedback aksi user
- ✅ **Success Modal** — Popup berhasil join giveaway
- ✅ **Empty State** — Tampilan saat data kosong
- ✅ **SEO Metadata** — Optimasi mesin pencari

---

## 📁 Struktur Project

```
ff-giveaway/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Redirect ke /login
│   │   ├── login/
│   │   │   └── page.tsx            # Halaman login
│   │   ├── gifts/
│   │   │   ├── layout.tsx          # Layout dengan Navbar & Footer
│   │   │   └── page.tsx            # Halaman daftar hadiah
│   │   └── admin/
│   │       ├── layout.tsx          # Layout admin dengan sidebar
│   │       ├── page.tsx            # Dashboard statistik
│   │       ├── gifts/
│   │       │   └── page.tsx        # Kelola hadiah
│   │       ├── users/
│   │       │   └── page.tsx        # Daftar user
│   │       └── participants/
│   │           └── page.tsx        # Daftar peserta
│   ├── components/
│   │   ├── LoginForm.tsx           # Form login
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Navbar publik
│   │   │   └── Footer.tsx          # Footer
│   │   ├── gifts/
│   │   │   ├── GiftsList.tsx       # Grid hadiah + search/filter
│   │   │   ├── GiftCard.tsx        # Kartu hadiah individual
│   │   │   ├── GiftCardSkeleton.tsx # Loading skeleton
│   │   │   └── SuccessModal.tsx    # Modal sukses join
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx    # Sidebar admin
│   │   │   └── AdminHeader.tsx     # Header admin
│   │   └── ui/
│   │       └── ThemeToggle.tsx     # Toggle dark mode
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase browser client
│   │   │   └── server.ts           # Supabase server client
│   │   └── utils.ts                # Helper functions
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   └── styles/
│       └── globals.css             # Global CSS + Neo Brutalism
├── supabase/
│   └── schema.sql                  # SQL schema lengkap
├── .env.local                      # Environment variables (jangan di-commit!)
├── .env.example                    # Template env
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚙️ Setup Lokal

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/ff-giveaway.git
cd ff-giveaway
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Supabase

#### a. Buat Project Supabase
1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"New Project"**
3. Isi nama project, password database, dan pilih region terdekat (Singapore)
4. Tunggu project dibuat (~2 menit)

#### b. Jalankan SQL Schema
1. Buka project Supabase kamu
2. Pergi ke **SQL Editor** (ikon terminal di sidebar kiri)
3. Klik **"New Query"**
4. Copy-paste isi file `supabase/schema.sql`
5. Klik **"Run"**
6. Pastikan semua tabel dan data dummy berhasil dibuat

#### c. Ambil API Keys
1. Pergi ke **Project Settings** → **API**
2. Salin:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Konfigurasi Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_ADMIN_EMAIL=email-admin-kamu@gmail.com
```

> ⚠️ Ganti `email-admin-kamu@gmail.com` dengan email yang akan digunakan untuk akses halaman `/admin`.

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🐙 Setup GitHub

```bash
# Inisialisasi git
git init
git add .
git commit -m "🔥 Initial commit — FF Giveaway"

# Buat repository baru di GitHub, lalu:
git remote add origin https://github.com/USERNAME/ff-giveaway.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy ke Vercel

### Cara 1: Via Vercel Dashboard (Direkomendasikan)

1. Buka [https://vercel.com](https://vercel.com) dan login
2. Klik **"Add New Project"**
3. Import repository GitHub `ff-giveaway`
4. Di bagian **"Environment Variables"**, tambahkan:
   ```
   NEXT_PUBLIC_SUPABASE_URL        = https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY       = eyJhbGci...
   NEXT_PUBLIC_ADMIN_EMAIL         = email-admin@gmail.com
   ```
5. Klik **"Deploy"**
6. Tunggu deploy selesai — URL live akan diberikan otomatis!

### Cara 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# Ikuti instruksi, tambahkan env vars saat diminta
vercel --prod
```

---

## 🔗 Menghubungkan Supabase ke Vercel

Setelah deploy, kamu perlu menambahkan domain Vercel ke Supabase:

1. Buka **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Di **Site URL**, tambahkan URL Vercel kamu (contoh: `https://ff-giveaway.vercel.app`)
3. Di **Redirect URLs**, tambahkan: `https://ff-giveaway.vercel.app/**`
4. Klik **Save**

---

## 👤 Akses Admin

Untuk mengakses halaman Admin (`/admin`):

1. Login dengan email yang sama persis dengan `NEXT_PUBLIC_ADMIN_EMAIL`
2. Di navbar akan muncul tombol **"ADMIN"**
3. Atau langsung akses `/admin`

---

## 🎨 Kustomisasi

### Warna (tailwind.config.ts)
```typescript
colors: {
  brand: {
    yellow:  "#FFE600",  // Warna utama
    orange:  "#FF4D00",  // Aksen
    red:     "#FF1744",  // Bahaya/hapus
    blue:    "#0047FF",  // Info
    lime:    "#CCFF00",  // Sukses/stok
  }
}
```

### Tambah Hadiah via Admin
1. Login dengan akun admin
2. Pergi ke `/admin/gifts`
3. Klik **"TAMBAH HADIAH"**
4. Isi nama, deskripsi, dan stok
5. Klik **"SIMPAN"**

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 15.1 | Framework React |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Supabase | 2.x | Database & Auth |
| react-hot-toast | 2.4 | Notifikasi toast |
| lucide-react | 0.469 | Icons |

---

## 📝 Lisensi

MIT License — bebas digunakan untuk keperluan pribadi maupun komersial.

---

> ⚠️ **Disclaimer**: Website ini bukan afiliasi resmi Garena Free Fire. Dibuat untuk tujuan pembelajaran.
