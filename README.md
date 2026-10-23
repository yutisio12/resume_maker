# Resume Maker - Next.js 14 + TypeScript

Aplikasi pembuat CV/resume client-side 100%. Data disimpan lokal di IndexedDB, tanpa backend, tanpa kirim data ke server.

## Fitur
- Form multi-section (Personal, Summary, Experience, Education, Skills, Projects, Certifications, Languages)
- Rich text editor (Tiptap) untuk deskripsi/summary
- Live preview A4
- 2 template: ATS Classic (default, tanpa foto) & Minimal
- Upload foto (resize/compress), simpan lokal
- Autosave ke IndexedDB
- Export/Import JSON (dengan validasi)
- Export PDF via html2canvas + jsPDF
- Responsive (desktop 2-panel, mobile tab)

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Tiptap
- IndexedDB (idb)
- html2canvas + jsPDF
- DOMPurify + Zod

## Development
\\\ash
npm install
npm run dev
\\\

## Build (Static Export)
\\\ash
npm run build
\\\
Hasil build ada di folder \out/\. Bisa langsung deploy ke static hosting (GitHub Pages, Cloudflare Pages, Netlify).

## Privasi
Semua proses di browser. Tidak ada API, tidak ada analytics, tidak ada pengiriman data.
