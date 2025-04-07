import { Component } from '@angular/core';
import { QuillViewComponent } from 'ngx-quill';

@Component({
  selector: 'app-docs-previewer',
  standalone: true,
  imports: [QuillViewComponent],
  templateUrl: './docs-previewer.component.html',
  styleUrl: './docs-previewer.component.css'
})
export class DocsPreviewerComponent {

  quilViewData : any = `🧱 Component Files
copy-to-clipboard.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-copy-to-clipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: ['./copy-to-clipboard.component.scss']
})
export class CopyToClipboardComponent {
  @Input() textToCopy: string = '';
  @Output() copied = new EventEmitter<void>();
  copiedText: string = '';

  constructor(private clipboard: Clipboard) {}

  copyText(): void {
    if (this.clipboard.copy(this.textToCopy)) {
      this.copiedText = 'Copied!';
      this.copied.emit();
      setTimeout(() => (this.copiedText = ''), 2000);
    }
  }
}

copy-to-clipboard.component.html

<div class="copy-container">
  <input [value]="textToCopy" readonly />
  <button (click)="copyText()" class="copy-btn">
    📋 Copy
  </button>
  <span class="copied-msg" *ngIf="copiedText">{{ copiedText }}</span>
</div>

copy-to-clipboard.component.scss

.copy-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  input {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .copy-btn {
    padding: 6px 10px;
    background-color: #3f51b5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #303f9f;
    }
  }

  .copied-msg {
    position: absolute;
    right: 0;
    top: -20px;
    font-size: 12px;
    color: green;
  }
}

🛠 How to Use

<app-copy-to-clipboard [textToCopy]="'ng generate component cool-feature'"></app-copy-to-clipboard>

You can also listen to the copied event:

<app-copy-to-clipboard
  [textToCopy]="'npm install @angular/cdk'"
  (copied)="onCopied()">
</app-copy-to-clipboard>

onCopied() {
  console.log('Text was copied!');
}

📦 Required Modules

In your module:

import { ClipboardModule } from '@angular/cdk/clipboard';

@NgModule({
  imports: [
    ClipboardModule
    // ...
  ]
})

📚 Notes

    Angular CDK Clipboard API is used for cross-browser support.

    Tooltip messages can be customized.

    Component is fully standalone and style-isolated.

Want me to export this as a Quill delta format or embedded HTML to drop into your editor?
You said:
yes both
ChatGPT said:

Always show details`

}
