# Rencana Revisi Desain: Luxury Bridal Rose & Warm Champagne UI

## 1. Analisis Referensi Desain
Gambar referensi menampilkan antarmuka bertema **"Luxury Bridal Aesthetic"**:
- **Palet Warna:** Rose Mauve / Dusty Rose (`#9e5867`, `#b87584`), Soft Blush Background (`#faf6f5`, `#fdfaf9`), Warm Champagne Card & Borders (`#f2e9e8`, `#e8dcda`), dan teks elegan Charcoal/Espresso (`#2c2426`).
- **Tipografi:** Font Serif Editorial Mewah (Playfair Display / Cormorant) pada nama pasangan dan judul, dikombinasikan dengan sans-serif modern yang rapi.
- **Hero Dashboard:**
  - Header sapaan: `"AMORE • John & Sarah"` (atau Hatami & Naning).
  - Countdown Card melengkung berwarna Mauve Rose dengan Circular Progress Indicator ("452 days away", "31% tasks complete").
  - Grid 4 Kartu Metrik Kompak (2x2): Budget (%), Guests (Confirmed), Tasks (Done), Vendors (Booked).
  - Section "Up Next" / Agenda terdekat.
- **Modul Layar:**
  - **Budget Tracker:** Card gradasi Mauve, circular/doughnut budget chart, alokasi kategori.
  - **Guest List:** Pill counter status (Total, Confirmed, Declined, Pending), input pencarian instan, list kartu tamu dengan pill status berwarna lembut.
  - **Vendors:** Metrik booked & remaining balance, kartu per vendor dengan badge status (`Booked`, `Contacted`, `Pending`).
  - **Timeline / Checklist:** Progress bar, filter (`All`, `To Do`, `Done`), group by months before, checklist bulat.
- **Navigasi Bawah (Bottom Dock):** Ikon modern minimalis dengan label (Home, Budget, Guests, Vendors, Tasks, More) bernuansa rose-gold aksen.

## 2. File yang Diubah
- `index.html`: Perombakan total antarmuka UI/UX mengikuti desain referensi, mempertahankan seluruh fungsionalitas Google Apps Script backend (`code.gs`, `setup.gs`).

## 3. Estimasi Dampak
- Tampilan 100% identik dengan estetika mobile luxury bridal app pada gambar.
- Responsif optimal untuk smartphone (iPhone frame aesthetic) dan tetap lebar & proporsional di layar laptop/desktop.
- Seluruh fungsi data kas, vendor, checklist, dan tamu tetap terhubung aman ke Google Sheets.

