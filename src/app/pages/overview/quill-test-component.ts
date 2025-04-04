import { Component, ViewChild, ElementRef, HostListener, Injectable, OnDestroy, OnInit } from '@angular/core';
import Quill, { Delta, Range } from 'quill';
import { QuillEditorComponent } from 'ngx-quill';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { QuillBinding } from 'y-quill';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import 'highlight.js/lib/languages/typescript';
import 'highlight.js/lib/languages/javascript';
import 'highlight.js/lib/languages/json';
import 'highlight.js/lib/languages/css';
import 'highlight.js/lib/languages/xml';
import 'highlight.js/lib/languages/bash';
import 'highlight.js/lib/languages/markdown';

// Import Quill modules
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';

// Register Quill modules
import * as Mention from 'quill-mention';
Quill.register('modules/mention', Mention);

// AI Service Mock
@Injectable({ providedIn: 'root' })
export class AIService {
  async generateContent(prompt: string): Promise<string> {
    // Implement actual AI integration here
    return Promise.resolve(`Generated content for: ${prompt}`);
  }
}

// Version History Service
@Injectable({ providedIn: 'root' })
export class HistoryService {
  private history: Delta[] = [];
  
  recordChange(delta: Delta) {
    this.history.push(delta);
    if(this.history.length > 100) this.history.shift();
  }

  getHistory(): Delta[] {
    return [...this.history];
  }
}

// Custom Blots
const BlockEmbed = Quill.import('blots/block/embed') as any;

class CheckboxBlot extends BlockEmbed {
  static blotName = 'checkbox';
  static tagName = 'div';
  static className = 'ql-checkbox';

  static create(value: boolean) {
    const node = super.create();
    node.innerHTML = `
      <input type="checkbox" ${value ? 'checked' : ''}/>
      <span contenteditable="true"></span>
    `;
    node.dataset.blockId = uuidv4();
    node.dataset.created = new Date().toISOString();
    return node;
  }

  static value(node: HTMLElement): boolean {
    return node.querySelector('input')?.checked || false;
  }
}

class ToggleBlot extends BlockEmbed {
  static blotName = 'toggle';
  static tagName = 'div';
  static className = 'ql-toggle';

  static create() {
    const node = super.create();
    node.innerHTML = `
      <div class="toggle-header">
        <span class="arrow">▶</span>
        <div contenteditable="true"></div>
      </div>
      <div class="toggle-content" style="display:none;"></div>
    `;
    node.dataset.blockId = uuidv4();
    node.dataset.created = new Date().toISOString();
    return node;
  }
}

class DatabaseBlot extends BlockEmbed {
  static blotName = 'database';
  static tagName = 'div';
  static className = 'ql-database';

  static create(databaseId: string) {
    const node = super.create();
    node.innerHTML = `
      <div class="database-view" data-id="${databaseId}">
        <div class="database-header">Database View</div>
        <div class="database-content"></div>
      </div>
    `;
    node.dataset.blockId = uuidv4();
    node.dataset.created = new Date().toISOString();
    return node;
  }
}

// Multi-column Blot
class ColumnBlot extends BlockEmbed {
  static blotName = 'columns';
  static tagName = 'div';
  static className = 'ql-columns';

  static create() {
    const node = super.create();
    node.innerHTML = `
      <div class="column" contenteditable="true"></div>
      <div class="column" contenteditable="true"></div>
    `;
    node.dataset.blockId = uuidv4();
    node.dataset.created = new Date().toISOString();
    return node;
  }
}

[CheckboxBlot, ToggleBlot, DatabaseBlot, ColumnBlot].forEach(Blot => 
  Quill.register(Blot)
);

interface BlockMetadata {
  id: string;
  type: string;
  created: Date;
  modified: Date;
}

// Custom Code Block Blot
const CodeBlock = Quill.import('formats/code-block') as any;

class CustomCodeBlock extends CodeBlock {
  static create(value: string) {
    const node = super.create(value);
    node.setAttribute('spellcheck', false);
    node.setAttribute('data-language', value || 'plaintext');
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute('data-language') || 'plaintext';
  }
}

