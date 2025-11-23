
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const XLSX = require('xlsx'); // make sure to `npm install xlsx`
try {
  require('electron-reloader')(module, {
    debug: true,
    watchRenderer: false
  });
} catch (_) {}



function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // must be true
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, '../dist/excel-processor/browser/index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Handle file selection ---
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel', extensions: ['xls', 'xlsx'] }],
  });
  if (canceled) return null;
  return filePaths[0]; // return full path
});

// --- Handle Excel reading ---
ipcMain.on('excel:load', (event, filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    console.log('Parsed Excel:', json);

    // Optionally send back to Angular
    event.sender.send('excel:data', json);
  } catch (err) {
    console.error('Error reading Excel:', err);
  }
});
