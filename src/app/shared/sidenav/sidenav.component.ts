import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent {

  selectedSubMenu! : number;

  navList: any[] = [
    {
      path: '/overview',
      title: 'Overview',
      icon: 'dashboard',
      submenu: [
        {
          path: '/overview',
          title: 'Something',
          icon: 'person',
        },
      ],
    },
    {
      path: '/overview',
      title: 'Functions',
      icon: 'function',
      submenu: [],
    },
    {
      path: '/overview',
      title: 'Components',
      icon: 'deployed_code',
      submenu: [],
    },
  ];

  toggleSubMenu(index: number) {
    this.selectedSubMenu = this.selectedSubMenu === index ? -1 : index;
  }


}
