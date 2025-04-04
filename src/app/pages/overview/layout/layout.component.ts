import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from "../../../shared/nav-bar/nav-bar.component";
import { SidenavComponent } from "../../../shared/sidenav/sidenav.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, SidenavComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
