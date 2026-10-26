# PLAN.md — Client-Side Resume Maker (Next.js 14)

> **Status dokumen:** Revisi 25 Oktober 2026.
> Dokumen ini menggantikan rencana awal berbasis Rust/Leptos/WASM. Keputusan produk: aplikasi tetap dibangun dengan **Next.js 14 + TypeScript** dan di-export sebagai static assets.
>
> Dokumen ini adalah sumber acuan utama untuk pengembangan. README.md berisi ringkasan untuk pengguna dan developer.

---

## 1. Tujuan Produk

Resume Maker adalah aplikasi web untuk membuat CV/resume profesional yang ramah ATS (Applicant Tracking System). Pengguna mengisi formulir, melihat preview langsung, mengatur bagian CV, mengunggah foto secara opsional, lalu mengekspor hasilnya.

### Keputusan produk yang sudah dikunci

| Topik | Keputusan |
|---|---|
| Stack | Next.js 14 App Router + TypeScript + static export |
| Backend | Tidak ada backend aplikasi; seluruh data CV diproses di browser |
| Penyimpanan | IndexedDB (draft + blob foto) |
| Reorder section/item | **Tidak dikerjakan** pada versi ini |
| Template | Dua template: **ATS Classic** (default) dan **Minimal** |
| Export PDF | Opsi **B**: browser print dialog (`window.print()`), bukan jsPDF/html2canvas |
| Watermark preview | Terlihat samar, berulang, teks `Create by github.com/yutisio12` |
| Watermark PDF | Teks putih tersembunyi di layer teks PDF, berisi brand + ID dokumen + timestamp |
| Import | Modal preview dokumen + sample JSON sebelum draft diganti |
| Verifikasi | Cloudflare Turnstile mengunci Import/Export JSON/Export PDF |
| Bahasa UI | Bahasa Indonesia |
| Tema aplikasi | Monokai Sublime |
| Font CV | Arial, Calibri, Helvetica, Helvetica Neue, Times New Roman, Aptos |

### Batasan watermark yang harus dipahami

Aplikasi ini 100% client-side. Karena itu:

- Watermark **tidak memiliki tombol hapus** di aplikasi.
- Watermark preview terlihat agar screenshot tidak bersih.
- Watermark PDF tidak terlihat secara visual, tetapi tetap ada di layer teks PDF dan dapat diidentifikasi.
- Watermark **bukan DRM dan bukan tamper-proof**. Pengguna teknis tetap dapat mengedit atau menghapusnya dengan tools PDF.
- Karena tidak ada akun, watermark hanya mengidentifikasi **dokumen/export**, bukan identitas pengguna.
- Jika suatu saat dibutuhkan watermark yang benar-benar tidak bisa dihapus, diperlukan server-side PDF signing/DRM. Itu bertentangan dengan prinsip 100% client-side dan berada di luar cakupan.

---

## 2. Prinsip Wajib

1. **Client-side only.** Tidak ada API, database server, autentikasi, upload server, atau endpoint yang menerima data CV.
2. **Static hosting.** Hasil build berupa aset statis yang dapat di-deploy ke Cloudflare Pages, Netlify, GitHub Pages, atau hosting statis lain.
3. **Privasi.** Tidak ada analytics, telemetry, tracking pixel, remote font, atau pengiriman isi CV/foto ke pihak ketiga.
4. **Pengecualian Turnstile.** Cloudflare Turnstile memuat script dari Cloudflare dan hanya mengirim token verifikasi, bukan isi CV. Fakta ini harus dijelaskan di README.
5. **ATS-first.** Layout satu kolom, urutan baca linear, heading standar, kontras baik, link bermakna, dan tidak mengandalkan tabel/ikon untuk informasi penting.
6. **Jujur pada pengguna.** Jangan mengklaim data tersimpan bila gagal, jangan menampilkan tombol palsu, dan jangan mengklaim watermark tidak bisa dihapus.
7. **Aman terhadap input tidak tepercaya.** HTML dari import/editor harus disanitasi sebelum masuk preview, disimpan, atau diekspor.
8. **Aksesibel.** Label terlihat, toolbar punya accessible name, focus state jelas, dapat digunakan dengan keyboard dan layar sentuh.

