import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BotService } from '../../services/bot.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-bot-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTabsModule
  ],
  template: `
    <div class="analytics-container">
      <div class="analytics-header">
        <div>
          <h2>Bot Analytics</h2>
          <p *ngIf="botId">Analytics for Bot ID: {{ botId }}</p>
        </div>

        <mat-form-field appearance="outline" class="period-selector">
          <mat-label>Time Period</mat-label>
          <mat-select [(value)]="selectedPeriod" (selectionChange)="onPeriodChange()">
            <mat-option value="1_day">Last 24 Hours</mat-option>
            <mat-option value="1_week">Last Week</mat-option>
            <mat-option value="1_month">Last Month</mat-option>
            <mat-option value="1_year">Last Year</mat-option>
            <mat-option value="all_time">All Time</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      <div *ngIf="isLoading" class="loading-section">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading analytics data...</p>
      </div>

      <div *ngIf="!isLoading && analytics" class="analytics-content">
        <!-- Analytics Cards -->
        <div class="analytics-grid">
          <!-- Chat Count Card -->
          <mat-card class="analytics-card" (click)="showChart('chats')">
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
          <mat-card class="analytics-card" (click)="showChart('messages')">
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
          <mat-card class="analytics-card" (click)="showChart('users')">
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
          <mat-card class="analytics-card" (click)="showChart('banned_users')">
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

        <!-- Chart Section -->
        <div *ngIf="selectedChartType" class="chart-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>{{ getChartTitle() }}</mat-card-title>
              <button mat-icon-button (click)="hideChart()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas #chartCanvas></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
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

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .period-selector {
      min-width: 200px;
    }

    .analytics-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .chart-section {
      margin-top: 24px;
    }

    .chart-card {
      width: 100%;
    }

    .chart-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 16px 0;
    }

    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
      padding: 16px;
    }

    .analytics-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .analytics-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
export class BotAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;
  
  botId: string | null = null;
  analytics: any = null;
  isLoading = false;
  error: string | null = null;
  selectedPeriod: string = 'all_time';
  selectedChartType: string | null = null;
  currentChart: Chart | null = null;
  trendData: any = null;

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

    this.botService.getBotAnalytics(parseInt(this.botId), this.selectedPeriod).subscribe({
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

  ngAfterViewInit(): void {
    // Chart will be initialized when needed
  }

  onPeriodChange(): void {
    this.loadAnalytics();
    // Always reload chart data if a chart type is selected
    if (this.selectedChartType) {
      // Force refresh the chart by destroying it first
      if (this.currentChart) {
        this.currentChart.destroy();
        this.currentChart = null;
      }
      // Small delay to ensure the chart canvas is ready
      setTimeout(() => {
        this.loadChartData();
      }, 100);
    }
  }

  showChart(chartType: string): void {
    this.selectedChartType = chartType;
    // Destroy any existing chart before creating a new one
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }
    this.loadChartData();
  }

  hideChart(): void {
    this.selectedChartType = null;
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }
  }

  getChartTitle(): string {
    const titles: { [key: string]: string } = {
      'messages': 'Message Trends',
      'chats': 'Chat Activity',
      'users': 'User Growth',
      'banned_users': 'Banned Users'
    };
    return titles[this.selectedChartType || ''] || 'Analytics Chart';
  }

  loadChartData(): void {
    if (!this.botId || !this.selectedChartType) return;

    this.botService.getBotAnalyticsTrend(
      parseInt(this.botId), 
      this.selectedPeriod, 
      this.selectedChartType
    ).subscribe({
      next: (data) => {
        this.trendData = data.trend_data;
        // Ensure chart is created even if it was previously destroyed
        setTimeout(() => {
          this.createChart();
        }, 150);
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
        // Clear trend data on error to prevent showing stale data
        this.trendData = null;
        if (this.currentChart) {
          this.currentChart.destroy();
          this.currentChart = null;
        }
      }
    });
  }

  createChart(): void {
    if (!this.chartCanvas || !this.trendData) {
      return;
    }

    // Check if canvas is properly initialized
    if (!this.chartCanvas.nativeElement) {
      setTimeout(() => {
        this.createChart();
      }, 100);
      return;
    }

    // Destroy existing chart
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }
    
    this.currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.trendData.dates,
        datasets: [{
          label: this.getChartTitle(),
          data: this.trendData.values,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                return `Date: ${context[0].label}`;
              },
              label: (context) => {
                return `${this.getChartTitle()}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: this.getChartTitle()
            },
            beginAtZero: true
          }
        }
      }
    });

    // Force the chart to resize after creation
    setTimeout(() => {
      if (this.currentChart) {
        this.currentChart.resize();
      }
    }, 100);
  }
} 