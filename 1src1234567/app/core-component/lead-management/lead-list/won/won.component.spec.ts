import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WonComponent } from './won.component';

describe('WonComponent', () => {
  let component: WonComponent;
  let fixture: ComponentFixture<WonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