---

## 3. Stack dan Dependency

### Runtime

- **Next.js 14.2.x** (App Router, `src/`, `output: 'export'`)
- **React 18** + **TypeScript**
- **Tailwind CSS 3.4** + shadcn/ui + `tailwindcss-animate`
- **Tiptap 3** (StarterKit, Link, Underline)
- **idb 8** untuk IndexedDB
- **DOMPurify 3** untuk sanitasi HTML
- **Zod 4** untuk validasi schema import
- **uuid** untuk ID stabil
- **lucide-react** untuk ikon
- **sonner** untuk toast

### Dependency yang dihapus pada P1

- `html2canvas`
- `jspdf`

Keduanya sudah dihapus setelah export PDF berpindah ke `window.print()`.

### Aset lokal

- Font UI Geist dibundel lokal melalui `next/font/local`.
- Font CV memakai font sistem pengguna (Arial, Calibri, Helvetica, Times New Roman, Aptos).
- Tidak ada CDN untuk editor, font, gambar, ikon, atau library ekspor.
- Satu-satunya request eksternal adalah script Turnstile (Cloudflare).

---

## 4. Arsitektur dan Struktur Kode

### Alur state

```
Form / Editor / Photo
        |
        v
ResumeContext (useReducer)
        |
        +--> Live preview (ResumePreview)
        |
        +--> Autosave debounce 800ms --> IndexedDB (drafts)
        |
        +--> Export JSON / Print / Import
```

- `ResumeProvider` memuat draft terakhir saat mount.
- Perubahan memicu autosave dengan debounce.
- Status simpan harus ditampilkan jujur: `idle`, `saving`, `saved`, `error`.
- ID section/item stabil dan tidak boleh memakai index array sebagai identitas.

### Struktur folder

```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    editor/        TiptapEditor, TiptapWrapper
    form/          FormSections, PhotoUpload, ResumeSettings
    layout/        AppShell, MobileTabs
    preview/       ResumePreview, PreviewPhoto, ResumeWatermark
    shared/        ExportPdfButton, HeaderActions, SaveStatus,
                   HomeTurnstileWrapper, TurnstileWidget
    ui/            komponen shadcn/ui
  lib/
    constants/     defaults.ts, fonts.ts
    models/        types.ts, schema.ts
    storage/       db.ts
    utils/         sanitize.ts, import.ts, cn.ts
    watermark.ts   brand + fingerprint dokumen
  store/
    resume-context.tsx
  styles/
    monokai.css
    print.css
public/
  _headers
  sample-resume.json
functions/
  verify-turnstile.ts       (Cloudflare Pages Function)
__tests__/                  unit test (Vitest)
e2e/                        end-to-end test (Playwright)
playwright.config.ts        konfigurasi Playwright
```

Renderer ATS Classic dan Minimal saat ini berada di `ResumePreview` melalui kelas dan kondisi template, bukan folder renderer terpisah.

### Batas tanggung jawab

- `store` mengelola state, autosave, dan status simpan.
- `components` menangani UI, editor, form, preview, dan dialog.
- `lib/models` berisi tipe dan schema validasi.
- `lib/storage` hanya berisi bridge IndexedDB.
- `lib/utils` berisi sanitasi, validasi URL, import, dan helper.
- `ResumePreview` memilih tampilan template berdasarkan `settings.template`.

---

## 5. Model Data

### Tipe utama

- `ResumeDocument`
  - `schemaVersion`
  - `id`
  - `metadata.createdAt`, `metadata.updatedAt`
  - `personalInfo`
  - `summary` (`RichTextContent`)
  - `sections[]`
  - `settings`
- `PersonalInfo`
  - `fullName`, `headline`, `location`, `phone`, `email`
  - `linkedin`, `github`, `website`
  - `photoId`, `showPhoto`
- `ResumeSection`
  - `id`, `type`, `title`, `visible`, `order`, `items[]`
- `SectionItem`
  - field fleksibel untuk experience, education, projects,
    certifications, languages, dan skills
- `ResumeSettings`
  - `template`: `ats-classic` | `minimal`
  - `showPhoto`
  - `fontFamily`

