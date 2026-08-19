import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeTypeComponent } from './fee-type.component';

describe('FeeTypeComponent', () => {
  let component: FeeTypeComponent;
  let fixture: ComponentFixture<FeeTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
