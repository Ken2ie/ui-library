import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsPreviewerComponent } from './docs-previewer.component';

describe('DocsPreviewerComponent', () => {
  let component: DocsPreviewerComponent;
  let fixture: ComponentFixture<DocsPreviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPreviewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocsPreviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