### Aturan data

- `schemaVersion` saat ini `1`.
- Semua section dan item memakai UUID stabil.
- HTML disimpan sebagai `{ html, text }`.
- HTML harus lolos allowlist sanitasi.
- Foto disimpan sebagai blob di IndexedDB, bukan base64 di localStorage.
- Export JSON **tidak menyertakan blob foto**. `photoId` boleh ada, tetapi perangkat tujuan tidak memiliki blob-nya.
- Saat import, `photoId` harus dihapus dan `showPhoto` di-set `false`, dengan peringatan ke pengguna.
- Template atau font yang tidak dikenal saat import harus fallback ke default.

### Bentuk JSON backup

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
  "summary": { "html": "<p>Ringkasan...</p>", "text": "Ringkasan..." },
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

Sample lengkap akan tersedia di `public/sample-resume.json` dan dapat diunduh dari modal import.

---

## 6. Fitur

### 6.1 Informasi pribadi

- Nama lengkap, headline, lokasi, telepon, email.
- LinkedIn, GitHub, website.
- Foto profil opsional.
- Preview harus menampilkan LinkedIn, GitHub, dan website sebagai link yang bermakna.
- Form desktop dan mobile harus memiliki field yang sama.

### 6.2 Ringkasan profesional

- Rich-text multiline.
- Mendukung bold, italic, underline, strike, bullet list, numbered list, link.

### 6.3 Pengalaman kerja

- Banyak item.
- Posisi, perusahaan, lokasi, tanggal mulai/selesai.
- Checkbox “Masih bekerja di sini”.
- Deskripsi/pencapaian rich-text.

### 6.4 Pendidikan

- Banyak item.
- Institusi, gelar/jurusan, lokasi, periode.
- Nilai/IPK opsional.
- Catatan/aktivitas rich-text opsional.

### 6.5 Keahlian

- Rich-text atau daftar skill.
- Tanpa rating bintang, grafik, atau visual yang tidak diperlukan ATS.

### 6.6 Proyek

- Nama proyek, link opsional, periode opsional, deskripsi rich-text.

### 6.7 Sertifikasi

- Nama, penerbit, tanggal opsional, link kredensial opsional, deskripsi opsional.

### 6.8 Bahasa

- Nama bahasa dan tingkat kemampuan sebagai teks sederhana.
- Tanpa grafik/rating.

### 6.9 Section opsional

- Mekanisme extensible untuk Awards, Volunteer, Publications, Courses, References.
- Tidak wajib ditampilkan pada template.
- Implementasi penuh dapat menyusul setelah P1.

### 6.10 Reorder

- **Tidak dikerjakan.** Tidak ada drag-and-drop, tombol naik/turun, atau ikon grip palsu.
- Urutan mengikuti field `order` yang tersimpan.
- Ikon `GripVertical` sudah dihapus pada P0.

### 6.11 Template

- **ATS Classic** (default): satu kolom, tanpa foto default, heading standar, bullet sederhana.
- **Minimal**: satu kolom, lebih lapang, tetap mudah diparsing.
- Selector template tersedia di desktop dan mobile.
- Preview dan print harus menghasilkan alur baca yang sama.
- `settings.template` wajib benar-benar memengaruhi renderer.

### 6.12 Foto

- Upload JPG/PNG/WebP, validasi MIME dan ukuran maksimal 2 MB.
- Resize/compress di browser (center-crop persegi, sisi maksimal 400px, JPEG kualitas 0.85).
- Simpan blob di IndexedDB.
- Preview sebelum simpan dan crop sederhana sudah tersedia.
- Tampilkan/sembunyikan, ganti, dan hapus.
- Foto default off pada ATS Classic.
- Blob lama harus dihapus saat foto diganti.
- Reset harus menghapus draft dan seluruh blob foto.

### 6.13 Import JSON

Alur final:

1. Klik **Import**.
2. Cek Turnstile; jika belum terverifikasi, tampilkan pesan dan hentikan.
3. Buka modal **Import Resume**.
4. Modal menjelaskan format file dan menyediakan tombol **Unduh contoh JSON**.
5. Pengguna memilih file.
6. Validasi:
   - ukuran maksimal 2 MB;
   - JSON valid;
   - schema Zod;
   - `schemaVersion` dikenal;
   - sanitasi seluruh HTML;
   - validasi URL;
   - fallback template/font.
