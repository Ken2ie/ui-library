import { Component } from '@angular/core';

@Component({
  selector: 'app-teamware',
  standalone: true,
  imports: [],
  templateUrl: './teamware.component.html',
  styleUrl: './teamware.component.css'
})
export class TeamwareComponent {

  teamSoftwareCategories: Array<any> = [
    {
      title: "Internal Developer Tools",
      description: "In-house tools built to improve developer productivity and code sharing.",
      softwares: [
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "DevHub",
          appDescription: "Central hub for all reusable code components, team packages, and integration guidelines.",
          link: "https://www.devhub.co/",
          download: "https://www.devhub.co/download"
        },
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "DevHub",
          appDescription: "Central hub for all reusable code components, team packages, and integration guidelines.",
          link: "https://www.devhub.co/",
          download: "https://www.devhub.co/download"
        },
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "DocForge",
          appDescription: "A markdown-based documentation builder for creating, editing, and sharing internal guides.",
          link: "https://www.devhub.co/docforge",
          download: "https://www.devhub.co/docforge/download"
        }
      ]
    },
    {
      title: "Design & Collaboration",
      description: "Tools for collaborating with design and UI/UX teams.",
      softwares: [
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "UIKit",
          appDescription: "Shared UI library with Angular and React components and usage examples.",
          link: "https://developer.apple.com/documentation/uikit",
          download: "https://developer.apple.com/download/"
        },
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "WireframeBox",
          appDescription: "Tool for designing and previewing wireframes for new features.",
          link: "https://www.devhub.co/wireframebox",
          download: "https://www.devhub.co/wireframebox/download"
        }
      ]
    },
    {
      title: "Productivity & Communication",
      description: "Recommended apps to streamline communication and task management.",
      softwares: [
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "TaskMate",
          appDescription: "In-house task board and agile workflow tracker for internal teams.",
          link: "https://www.taskmatehq.com/",
          download: "https://www.taskmatehq.com/download"
        },
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "TeamTalk",
          appDescription: "Real-time chat app for project discussions and announcements.",
          link: "https://www.teamtalknetworks.com/",
          download: "https://www.teamtalknetworks.com/download"
        },
        {
          appImage: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          name: "TeamTalk",
          appDescription: "Real-time chat app for project discussions and announcements.",
          link: "https://www.teamtalknetworks.com/",
          download: "https://www.teamtalknetworks.com/download"
        }
      ]
    }
  ];
  

}
