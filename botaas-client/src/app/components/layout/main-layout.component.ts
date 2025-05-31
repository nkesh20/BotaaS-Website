import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    template: `
    <div class="layout-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
    styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
    }
    
    .main-content {
      margin-left: 280px;
      flex: 1;
      overflow: auto;
      background-color: #f8f9fa;
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `],
    standalone: true,
    imports: [RouterOutlet, SidebarComponent]
})
export class MainLayoutComponent { }