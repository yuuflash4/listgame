/**
 * ============================================================================
 * GRANDIA GAME TAVERN - GOOGLE APPS SCRIPT BACKEND (DATABASE & STORAGE)
 * ============================================================================
 * Kode ini ditempel ke editor Google Apps Script (script.google.com).
 * Hubungkan dengan Google Sheets (Spreadsheet) sebagai Database dan
 * Google Drive sebagai Media Storage.
 *
 * CARA DEPLOY:
 * 1. Buka Google Sheets baru -> Extensions (Ekstensi) -> Apps Script.
 * 2. Hapus isi Code.gs bawaan, lalu tempel SELURUH KODE DI BAWAH INI.
 * 3. Klik tombol 'Deploy' -> 'New deployment'.
 * 4. Select type: 'Web app'.
 * 5. Description: 'Grandia Game Tavern API'.
 * 6. Execute as: 'Me' (Email Anda).
 * 7. Who has access: 'Anyone' (Siapa saja).
 * 8. Klik 'Deploy', berikan izin (Authorize), lalu SALIN Web App URL-nya.
 * ============================================================================
 */

// Nama Sheet Database
var SHEET_GAMES = "Games";
var SHEET_ORDERS = "Orders";

// ID Folder Google Drive tempat menyimpan gambar Cover (opsional).
// Jika dikosongkan, gambar akan diupload ke root Google Drive Anda.
var DRIVE_FOLDER_ID = "";

/**
 * Memastikan Sheet dan Header Kolom yang dibutuhkan sudah siap.
 */
function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet Games
  var sheetGames = ss.getSheetByName(SHEET_GAMES);
  if (!sheetGames) {
    sheetGames = ss.insertSheet(SHEET_GAMES);
    var headersGames = ["ID", "Title", "Category", "Platform", "SizeGB", "ReleaseYear", "Rating", "Cover", "GameInfoJSON", "RequirementsJSON", "CreatedAt"];
    sheetGames.getRange(1, 1, 1, headersGames.length).setValues([headersGames]);
    sheetGames.getRange(1, 1, 1, headersGames.length).setFontWeight("bold").setBackground("#38bdf8").setFontColor("#000000");
    sheetGames.setFrozenRows(1);
  }
  
  // 2. Setup Sheet Orders
  var sheetOrders = ss.getSheetByName(SHEET_ORDERS);
  if (!sheetOrders) {
    sheetOrders = ss.insertSheet(SHEET_ORDERS);
    var headersOrders = ["OrderID", "CustomerName", "CustomerPhone", "StorageType", "Capacity", "GamesList", "TotalSizeGB", "TotalPrice", "Status", "CreatedAt"];
    sheetOrders.getRange(1, 1, 1, headersOrders.length).setValues([headersOrders]);
    sheetOrders.getRange(1, 1, 1, headersOrders.length).setFontWeight("bold").setBackground("#a855f7").setFontColor("#ffffff");
    sheetOrders.setFrozenRows(1);
  }
}

/**
 * Format Response JSON dengan CORS Header agar bisa dipanggil dari Frontend Web.
 */
function buildJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * HTTP GET Handler (Ambil Data Game / Status API)
 */
