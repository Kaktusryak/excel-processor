import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-file-accessor',
  imports: [JsonPipe],
  templateUrl: './file-accessor.html',
  styleUrl: './file-accessor.scss',
})
export class FileAccessor {


 excelData: any;

  constructor() {
    // Listen for data from main process
    (window as any).electronAPI.onExcelData((data: any) => {
      this.excelData = data;
    });
  }

  // --- Drag & drop ---
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Cannot use file.path here for security reasons
    alert('Drag-and-drop does not provide file path in Electron! Use Select File button.');
  }

  // --- File dialog ---
  async selectFile() {
    const filePath = await (window as any).electronAPI.openFile();
    if (filePath) {
      (window as any).electronAPI.openExcel(filePath);
    }
  }
}

