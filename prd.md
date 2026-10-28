# PRD: Wedding Planner & Savings Manager (Hatami & Naning)

================================================================================
ZONA ATAS: SPESIFIKASI KEBUTUHAN PRODUK (BLUEPRINT AWAL)
================================================================================

## 1. Nama Projek & Problem Statement
- **Nama Aplikasi:** Wedding Planner & Savings Manager (Hatami & Naning)
- **Problem Statement:** Membantu pasangan mengelola seluruh persiapan pernikahan secara terpadu: tabungan bersama, estimasi dan realisasi vendor, checklist seserahan/hantaran, kelengkapan berkas KUA, serta manajemen tamu dengan AI Pax recommendation engine guna menghindari salah estimasi porsi katering.
- **Visual Aesthetic:** Emerald & Warm Gold (Anti-AI Human Crafted, Font serif aksen, rounded cards, micro-interactions, responsive mobile & desktop).

## 2. Peran Pengguna
- **Calon Pengantin (Hatami & Naning):** Pengguna penuh (input tabungan bersama, pengeluaran vendor, checklist seserahan, dokumen KUA, daftar tamu).

## 3. Arsitektur & Lingkungan Kerja
- **Arsitektur:** Pure Google Apps Script Web App (HtmlService monolith modular: `code.gs`, `setup.gs`, `index.html`).
- **Database:** Google Spreadsheet terintegrasi langsung (Tabungan, Vendor, Seserahan, DokumenKUA, TamuUndangan, Pengaturan).
- **Client Cache:** In-memory caching di frontend untuk perpindahan tab instan (0 detik).

## 4. Modul & Alur Kerja Aplikasi (User Flow Sesuai Diagram)
1. **Tabungan Bersama:**
   - Ringkasan: Hatami, Naning, Bersama, Total Pengeluaran, Sisa Saldo.
   - Catat transaksi: Pemasukan / Pengeluaran (Pilih Kontributor: Hatami, Naning, Bersama).
   - Pengeluaran terintegrasi: Jika kategori bayar vendor, auto-lunas status vendor terkait.
2. **Wedding Planner (Vendor & Acara):**
   - Kategori acara: Lamaran & Wedding (Akad & Resepsi).
   - Estimasi biaya vendor (tanpa memotong saldo kas s/d dibayarkan).
   - Filter cepat tahapan & status: Belum / DP / Lunas.
   - Tombol Bayar / Update per vendor untuk pelunasan via kas tabungan.
3. **Seserahan & Hantaran:**
   - Rekap nilai seserahan, barang terbeli & wishlist belanja.
   - Tambah item + estimasi harga + link marketplace (Shopee / TikTok Shop / Tokopedia).
   - Toggle 1-klik: Wishlist <-> Sudah Dibeli.
4. **Dokumen KUA:**
   - Progress bar kelengkapan berkas: Pria vs Wanita.
   - Daftar checklist standar: KTP, KK, Ijazah, Surat Sehat, Imunisasi TT, Numpang Nikah + Opsi syarat custom.
   - 1-klik centang selesai per calon pengantin.
5. **Tamu & AI Pax Engine:**
   - Input tamu: Nama, No HP, Kategori Relasi (Keluarga, Teman, Kolega, VIP), Jenis Undangan (Fisik/Digital).
   - Status RSVP: Belum / Terkirim / Hadir / Batal.
   - AI Pax Recommendation Engine: Estimasi kehadiran x 2 pax + safety margin 15% untuk kalkulasi porsi katering aman.

## 5. Desain Basis Data (Google Sheets - Bebas Underscore)
- `Tabungan`: `[ID, Tanggal, Tipe, Kontributor, Nominal, Keterangan, IDVendor]`
- `Vendor`: `[ID, Acara, Kategori, NamaVendor, EstimasiBiaya, RealisasiBiaya, StatusBayar, Catatan]`
- `Seserahan`: `[ID, NamaBarang, Kategori, EstimasiHarga, RealisasiHarga, StatusBeli, LinkToko, Catatan]`
- `DokumenKUA`: `[ID, NamaDokumen, Pihak, StatusSelesai, Wajib, Catatan]`
- `TamuUndangan`: `[ID, NamaTamu, NoHP, KategoriRelasi, TipeUndangan, StatusRSVP, JumlahPax, Catatan]`
- Urutan Kolom: 0-indexed column mapping constant (`COL.*`).

## 6. Aturan Validasi & Logika Bisnis
- ID Generator otomatis di backend: `TBG-YYYYMM-XXX`, `VND-YYYYMM-XXX`, `SSR-YYYYMM-XXX`, `KUA-YYYYMM-XXX`, `TMU-YYYYMM-XXX`.
- Idempoten safe migration via `setup.gs`.
- Kolom sheet aman dari pergeseran format, LockService aktif pada penambahan transaksi.

## 7. Kriteria Pengujian (Checklist)
- [ ] Ringkasan Tabungan Bersama menghitung saldo masuk dan keluar secara akurat.
- [ ] Pembayaran vendor auto-sinkron ke tabel vendor dan kas tabungan.
- [ ] Checklist seserahan dan KUA realtime update toggle status.
- [ ] AI Pax kalkulasi porsi katering sesuai formula margin 15%.
- [ ] Tampilan rapi, responsif mobile (smartphone) & laptop (desktop).

================================================================================
ZONA BAWAH: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)
================================================================================
- **Platform:** Google Apps Script Web App (HtmlService monolith).
- **Status Berkas:**
  - `setup.gs`: Inisialisasi Google Sheets idempoten & safe migration tanpa underscore (`Tabungan`, `Vendor`, `Seserahan`, `DokumenKUA`, `TamuUndangan`).
  - `code.gs`: Controller backend, LockService, generator ID sekuensial (`TBG-`, `VND-`, `SSR-`, `KUA-`, `TMU-`), index-based column mapping, serta router pembayaran otomatis.
  - `index.html`: UI responsif tema Emerald & Warm Gold, antarmuka mobile-dock & desktop-nav, modal form interaktif, in-memory client cache untuk transisi tab 0-detik.
- **Logika Terpasang:**
  1. Auto-potong kas dan sinkronisasi status vendor saat mencatat transaksi pengeluaran.
  2. Toggle 1-klik status seserahan (Wishlist vs Sudah Dibeli) & checklist berkas KUA (Pria & Wanita).
  3. AI Pax Recommendation Engine: `Basis Hadir + Margin 15%` untuk estimasi porsi katering.

