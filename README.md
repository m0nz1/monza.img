# MonPix — AI Image Tools

> **AI-powered image upscaling & background removal** — zero backend, fully static, deploy in minutes.

![MonPix Preview](assets/favicon.svg)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 AI Upscaler | Upscale images 1× to 16× using AI super-resolution |
| 🪄 Remove Background | One-click AI background removal |
| ☁️ Uploadcare | Cloud image upload with drag & drop |
| 📥 Download HD | Download results in original quality |
| 🌙 Dark / Light Mode | Auto-saved theme preference |
| 📱 Responsive | Mobile-first, works on all screen sizes |
| 🕹️ Before/After Slider | Visual comparison of original vs result |
| 🕓 History | Last 30 results saved in localStorage |
| 🔔 Toast Notifications | Modern success/error alerts |
| 📦 PWA | Installable as a mobile app |
| 🚀 Vercel Ready | One-click deploy |

---

## 🗂 Folder Structure

```
monpix/
├── index.html          # Main HTML (single page app)
├── style.css           # All styles — glassmorphism design system
├── script.js           # All logic — Uploadcare, API calls, history
├── sw.js               # Service Worker (PWA offline cache)
├── manifest.json       # PWA manifest
├── vercel.json         # Vercel deployment config
├── assets/
│   ├── favicon.svg     # Browser tab icon
│   ├── icon-192.svg    # PWA icon 192×192
│   └── icon-512.svg    # PWA icon 512×512
└── README.md           # This file
```

---

## 🚀 Deploy to Vercel (Recommended)

### Option A — Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Enter project folder
cd monpix

# 3. Deploy
vercel

# Follow the prompts. Done — you'll get a live URL instantly.
```

### Option B — Vercel Dashboard (no CLI needed)

1. Push this folder to a **GitHub repository**
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Framework Preset: **Other** (it's static HTML)
5. Click **Deploy** — done ✅

---

## 🐙 Push to GitHub

```bash
# Inside the monpix folder
git init
git add .
git commit -m "feat: MonPix AI image tools"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/monpix.git
git branch -M main
git push -u origin main
```

---

## 💻 Run Locally

No build step needed — it's plain HTML/CSS/JS.

### Using VS Code Live Server
1. Open the `monpix` folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

### Using Python
```bash
cd monpix
python3 -m http.server 3000
# Open: http://localhost:3000
```

### Using Node.js (npx)
```bash
cd monpix
npx serve .
# Open the printed URL
```

> **Note:** The Service Worker requires HTTPS or localhost to activate. On local HTTP you'll see a SW registration warning — this is normal and doesn't affect functionality.

---

## 🔧 Changing the APIs

All API endpoints are defined at the top of `script.js`:

```js
// script.js — Line 7-8
const API_UPSCALE  = 'https://bintangapi.full.diskon.cloud/api/tools/upscale-img';
const API_REMOVEBG = 'https://bintangapi.full.diskon.cloud/api/tools/removebg';
```

### Upscaler API
- **Endpoint:** `GET /api/tools/upscale-img?url=IMAGE_URL&resolusi=LEVEL`
- `IMAGE_URL` — Uploadcare CDN URL of the image
- `resolusi` — Integer from `1` to `16`
- **Expected response:** JSON with a `result`, `url`, or `data.url` field containing the output image URL

### Remove Background API
- **Endpoint:** `GET /api/tools/removebg?url=IMAGE_URL`
- `IMAGE_URL` — Uploadcare CDN URL
- **Expected response:** JSON with `result`, `url`, or `data.url` field

### Uploadcare
To change the Uploadcare project:
```js
// index.html — top <script> tag
UPLOADCARE_PUBLIC_KEY = '527f0f1c182a3ad64fd4';  // ← Replace with your key

// script.js — Line 10
const UC_PUBLIC_KEY = '527f0f1c182a3ad64fd4';     // ← Also update here
```

Get your key at [uploadcare.com](https://uploadcare.com) (free tier available).

---

## 📦 API Response Format

The app auto-detects result URLs from these response shapes:

```json
{ "result": "https://..." }
{ "url": "https://..." }
{ "data": { "url": "https://..." } }
{ "data": { "result": "https://..." } }
```

If your API returns a different shape, update the result extraction in `script.js` inside `runUpscale()` and `runRemoveBg()`.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Font (Display) | Syne 800 |
| Font (Body) | DM Sans 300-500 |
| Primary Accent | `#7c3aed` (Purple) |
| Secondary Accent | `#2563eb` (Blue) |
| Tertiary Accent | `#06b6d4` (Cyan) |
| Border Radius | 8 / 14 / 20 / 28px |
| Blur | `backdrop-filter: blur(20px)` |

---

## 📄 License

MIT — free for personal and commercial use.

---

**Built with ❤️ for creators. Powered by AI.**
