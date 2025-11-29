const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const { excelParser } = require('./excel/excel');

// Auto-reload Electron
try {
  require('electron-reloader')(module, {
    debug: true,
    watchRenderer: false   // IMPORTANT: disable renderer watching
  });
} catch (_) {}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const DIST = path.join(__dirname, '../dist/excel-processor/browser');
  const INDEX = path.join(DIST, 'index.html');

  // ---- ALWAYS LOAD ONLY index.html ----
  mainWindow.loadFile(INDEX);

  // ---- SAFE RELOAD WATCHER ----
  let reloadTimer;
  fs.watch(DIST, { recursive: true }, () => {
    clearTimeout(reloadTimer);

    reloadTimer = setTimeout(() => {
      // DO NOTHING if index.html does NOT exist yet
      if (!fs.existsSync(INDEX)) return;

      console.log("🔄 Angular finished rebuilding → Reloading window...");
      mainWindow.loadFile(INDEX);  // <──── correct reload
    }, 250); // wait for ALL dist files to finish writing
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- File dialog ---
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel', extensions: ['xls', 'xlsx'] }],
  });


  if (canceled) return null;

  excelParser(filePaths[0]);

  return filePaths[0];
});

// --- Read Excel ---
ipcMain.on('excel:load', (event, filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    event.sender.send('excel:data', json);
  } catch (err) {
    console.error("Error reading Excel:", err);
  }
});
