# Cloudflare Pages Security Advisor

Skill ini fokus untuk aplikasi Next.js dengan output: 'export' yang di-deploy ke **Cloudflare Pages**.

## Tujuan
Membantu review keamanan agar aman untuk static hosting di Cloudflare Pages, terutama terkait Turnstile, security headers, sanitasi, dan client-side only.

## Checklist Review

### 1) Secrets & Environment
- [ ] TURNSTILE_SECRET_KEY **HANYA** ada di Cloudflare Pages Environment Variables (Production/Preview). **JANGAN** pakai NEXT_PUBLIC_*
- [ ] Hanya NEXT_PUBLIC_TURNSTILE_SITE_KEY yang boleh di client
- [ ] Tidak ada API key/token rahasia di repo
- [ ] .env.example hanya berisi key publik atau placeholder

### 2) Next.js Static Export
- [ ] 
ext.config.mjs menggunakan output: 'export'
- [ ] images.unoptimized: true (wajib untuk static export)
- [ ] Tidak ada pp/api/* yang diharapkan berjalan sebagai Next.js API Route. Gunakan unctions/ untuk Pages Functions
- [ ] Build menghasilkan folder out/

### 3) Security Headers
- [ ] Ada public/_headers untuk Cloudflare Pages
- [ ] Minimal: X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=()
- [ ] Pertimbangkan Strict-Transport-Security jika domain sudah HTTPS
- [ ] Content-Security-Policy disarankan bertahap (kompatibel dengan Tiptap + html2canvas). Jangan blok style-src 'unsafe-inline' secara berlebihan jika diperlukan untuk rendering

### 4) Cloudflare Turnstile
- [ ] Widget hanya muncul di tempat yang diperlukan (disarankan **hanya halaman utama**)
- [ ] Verifikasi token **wajib** lewat server-side: unctions/verify-turnstile.ts call https://challenges.cloudflare.com/turnstile/v0/siteverify dengan TURNSTILE_SECRET_KEY
- [ ] Token tidak disimpan permanen, cukup sessionStorage untuk gating per tab/session
- [ ] Tersedia dev bypass NEXT_PUBLIC_TURNSTILE_DISABLED=true untuk lokal
- [ ] Secret key tidak bocor ke bundle client

### 5) Sanitasi & XSS
- [ ] Gunakan dompurify untuk semua HTML dari rich text/import
- [ ] Blok script, iframe, object, embed, event handler (onclick, dll), javascript:
- [ ] Hanya allowlist tag/atribut yang aman untuk konten resume
- [ ] Link eksternal aman (http, https, mailto, 	el)

### 6) Client-Only Data
- [ ] Data CV, foto, draft hanya disimpan di IndexedDB/memory
- [ ] Tidak ada pengiriman isi CV/foto ke third-party
- [ ] Tidak ada analytics/tracking/telemetry
- [ ] Foto disimpan sebagai Blob di IndexedDB (bukan base64 besar di localStorage)

### 7) Dependencies & Build
- [ ] 
pm audit minimal (periksa issue kritis/moderat)
- [ ] Hanya dependency yang dibutuhkan
- [ ] 
pm run build berhasil menghasilkan out/
- [ ] Tidak ada hardcoded secret

## Panduan Deploy ke Cloudflare Pages
1. Build command: 
pm run build
2. Output directory: out
3. Tambahkan Environment Variables: NEXT_PUBLIC_TURNSTILE_SITE_KEY (public) dan TURNSTILE_SECRET_KEY (secret, server-side only)
4. Pastikan unctions/ ter-upload (Pages Functions akan auto-detect)

## Catatan
Fokus pada CF Pages static export. Jangan menambahkan Next.js API Routes (pp/api/) untuk kebutuhan verifikasi Turnstile - gunakan Pages Functions.