Quill.register('formats/code-block', CustomCodeBlock);

@Component({
  selector: 'app-notion-editor',
  standalone: true,
  imports: [CommonModule, QuillEditorComponent],
  template: `
    <div class="editor-container">
      <quill-editor 
        #editor
        [modules]="modules"
        (onEditorCreated)="onEditorCreated($event)"
        (onContentChanged)="onContentChanged($event)"
        [formats]="formats"
        [placeholder]="placeholder"
        [theme]="theme"
      ></quill-editor>
      
      <div *ngIf="showSlashMenu" class="slash-menu" [ngStyle]="menuPosition">
        <div *ngFor="let cmd of commands" (click)="insertBlock(cmd)">
          <span class="icon">{{ cmd.icon }}</span>
          {{ cmd.label }}
        </div>
      </div>

      <div *ngIf="showAIPanel" class="ai-panel">
        <button (click)="generateAIContent('summarize')">Summarize</button>
        <button (click)="generateAIContent('expand')">Expand</button>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      position: relative;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ql-editor {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
      padding: 32px;
      min-height: 300px;
      font-size: 16px;
      line-height: 1.6;
      width: 100%;
    }

    .ql-container {
      width: 100%;
      height: 100%;
    }

    .ql-toolbar {
      width: 100%;
    }

    .ql-checkbox {
      display: flex;
      align-items: center;
      margin: 8px 0;
      padding: 4px 0;
      
      input {
        margin-right: 12px;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      span {
        flex: 1;
      }
    }

    .ql-toggle {
      border-left: 3px solid #eee;
      padding-left: 12px;
      margin: 12px 0;
      
      .toggle-header {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px 0;
        
        .arrow {
          margin-right: 8px;
          user-select: none;
          transition: transform 0.2s;
        }
      }

      &.expanded .arrow {
        transform: rotate(90deg);
      }
    }

    .slash-menu {
      position: absolute;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 4px;
      padding: 8px;
      z-index: 1000;
      min-width: 200px;
      
      div {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &:hover {
          background: #f5f5f5;
        }

        .icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .ql-editor h1 {
      font-size: 2em;
      font-weight: 600;
      margin: 1em 0 0.5em;
    }

    .ql-editor h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0.8em 0 0.4em;
    }

    .ql-editor p {
      margin: 0.5em 0;
    }

    .ql-editor ul, .ql-editor ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }

    .ql-editor blockquote {
      border-left: 4px solid #e0e0e0;
      margin: 1em 0;
      padding-left: 1em;
      color: #666;
    }

    .ql-editor code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: monospace;
    }

    .ql-editor pre {
      background: #1d1f21;
      color: #c5c8d4;
      padding: 1em;
      border-radius: 4px;
      margin: 1em 0;
      overflow-x: auto;
      position: relative;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    .ql-editor pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      color: inherit;
      white-space: pre;
      tab-size: 2;
    }

    .ql-editor pre .language-selector {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #2c2e30;
      border: none;
      color: #c5c8d4;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      z-index: 1;
    }

    .ql-editor pre .language-selector:hover {
      background: #3c3e40;
    }

    .ql-editor pre .language-selector:focus {
      outline: none;
      box-shadow: 0 0 0 2px #81a2be;
    }

    .ql-editor pre .language-selector option {
      background: #1d1f21;
      color: #c5c8d4;
    }

    /* Highlight.js syntax highlighting colors */
    .ql-editor pre .hljs {
      color: #c5c8d4;
      background: none;
    }

    .ql-editor pre .hljs-comment,
    .ql-editor pre .hljs-quote {
      color: #969896;
      font-style: italic;
    }

    .ql-editor pre .hljs-keyword,
    .ql-editor pre .hljs-selector-tag,
    .ql-editor pre .hljs-literal,
    .ql-editor pre .hljs-section,
    .ql-editor pre .hljs-link {
      color: #cc6666;
    }

    .ql-editor pre .hljs-string,
    .ql-editor pre .hljs-name,
    .ql-editor pre .hljs-type,
    .ql-editor pre .hljs-symbol,
    .ql-editor pre .hljs-bullet,
    .ql-editor pre .hljs-addition,
    .ql-editor pre .hljs-variable,
    .ql-editor pre .hljs-template-tag,
    .ql-editor pre .hljs-template-variable {
      color: #b5bd68;
    }

    .ql-editor pre .hljs-number {
      color: #de935f;
    }

    .ql-editor pre .hljs-deletion,
    .ql-editor pre .hljs-emphasis {
      color: #c66;
    }

    .ql-editor pre .hljs-strong {
      color: #c66;
      font-weight: bold;
    }

    .ql-editor pre .hljs-formula {
      color: #c66;
      font-style: italic;
    }

    .ql-editor pre .hljs-selector-id,
    .ql-editor pre .hljs-selector-class {
      color: #cc6666;
    }

    .ql-editor pre .hljs-title {
      color: #f0c674;
    }

    .ql-editor pre .hljs-params {
      color: #de935f;
    }

    .ql-editor pre .hljs-built_in {
      color: #81a2be;
    }

    .ql-editor pre .hljs-function {
      color: #81a2be;
    }

    .ql-editor pre .hljs-class {
      color: #f0c674;
    }

    .ai-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  `]
})
export class NotionEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editor') editor!: QuillEditorComponent;
  @ViewChild('editor', { read: ElementRef }) editorElem!: ElementRef;

  showSlashMenu = false;
  showAIPanel = false;
  menuPosition = { left: '0px', top: '0px' };
  private provider?: WebrtcProvider;
  private binding?: QuillBinding;

  // Quill configuration properties
  placeholder = 'Type "/" for commands or "@" for mentions...';
  theme = 'snow';
  formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'header', 'list', 'indent',
    'link', 'image', 'video'
  ];

  commands = [
    { label: 'Heading 1', command: 'header1', icon: 'H1' },
    { label: 'Heading 2', command: 'header2', icon: 'H2' },
    { label: 'To-do List', command: 'checkbox', icon: '☐' },
    { label: 'Toggle List', command: 'toggle', icon: '▶' },
    { label: 'Bulleted List', command: 'bullet', icon: '•' },
    { label: 'Numbered List', command: 'ordered', icon: '1.' },
    { label: 'Divider', command: 'divider', icon: '—' },
    { label: 'Database', command: 'database', icon: '📁' },
    { label: 'Columns', command: 'columns', icon: '📏' }
  ];

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    syntax: {
      highlight: (text: string) => hljs.highlightAuto(text).value
    },
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
      source: this.fetchMentions.bind(this)
    },
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: (range: any, context: any) => {
            return this.handleEnterKey(range, context);
          }
        },
        slash: {
          key: 191,
          handler: (range: any, context: any) => {
            return this.handleSlashKey(range, context);
          }
        }
      }
    }
  };

  constructor(
    private aiService: AIService,
    private historyService: HistoryService
  ) {}

  ngOnInit() {
    // Initialize any necessary services or data
  }

  onEditorCreated(editor: Quill) {
    this.setupCustomBehaviors(editor);
    this.initCollaboration();
    this.setupVersionHistory();
    this.setupCodeBlockHandlers(editor);
  }

  onContentChanged({ content, delta }: { content: Delta, delta: Delta }) {
    this.historyService.recordChange(delta);
  }

  private handleEnterKey(range: any, context: any): boolean {
    if (!this.editor.quillEditor) return true;

    const [line, offset] = this.editor.quillEditor.getLine(range.index);
    const text = line?.domNode.textContent || '';

    if (text.startsWith('/')) {
      this.showSlashMenu = true;
      const rect = this.editor.quillEditor.getBounds(range.index, range.length);
      if (rect) {
        this.menuPosition = {
          left: `${rect.left}px`,
          top: `${rect.top + 20}px`
        };
      }
      return false;
    }

    return true;
  }

  private handleSlashKey(range: any, context: any): boolean {
    if (!this.editor.quillEditor) return true;

    const [line, offset] = this.editor.quillEditor.getLine(range.index);
    const text = line?.domNode.textContent || '';

    if (text === '/') {
      this.showSlashMenu = true;
      const rect = this.editor.quillEditor.getBounds(range.index, range.length);
      if (rect) {
        this.menuPosition = {
          left: `${rect.left}px`,
          top: `${rect.top + 20}px`
        };
      }
      return false;
    }

    return true;
  }

  private setupCustomBehaviors(editor: Quill) {
    editor.on('text-change', (delta: Delta) => {
      this.handleSlashCommands(editor);
    });

    editor.on('selection-change', (range: Range | null) => {
      if (range) this.handleBlockSelection(range);
      this.showAIPanel = !!range;
    });

    // Handle mention selection
    editor.on('mention-selected', (mentioned: any) => {
      console.log('Mention selected:', mentioned);
    });
  }

  private handleSlashCommands(editor: Quill) {
    const range = editor.getSelection();
    if (!range) return;

    const [line, offset] = editor.getLine(range.index);
    const text = line?.domNode.textContent || '';

    if (text.startsWith('/') && offset === 1) {
      const rect = editor.getBounds(range.index, range.length);
      if (rect) {
        this.menuPosition = {
          left: `${rect.left}px`,
          top: `${rect.top + 20}px`
        };
        this.showSlashMenu = true;
      }
    } else {
      this.showSlashMenu = false;
    }
  }

  insertBlock(command: any) {
    const range = this.editor.quillEditor?.getSelection();
    if (!range || !this.editor.quillEditor) return;

    try {
      this.editor.quillEditor.deleteText(range.index - 1, 1);
      
      switch(command.command) {
        case 'header1':
          this.editor.quillEditor.formatLine(range.index, 1, 'header', 1);
          break;
        case 'header2':
          this.editor.quillEditor.formatLine(range.index, 1, 'header', 2);
          break;
        case 'checkbox':
          this.editor.quillEditor.insertEmbed(range.index, 'checkbox', false);
          break;
        case 'toggle':
          this.editor.quillEditor.insertEmbed(range.index, 'toggle', null);
          break;
        case 'bullet':
          this.editor.quillEditor.formatLine(range.index, 1, 'list', 'bullet');
          break;
        case 'ordered':
          this.editor.quillEditor.formatLine(range.index, 1, 'list', 'ordered');
          break;
        case 'divider':
          this.editor.quillEditor.insertEmbed(range.index, 'divider', null);
          break;
        case 'database':
          this.insertDatabase(range.index);
          break;
        case 'columns':
          this.editor.quillEditor.insertEmbed(range.index, 'columns', null);
          break;
      }
    } catch (error) {
      console.error('Error inserting block:', error);
    }
    
    this.showSlashMenu = false;
  }

  private insertDatabase(index: number) {
    this.editor.quillEditor?.insertEmbed(index, 'database', uuidv4());
  }

  private insertColumns(index: number) {
    this.editor.quillEditor?.insertEmbed(index, 'columns', null);
  }

  // Null-safe collaborative editing
  private initCollaboration() {
    try {
      const ydoc = new Y.Doc();
      this.provider = new WebrtcProvider('notion-room', ydoc);
      const ytext = ydoc.getText('quill');
      this.binding = new QuillBinding(ytext, this.editor.quillEditor);
    } catch (error) {
      console.error('Collaboration setup failed:', error);
    }
  }

  // Version history integration
  private setupVersionHistory() {
    this.editor.quillEditor?.history?.clear();
    this.editor.quillEditor?.history?.undo();
  }

  // AI integration
  async generateAIContent(action: string) {
    const selection = this.editor.quillEditor?.getSelection();
    if (!selection) return;

    try {
      const text = this.editor.quillEditor.getText(selection);
      const generated = await this.aiService.generateContent(`${action}: ${text}`);
      this.editor.quillEditor.insertText(selection.index, generated);
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  }

  // Null-safe metadata handling
  getBlockMetadata(index: number): BlockMetadata | null {
    try {
      const [block] = this.editor.quillEditor?.getLine(index) || [];
      if (!block?.domNode?.dataset) return null;

      return {
        id: block.domNode.dataset['blockId'] || '',
        type: block.statics.blotName,
        created: new Date(block.domNode.dataset['created'] || Date.now()),
        modified: new Date(block.domNode.dataset['modified'] || Date.now())
      };
    } catch (error) {
      console.error('Error getting block metadata:', error);
      return null;
    }
  }

  ngOnDestroy() {
    this.provider?.destroy();
    this.binding?.destroy();
  }

  // Additional safety for event handlers
  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    try {
      if (target.closest('.ql-checkbox input')) {
        this.toggleCheckbox(event);
      }
      if (target.closest('.ql-toggle .arrow')) {
        this.toggleContent(event);
      }
    } catch (error) {
      console.error('Event handler error:', error);
    }
  }

  private toggleCheckbox(event: MouseEvent) {
    const checkbox = event.target as HTMLInputElement;
    const element = checkbox.closest('.ql-checkbox');
    if (!element) return;
    
    const blot = Quill.find(element);
    if (!blot || !this.editor.quillEditor) return;

    try {
      const index = (blot as any).offset(this.editor.quillEditor.scroll.domNode);
      const length = (blot as any).length();
      this.editor.quillEditor.updateContents(new Delta()
        .retain(index)
        .retain(length, { checked: checkbox.checked })
      );
    } catch (error) {
      console.error('Toggle checkbox failed:', error);
    }
  }

  private toggleContent(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const toggle = target.closest('.ql-toggle');
    if (!toggle) return;
    
    const content = toggle.querySelector<HTMLElement>('.toggle-content');
    if (content) {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
      toggle.classList.toggle('expanded', content.style.display !== 'none');
    }
  }

  // Database relations
  private setupDatabaseRelations() {
    // Implement database synchronization logic
  }

  // Template system
  private loadTemplate(templateName: string) {
    // Implement template loading
  }

  // Multi-column layout handlers
  private handleColumnResize() {
    // Implement column resize logic
  }

  private fetchMentions(searchTerm: string, renderList: Function) {
    // Mock data for mentions
    const mockUsers = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Bob Johnson' }
    ];
    
    const results = mockUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderList(results);
  }

  private handleBlockSelection(range: Range) {
    if (!this.editor.quillEditor) return;
    const formats = this.editor.quillEditor.getFormat(range.index, range.length);
    this.updateContextualToolbar(this.editor.quillEditor);
  }

  private updateContextualToolbar(editor: Quill) {
    const range = editor.getSelection();
    if (!range) return;

    const formats = editor.getFormat(range.index, range.length);
    const blockType = formats['header'] || formats['list'] || 'paragraph';
    
    // Update toolbar state based on block type
    this.updateToolbarButtons(blockType as string);
  }

  private updateToolbarButtons(blockType: string) {
    // Implement logic to show/hide relevant toolbar buttons
    // This would be more complex in a real implementation
  }

  // Add missing handler methods
  insertCheckbox() {
    const range = this.editor.quillEditor?.getSelection();
    if (!range) return;
    this.editor.quillEditor.insertEmbed(range.index, 'checkbox', false);
  }

  insertToggle() {
    const range = this.editor.quillEditor?.getSelection();
    if (!range) return;
    this.editor.quillEditor.insertEmbed(range.index, 'toggle', null);
  }

  private setupCodeBlockHandlers(editor: Quill) {
    editor.on('text-change', () => {
      const blocks = editor.root.querySelectorAll('pre');
      blocks.forEach(block => {
        const code = block.querySelector('code');
        if (code) {
          const language = block.getAttribute('data-language') || 'plaintext';
          code.className = `hljs language-${language}`;
          hljs.highlightElement(code);
        }
      });
    });
  }

  private handleCodeBlockLanguageChange(event: Event, block: HTMLElement) {
    const select = event.target as HTMLSelectElement;
    const language = select.value;
    block.setAttribute('data-language', language);
    const code = block.querySelector('code');
    if (code) {
      code.className = `hljs language-${language}`;
      hljs.highlightElement(code);
    }
  }
}