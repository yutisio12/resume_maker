# PLAN.md — Client-Side Resume Maker dengan Rust

> **Instruksi untuk AI coding agent / vibecoding tool:** Baca dokumen ini sampai selesai, lalu implementasikan aplikasinya di repository aktif. Jangan berhenti pada proposal atau pseudocode. Jika repository masih kosong, bootstrap project dari awal. Jika sudah ada kode, pahami struktur dan pertahankan bagian yang masih relevan. Kerjakan secara bertahap, jalankan build/check/test, perbaiki error yang ditemukan, dan perbarui checklist di bagian akhir.

## 1. Tujuan Produk

Bangun aplikasi web **Resume Maker** yang membantu pengguna membuat CV/resume profesional dan ramah ATS (Applicant Tracking System). Pengguna mengisi data pada formulir, melihat preview resume secara langsung, mengatur susunan bagian, mengunggah foto secara opsional, lalu mengekspor hasilnya.

### Prinsip wajib

1. **100% pemrosesan data pengguna dilakukan di browser. Tidak ada backend aplikasi.** Jangan membuat API server, database server, autentikasi, upload server, atau endpoint yang mengirimkan data CV.
2. Gunakan **Rust sebagai bahasa utama aplikasi**, dikompilasi ke WebAssembly (WASM) dan dijalankan di browser.
3. Gunakan JavaScript/TypeScript hanya untuk integrasi browser yang memang lebih cocok ditangani library JavaScript, terutama rich-text editor dan API browser. Seluruh kode tetap berjalan di perangkat pengguna.
4. Jangan mengirim isi CV, foto, file ekspor, atau data pribadi ke pihak ketiga. Jangan menambahkan analytics, telemetry, tracking pixel, atau remote font.
5. Aplikasi harus bisa di-build menjadi aset statis dan di-deploy ke static hosting. Setelah aset aplikasi terunduh, proses edit, autosave, preview, import, serta ekspor tidak membutuhkan backend.
6. Jangan menambahkan fitur yang tidak dibutuhkan jika berpotensi mengurangi privasi, kualitas ATS, atau keandalan implementasi.

## 2. Stack dan Arsitektur

Gunakan stack berikut kecuali terdapat incompatibility yang benar-benar dibuktikan saat build:

- **Rust + Leptos CSR** untuk UI dan state aplikasi.
- **WebAssembly target** `wasm32-unknown-unknown`.
- **Trunk** sebagai tooling build/serve untuk aplikasi Leptos CSR.
- **Tiptap** sebagai rich-text editor di browser, dibundel secara lokal melalui npm/Vite. Jangan memuat editor dari CDN saat runtime.
- `serde` dan `serde_json` untuk model data dan backup JSON.
- **IndexedDB** untuk penyimpanan otomatis lokal di browser, termasuk foto. Buat wrapper browser-side seperlunya; jangan mengirim data ke server.
- Gunakan CSS responsif biasa atau styling system yang kompatibel dengan Leptos. Utamakan styling sederhana, konsisten, dan mudah dipelihara.
- PDF tahap MVP dibuat melalui **browser print dialog** (`window.print()`) dengan print stylesheet yang khusus untuk resume. Ini tetap client-side dan menghindari ketergantungan pada layanan konversi PDF online.
- `.docx` export boleh ditambahkan setelah fungsi inti stabil; jika ditambahkan, file harus dibuat secara lokal di browser.

### Batas arsitektur

- Rust mengelola model CV, validasi, urutan section, pilihan template, state aplikasi, dan interaksi utama.
- Rich-text editor menggunakan Tiptap sebagai komponen browser yang dibundel lokal. Buat jembatan terisolasi antara Leptos/WASM dan editor, bukan menyebarkan kode JavaScript di seluruh aplikasi.
- Gunakan satu kontrak editor yang jelas: inisialisasi berdasarkan ID field, muat konten HTML awal, kirim event saat konten berubah, dan hancurkan instance saat field dilepas. Hindari inisialisasi editor ganda serta jangan mengganti konten setiap kali state berubah jika hal itu mengganggu posisi kursor.
- Jika perlu build JavaScript terpisah, dokumentasikan satu urutan command yang benar untuk development dan production. Build Rust dan bundle editor harus bisa dijalankan dari repository dengan command yang jelas.
- Seluruh dependensi runtime harus menjadi aset lokal dalam hasil build. Jangan menggunakan CDN untuk editor, font, gambar, ikon, atau library ekspor.

