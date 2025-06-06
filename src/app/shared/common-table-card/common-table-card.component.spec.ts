import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTableCardComponent } from './common-table-card.component';

describe('CommonTableCardComponent', () => {
  let component: CommonTableCardComponent;
  let fixture: ComponentFixture<CommonTableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTableCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
