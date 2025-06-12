import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicevoucherformComponent } from './servicevoucherform.component';

describe('ServicevoucherformComponent', () => {
  let component: ServicevoucherformComponent;
  let fixture: ComponentFixture<ServicevoucherformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicevoucherformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicevoucherformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