7. Tampilkan preview read-only dokumen yang akan diimport.
8. Tampilkan ringkasan: nama, headline, jumlah section, font, template.
9. Tampilkan peringatan foto tidak ikut serta `photoId` dihapus.
10. Tombol **Batal** / **Ganti draft**.
11. Draft aktif hanya diganti setelah konfirmasi.
12. Import gagal tidak boleh mengubah draft aktif.

Sample import:

- File: `public/sample-resume.json`
- Berisi data dummy lengkap dan jelas sebagai contoh.
- Tidak otomatis dimasukkan ke draft.
- Pengguna dapat mengunduh, mempelajari struktur, lalu mengimportnya.
- Data dummy tidak boleh dianggap sebagai data pengguna.

### 6.14 Export JSON

- Mengunduh seluruh `ResumeDocument` sebagai file JSON.
- HTML disanitasi sebelum diekspor.
- Foto tidak disertakan.
- Tetap dicek Turnstile.

### 6.15 Export PDF / Print

- Tombol **Export PDF** memanggil `window.print()`.
- Pengguna memilih “Save as PDF” di dialog browser.
- `print.css` hanya menampilkan CV, bukan form/header/tab/tombol.
- Ukuran A4, margin wajar, warna aman cetak.
- Heading tidak terpisah dari isi; item pengalaman/pendidikan tidak terpotong.
- Print dari mobile harus tetap mencetak preview desktop yang benar.
- UI harus menjelaskan bahwa hasil akhir dapat berbeda tergantung browser/printer.
- `html2canvas` dan `jsPDF` tidak dipakai lagi.

### 6.16 Watermark

**Preview:**

- Watermark terlihat samar dan berulang diagonal.
- Teks: `Create by github.com/yutisio12`.
- `pointer-events: none`, `aria-hidden`, tidak bisa dipilih.
- Tidak ada tombol untuk mematikan.
- Berfungsi sebagai penanda visual agar screenshot tidak bersih.

**PDF hasil print:**

- Watermark preview disembunyikan di print.
- Watermark print berupa teks putih 1px, `position: fixed`, berisi:
  `Create by github.com/yutisio12 | doc:<id> | <timestamp>`
- Tidak terlihat secara visual di kertas/PDF.
- Tetap ada di layer teks PDF dan dapat diidentifikasi lewat ekstraksi teks.
- Tidak disertakan pada preview import agar preview tetap bersih.
- Tidak ada metadata PDF khusus karena export memakai print dialog.
- **Bukan DRM.** Pengguna teknis dapat menghapus watermark dengan tools PDF.
- Tidak boleh memuat nama, email, telepon, atau data pribadi lain.

### 6.17 Turnstile

