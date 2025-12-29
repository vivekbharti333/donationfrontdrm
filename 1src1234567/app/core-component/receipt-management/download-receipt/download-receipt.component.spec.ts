import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadReceiptComponent } from './download-receipt.component';

describe('DownloadReceiptComponent', () => {
  let component: DownloadReceiptComponent;
  let fixture: ComponentFixture<DownloadReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadReceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DownloadReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
