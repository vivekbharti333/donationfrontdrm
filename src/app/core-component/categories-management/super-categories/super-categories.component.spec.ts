import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperCategoriesComponent } from './super-categories.component';

describe('SuperCategoriesComponent', () => {
  let component: SuperCategoriesComponent;
  let fixture: ComponentFixture<SuperCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperCategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