- Gate di homepage sebelum aplikasi dapat digunakan.
- Import, Export JSON, dan Export PDF tetap dicek.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` aman di client.
- `TURNSTILE_SECRET_KEY` hanya di environment Cloudflare Pages.
- `NEXT_PUBLIC_TURNSTILE_DISABLED=true` hanya untuk development.
- Verifikasi disimpan di `sessionStorage` dengan key `turnstile_verified`.
- Hanya token yang dikirim ke `/verify-turnstile`, bukan data CV.

### 6.18 Tema dan tampilan

- Monokai Sublime untuk UI aplikasi.
- Preview CV tetap putih dengan teks hitam agar siap cetak.
- Perubahan tema aplikasi dipusatkan di `src/styles/monokai.css`.
- Font CV dapat dipilih dan diterapkan pada preview.
- Layout desktop dua panel; mobile memakai tab Form/Preview.
- Toolbar tidak boleh overflow horizontal.

---

## 7. Keamanan dan Penanganan Error

### Sanitasi

- Allowlist tag: paragraf, strong/b, em/i, u, s/strike, a, ul, ol, li, h1-h3, span, br.
- Allowlist atribut: `href`, `target`, `rel`, `class`.
- URL hanya `http`, `https`, `mailto`, `tel`.
- Tolak `javascript:`, `data:` berbahaya, event handler, `script`, `iframe`, `embed`, dan konten aktif.
- Sanitasi diterapkan:
  - saat editor berubah;
  - saat import;
  - sebelum preview;
  - sebelum export.
- Link eksternal memakai `rel="noopener noreferrer"`.

### Validasi import

- Schema Zod lengkap.
- Batas ukuran file.
- Cek versi schema.
- Pesan error ramah, tidak mencetak isi CV ke console.
- Import gagal tidak menimpa draft.

### IndexedDB

- Tangani browser tanpa IndexedDB.
- Tangani quota penuh/gagal tulis.
- Tampilkan status gagal, jangan mengklaim tersimpan.
- `beforeunload` jika ada perubahan belum tersimpan.

### Error lain

- Format foto tidak didukung, terlalu besar, atau gagal decode.
- Editor gagal diinisialisasi: tampilkan fallback, jangan crash seluruh aplikasi.
- Link berbahaya.
- Satu section invalid tidak boleh merusak seluruh dokumen.

### Logging

- Jangan mencetak isi CV, email, telepon, atau blob foto ke console/log.

---

## 8. UX dan Aksesibilitas

- Label terlihat, bukan hanya placeholder.
- Tombol tambah/hapus benar-benar berfungsi.
- Konfirmasi sebelum menghapus item/section yang berisi data.
- Empty state menjelaskan langkah awal.
- Tidak ada data contoh otomatis di draft pengguna.
- Section yang dibuka/ditutup tidak kehilangan perubahan.
- Status simpan terlihat: menyimpan, tersimpan, gagal.
- `prefers-reduced-motion` dihormati.
- Focus ring jelas.
- Toolbar editor punya `aria-label` dan tooltip.
- Layout dapat digunakan di desktop dan mobile.
- Icon-only button wajib punya `aria-label` dan `title`.
- Reorder tidak ditampilkan sebagai fitur palsu.

---

## 9. Roadmap P0 — Keamanan, Import, dan Status Simpan

Status: **selesai**.

P0 harus selesai dan diverifikasi sebelum P1.

### P0.1 Perbaiki test runner

- [x] Ganti environment Vitest dari `jsdom` ke `happy-dom` atau pin versi yang kompatibel.
- [x] Pastikan `npm run test:run` benar-benar menjalankan test.
- [x] Pertahankan 3 test yang sudah ada dan tambah test baru.
- [x] `npm run build` dan `npm run lint` harus lulus.

### P0.2 Sanitasi menyeluruh

- [x] Perluas `src/lib/utils/sanitize.ts` dengan validasi URL.
- [x] Terapkan sanitasi pada preview, import, dan export.
- [x] Validasi `href` proyek dan link kredensial.
- [x] Konfigurasi Link Tiptap agar hanya menerima protokol aman.
- [x] Test payload XSS: `<script>`, `onerror`, `javascript:`, `iframe`.
- [x] Pastikan `sanitizeHtml` tidak lagi hanya dipakai di test.

### P0.3 Import aman + sample + preview

- [x] Buat `src/lib/models/schema.ts` dengan Zod.
- [x] Batasi ukuran file 2 MB.
- [x] Cek `schemaVersion`.
- [x] Buat modal import dengan preview (diimplementasikan di `HeaderActions`).
- [x] Gate Turnstile sebelum file picker.
- [x] Refactor `ResumePreview` agar menerima `document?: ResumeDocument` dan `showWatermark?: boolean`.
- [x] Tampilkan preview dokumen import.
- [x] Tambah tombol unduh `/sample-resume.json`.
- [x] Buat `public/sample-resume.json` berisi data dummy lengkap.
- [x] Hapus `photoId`, set `showPhoto=false` saat import, tampilkan peringatan.
- [x] Fallback template/font tidak dikenal.
- [x] Import invalid tidak mengubah draft.
- [x] Konfirmasi sebelum mengganti draft.

### P0.4 Status simpan dan error

- [x] Tambah `saveStatus` dan `saveError` pada context.
- [x] Set `isLoading=false` setelah restore selesai.
- [x] Tampilkan indikator menyimpan/tersimpan/gagal di header.
- [x] Tangani IndexedDB tidak didukung dan quota penuh.
- [x] Tambah `beforeunload` jika belum tersimpan.
- [x] Hapus `catch {}` yang menelan error.

### P0.5 Perbaikan interaksi

- [x] Konfirmasi hapus item berisi data.
- [x] Hapus ikon `GripVertical`.
- [x] Pastikan reset menghapus draft dan blob foto.
- [x] Gate Turnstile sebelum file picker dibuka.

### Kriteria selesai P0

- Build, lint, dan test lulus.
- Import invalid/XSS tidak mengubah draft dan tidak mengeksekusi script.
- Preview import muncul sebelum konfirmasi.
- Sample JSON dapat diunduh.
- Status simpan jujur.
- Tidak ada ikon reorder palsu.

---

## 10. Roadmap P1 — Watermark dan Kelengkapan Fitur

Status: **diimplementasikan dan diverifikasi**. Print desktop/mobile diuji dengan Chrome headless: hanya CV yang tercetak, watermark PDF dapat diekstrak.

### P1.1 Watermark

- [x] Buat `src/lib/watermark.ts`:
  - teks brand;
  - helper metadata dokumen (`id`, timestamp).
- [x] Buat `ResumeWatermark` untuk preview.
- [x] Style watermark di `monokai.css` (screen) dan `print.css` (print).
- [x] Watermark preview selalu tampil, tanpa toggle.
- [x] Watermark print tersembunyi secara visual, berisi brand + ID + timestamp.
- [x] Pastikan watermark tidak memuat data pribadi.
- [x] Tambahkan catatan batasan watermark di README.

### P1.2 Export PDF/Print

- [x] Ganti isi `ExportPdfButton` menjadi `window.print()`.
- [x] Hapus `html2canvas` dan `jsPDF` dari dependency.
- [x] Perbaiki `print.css`:
  - hanya CV yang tercetak;
  - A4, margin aman;
  - header/form/tab/status hilang;
  - mobile tetap mencetak `#resume-preview`;
  - watermark preview disembunyikan, watermark print ditampilkan.
