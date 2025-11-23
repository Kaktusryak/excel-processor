import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileAccessor } from "./components/file-accessor/file-accessor";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FileAccessor],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('excel-processor');
}