## 3. Pengalaman Pengguna dan Layout

Buat desain yang modern, bersih, profesional, dan tidak terasa seperti dashboard admin generik.

### Layout desktop

- Header atas: nama aplikasi, status penyimpanan (misalnya “Tersimpan di perangkat ini”), tombol **Preview**, **Import**, **Export**, dan menu reset.
- Panel kiri: form editor CV dengan section yang bisa dibuka/tutup.
- Area kanan: preview resume ukuran kertas **A4**, dengan update langsung setelah data diubah.
- Preview harus menampilkan dokumen yang mudah dibaca, bukan kartu-kartu UI di dalam halaman CV.
- Berikan indikator bagian yang belum diisi dan tombol tambah/hapus section/item.

### Layout mobile

- Panel form dan preview berubah menjadi tab atau segmented control, supaya pengguna tidak harus menyempitkan halaman A4.
- Toolbar tidak boleh overflow secara horizontal tanpa kontrol yang jelas.
- Semua fitur inti dapat digunakan dengan keyboard dan layar sentuh.

### Bahasa dan isi CV

- Bahasa UI awal: **Bahasa Indonesia**.
- Konten resume tidak diterjemahkan atau ditulis otomatis. Pengguna bebas menulis CV dalam bahasa apa pun.
- Sediakan placeholder/contoh ringan, tetapi jangan pernah memasukkan pengalaman kerja, gelar, atau pencapaian fiktif ke dalam resume pengguna secara otomatis.

## 4. Rich-Text Editor

Semua field teks bebas pada CV harus menggunakan komponen rich-text yang konsisten. Field terstruktur yang memang memerlukan format data khusus (misalnya tanggal, pilihan tanggal, atau input email yang tervalidasi) boleh menggunakan input native dengan label jelas; field teks CV lainnya menggunakan editor rich-text, termasuk field pendek melalui mode single-line.

### Fitur toolbar MVP

- Bold
- Italic
- Underline
- Strikethrough
- Tambah/edit/hapus hyperlink
- Bulleted list
- Numbered list
- Undo / redo
- Clear formatting
- Mode single-line untuk field pendek dan mode multiline untuk ringkasan/deskripsi

Boleh menambahkan warna teks atau ukuran teks sebagai fitur lanjutan, tetapi jangan sampai mendorong desain resume yang sulit diparsing ATS. Jangan mendukung HTML arbitrary, JavaScript, iframe, embed, atau konten aktif.

### Sanitasi dan aksesibilitas

- Simpan konten editor sebagai HTML terkontrol dengan allowlist tag/atribut yang aman.
- Sanitasi konten ketika melakukan import, ketika konten masuk ke preview, dan sebelum diekspor.
- Izinkan tag semantik yang relevan seperti paragraf, bold, italic, underline, strike, anchor, heading sederhana, dan list.
- Tolak atribut event handler (`onclick`, dan sejenisnya), `script`, `iframe`, serta URL berbahaya seperti `javascript:`.
- Link eksternal harus menggunakan protokol aman (`https:`, `http:`, `mailto:`, dan bila diperlukan `tel:`). Tampilkan URL link secara jelas dan pastikan link tetap terbaca saat dicetak.
- Toolbar dapat digunakan memakai keyboard; setiap tombol mempunyai accessible name, focus state, dan tooltip/label yang jelas.
- Jangan merusak selection atau posisi kursor ketika state Leptos diperbarui.

## 5. Data CV yang Didukung

Semua bagian harus opsional, dapat dihapus/ditambahkan jika relevan, dan dapat diubah urutannya. Jangan mewajibkan pengguna mengisi seluruh bagian.

### 5.1 Personal Information / Informasi Pribadi

- Nama lengkap
- Jabatan atau headline profesional
- Kota/domisiIi (alamat lengkap tidak wajib)
- Nomor telepon
- Email
- LinkedIn
- GitHub
- Portfolio/website
- Foto profil (opsional)

Untuk informasi kontak, pengguna dapat memasukkan URL dan mengatur tampilan hyperlink. Validasi email/URL secara wajar tanpa menolak input yang sah karena aturan terlalu ketat.

### 5.2 Professional Summary

- Ringkasan profesional dengan rich-text multiline.

### 5.3 Work Experience / Pengalaman Kerja

