import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradingScaleComponent } from './grading-scale.component';

describe('GradingScaleComponent', () => {
  let component: GradingScaleComponent;
  let fixture: ComponentFixture<GradingScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingScaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradingScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
