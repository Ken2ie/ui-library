import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamwareComponent } from './teamware.component';

describe('TeamwareComponent', () => {
  let component: TeamwareComponent;
  let fixture: ComponentFixture<TeamwareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamwareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeamwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
