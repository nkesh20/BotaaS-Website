import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf, NgFor } from '@angular/common';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

interface MenuItem {
  label: string;
  translationKey: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    NgIf,
    NgFor,
    TranslatePipe,
    LanguageSelectorComponent
  ]
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      translationKey: 'navigation.dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'My Bots',
      translationKey: 'bots.myBots',
      icon: 'smart_toy',
      route: '/bots'
    },
    {
      label: 'Broadcast',
      translationKey: 'broadcast.title',
      icon: 'campaign',
      route: '/broadcast'
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActiveRoute(route: string): boolean {
    // Only highlight the button if the current URL exactly matches the route
    return this.router.url === route;
  }
}