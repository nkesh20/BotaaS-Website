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
                path: 'bots/:id/edit',
                loadComponent: () => import('./features/bot-management/components/bot-editor/bot-editor.component').then(m => m.BotEditorComponent)
            },
            {
                path: 'bots/:botId/flows',
                loadComponent: () => import('./features/bot-management/components/flow-list/flow-list.component').then(m => m.FlowListComponent)
            },
            {
                path: 'bots/:botId/flows/new',
                loadComponent: () => import('./features/bot-management/components/flow-builder/flow-builder.component').then(m => m.FlowBuilderComponent)
            },
            {
                path: 'bots/:botId/flows/:flowId',
                loadComponent: () => import('./features/bot-management/components/flow-builder/flow-builder.component').then(m => m.FlowBuilderComponent)
            },
            {
                path: 'bots/:botId/analytics',
                loadComponent: () => import('./features/bot-management/components/bot-analytics/bot-analytics.component').then(m => m.BotAnalyticsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '/dashboard' }
];