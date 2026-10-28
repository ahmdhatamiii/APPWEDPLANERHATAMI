# Workspace Rules: Auto-Push to Google Apps Script

Setiap kali mengubah atau membuat file backend/frontend (`code.gs`, `setup.gs`, `*.gs`, `index.html`, `appsscript.json`), agent WAJIB otomatis menjalankan:
```powershell
npx @google/clasp push -f
```
agar kode di Google Apps Script selalu tersinkronisasi langsung tanpa menunggu instruksi manual dari user.

