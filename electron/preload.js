const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openExcel: (filePath) => ipcRenderer.send('excel:load', filePath),
  onExcelData: (callback) => ipcRenderer.on('excel:data', (event, data) => callback(data))
});
