# Resume Maker

Aplikasi pembuat CV/resume profesional yang ramah ATS, berjalan **100% di browser**. Data CV disimpan lokal di IndexedDB; tidak ada backend yang menerima isi CV, foto, atau file ekspor.

Dibuat oleh [github.com/yutisio12](https://github.com/yutisio12).

> **Dokumen teknis lengkap:** lihat [PLAN.md](./PLAN.md). Dokumen ini menjelaskan arsitektur, roadmap P0/P1, acceptance criteria, dan batasan implementasi secara rinci.

---

## Status Proyek

Aplikasi sudah dapat di-build menjadi static assets. Roadmap P0 dan P1 selesai; print desktop/mobile serta alur import, foto, reset, error penyimpanan, dan Turnstile sudah diuji dengan Chrome headless/Playwright.

| Area | Status |
|---|---|
| Next.js 14 + static export | Selesai |
| Form CV & live preview | Selesai |
| IndexedDB autosave/restore | Selesai |
| Upload foto | Selesai |
| Import/Export JSON | Selesai |
| Export PDF | Selesai (`window.print()`) |
| Dua template | Selesai |
| Sanitasi HTML menyeluruh | Selesai |
| Watermark preview + PDF | Selesai |
| Turnstile | Selesai |

Rencana lengkap ada di [PLAN.md](./PLAN.md).

---

## Fitur

### Data CV
- Informasi pribadi: nama, headline, lokasi, telepon, email, LinkedIn, GitHub, website.
- Ringkasan profesional rich-text.
- Pengalaman kerja, pendidikan, keahlian, proyek, sertifikasi, bahasa.
- Tambah, ubah, hapus, dan tampilkan/sembunyikan section/item.
- **Reorder section/item tidak tersedia** dan tidak termasuk scope versi ini.

### Editor
- Tiptap dengan bold, italic, underline, strike, bullet list, numbered list, link, undo/redo.
- Dialog link dengan validasi URL; tautan tidak aman ditolak.
- Mode single-line tersedia untuk field pendek.
- Toolbar aksesibel dengan label, tooltip, dan focus state.

### Template
- **ATS Classic** (default): satu kolom, tanpa foto default, heading standar.
- **Minimal**: satu kolom, lebih lapang, tetap mudah diparsing.
- Preview dan hasil cetak memiliki alur baca yang sama.

### Foto
- Upload JPG/PNG/WebP maksimal 2 MB.
- Resize/compress di browser, simpan blob di IndexedDB.
- Crop, tampilkan/sembunyikan, ganti, dan hapus.
- Foto tidak pernah dikirim ke server.

### Import/Export
- Export JSON untuk backup atau pindah perangkat.
- Import JSON dengan validasi schema, batas ukuran, sanitasi HTML, preview dokumen, dan konfirmasi sebelum draft diganti.
- Export PDF melalui browser print dialog (`window.print()`), bukan layanan konversi online.

### Keamanan
- Sanitasi HTML sebelum preview dan export, serta saat import JSON.
- Validasi URL: hanya `http`, `https`, `mailto`, dan `tel`.
- Cloudflare Turnstile pada homepage serta Import/Export. Pada aplikasi static ini, Turnstile berfungsi sebagai gate UX/spam, bukan access control; pengguna teknis tetap dapat memodifikasi sisi client.
- Tidak ada analytics, tracking, atau pengiriman data CV ke pihak ketiga.

---

## Watermark

### Preview
Preview CV menampilkan watermark samar dan berulang:

```
Create by github.com/yutisio12
```

Tujuannya agar screenshot preview tidak bersih. Watermark tidak memiliki tombol hapus di aplikasi.

### PDF
Saat mencetak/menyimpan PDF, preview watermark disembunyikan dan diganti watermark teks putih tersembunyi di layer teks PDF:

```
Create by github.com/yutisio12 | doc:<id> | <timestamp>
```

Watermark ini tidak terlihat secara visual, tetapi dapat diidentifikasi melalui ekstraksi teks PDF.

### Batasan penting

- Ini **bukan DRM** dan **bukan tamper-proof**. Pengguna teknis tetap dapat mengedit atau menghapus watermark dengan tools PDF.
- Watermark preview hanya menghalangi screenshot secara visual; pengguna tetap bisa melakukan crop atau menyembunyikannya lewat inspect element.
- Karena aplikasi tidak memakai akun, watermark hanya mengidentifikasi **dokumen/export**, bukan identitas pengguna.
- Watermark tidak memuat nama, email, telepon, atau data pribadi lain.
- Watermark yang benar-benar tidak bisa dihapus memerlukan PDF signing/DRM di server, yang bertentangan dengan prinsip 100% client-side.

---

## Import JSON dan Sample

Import tidak langsung mengganti draft. Alurnya:

1. Klik **Import**.
2. Selesaikan Turnstile jika diminta.
3. Modal import terbuka.
4. Unduh **contoh JSON** jika perlu.
5. Pilih file JSON.
6. File divalidasi dan disanitasi.
7. Preview dokumen yang akan diimport ditampilkan.
8. Klik **Ganti draft** untuk menerapkan, atau **Batal**.

Sample tersedia di:

```
/sample-resume.json
```

Sample berisi data dummy lengkap untuk semua section. Sample tidak otomatis dimasukkan ke draft; pengguna harus mengunduh dan mengimportnya secara sadar. Import tidak membawa foto; foto lama di perangkat dihapus saat draft diganti.

### Format JSON

File harus mengikuti struktur `ResumeDocument`:

```json
{
  "schemaVersion": 1,
  "id": "uuid",
  "metadata": {
    "createdAt": "2026-10-25T00:00:00.000Z",
    "updatedAt": "2026-10-25T00:00:00.000Z"
  },
  "personalInfo": {
    "fullName": "Nama Contoh",
    "headline": "Frontend Developer",
    "location": "Jakarta",
    "phone": "0812xxxx",
    "email": "nama@example.com",
    "linkedin": "https://linkedin.com/in/contoh",
    "github": "https://github.com/contoh",
    "website": "https://example.com",
    "photoId": null,
    "showPhoto": false
  },
  "summary": {
    "html": "<p>Ringkasan profesional...</p>",
    "text": "Ringkasan profesional..."
  },
  "sections": [
    {
      "id": "uuid",
      "type": "experience",
      "title": "Pengalaman Kerja",
      "visible": true,
      "order": 0,
      "items": []
    }
  ],
  "settings": {
    "template": "ats-classic",
    "showPhoto": false,
    "fontFamily": "Arial"
  }
}
```

Catatan:

- Foto **tidak ikut** dalam JSON karena disimpan sebagai blob di IndexedDB.
- Saat import, `photoId` dihapus dan foto tidak ditampilkan di perangkat tujuan.
- Template/font yang tidak dikenal akan fallback ke default.
- HTML dari import disanitasi sebelum ditampilkan atau disimpan.

---

## Privasi

- Semua pemrosesan CV terjadi di browser.
- Draft dan foto disimpan di IndexedDB perangkat pengguna.
- Tidak ada akun, login, cookie pelacakan, analytics, atau cloud sync.
- Data dapat hilang jika pengguna menghapus data situs/browser.
- Data tidak dienkripsi oleh aplikasi. Jangan mengklaim sebaliknya.
- Satu-satunya request eksternal adalah Cloudflare Turnstile. Yang dikirim hanya token verifikasi, bukan isi CV.
- Script Turnstile dimuat dari Cloudflare; ini perlu diketahui jika ingin deployment tanpa request pihak ketiga.

---

## Menjalankan Secara Lokal

Kebutuhan:

- Node.js 20+
- npm atau pnpm

```bash
npm install
npm run dev
```

Jika `npm install` gagal pada environment Windows tertentu, gunakan pnpm:

```bash
npx --yes pnpm@9.15.9 install
npx --yes pnpm@9.15.9 dev
```

Buka `http://localhost:3000`.

### Environment

Buat `.env.local`:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=site-key-anda
NEXT_PUBLIC_TURNSTILE_DISABLED=true
```

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: site key Turnstile, aman di client.
- `NEXT_PUBLIC_TURNSTILE_DISABLED=true`: bypass Turnstile untuk development.
- `TURNSTILE_SECRET_KEY`: **hanya** untuk environment Cloudflare Pages, jangan pernah dimasukkan ke client.

Contoh lengkap ada di `.env.example`.

---

## Build

```bash
npm run build
```

Hasil static export ada di folder `out/`.

Perintah lain:

```bash
npm run lint
npm run test:run
```

Test end-to-end memakai Playwright:

```bash
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:ui
```

Playwright menjalankan dev server otomatis di port `3100` dengan Turnstile dinonaktifkan.

Status verifikasi saat ini:

- `npm run build` lulus (termasuk lint dan type-check).
- `npm run test:run` lulus: 5 file, 22 test.
- `npm run test:e2e` lulus: 3 test Playwright.
- `npm run lint` dapat dijalankan terpisah dan lulus.
- Export PDF memakai dialog print browser, bukan `html2canvas`/`jsPDF`.
- Print desktop/mobile diuji dengan Chrome headless: hanya CV yang tercetak dan watermark teks PDF dapat diekstrak.

---

## Deploy ke Cloudflare Pages

Pengaturan umum:

- **Build command:** `npm run build`
- **Output directory:** `out`
- **Framework preset:** Next.js (static export)

Environment variables di Cloudflare Pages:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=site-key-anda
TURNSTILE_SECRET_KEY=secret-key-anda
```

Folder `functions/` berisi Cloudflare Pages Function `verify-turnstile.ts` untuk memverifikasi token. File `public/_headers` menambahkan header keamanan.

Alur verifikasi:

1. Widget Turnstile menghasilkan token di browser.
2. Token dikirim ke `/verify-turnstile`.
3. Function memverifikasi token ke Cloudflare memakai `TURNSTILE_SECRET_KEY`.
4. Jika valid, aplikasi menyimpan status verifikasi di `sessionStorage`.

Tidak ada data CV yang dikirim ke endpoint ini.

---

## Struktur Proyek

```
src/
  app/                 Halaman utama, layout, global CSS
  components/
    editor/            Tiptap editor dan wrapper
    form/              Form section, pengaturan template, upload foto
    layout/            AppShell desktop, MobileTabs, save status
    preview/           Preview CV, foto, dan watermark
    shared/            Header actions, tombol print, Turnstile
    ui/                Komponen shadcn/ui
  lib/
    constants/         Default resume, daftar font
    models/            Tipe data dan schema Zod
    storage/           IndexedDB
    utils/             Sanitasi, import JSON, helper
    watermark.ts       Brand + fingerprint dokumen
  store/               Resume context + autosave
  styles/              Tema Monokai dan print stylesheet
public/
  _headers
  sample-resume.json
functions/
  verify-turnstile.ts
```

---

## Roadmap

Status: **P0 dan P1 selesai**; print desktop/mobile dan watermark PDF sudah diverifikasi dengan Chrome headless.

### P0 � Keamanan dan kejujuran

- Perbaiki test runner.
- Sanitasi HTML dan URL di semua alur.
- Validasi import dengan Zod + batas ukuran + schema version.
- Modal import dengan preview dan sample JSON.
- Status penyimpanan dan error yang jujur.
- `beforeunload` untuk perubahan belum tersimpan.
- Konfirmasi hapus item; hapus ikon reorder palsu.

### P1 � Watermark dan kelengkapan

- Watermark preview terlihat + watermark PDF tersembunyi.
- Export PDF via `window.print()`.
- Field pendidikan/proyek/sertifikasi yang lengkap.
- Kontak LinkedIn/GitHub/website di preview.
- Dua template: ATS Classic dan Minimal.
- Toolbar Tiptap lengkap dan aksesibel.
- Crop foto, ganti/hapus blob lama, reset bersih.
- Dokumentasi final.

Detail lengkap ada di [PLAN.md](./PLAN.md).

---

## Batasan yang Diketahui

- **Reorder section/item tidak tersedia.**
- Export DOCX tidak tersedia.
- Tidak ada akun, login, atau cloud sync.
- Watermark bukan DRM dan dapat dihapus dengan tools PDF.
- Watermark tidak mengidentifikasi pengguna, hanya dokumen/export.
- Foto tidak ikut dalam JSON.
- Ketersediaan font CV bergantung pada font di perangkat pengguna.
- Hasil PDF dapat berbeda sedikit tergantung browser, printer, dan pengaturan margin.
- Turnstile memuat script eksternal dari Cloudflare.
- Reorder section/item tidak tersedia.
- `npm install` dapat gagal pada sebagian environment Windows; gunakan pnpm sesuai petunjuk di atas.

---

## Lisensi dan Kredit

Dibuat oleh [github.com/yutisio12](https://github.com/yutisio12).

Watermark pada preview dan PDF menggunakan teks:

```
Create by github.com/yutisio12
```
