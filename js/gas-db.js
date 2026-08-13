/**
 * Google Apps Script (GAS) & Google Sheets Client Library for Grandia Game Tavern
 */

(function (window) {
  'use strict';

  var DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbx0wQvCRHg3Uqmxo00RlBfdzgS339Ti4-2_gXFTKA6137flvjm5is8_pPoPioSMmBv1/exec';
  var OLD_DEAD_URL = 'AKfycbyWZKd1eMTZSRZoMNaLX1zVlik3rje63ldJ7PmCZHX3UToU5qx_i_6N2zncOmz6Yeh82Q';

  // Auto load from drive_config.json if available
  try {
    fetch('drive_config.json').then(r => r.json()).then(cfg => {
      if (cfg && cfg.web_app_url) {
        window.GAS_WEB_APP_URL = cfg.web_app_url;
      }
    }).catch(function() {});
  } catch (e) {}

  var GASDB = {
    getWebUrl: function () {
      var saved = localStorage.getItem('gas_web_app_url');
      if (saved && saved.includes(OLD_DEAD_URL)) {
        localStorage.removeItem('gas_web_app_url');
        saved = null;
      }
      if (saved && saved.trim()) return saved.trim();
      if (window.GAS_WEB_APP_URL && window.GAS_WEB_APP_URL.trim() && !window.GAS_WEB_APP_URL.includes(OLD_DEAD_URL)) return window.GAS_WEB_APP_URL.trim();
      return DEFAULT_GAS_URL;
    },

    setWebUrl: function (url) {
      if (url) {
        localStorage.setItem('gas_web_app_url', url.trim());
      } else {
        localStorage.removeItem('gas_web_app_url');
      }
    },

    ping: async function () {
      var url = this.getWebUrl();
      if (!url) throw new Error('URL Google Apps Script belum dikonfigurasi.');
      var resp = await fetch(url + '?action=ping');
      var json = await resp.json();
      return json;
    },

    fetchGames: async function () {
      var url = this.getWebUrl();
      if (!url) return null;
      try {
        var resp = await fetch(url + '?action=getGames');
        var json = await resp.json();
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          return json.data;
        }
        return null;
      } catch (err) {
        console.warn('[GAS DB] Error fetching games:', err);
        return null;
      }
    },

    addGame: async function (gameData) {
      var url = this.getWebUrl();
      if (!url) throw new Error('URL Google Apps Script belum dikonfigurasi.');
      var payload = { action: 'addGame', game: gameData };
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return await resp.json();
    },

    updateGame: async function (gameData) {
      var url = this.getWebUrl();
      if (!url) throw new Error('URL Google Apps Script belum dikonfigurasi.');
      var payload = { action: 'updateGame', game: gameData };
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return await resp.json();
    },

    deleteGame: async function (id) {
      var url = this.getWebUrl();
      if (!url) throw new Error('URL Google Apps Script belum dikonfigurasi.');
      var payload = { action: 'deleteGame', id: id };
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return await resp.json();
    },

    bulkImport: async function (gamesArray, overwrite = true) {
      var url = this.getWebUrl();
      if (!url) throw new Error('URL Google Apps Script belum dikonfigurasi.');
      var payload = { action: 'bulkImport', games: gamesArray, overwrite: overwrite };
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return await resp.json();
    },

    uploadImage: function (file) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var url = self.getWebUrl();
        if (!url) return reject(new Error('URL Google Apps Script belum dikonfigurasi.'));

        var reader = new FileReader();
        reader.onload = function (e) {
          var base64 = e.target.result;
          var payload = {
            action: 'uploadImage',
            filename: file.name,
            mimeType: file.type || 'image/jpeg',
            base64: base64
          };

          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          })
            .then(res => res.json())
            .then(json => {
              if (json && json.status === 'success' && json.url) {
                resolve(json.url);
              } else {
                reject(new Error((json && json.message) || 'Gagal mengunggah gambar ke Google Drive.'));
              }
            })
            .catch(err => reject(err));
        };
        reader.onerror = function (err) {
          reject(err);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  window.GASDB = GASDB;
})(window);