- [x] Tetap cek Turnstile.
- [x] Uji print desktop dan mobile viewport (diverifikasi dengan Chrome headless).

### P1.3 Field dan kontak

- [x] Pendidikan: lokasi + IPK.
- [x] Proyek: periode.
- [x] Sertifikasi: link kredensial + deskripsi.
- [x] Preview menampilkan LinkedIn, GitHub, website.
- [x] Form mobile lengkap: lokasi, LinkedIn, GitHub, website.
- [x] Preview proyek memakai link yang tervalidasi.

### P1.4 Template

- [x] Buat renderer **ATS Classic**.
- [x] Buat renderer **Minimal**.
- [x] Selector template di desktop dan mobile.
- [x] `settings.template` benar-benar memengaruhi preview/print.
- [x] ATS Classic default dan foto off.

### P1.5 Tiptap

- [x] Perbaiki ikon bullet/undo/redo yang rusak.
- [x] Tambah link dialog (tambah/edit/hapus).
- [x] Tambah mode single-line.
- [x] Tambah `aria-label`, tooltip, focus state.
- [x] Pastikan perubahan konten tidak merusak selection/kursor.
- [x] Sanitasi konten saat update.

### P1.6 Foto

- [x] Crop/preview sebelum simpan.
- [x] Hapus blob lama saat foto diganti.
- [x] Reset menghapus seluruh foto di IndexedDB.
- [x] Tampilkan catatan netral tentang kebutuhan foto yang berbeda per negara/industri.

### P1.7 Dokumentasi

- [x] Update README dengan fitur final, batasan, dan deploy.
- [x] Catat bahwa reorder dan DOCX tidak tersedia.
- [x] Catat batasan watermark.
- [x] Catat sample import.
- [x] Catat deviasi dari rencana awal Rust/Leptos.

### Kriteria selesai P1

