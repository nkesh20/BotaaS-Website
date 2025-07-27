import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DatePipe,
    NgIf,
    TranslatePipe
  ]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get user data
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      // If no user data is available, try to load it
      if (!user && this.authService.isLoggedIn()) {
        this.authService.loadUserInfo().subscribe();
      }
    });
  }

  navigateToBots(): void {
    this.router.navigate(['/bots']);
  }

  addNewBot(): void {
    this.router.navigate(['/bots/add']);
  }

  navigateToBroadcast(): void {
    this.router.navigate(['/broadcast']);
  }
}