/**
 * code.gs - Controller Backend Google Apps Script Web App
 * Aurelia — Wedding Planner & Keuangan Pernikahan
 */

const COL_TX = { ID: 0, TIPE: 1, JUDUL: 2, NOMINAL: 3, KATEGORI: 4, STATUS: 5, TANGGAL: 6, CATATAN: 7 };
const COL_CK = { ID: 0, JUDUL: 1, TIMELINE: 2, SELESAI: 3 };
const COL_VND = { ID: 0, NAMA: 1, KATEGORI: 2, KONTAK: 3, ESTIMASI: 4, TERBAYAR: 5, STATUS: 6, CATATAN: 7 };

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter.params);
  }
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Aurelia — Aplikasi Wedding Planner & Keuangan Pernikahan")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  var payload = {};
  try { payload = JSON.parse(raw); } catch (err) {}
  var action = (payload && payload.action) || (e && e.parameter && e.parameter.action) || "";
  var params = (payload && payload.params) ? JSON.stringify(payload.params) : (e && e.parameter && e.parameter.params);
  return handleApiRequest(action, params);
}

function handleApiRequest(action, rawParams) {
  try {
    var params = [];
    if (rawParams) {
      try {
        params = JSON.parse(rawParams);
        if (!Array.isArray(params)) params = [params];
      } catch (err) {
        params = [rawParams];
      }
    }
    var globalScope = this;
    if (typeof globalScope[action] === "function") {
      var result = globalScope[action].apply(globalScope, params);
      return ContentService.createTextOutput(JSON.stringify(result !== undefined ? result : { status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    throw new Error("Action '" + action + "' tidak ditemukan.");
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Akses Spreadsheet Aman (Mendukung Container-Bound & Standalone Project)
 */
function getActiveSpreadsheetSafe() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}

  var prop = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (prop) {
    try {
      var opened = SpreadsheetApp.openById(prop);
      if (opened) return opened;
    } catch (e) {}
  }

  try {
    var newSs = SpreadsheetApp.create("Aurelia Wedding Planner — Database");
    PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", newSs.getId());
    return newSs;
  } catch (e) {
    Logger.log("Safe SS error: " + e.toString());
  }
  return null;
}

/**
 * Inisialisasi & Ambil seluruh data awal untuk frontend
 */
function getInitialData() {
  var ss = getActiveSpreadsheetSafe();
  if (ss) {
    try { setupDatabase(); } catch(e) {}
  }
  
  var settings = {
    coupleName: "Calon Pengantin",
    weddingDate: "",
    targetBudget: 0
  };

  if (!ss) {
    return {
      coupleName: settings.coupleName,
      weddingDate: settings.weddingDate,
      targetBudget: settings.targetBudget,
      transactions: [],
      checklist: [],
      vendors: [],
      kuaDocs: []
    };
  }

  var sheetSet = ss.getSheetByName("Pengaturan");
  if (sheetSet && sheetSet.getLastRow() > 1) {
    var setRows = sheetSet.getRange(2, 1, sheetSet.getLastRow() - 1, 2).getValues();
    for (var i = 0; i < setRows.length; i++) {
      var k = String(setRows[i][0]).trim();
      var v = setRows[i][1];
      if (k === "coupleName" && v) settings.coupleName = String(v);
      if (k === "weddingDate" && v) {
        settings.weddingDate = v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd") : String(v);
      }
      if (k === "targetBudget" && v) settings.targetBudget = Number(v) || settings.targetBudget;
    }
  }

  var transactions = [];
  var sheetTx = ss.getSheetByName("Transaksi");
  if (sheetTx && sheetTx.getLastRow() > 1) {
    var txRows = sheetTx.getRange(2, 1, sheetTx.getLastRow() - 1, 8).getValues();
    for (var j = 0; j < txRows.length; j++) {
      var r = txRows[j];
      var tglStr = r[COL_TX.TANGGAL] instanceof Date ? Utilities.formatDate(r[COL_TX.TANGGAL], Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd") : String(r[COL_TX.TANGGAL] || "");
      transactions.push({
        id: String(r[COL_TX.ID]),
        type: String(r[COL_TX.TIPE]),
        title: String(r[COL_TX.JUDUL]),
        amount: Number(r[COL_TX.NOMINAL]) || 0,
        category: String(r[COL_TX.KATEGORI]),
        status: String(r[COL_TX.STATUS]),
        date: tglStr,
        notes: String(r[COL_TX.CATATAN] || "")
      });
    }
  }

  var checklist = [];
  var sheetCk = ss.getSheetByName("Checklist");
  if (sheetCk && sheetCk.getLastRow() > 1) {
    var ckRows = sheetCk.getRange(2, 1, sheetCk.getLastRow() - 1, 4).getValues();
    for (var k = 0; k < ckRows.length; k++) {
      var c = ckRows[k];
      checklist.push({
        id: String(c[COL_CK.ID]),
        title: String(c[COL_CK.JUDUL]),
        timeline: String(c[COL_CK.TIMELINE]),
        done: Boolean(c[COL_CK.SELESAI] === true || String(c[COL_CK.SELESAI]).toUpperCase() === "TRUE")
      });
    }
  }

  var kuaDocs = [];
  try {
    var rawKua = PropertiesService.getScriptProperties().getProperty("KUA_DOCS");
    if (rawKua) kuaDocs = JSON.parse(rawKua);
  } catch(e) {}

  var vendors = [];
  var sheetVnd = ss.getSheetByName("Vendor");
  if (sheetVnd && sheetVnd.getLastRow() > 1) {
    var vndRows = sheetVnd.getRange(2, 1, sheetVnd.getLastRow() - 1, 8).getValues();
    for (var v = 0; v < vndRows.length; v++) {
      var vr = vndRows[v];
      vendors.push({
        id: String(vr[COL_VND.ID]),
        name: String(vr[COL_VND.NAMA]),
        category: String(vr[COL_VND.KATEGORI] || "Lainnya"),
        contact: String(vr[COL_VND.KONTAK] || ""),
        contractAmount: Number(vr[COL_VND.ESTIMASI]) || 0,
        paidAmount: Number(vr[COL_VND.TERBAYAR]) || 0,
        status: String(vr[COL_VND.STATUS] || "Belum Bayar"),
        notes: String(vr[COL_VND.CATATAN] || "")
      });
    }
  }

  return {
    coupleName: settings.coupleName,
    weddingDate: settings.weddingDate,
    targetBudget: settings.targetBudget,
    transactions: transactions,
    checklist: checklist,
    vendors: vendors,
    kuaDocs: kuaDocs
  };
}

function apiSaveKuaDocs(docs) {
  try {
    PropertiesService.getScriptProperties().setProperty("KUA_DOCS", JSON.stringify(docs));
    return true;
  } catch(e) {
    return false;
  }
}

/**
 * Generator ID Sekuensial Anti-Tabrakan
 */
function generateNextId(sheetName, prefix) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return prefix + "-" + Date.now();
    var sheet = ss.getSheetByName(sheetName);
    var now = new Date();
    var yearMonth = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "yyyyMM");
    var targetPrefix = prefix + "-" + yearMonth + "-";
    
    var maxNum = 0;
    if (sheet && sheet.getLastRow() > 1) {
      var ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        var strId = String(ids[i][0]);
        if (strId.indexOf(targetPrefix) === 0) {
          var numPart = parseInt(strId.replace(targetPrefix, ""), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      }
    }
    var nextNum = maxNum + 1;
    var padded = ("000" + nextNum).slice(-3);
    return targetPrefix + padded;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan / Update Transaksi
 */
function apiSimpanTransaksi(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false, message: "Spreadsheet tidak aktif." };
    var sheet = ss.getSheetByName("Transaksi");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("Transaksi");
    }
    var isEdit = data.id && String(data.id).indexOf("tx-") !== 0 && String(data.id).trim() !== "";
    var id = isEdit ? data.id : generateNextId("Transaksi", "TX");
    var tgl = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
    
    var rowData = [
      id,
      data.type || "expense",
      data.title || "",
      Number(data.amount) || 0,
      data.category || "Lainnya",
      data.status || "Lunas / Diterima",
      tgl,
      data.notes || ""
    ];

    if (isEdit) {
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) {
          sheet.getRange(i + 2, 1, 1, rowData.length).setValues([rowData]);
          return { success: true, message: "Transaksi diperbarui!", id: id };
        }
      }
    }

    sheet.appendRow(rowData);
    return { success: true, message: "Transaksi berhasil disimpan!", id: id };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Hapus Transaksi
 */
function apiHapusTransaksi(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false, message: "Spreadsheet tidak aktif." };
    var sheet = ss.getSheetByName("Transaksi");
    if (!sheet || sheet.getLastRow() <= 1) return { success: false, message: "Sheet kosong." };

    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.deleteRow(i + 2);
        return { success: true };
      }
    }
    return { success: false, message: "Data tidak ditemukan." };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan Checklist Baru
 */
