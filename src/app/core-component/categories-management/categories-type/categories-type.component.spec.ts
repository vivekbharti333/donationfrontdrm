import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesTypeComponent } from './categories-type.component';

describe('CategoriesTypeComponent', () => {
  let component: CategoriesTypeComponent;
  let fixture: ComponentFixture<CategoriesTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoriesTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriesTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