Bisa menambah banyak pengalaman. Setiap item memiliki:

- Nama posisi
- Nama perusahaan/organisasi
- Lokasi (opsional)
- Tanggal mulai dan selesai
- Checkbox “Masih bekerja di sini”
- Deskripsi dan pencapaian dengan rich-text multiline, mendukung bullet list dan hyperlink

### 5.4 Education / Pendidikan

Bisa menambah banyak item. Setiap item memiliki:

- Nama institusi
- Gelar/program studi
- Lokasi (opsional)
- Tanggal/periode
- Nilai/IPK (opsional)
- Catatan/aktivitas/deskripsi rich-text (opsional)

### 5.5 Skills / Keahlian

- Field rich-text atau daftar skill yang dapat diatur urutannya.
- Jangan menghasilkan rating bintang, grafik tingkat keahlian, atau visual yang tidak diperlukan ATS.

### 5.6 Projects / Proyek

Setiap item memiliki nama proyek, tautan (opsional), periode (opsional), dan deskripsi/pencapaian rich-text.

### 5.7 Certifications / Sertifikasi

Nama sertifikasi, penerbit, tanggal (opsional), tautan kredensial (opsional), dan deskripsi (opsional).

### 5.8 Languages / Bahasa

Nama bahasa serta keterangan tingkat kemampuan sebagai teks sederhana. Tidak perlu grafik atau rating visual.

### 5.9 Optional Sections

Siapkan mekanisme extensible untuk menambah bagian opsional seperti Awards, Volunteer Experience, Publications, Courses, dan References. Bagian opsional tidak wajib ditampilkan pada template.

## 6. Foto Profil

- Upload foto lokal lewat file picker.
- Terima format gambar umum seperti JPEG, PNG, dan WebP; validasi MIME type dan ukuran file.
- Tampilkan crop/preview sebelum disimpan; berikan opsi untuk mengganti atau menghapus foto.
- Resize/compress foto di browser agar tidak membebani penyimpanan. Simpan blob di IndexedDB, bukan sebagai base64 besar di localStorage.
- Foto **off secara default pada template ATS Classic**. Jika foto diaktifkan, tampilkan kontrol jelas yang memungkinkan pengguna menampilkan atau menyembunyikannya.
- Berikan catatan singkat dan netral bahwa kebutuhan foto berbeda menurut negara, industri, serta lowongan; template ATS tanpa foto tetap menjadi pilihan default.
- Foto tidak boleh dikirim ke server mana pun.

## 7. Template Resume dan Prinsip ATS

Buat setidaknya dua template pada MVP:

1. **ATS Classic** — default, satu kolom, tanpa foto secara default, heading section standar, font mudah dibaca, bullet list sederhana.
2. **Minimal** — tampilan lebih lapang tetapi tetap satu kolom dan mudah diparsing.

Template tambahan boleh dibuat kemudian, tetapi jangan menomorsatukan dekorasi dibanding keterbacaan.

### Persyaratan ATS

- Gunakan urutan baca yang linear dari atas ke bawah.
- Gunakan heading section konvensional: Summary, Work Experience, Education, Skills, Projects, Certifications, dan sebagainya.
- Jangan mengandalkan tabel, multi-column layout, text box, ikon sebagai pengganti label kontak, grafik, atau elemen dekoratif untuk menyampaikan informasi penting.
- Gunakan kontras warna yang baik dan ukuran font yang terbaca.
- Pastikan hyperlink memiliki teks yang bermakna; jangan hanya menampilkan ikon.
- Sediakan opsi foto, tetapi template ATS Classic harus tetap bersih saat foto dimatikan.
- Template preview dan print harus menghasilkan alur baca yang sama.
- Jangan menjanjikan bahwa dokumen “pasti lolos ATS”; aplikasinya hanya mengutamakan struktur yang ramah parsing.

## 8. Preview, Halaman, dan Ekspor

### Live preview

- Preview berubah saat input disunting, section ditambah/dihapus, urutan section diubah, template diganti, atau foto diubah.
- Render konten yang sudah disanitasi; jangan memakai HTML mentah yang tidak dipercaya.
- Sediakan kontrol zoom preview jika mudah, tetapi ukuran dokumen untuk print harus tetap A4.
- Gunakan styling kertas yang jelas di layar dan hilangkan bayangan/background dekoratif ketika mencetak.

### Export PDF / Print

