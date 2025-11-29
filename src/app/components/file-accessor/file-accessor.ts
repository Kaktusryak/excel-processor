import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-file-accessor',
  imports: [JsonPipe],
  templateUrl: './file-accessor.html',
  styleUrl: './file-accessor.scss',
})
export class FileAccessor {

  private cdr = inject(ChangeDetectorRef)


 excelData: BehaviorSubject<any | null> = new BehaviorSubject(null);

  constructor() {
    // Listen for data from main process
    (window as any).electronAPI.onExcelData((data: any) => {
      // this.excelData = data;
      this.excelData.next(data)
      this.cdr.detectChanges()

    });
  }

  // --- File dialog ---
  async selectFile() {
    const filePath = await (window as any).electronAPI.openFile();
    console.log('asdhjlakda');
    
    if (filePath) {
      (window as any).electronAPI.openExcel(filePath);
    }
  }
}

