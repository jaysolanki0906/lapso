import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicevoucherlistComponent } from './servicevoucherlist.component';

describe('ServicevoucherlistComponent', () => {
  let component: ServicevoucherlistComponent;
  let fixture: ComponentFixture<ServicevoucherlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicevoucherlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicevoucherlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
