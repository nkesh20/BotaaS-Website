import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BotService } from '../../services/bot.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bot-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="analytics-container">
      <h2>Bot Analytics</h2>
      <p *ngIf="botId">Analytics for Bot ID: {{ botId }}</p>
      
      <div *ngIf="isLoading" class="loading-section">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading analytics data...</p>
      </div>

      <div *ngIf="!isLoading && analytics" class="analytics-grid">
        <!-- Chat Count Card -->
        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="metric">
              <mat-icon class="metric-icon">chat</mat-icon>
              <div class="metric-content">
                <h3>{{ analytics.total_chats }}</h3>
                <p>Total Chats</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Message Count Card -->
        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="metric">
              <mat-icon class="metric-icon">message</mat-icon>
              <div class="metric-content">
                <h3>{{ analytics.total_messages }}</h3>
                <p>Total Messages</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- User Count Card -->
        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="metric">
              <mat-icon class="metric-icon">people</mat-icon>
              <div class="metric-content">
                <h3>{{ analytics.unique_users }}</h3>
                <p>Unique Users</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Banned Users Card -->
        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="metric">
              <mat-icon class="metric-icon">block</mat-icon>
              <div class="metric-content">
                <h3>{{ analytics.banned_users }}</h3>
                <p>Banned Users</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !analytics" class="placeholder">
        <mat-icon>analytics</mat-icon>
        <h3>No Analytics Data</h3>
        <p>This bot hasn't received any messages yet. Analytics will appear here once the bot starts interacting with users.</p>
      </div>

      <div *ngIf="error" class="error-section">
        <mat-icon color="warn">error</mat-icon>
        <h3>Error Loading Analytics</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      margin-bottom: 8px;
      color: #333;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }

    .analytics-card {
      transition: transform 0.2s ease-in-out;
    }

    .analytics-card:hover {
      transform: translateY(-2px);
    }

    .metric {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
    }

    .metric-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }

    .metric-content h3 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      color: #333;
    }

    .metric-content p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .placeholder {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .placeholder mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .placeholder h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .placeholder p {
      margin: 0;
      max-width: 400px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .error-section {
      text-align: center;
      padding: 40px 20px;
      color: #d32f2f;
    }

    .error-section mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .error-section h3 {
      margin: 16px 0 8px 0;
    }

    .error-section p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: 16px;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .metric-content h3 {
        font-size: 28px;
      }
    }
  `]
})
export class BotAnalyticsComponent implements OnInit {
  botId: string | null = null;
  analytics: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private botService: BotService
  ) {}

  ngOnInit(): void {
    this.botId = this.route.snapshot.paramMap.get('botId');
    if (this.botId) {
      this.loadAnalytics();
    }
  }

  loadAnalytics(): void {
    if (!this.botId) return;

    this.isLoading = true;
    this.error = null;

    this.botService.getBotAnalytics(parseInt(this.botId)).subscribe({
      next: (data) => {
        this.analytics = data.analytics;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load analytics data. Please try again.';
        this.isLoading = false;
        console.error('Analytics error:', err);
      }
    });
  }
} 