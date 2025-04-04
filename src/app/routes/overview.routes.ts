import { Routes } from "@angular/router";
import { OverviewComponent } from "../pages/overview/overview.component";

export const routes : Routes = [
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
    },
    {
        path: '',
        component: OverviewComponent,
        title:'Overview'
    }
]