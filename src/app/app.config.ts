import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideQuillConfig } from 'ngx-quill';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['link', 'image', 'video'],
          ['clean']
        ],
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ['@'],
          source: (searchTerm: string, renderList: Function) => {
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
        },
        keyboard: {
          bindings: {
            enter: {
              key: 13,
              handler: (range: any, context: any) => true
            },
            slash: {
              key: 191,
              handler: (range: any, context: any) => true
            }
          }
        }
      },
      formats: [
        'bold', 'italic', 'underline', 'strike',
        'blockquote', 'code-block',
        'header', 'list', 'indent',
        'link', 'image', 'video'
      ],
      theme: 'snow',
      placeholder: 'Type "/" for commands or "@" for mentions...'
    }) 
  ]
};