- Watermark terlihat di preview.
- Watermark PDF tidak terlihat tetapi dapat diidentifikasi.
- Export PDF via print dialog, bukan raster jsPDF.
- Dua template berfungsi.
- Semua field dan kontak tampil di preview.
- Toolbar editor lengkap dan aksesibel.
- Foto dapat di-crop, diganti, dan dihapus dengan bersih.

---

## 11. Verifikasi

### Perintah

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test:run
npm run test:e2e:install
npm run test:e2e
```

Status verifikasi saat dokumen ini diperbarui:

- `npm run build` lulus, termasuk lint dan type-check.
- `npm run test:run` lulus: 5 file, 22 test.
- `npm run test:e2e` lulus: 3 test Playwright (form/preview/watermark, import sample, mode print).
- `npm run lint` lulus.
- Export PDF memakai `window.print()`; `html2canvas` dan `jsPDF` sudah dihapus.
- Print desktop dan mobile diuji dengan Chrome headless; PDF hanya berisi CV dan watermark teks dapat diekstrak.
- Import valid/invalid, batal import, penerapan sample, upload/persistensi foto, switch template, reset, watermark, dan print CV terisi sudah diuji dengan Playwright + Chrome headless tanpa console error.
- Turnstile diuji dengan test key resmi Cloudflare dan endpoint siteverify nyata: widget lolos, /verify-turnstile mengembalikan success: true, aplikasi terbuka, dan tidak ada error console. Site key/secret produksi tetap perlu smoke test setelah deploy.
- Simulasi IndexedDB gagal/penuh diuji dengan memaksa IDBObjectStore.put melempar QuotaExceededError: status gagal tampil dan pulih setelah penyimpanan normal.
- Peringatan tutup tab dan keyboard navigation sudah diuji otomatis dengan Playwright.

### Checklist regresi

- [x] Import sample JSON valid (Playwright).
- [x] Import JSON invalid (Playwright).
- [x] Import JSON dengan `<script>`, `onerror`, dan `javascript:` (unit test sanitasi).
- [x] Batal import: draft lama tetap utuh (Playwright).
- [x] Import mengganti draft menghapus blob foto lama (Playwright).
- [x] Gate Turnstile menahan aplikasi sampai verifikasi berhasil (Playwright, test key resmi).
- [x] Reload halaman: draft dan foto kembali (Playwright).
- [x] Ganti foto menghapus blob lama, menyisakan satu foto di IndexedDB (Playwright).
- [x] Reset menghapus draft dan blob foto (Playwright).
- [x] Simulasi IndexedDB gagal/penuh: status error tampil (Playwright).
- [x] Tutup tab saat belum tersimpan: ada peringatan (Playwright menerima dialog `beforeunload`).
- [x] Preview watermark terlihat (Playwright).
- [x] Print desktop: hanya CV yang tercetak (Chrome headless).
- [x] Print mobile: hanya CV yang tercetak (Chrome headless).
- [x] PDF hasil print: watermark tidak terlihat, tetapi teks watermark dapat diekstrak (pypdf).
- [x] PDF CV terisi: satu halaman, hanya konten CV, tanpa UI aplikasi (Playwright + pypdf).
- [x] Tidak ada request data CV keluar selain token Turnstile (audit request Playwright: hanya asset lokal dan script Turnstile).
- [x] Tab order, focus ring, dan label (Playwright: 24 elemen berurutan, outline 2px, label/aria-label tersedia); uji screen reader manual belum dilakukan.

---

## 12. Acceptance Criteria (Revisi)

1. Aplikasi berjalan lokal dan dapat dibuild menjadi static assets.
2. Tidak ada backend/API yang menerima data CV.
3. Pengguna dapat mengisi personal info, summary, experience, education, skills, projects, certifications, dan languages.
4. Field rich-text mendukung minimal bold, italic, underline, strike, hyperlink, bullet list, numbered list, undo/redo, dan clear formatting.
5. Pengguna dapat menambah, mengubah, dan menghapus section/item tanpa kehilangan data. **Reorder tidak termasuk.**
6. Live preview menampilkan data yang sama dengan form.
7. Pengguna dapat memilih **ATS Classic** atau **Minimal**; ATS Classic satu kolom dan tanpa foto default.
8. Foto dapat diunggah, dipreview, di-crop, disimpan lokal, ditampilkan/disembunyikan, diganti, dan dihapus.
9. Draft tersimpan otomatis dan dipulihkan setelah reload.
10. Status simpan dan error ditampilkan jujur.
11. Import JSON tervalidasi, disanitasi, menampilkan preview, dan tidak menghapus draft saat gagal.
12. Sample JSON tersedia untuk diunduh sebelum import.
13. Export JSON berfungsi dan tidak menyertakan blob foto.
14. Export PDF membuka print dialog A4; hanya CV yang tercetak.
15. HTML dari import/editor disanitasi; script dan link berbahaya tidak dijalankan.
16. Watermark terlihat di preview dan tersembunyi di PDF, dengan batasan yang dijelaskan.
17. Tidak ada tombol palsu, fitur mockup, atau data CV yang terkirim ke layanan eksternal.
18. README berisi command, deploy, sample import, batasan, dan penjelasan watermark.

---

## 13. Di Luar Cakupan / Batasan Diketahui

- **Reorder section/item**: sengaja tidak dikerjakan.
- **Export DOCX**: tidak tersedia.
- **Akun, login, cloud sync**: tidak ada.
- **Watermark tamper-proof/DRM**: tidak mungkin dengan arsitektur client-side.
- **Identifikasi pengguna dari watermark**: tidak ada akun, jadi watermark hanya mengidentifikasi dokumen/export.
- **Foto di JSON**: blob tidak ikut; import di perangkat lain tidak membawa foto.
- **Ketersediaan font**: Calibri/Aptos bergantung pada font yang terpasang di perangkat; browser akan fallback.
- **Hasil PDF**: dapat berbeda sedikit tergantung browser, printer, dan pengaturan margin.
- **Turnstile**: memuat script eksternal dari Cloudflare; hanya token yang dikirim, bukan data CV. Karena aplikasi static, gate Turnstile adalah penghalang UX/spam, bukan access control; pengguna teknis dapat memodifikasi `sessionStorage` atau bundle.
- **Watermark**: best-effort, bukan DRM. Teks PDF dapat dihapus dengan tools pengolah PDF.
- **Uji print**: sudah diverifikasi dengan Chrome headless; hasil printer nyata tetap dapat berbeda.

---

## 14. Status Implementasi Saat Ini

| Area | Status | Catatan |
|---|---|---|
| Next.js static export | Selesai | `npm run build` lulus |
| Layout desktop/mobile | Selesai | Dua panel + tab mobile + salinan print |
| Model data TypeScript | Selesai | `schemaVersion`, ID stabil, field lengkap |
| Form semua section | Selesai | Termasuk lokasi/IPK, periode, link kredensial |
| Tiptap | Selesai | Link dialog, single-line, ikon, aria, sanitasi blur |
| Live preview | Selesai | Kontak, field baru, dua template |
| Template ganda | Selesai | ATS Classic + Minimal |
| Foto | Selesai | Center-crop, preview sebelum simpan, blob lama dibersihkan |
| Autosave/restore | Selesai | Status menyimpan/tersimpan/gagal + beforeunload |
| Import JSON | Selesai | Zod, 2 MB, schema version, preview, sample |
| Export JSON | Selesai | Sanitasi, tanpa blob foto |
| Export PDF | Selesai | `window.print()`, A4, hanya CV |
| Sanitasi | Selesai | DOMPurify + validasi URL di preview/import/export |
| Watermark | Selesai | Preview terlihat, PDF tersembunyi |
| Turnstile | Selesai | Gate homepage + export/import |
| Reorder | Tidak dikerjakan | Sengaja dihapus dari scope |
| Test | Selesai | 5 file/22 test unit + 3 test E2E Playwright |
| README | Selesai | Fitur final, batasan, deploy |

---

## 15. Referensi Teknis

- Next.js static exports: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Next.js App Router: https://nextjs.org/docs/app
- Tiptap: https://tiptap.dev/docs
- Tiptap Link: https://tiptap.dev/docs/editor/extensions/marks/link
- IndexedDB dengan idb: https://github.com/jakearchibald/idb
- DOMPurify: https://github.com/cure53/DOMPurify
- Zod: https://zod.dev
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/
