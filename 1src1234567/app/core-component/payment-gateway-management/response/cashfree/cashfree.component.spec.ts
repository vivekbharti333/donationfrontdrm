import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashfreeComponent } from './cashfree.component';

describe('CashfreeComponent', () => {
  let component: CashfreeComponent;
  let fixture: ComponentFixture<CashfreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashfreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CashfreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
