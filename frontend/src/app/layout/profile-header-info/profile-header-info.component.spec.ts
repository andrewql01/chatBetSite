import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileHeaderInfoComponent } from './profile-header-info.component';

describe('ProfileHeaderInfoComponent', () => {
  let component: ProfileHeaderInfoComponent;
  let fixture: ComponentFixture<ProfileHeaderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHeaderInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileHeaderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
