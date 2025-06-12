import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicecallformComponent } from './servicecallform.component';

describe('ServicecallformComponent', () => {
  let component: ServicecallformComponent;
  let fixture: ComponentFixture<ServicecallformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicecallformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicecallformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
