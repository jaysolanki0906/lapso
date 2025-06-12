import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicecalllistComponent } from './servicecalllist.component';

describe('ServicecalllistComponent', () => {
  let component: ServicecalllistComponent;
  let fixture: ComponentFixture<ServicecalllistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicecalllistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicecalllistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
