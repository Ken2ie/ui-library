import { Component } from '@angular/core';
import { NotionEditorComponent } from "./quill-test-component";
import { TeamwareComponent } from '../teamware/teamware.component';
import { DocsPreviewerComponent } from '../docs-previewer/docs-previewer.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [NotionEditorComponent, TeamwareComponent, DocsPreviewerComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

}
