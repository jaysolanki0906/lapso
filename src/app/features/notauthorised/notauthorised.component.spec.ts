import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotauthorisedComponent } from './notauthorised.component';

describe('NotauthorisedComponent', () => {
  let component: NotauthorisedComponent;
  let fixture: ComponentFixture<NotauthorisedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotauthorisedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotauthorisedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