function doGet(e) {
  try {
    setupDatabaseSheets();
    var params = e ? e.parameter : {};
    var action = params.action || "getGames";

    if (action === "ping") {
      return buildJsonResponse({ status: "success", message: "Google Apps Script Backend Active & Connected!" });
    }

    if (action === "getGames" || action === "getCatalog") {
      var games = getAllGames();
      return buildJsonResponse({ status: "success", count: games.length, data: games });
    }

    return buildJsonResponse({ status: "error", message: "Unknown GET action: " + action });
  } catch (err) {
    return buildJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * HTTP POST Handler (Tambah, Edit, Hapus, Import Bulk Game, Upload Gambar)
 */
function doPost(e) {
  try {
    setupDatabaseSheets();
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (ex) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var action = postData.action || "";

    // 1. Action: Upload Gambar ke Google Drive
    if (action === "uploadImage") {
      var filename = postData.filename || ("cover_" + new Date().getTime() + ".jpg");
      var base64Str = postData.base64 || "";
      var mimeType = postData.mimeType || "image/jpeg";

      if (!base64Str) {
        return buildJsonResponse({ status: "error", message: "Base64 image data missing." });
      }

      // Format base64 jika mengandung data URL prefix
      if (base64Str.indexOf("base64,") !== -1) {
        base64Str = base64Str.split("base64,")[1];
      }

      var decoded = Utilities.base64Decode(base64Str);
      var blob = Utilities.newBlob(decoded, mimeType, filename);
      
      var folder;
      if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== "") {
        try {
          folder = DriveApp.getFolderById(DRIVE_FOLDER_ID.trim());
        } catch (fErr) {
          folder = DriveApp.getRootFolder();
        }
      } else {
        folder = DriveApp.getRootFolder();
      }

      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Ambil Direct URL
      var fileId = file.getId();
      var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;

      return buildJsonResponse({
        status: "success",
        fileId: fileId,
        url: directUrl,
        webViewLink: file.getUrl()
      });
    }

    // 2. Action: Tambah Single Game
    if (action === "addGame") {
      var game = postData.game;
      if (!game) {
        return buildJsonResponse({ status: "error", message: "Game data is required." });
      }
      var created = saveSingleGame(game);
      return buildJsonResponse({ status: "success", message: "Game added successfully", data: created });
    }

    // 3. Action: Update Single Game
    if (action === "updateGame") {
      var gameUpdate = postData.game;
      if (!gameUpdate || !gameUpdate.id) {
        return buildJsonResponse({ status: "error", message: "Game ID and payload required." });
      }
      var updated = updateSingleGame(gameUpdate);
      if (updated) {
        return buildJsonResponse({ status: "success", message: "Game updated successfully", data: gameUpdate });
      } else {
        return buildJsonResponse({ status: "error", message: "Game with ID " + gameUpdate.id + " not found." });
      }
    }

    // 4. Action: Hapus Single Game
    if (action === "deleteGame") {
      var idToDelete = postData.id;
      if (!idToDelete) {
        return buildJsonResponse({ status: "error", message: "ID is required." });
      }
      var deleted = deleteSingleGame(idToDelete);
      if (deleted) {
        return buildJsonResponse({ status: "success", message: "Game deleted successfully", id: idToDelete });
      } else {
        return buildJsonResponse({ status: "error", message: "Game ID not found." });
      }
    }

    // 5. Action: Bulk Import / Overwrite Games
    if (action === "bulkImport" || action === "saveAllGames") {
      var gamesList = postData.games;
      var overwrite = postData.overwrite !== false; // default true
      if (!gamesList || !Array.isArray(gamesList)) {
        return buildJsonResponse({ status: "error", message: "Array of games required." });
      }
      var count = bulkImportGames(gamesList, overwrite);
      return buildJsonResponse({ status: "success", message: count + " games imported successfully." });
    }

    return buildJsonResponse({ status: "error", message: "Unknown POST action: " + action });

  } catch (err) {
    return buildJsonResponse({ status: "error", message: err.toString() });
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR GOOGLE SHEETS CRUD
// ============================================================================

function getAllGames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_GAMES);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Hanya ada header

  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var id = String(row[0]).trim();
    if (!id) continue;

    var gameInfoObj = {};
    var reqsObj = [];

    try {
      if (row[8]) gameInfoObj = typeof row[8] === "string" ? JSON.parse(row[8]) : row[8];
    } catch (e) {
      gameInfoObj = { Genre: row[8] || "" };
    }

    try {
      if (row[9]) reqsObj = typeof row[9] === "string" ? JSON.parse(row[9]) : row[9];
    } catch (e) {
      reqsObj = [String(row[9])];
    }

    result.push({
      id: id,
      title: row[1] || "",
      category: row[2] || "pc",
      platform: row[3] || "PC (Windows)",
      sizeGB: parseFloat(row[4]) || 0,
      releaseYear: parseInt(row[5]) || 2024,
      rating: parseFloat(row[6]) || 5.0,
      cover: row[7] || "",
      banner_url: row[7] || "", // alias
      game_info: gameInfoObj,
      requirements: reqsObj,
      system_requirements: reqsObj, // alias
      created_at: row[10] || new Date().toISOString()
    });
  }

  return result;
}

