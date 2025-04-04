import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/overview/layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
    },
    {
        path: 'overview',
        loadChildren: () => import('./routes/overview.routes').then(m => m.routes),
        component: LayoutComponent
    }
];
