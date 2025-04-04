import { Component } from '@angular/core';
import { NotionEditorComponent } from "./quill-test-component";

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [NotionEditorComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

}
