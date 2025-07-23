import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bot-analytics',
  standalone: true,
  template: `
    <div class="analytics-container">
      <h2>Bot Analytics</h2>
      <p>Analytics for Bot ID: {{ botId }}</p>
      <div class="placeholder">Analytics data will appear here.</div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }
    .placeholder {
      margin-top: 24px;
      padding: 24px;
      background: #f5f5f5;
      border-radius: 8px;
      color: #888;
      text-align: center;
    }
  `]
})
export class BotAnalyticsComponent implements OnInit {
  botId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.botId = this.route.snapshot.paramMap.get('botId');
  }
} 