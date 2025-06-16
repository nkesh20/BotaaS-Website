import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BotService } from '../../../bot-management/services/bot.service';

@Component({
    selector: 'app-bot-status',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatProgressSpinnerModule
    ],
    template: `
    <mat-card class="bot-status-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon [color]="getStatusColor()">{{ getStatusIcon() }}</mat-icon>
          Bot Status
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content *ngIf="!isLoading; else loadingTemplate">
        <!-- Overall Status -->
        <div class="overall-status" [class]="botStatus?.status">
          <h3>{{ getStatusText() }}</h3>
          <p>{{ getStatusDescription() }}</p>
        </div>

        <!-- Status Details -->
        <div class="status-grid">
          <!-- Webhook Status -->
          <div class="status-item">
            <mat-icon [color]="botStatus?.webhook?.is_configured ? 'primary' : 'warn'">
              {{ botStatus?.webhook?.is_configured ? 'cloud_done' : 'cloud_off' }}
            </mat-icon>
            <div>
              <strong>Webhook:</strong>
              <span [class]="botStatus?.webhook?.is_configured ? 'status-good' : 'status-bad'">
                {{ botStatus?.webhook?.is_configured ? 'Connected' : 'Not configured' }}
              </span>
              <div *ngIf="!botStatus?.webhook?.is_correct && botStatus?.webhook?.is_configured" class="warning">
                ⚠️ Webhook URL mismatch - needs fixing
              </div>
            </div>
          </div>

          <!-- Flow Status -->
          <div class="status-item">
            <mat-icon [color]="botStatus?.flows?.default_flow ? 'primary' : 'warn'">
              {{ botStatus?.flows?.default_flow ? 'account_tree' : 'warning' }}
            </mat-icon>
            <div>
              <strong>Default Flow:</strong>
              <span [class]="botStatus?.flows?.default_flow ? 'status-good' : 'status-bad'">
                {{ botStatus?.flows?.default_flow?.name || 'None set' }}
              </span>
            </div>
          </div>

          <!-- Bot Activity -->
          <div class="status-item">
            <mat-icon [color]="bot?.is_active ? 'primary' : 'warn'">
              {{ bot?.is_active ? 'play_circle' : 'pause_circle' }}
            </mat-icon>
            <div>
              <strong>Status:</strong>
              <span [class]="bot?.is_active ? 'status-good' : 'status-bad'">
                {{ bot?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Flows Count -->
          <div class="status-item">
            <mat-icon color="accent">analytics</mat-icon>
            <div>
              <strong>Flows:</strong>
              {{ botStatus?.flows?.total_count || 0 }} total, 
              {{ botStatus?.flows?.active_count || 0 }} active
            </div>
          </div>
        </div>
      </mat-card-content>

      <ng-template #loadingTemplate>
        <mat-card-content class="loading-content">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Checking bot status...</p>
        </mat-card-content>
      </ng-template>

      <mat-card-actions>
        <!-- Fix Webhook (only show if needed) -->
        <button 
          mat-raised-button 
          color="warn" 
          (click)="fixWebhook()"
          [disabled]="isLoading"
          *ngIf="needsWebhookFix()">
          <mat-icon>build</mat-icon>
          Fix Webhook
        </button>

        <!-- Create Default Flow -->
        <button 
          mat-button 
          color="primary" 
          (click)="createDefaultFlow()"
          *ngIf="!botStatus?.flows?.default_flow">
          <mat-icon>add</mat-icon>
          Create Flow
        </button>

        <!-- Test Flow -->
        <button 
          mat-button 
          color="accent" 
          (click)="testFlow()"
          [disabled]="isLoading || !isReadyForTesting()">
          <mat-icon>play_arrow</mat-icon>
          Test Bot
        </button>

        <!-- Refresh Status -->
        <button 
          mat-button 
          (click)="refreshStatus()"
          [disabled]="isLoading">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </mat-card-actions>
    </mat-card>

    <!-- Test Results -->
    <mat-card class="test-results" *ngIf="testResult">
      <mat-card-header>
        <mat-card-title>Test Result</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="test-conversation">
          <div class="user-message">
            <strong>You:</strong> "{{ testResult.input_message }}"
          </div>
          <div class="bot-message">
            <strong>{{ bot?.first_name }}:</strong> "{{ testResult.bot_response }}"
          </div>
          <div *ngIf="testResult.quick_replies?.length" class="quick-replies">
            <strong>Quick Replies:</strong> 
            <span *ngFor="let reply of testResult.quick_replies" class="reply-chip">{{ reply }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    .bot-status-card {
      margin: 16px 0;
    }

    .overall-status {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      
      &.ready {
        background: #e8f5e8;
        color: #2e7d32;
      }
      
      &.needs_setup {
        background: #fff3e0;
        color: #f57c00;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
      }
      
      p {
        margin: 0;
        opacity: 0.8;
      }
    }

    .status-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .status-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border: 1px solid #eee;
      border-radius: 8px;
      
      mat-icon {
        margin-top: 2px;
      }
      
      div {
        flex: 1;
      }
    }

    .status-good {
      color: #4caf50;
      font-weight: 500;
    }

    .status-bad {
      color: #f44336;
      font-weight: 500;
    }

    .warning {
      font-size: 12px;
      color: #ff9800;
      margin-top: 4px;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      
      mat-spinner {
        margin-bottom: 16px;
      }
    }

    .test-results {
      margin: 16px 0;
    }

    .test-conversation {
      .user-message, .bot-message {
        margin: 8px 0;
        padding: 8px 12px;
        border-radius: 8px;
      }
      
      .user-message {
        background: #e3f2fd;
        text-align: right;
      }
      
      .bot-message {
        background: #f3e5f5;
      }
      
      .quick-replies {
        margin: 12px 0;
        
        .reply-chip {
          display: inline-block;
          background: #e0e0e0;
          padding: 4px 8px;
          border-radius: 12px;
          margin: 2px 4px;
          font-size: 12px;
        }
      }
    }
  `]
})
export class BotStatusComponent implements OnInit {
    @Input() bot: any;

