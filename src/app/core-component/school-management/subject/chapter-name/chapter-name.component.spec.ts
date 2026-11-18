import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterNameComponent } from './chapter-name.component';

describe('ChapterNameComponent', () => {
  let component: ChapterNameComponent;
  let fixture: ComponentFixture<ChapterNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterNameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChapterNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