- Tombol **Export PDF** membuka browser print dialog dengan `window.print()`; instruksikan pengguna memilih “Save as PDF”.
- Buat `@media print` stylesheet yang menyembunyikan editor, toolbar, header aplikasi, tombol, status penyimpanan, dan elemen UI non-resume.
- Atur ukuran halaman A4, margin cetak yang wajar, warna teks yang aman dicetak, dan ukuran font yang konsisten.
- Cegah sebisa mungkin heading terpisah dari isi setelahnya, item pengalaman/pendidikan terpotong di tengah halaman, atau link menjadi tidak terbaca. Jangan mengorbankan aliran dokumen demi memaksa semua CV menjadi satu halaman.
- Preview cetak hanya boleh menampilkan CV, bukan form aplikasi.
- Jelaskan dalam UI bahwa hasil akhir dapat berbeda sedikit mengikuti browser/printer settings.

### Backup dan export data

- **Export JSON** untuk backup/edit lagi di perangkat yang sama atau pindah perangkat.
- **Import JSON** dengan validasi schema, batas ukuran file yang masuk akal, sanitasi HTML, dan penanganan error yang ramah pengguna.
- Import yang gagal tidak boleh menghapus data CV yang sedang aktif.
- Berikan opsi **Hapus semua data lokal** dengan dialog konfirmasi.
- `.docx` export merupakan fitur lanjutan setelah MVP stabil, dan harus dibuat di browser tanpa mengupload data. Jika belum sempat dibuat, tulis sebagai batasan yang diketahui dan jangan menampilkan tombol palsu.

## 9. Penyimpanan Lokal dan Privasi

- Autosave ke IndexedDB setelah perubahan dengan debounce untuk mengurangi penulisan berulang.
- Tampilkan status yang jujur: “Menyimpan…”, “Tersimpan di perangkat ini”, atau pesan gagal menyimpan. Jangan mengklaim tersimpan bila operasi gagal.
- Saat halaman dibuka lagi di browser/profil yang sama, pulihkan draft terakhir.
- Tambahkan tombol untuk memulai resume baru dan konfirmasi sebelum menimpa draft aktif.
- Simpan versi schema data sehingga format backup bisa dimigrasikan kelak.
- Tidak perlu akun, login, cookie pelacakan, atau cloud sync.
- Beri penjelasan singkat bahwa data tersimpan di browser/perangkat pengguna dan dapat hilang bila data situs browser dihapus.
- Jangan menyebut data terenkripsi jika implementasi tidak benar-benar mengenkripsi data.
- Pastikan error log tidak mencetak isi CV, email, nomor telepon, atau konten foto.

## 10. Model Data dan Struktur Kode

Buat model Rust yang eksplisit, serializable, dan mudah diperluas. Bentuk final boleh disesuaikan, tetapi minimal harus mencakup:

- `ResumeDocument`: schema version, metadata, personal info, summary, daftar section, pengaturan tampilan, dan status foto.
- `RichTextContent`: representasi HTML terbatas atau struktur konten yang dapat diserialisasi.
- `ExperienceItem`, `EducationItem`, `ProjectItem`, `CertificationItem`, dan tipe item lain yang memang dibutuhkan.
- `ResumeSection`: ID stabil, tipe section, judul, status terlihat, urutan, dan item/isi terkait.
- `ResumeSettings`: template aktif, pilihan foto, ukuran kertas, serta pengaturan tampilan yang aman untuk ATS.

Gunakan ID stabil untuk section dan item supaya fokus input/editor tidak hilang ketika mengurutkan atau mengedit data. Hindari menggunakan indeks array sebagai satu-satunya identitas komponen.

### Struktur modul yang disarankan

Nama folder boleh menyesuaikan konvensi framework, tetapi pisahkan tanggung jawab:

- `app` — root UI dan routing sederhana bila dibutuhkan.
- `components` — input, rich-text editor, toolbar, modal, dialog, dan preview.
- `models` — tipe data resume dan schema backup.
- `state` — perubahan state, autosave coordination, dan section ordering.
- `templates` — renderer dan styling tiap template.
- `storage` — IndexedDB bridge dan pemulihan draft lokal.
- `export` — print/PDF stylesheet dan JSON import/export.
- `utils` — sanitasi/validasi dan helper format tanggal.

Jaga batas tanggung jawab. Jangan membuat satu file besar berisi seluruh aplikasi.

