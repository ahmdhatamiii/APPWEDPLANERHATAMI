---
name: gas-autopush
description: Otomatis mengirim (push) kode ke Google Apps Script (GAS) menggunakan Clasp setiap kali file .gs, .html, atau appsscript.json dibuat atau diubah di workspace.
---

# Google Apps Script Auto-Push Skill

Skill ini mengatur workflow otomatisasi sinkronisasi kode lokal ke Google Apps Script menggunakan Google Clasp.

## 1. Aturan Eksekusi Otomatis (Automatic Trigger)
Setiap kali agent selesai melakukan pembuatan atau penyuntingan file:
- `*.gs` atau `*.js` (backend Apps Script)
- `*.html` (frontend template)
- `appsscript.json` (manifest proyek)

Agent **WAJIB** langsung mengeksekusi sinkronisasi ke remote project:
```powershell
npx @google/clasp push -f
```

## 2. Mode File-Watcher Background (Daemon)
Jika user menginginkan sinkronisasi instan saat user mengedit file sendiri secara manual di IDE:
Jalankan perintah watch sebagai background process / daemon:
```powershell
npx @google/clasp push --watch
```
*Catatan: Parameter `--watch` memonitor perubahan file lokal dan otomatis melakukan push seketika file disimpan.*

## 3. Prasyarat & Penanganan Error
- Pastikan `.clasp.json` berada di root workspace dengan `scriptId` yang valid.
- Jika status push `User has not enabled the Apps Script API`:
  Instruksikan user untuk mengaktifkan Google Apps Script API di [script.google.com/home/usersettings](https://script.google.com/home/usersettings).

