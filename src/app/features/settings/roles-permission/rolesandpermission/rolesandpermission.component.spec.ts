import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesandpermissionComponent } from './rolesandpermission.component';

describe('RolesandpermissionComponent', () => {
  let component: RolesandpermissionComponent;
  let fixture: ComponentFixture<RolesandpermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesandpermissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesandpermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