## 11. Kualitas UI dan Detail Interaksi

- Gunakan label yang terlihat; jangan hanya mengandalkan placeholder.
- Tombol tambah/hapus section dan item harus benar-benar berfungsi.
- Tampilkan konfirmasi sebelum menghapus item yang berisi data.
- Sediakan empty state yang menjelaskan langkah awal.
- Jangan menambahkan data contoh ke draft permanen kecuali pengguna memilih “Isi contoh”.
- Form tidak boleh kehilangan perubahan ketika membuka/tutup section.
- Sediakan undo/redo di editor rich-text; undo global untuk seluruh dokumen boleh menjadi fitur lanjutan.
- Buat desain yang konsisten: spacing, font, button states, border, focus ring, empty state, loading/save state, dan error state.
- Hormati `prefers-reduced-motion` dan pastikan aplikasi dapat digunakan tanpa animasi.
- Pastikan layout dapat digunakan pada desktop dan mobile.

## 12. Error Handling dan Keamanan

Tangani paling tidak kasus berikut:

- Browser tidak mendukung WebAssembly atau IndexedDB.
- IndexedDB penuh atau gagal ditulis.
- Format foto tidak didukung, foto terlalu besar, atau decode gambar gagal.
- File JSON invalid, terlalu besar, versi schema tidak dikenal, atau mengandung HTML berbahaya.
- Gagal menginisialisasi rich-text editor.
- Konten link dengan protokol berbahaya.
- Pengguna menutup tab ketika perubahan belum berhasil tersimpan.

Jangan crash seluruh aplikasi hanya karena satu section invalid. Tampilkan pesan yang membantu dan pertahankan data terakhir yang valid. Jangan mengklaim ada jaminan penyimpanan jika browser menolak operasi penyimpanan.

## 13. Tahapan Implementasi

Ikuti urutan ini. Selesaikan dan verifikasi tiap tahap sebelum menumpuk kompleksitas baru.

### Phase 1 — Project bootstrap

- [ ] Periksa environment dan isi repository.
- [ ] Siapkan Leptos CSR, Trunk, dan target WASM.
- [ ] Siapkan bundling lokal Tiptap bila diperlukan.
- [ ] Pastikan halaman dasar berjalan secara lokal.
- [ ] Dokumentasikan command setup, dev, build, dan test.

### Phase 2 — UI shell dan model

- [ ] Buat layout responsive, panel form, preview area, toolbar utama, serta empty state.
- [ ] Implementasikan model Rust dengan ID stabil dan serialisasi.
- [ ] Buat data dummy hanya untuk pengembangan preview, bukan draft pengguna secara default.
- [ ] Buat dua template satu kolom: ATS Classic dan Minimal.

### Phase 3 — Data entry dan rich text

- [ ] Buat seluruh section personal info, summary, experience, education, skills, projects, certifications, dan languages.
- [ ] Buat komponen Tiptap yang reusable untuk mode single-line dan multiline.
- [ ] Implementasikan toolbar, link modal, sanitasi HTML, dan event bridge editor.
- [ ] Tambahkan, edit, hapus, tampil/sembunyikan, dan ubah urutan section/item.
- [ ] Pastikan preview mengikuti perubahan form.

### Phase 4 — Foto dan penyimpanan lokal

- [ ] Upload, preview/crop, resize/compress, simpan, ganti, dan hapus foto.
- [ ] Implementasikan IndexedDB untuk draft serta file gambar.
- [ ] Implementasikan autosave debounce dan status penyimpanan.
- [ ] Pulihkan draft saat reload.
- [ ] Tambahkan reset dan konfirmasi penimpaan draft.

### Phase 5 — Import/export dan print

- [ ] Export JSON.
- [ ] Import JSON dengan validasi schema dan sanitasi.
- [ ] Implementasikan print mode A4 dan tombol Export PDF via browser print dialog.
- [ ] Pastikan editor dan UI aplikasi tidak muncul dalam hasil cetak.
- [ ] (Opsional setelah MVP) Export DOCX browser-side tanpa server.

### Phase 6 — QA, aksesibilitas, dan dokumentasi

