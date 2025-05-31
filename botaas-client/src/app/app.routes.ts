import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./components/layout/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'bots',
                loadComponent: () => import('./components/bots/bot-list/bot-list.component').then(m => m.BotListComponent)
            },
            {
                path: 'bots/add',
                loadComponent: () => import('./components/bots/bot-add/bot-add.component').then(m => m.AddBotComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) // Reuse dashboard for now
            },
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '/dashboard' }
];