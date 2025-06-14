import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleandpermissionformComponent } from './roleandpermissionform.component';

describe('RoleandpermissionformComponent', () => {
  let component: RoleandpermissionformComponent;
  let fixture: ComponentFixture<RoleandpermissionformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleandpermissionformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleandpermissionformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