function apiSimpanChecklist(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false, message: "Spreadsheet tidak aktif." };
    var sheet = ss.getSheetByName("Checklist");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("Checklist");
    }
    var id = generateNextId("Checklist", "CK");
    var rowData = [id, data.title || "", data.timeline || "H-12 Bln", false];
    sheet.appendRow(rowData);
    return { success: true, id: id };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Toggle Status Checklist
 */
function apiToggleChecklist(id, isDone) {
  var ss = getActiveSpreadsheetSafe();
  if (!ss) return { success: false };
  var sheet = ss.getSheetByName("Checklist");
  if (!sheet || sheet.getLastRow() <= 1) return { success: false };

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 2, COL_CK.SELESAI + 1).setValue(Boolean(isDone));
      return { success: true };
    }
  }
  return { success: false };
}

/**
 * Hapus Checklist
 */
function apiHapusChecklist(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Checklist");
    if (!sheet || sheet.getLastRow() <= 1) return { success: false };

    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.deleteRow(i + 2);
        return { success: true };
      }
    }
    return { success: false };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan Pengaturan Pasangan & Target Budget
 */
function apiSimpanPengaturan(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Pengaturan");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("Pengaturan");
    }

    var dict = {
      coupleName: data.coupleName || "Adrian & Clarissa",
      weddingDate: data.weddingDate || "2027-02-14",
      targetBudget: Number(data.targetBudget) || 250000000
    };

    if (sheet && sheet.getLastRow() > 1) {
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
      for (var i = 0; i < rows.length; i++) {
        var k = String(rows[i][0]).trim();
        if (dict.hasOwnProperty(k)) {
          sheet.getRange(i + 2, 2).setValue(dict[k]);
          delete dict[k];
        }
      }
    }
    
    if (sheet) {
      for (var key in dict) {
        sheet.appendRow([key, dict[key]]);
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan / Update Data Vendor
 */
function apiSimpanVendor(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false, message: "Spreadsheet tidak aktif." };
    var sheet = ss.getSheetByName("Vendor");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("Vendor");
    }

    var isEdit = data.id && String(data.id).indexOf("VND-") === 0;
    var id = isEdit ? data.id : generateNextId("Vendor", "VND");
    var contract = Number(data.contractAmount) || 0;
    var paid = Number(data.paidAmount) || 0;
    var status = paid >= contract && contract > 0 ? "Lunas" : (paid > 0 ? "DP / Dicicil" : "Belum Bayar");

    var rowData = [
      id,
      data.name || "Vendor",
      data.category || "Lainnya",
      data.contact || "",
      contract,
      paid,
      status,
      data.notes || ""
    ];

    if (isEdit) {
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) {
          sheet.getRange(i + 2, 1, 1, rowData.length).setValues([rowData]);
          return { success: true, message: "Vendor diperbarui!", id: id, status: status };
        }
      }
    }

    sheet.appendRow(rowData);
    return { success: true, message: "Vendor berhasil ditambahkan!", id: id, status: status };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Hapus Vendor
 */