function saveSingleGame(game) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_GAMES);
  
  var id = game.id || ("game_" + new Date().getTime());
  var title = game.title || "Untitled Game";
  var category = game.category || "pc";
  var platform = game.platform || (category === "ps2" ? "PlayStation 2" : "PC (Windows)");
  var sizeGB = parseFloat(game.sizeGB) || 0;
  var releaseYear = parseInt(game.releaseYear) || 2024;
  var rating = parseFloat(game.rating) || 5.0;
  var cover = game.cover || game.banner_url || "";
  var gameInfoJSON = JSON.stringify(game.game_info || {});
  var reqs = game.requirements || game.system_requirements || [];
  var reqsJSON = JSON.stringify(reqs);
  var createdAt = game.created_at || new Date().toISOString();

  sheet.appendRow([id, title, category, platform, sizeGB, releaseYear, rating, cover, gameInfoJSON, reqsJSON, createdAt]);
  
  game.id = id;
  return game;
}

function updateSingleGame(game) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_GAMES);
  var data = sheet.getDataRange().getValues();
  
  var targetId = String(game.id).trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetId) {
      var rowNum = i + 1; // 1-indexed
      var title = game.title || data[i][1];
      var category = game.category || data[i][2];
      var platform = game.platform || data[i][3];
      var sizeGB = parseFloat(game.sizeGB) !== undefined ? parseFloat(game.sizeGB) : data[i][4];
      var releaseYear = parseInt(game.releaseYear) || data[i][5];
      var rating = parseFloat(game.rating) || data[i][6];
      var cover = game.cover || game.banner_url || data[i][7];
      var gameInfoJSON = JSON.stringify(game.game_info || {});
      var reqs = game.requirements || game.system_requirements || [];
      var reqsJSON = JSON.stringify(reqs);
      var createdAt = data[i][10] || new Date().toISOString();

      sheet.getRange(rowNum, 1, 1, 11).setValues([[
        targetId, title, category, platform, sizeGB, releaseYear, rating, cover, gameInfoJSON, reqsJSON, createdAt
      ]]);
      return true;
    }
  }
  return false;
}

function deleteSingleGame(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_GAMES);
  var data = sheet.getDataRange().getValues();
  
  var targetId = String(id).trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetId) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function bulkImportGames(gamesList, overwrite) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_GAMES);

  if (overwrite) {
    // Clear data baris ke-2 dan seterusnya
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
  }

  var rowsToAppend = [];
  for (var i = 0; i < gamesList.length; i++) {
    var game = gamesList[i];
    var id = game.id || ("game_" + new Date().getTime() + "_" + i);
    var title = game.title || "Untitled Game";
    var category = game.category || "pc";
    var platform = game.platform || (category === "ps2" ? "PlayStation 2" : "PC (Windows)");
    var sizeGB = parseFloat(game.sizeGB) || (game.game_info && game.game_info["Game Size"] ? parseFloat(game.game_info["Game Size"]) : 0);
    var releaseYear = parseInt(game.releaseYear) || 2024;
    var rating = parseFloat(game.rating) || 5.0;
    var cover = game.cover || game.banner_url || "";
    var gameInfoJSON = JSON.stringify(game.game_info || {});
    var reqs = game.requirements || game.system_requirements || [];
    var reqsJSON = JSON.stringify(reqs);
    var createdAt = game.created_at || new Date().toISOString();

    rowsToAppend.push([id, title, category, platform, sizeGB, releaseYear, rating, cover, gameInfoJSON, reqsJSON, createdAt]);
  }

  if (rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 11).setValues(rowsToAppend);
  }

  return rowsToAppend.length;
}
