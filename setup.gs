/**
 * setup.gs - Inisialisasi Database Google Sheets untuk Aurelia Wedding Planner
 */

function setupDatabase() {
  var ss = typeof getActiveSpreadsheetSafe === 'function' ? getActiveSpreadsheetSafe() : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("Error: Spreadsheet tidak dapat diakses.");
    return;
  }

  // 1. Pengaturan (Key, Value)
  var colPengaturan = ["Key", "Value"];
  var initialPengaturan = [
    ["coupleName", "Calon Pengantin"],
    ["weddingDate", ""],
    ["targetBudget", 0]
  ];
  ensureSheetWithHeaders(ss, "Pengaturan", colPengaturan, initialPengaturan);

  // 2. Transaksi (ID, Tipe, Judul, Nominal, Kategori, Status, Tanggal, Catatan)
  var colTransaksi = ["ID", "Tipe", "Judul", "Nominal", "Kategori", "Status", "Tanggal", "Catatan"];
  ensureSheetWithHeaders(ss, "Transaksi", colTransaksi, []);

  // 3. Checklist (ID, Judul, Timeline, Selesai)
  var colChecklist = ["ID", "Judul", "Timeline", "Selesai"];
  ensureSheetWithHeaders(ss, "Checklist", colChecklist, []);

  // 4. Vendor (ID, Nama, Kategori, Kontak, Estimasi_Biaya, Terbayar, Status, Catatan)
  var colVendor = ["ID", "Nama", "Kategori", "Kontak", "Estimasi_Biaya", "Terbayar", "Status", "Catatan"];
  ensureSheetWithHeaders(ss, "Vendor", colVendor, []);

  Logger.log("Safe Migration Database Selesai: Seluruh Sheet Siap.");
}

function ensureSheetWithHeaders(ss, sheetName, headers, dummyRows) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow === 0 || lastCol === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F3ECE1");
    if (dummyRows && dummyRows.length > 0) {
      for (var i = 0; i < dummyRows.length; i++) {
        sheet.appendRow(dummyRows[i]);
      }
    }
    sheet.autoResizeColumns(1, headers.length);
  } else {
    var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    for (var j = 0; j < headers.length; j++) {
      var targetCol = headers[j];
      if (existingHeaders.indexOf(targetCol) === -1) {
        var newColIdx = sheet.getLastColumn() + 1;
        sheet.getRange(1, newColIdx).setValue(targetCol).setFontWeight("bold").setBackground("#F3ECE1");
      }
    }
  }
}
