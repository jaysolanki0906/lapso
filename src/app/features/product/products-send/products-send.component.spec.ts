import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsSendComponent } from './products-send.component';

describe('ProductsSendComponent', () => {
  let component: ProductsSendComponent;
  let fixture: ComponentFixture<ProductsSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsSendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
