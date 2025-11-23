import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileAccessor } from './file-accessor';

describe('FileAccessor', () => {
  let component: FileAccessor;
  let fixture: ComponentFixture<FileAccessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileAccessor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileAccessor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