    botStatus: any = null;
    testResult: any = null;
    isLoading = false;

    constructor(
        private botService: BotService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        if (this.bot) {
            this.refreshStatus();
        }
    }

    refreshStatus() {
        if (!this.bot) return;

        this.isLoading = true;
        // Use the new automatic status endpoint
        this.botService.getBotStatus(this.bot.id).subscribe({
            next: (status: any) => {
                this.botStatus = status;
                this.isLoading = false;
                console.log('Bot status:', status);
            },
            error: (error: any) => {
                console.error('Error getting bot status:', error);
                this.snackBar.open('Error loading bot status', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    getStatusColor(): string {
        if (!this.botStatus) return 'accent';
        return this.botStatus.status === 'ready' ? 'primary' : 'warn';
    }

    getStatusIcon(): string {
        if (!this.botStatus) return 'help';
        return this.botStatus.status === 'ready' ? 'check_circle' : 'warning';
    }

    getStatusText(): string {
        if (!this.botStatus) return 'Checking...';
        return this.botStatus.status === 'ready' ? '✅ Ready to Chat!' : '⚠️ Setup Required';
    }

    getStatusDescription(): string {
        if (!this.botStatus) return 'Loading bot status...';

        if (this.botStatus.status === 'ready') {
            return 'Your bot is configured and ready to receive messages!';
        } else {
            const issues = [];
            if (!this.botStatus.webhook?.is_configured) issues.push('webhook');
            if (!this.botStatus.flows?.default_flow) issues.push('default flow');
            return `Missing: ${issues.join(' and ')}`;
        }
    }

    needsWebhookFix(): boolean {
        return this.botStatus?.webhook?.is_configured && !this.botStatus?.webhook?.is_correct;
    }

    isReadyForTesting(): boolean {
        return this.botStatus?.webhook?.is_configured &&
            this.botStatus?.webhook?.is_correct &&
            this.botStatus?.flows?.default_flow;
    }

    fixWebhook() {
        this.isLoading = true;
        this.botService.fixBotWebhook(this.bot.id).subscribe({
            next: () => {
                this.snackBar.open('✅ Webhook fixed successfully!', 'Close', { duration: 3000 });
                this.refreshStatus();
            },
            error: (error: any) => {
                console.error('Error fixing webhook:', error);
                this.snackBar.open('❌ Failed to fix webhook', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    createDefaultFlow() {
        // Navigate to flow creation
        window.location.href = `/bots/${this.bot.id}/flows`;
    }

    testFlow() {
        const testMessage = prompt('Enter test message:', 'Hello!');
        if (!testMessage) return;

        this.isLoading = true;
        this.botService.testBotFlow(this.bot.id, testMessage).subscribe({
            next: (result: any) => {
                this.testResult = result;
                this.snackBar.open('✅ Bot test completed', 'Close', { duration: 2000 });
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error testing bot:', error);
                this.snackBar.open('❌ Bot test failed', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }
}