- [ ] Jalankan `cargo fmt --check` dan `cargo check`/build yang sesuai.
- [ ] Jalankan lint/test JavaScript/TypeScript jika ada bundle editor.
- [ ] Uji seluruh alur utama secara manual pada browser desktop dan mobile viewport.
- [ ] Uji JSON invalid, foto invalid, editor reload, autosave, serta print preview.
- [ ] Periksa tab order, focus ring, label, dan keyboard navigation.
- [ ] Pastikan tidak ada request jaringan yang mengirim data CV.
- [ ] Tulis README dengan kebutuhan tools, command yang benar-benar sudah diverifikasi, fitur, batasan, serta instruksi deploy static hosting.
- [ ] Perbarui checklist ini sesuai status implementasi sebenarnya.

## 14. Acceptance Criteria

MVP dianggap selesai hanya jika semua kriteria berikut terpenuhi:

1. Aplikasi dapat dijalankan lokal dan dibuild menjadi static assets.
2. Tidak ada backend atau API yang menerima data pengguna.
3. Pengguna dapat mengisi informasi pribadi, summary, pengalaman kerja, pendidikan, skills, proyek, sertifikasi, dan bahasa.
4. Field teks bebas yang disediakan sebagai rich text mendukung minimal bold, italic, underline, hyperlink, bullet list, dan numbered list.
5. Pengguna dapat menambah, mengubah, menghapus, dan mengurutkan section/item tanpa kehilangan data.
6. Live preview memperlihatkan data dan urutan yang sama dengan form.
7. Pengguna dapat memilih template, dan template ATS Classic beralur satu kolom serta tidak menampilkan foto secara default.
8. Foto dapat diunggah, dipreview, disimpan lokal, ditampilkan/disembunyikan, diganti, dan dihapus.
9. Draft tersimpan otomatis di browser dan dipulihkan setelah reload.
10. Import/export JSON bekerja dan file import invalid tidak menghapus draft aktif.
11. Print preview A4 hanya menampilkan CV dan bisa dipakai untuk menyimpan PDF melalui browser.
12. Konten HTML dari import dibersihkan; script dan link berbahaya tidak dijalankan.
13. Status penyimpanan serta error ditampilkan dengan jujur.
14. Tidak ada tombol palsu, fitur inti yang hanya mockup, atau data CV yang terkirim ke layanan eksternal.
15. README berisi command setup/dev/build yang telah diuji.

## 15. Cara Kerja Agent dan Definisi Selesai

- Mulai dengan memeriksa repository dan toolchain yang tersedia; jangan menghapus file penting yang sudah ada.
- Implementasikan fitur dalam tahap kecil, dan pastikan project tetap dapat dibuild secara berkala.
- Jika menemukan library atau API yang berubah, rujuk dokumentasi resmi terbaru lalu sesuaikan implementasi. Jangan mengarang nama API atau menyebut build sukses tanpa menjalankan build.
- Jangan berhenti untuk meminta keputusan minor. Pilih default yang sederhana, aman, dan sesuai dokumen ini; catat asumsi penting di README.
- Jika suatu fitur tidak dapat diselesaikan, jelaskan secara eksplisit, jangan membuat UI palsu, dan jangan menandai checklist sebagai selesai.
- Setelah implementasi, berikan ringkasan fitur yang selesai, file utama yang dibuat, perintah untuk menjalankan aplikasi, hasil build/test aktual, dan batasan yang masih ada.

## 16. Referensi Teknis

Gunakan dokumentasi resmi ini untuk mengecek setup dan API terkini sebelum mengunci versi dependency:

- Leptos — Getting Started / CSR dengan Trunk: https://book.leptos.dev/getting_started/index.html
- Leptos — Client-Side Rendering: https://book.leptos.dev/csr_wrapping_up.html
- Tiptap — Vanilla JavaScript setup: https://tiptap.dev/docs/editor/getting-started/install/vanilla-javascript
- Tiptap — Link extension: https://tiptap.dev/docs/editor/extensions/marks/link
- Tiptap — Underline extension: https://tiptap.dev/docs/editor/extensions/marks/underline
- Tiptap — Extension concepts: https://tiptap.dev/docs/editor/core-concepts/extensions

**Catatan penting:** “Client-side only” berarti semua data CV dan pembuatan dokumen berlangsung di browser, bukan berarti setiap baris kode harus Rust murni. Tiptap dapat digunakan sebagai library editor browser yang dibundel lokal, sedangkan aplikasi utama dan model datanya tetap berbasis Rust/Leptos. Jangan membuat server hanya untuk menyelesaikan fungsi editor atau ekspor.