function apiHapusVendor(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false, message: "Spreadsheet tidak aktif." };
    var sheet = ss.getSheetByName("Vendor");
    if (!sheet || sheet.getLastRow() <= 1) return { success: false, message: "Sheet kosong." };

    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.deleteRow(i + 2);
        return { success: true };
      }
    }
    return { success: false, message: "Data tidak ditemukan." };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Bayar DP / Cicilan Vendor (Otomatis Catat Transaksi Pengeluaran ke Kas)
 */
function apiBayarVendor(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getActiveSpreadsheetSafe();
    if (!ss) return { success: false, message: "Spreadsheet tidak aktif." };
    var sheetVnd = ss.getSheetByName("Vendor");
    if (!sheetVnd || sheetVnd.getLastRow() <= 1) return { success: false, message: "Sheet vendor kosong." };

    var rows = sheetVnd.getRange(2, 1, sheetVnd.getLastRow() - 1, 8).getValues();
    var foundIndex = -1;
    var vendorRow = null;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][COL_VND.ID]) === String(data.vendorId)) {
        foundIndex = i;
        vendorRow = rows[i];
        break;
      }
    }

    if (foundIndex === -1 || !vendorRow) {
      return { success: false, message: "Vendor tidak ditemukan." };
    }

    var payAmount = Number(data.amount) || 0;
    if (payAmount <= 0) return { success: false, message: "Nominal pembayaran tidak valid." };

    var curPaid = Number(vendorRow[COL_VND.TERBAYAR]) || 0;
    var contract = Number(vendorRow[COL_VND.ESTIMASI]) || 0;
    var newPaid = curPaid + payAmount;
    var newStatus = newPaid >= contract && contract > 0 ? "Lunas" : (newPaid > 0 ? "DP / Dicicil" : "Belum Bayar");

    // Update Vendor Sheet
    sheetVnd.getRange(foundIndex + 2, COL_VND.TERBAYAR + 1).setValue(newPaid);
    sheetVnd.getRange(foundIndex + 2, COL_VND.STATUS + 1).setValue(newStatus);

    // Auto-create Transaction in Transaksi Sheet
    var sheetTx = ss.getSheetByName("Transaksi");
    if (!sheetTx) {
      setupDatabase();
      sheetTx = ss.getSheetByName("Transaksi");
    }
    var txId = generateNextId("Transaksi", "TX");
    var tgl = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
    var txRow = [
      txId,
      "expense",
      "Pembayaran " + String(vendorRow[COL_VND.NAMA]) + " (" + (data.paymentType || "DP / Cicilan") + ")",
      payAmount,
      String(vendorRow[COL_VND.KATEGORI] || "Lainnya"),
      data.paymentType || "Cicilan Vendor",
      tgl,
      data.notes || ("Pembayaran untuk vendor " + String(vendorRow[COL_VND.NAMA]))
    ];
    sheetTx.appendRow(txRow);

    return {
      success: true,
      vendorId: data.vendorId,
      newPaidAmount: newPaid,
      newStatus: newStatus,
      transaction: {
        id: txId,
        type: "expense",
        title: txRow[2],
        amount: payAmount,
        category: txRow[4],
        status: txRow[5],
        date: tgl,
        notes: txRow[7]
      }
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
