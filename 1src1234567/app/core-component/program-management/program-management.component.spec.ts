import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramManagementComponent } from './program-management.component';

describe('ProgramManagementComponent', () => {
  let component: ProgramManagementComponent;
  let fixture: ComponentFixture<ProgramManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
