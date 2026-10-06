import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsesLimitComponent } from './uses-limit.component';

describe('UsesLimitComponent', () => {
  let component: UsesLimitComponent;
  let fixture: ComponentFixture<UsesLimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsesLimitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsesLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
