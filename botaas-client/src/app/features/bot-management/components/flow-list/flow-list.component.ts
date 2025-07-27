import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BotService, Flow } from '../../services/bot.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-flow-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    TranslatePipe
  ],
  template: `
    <div class="flow-list-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h2>{{ 'flows.conversationFlows' | translate }}</h2>
          <p>{{ 'flows.manageFlowsDescription' | translate }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="createNewFlow()">
          <mat-icon>add</mat-icon>
          {{ 'flows.createNewFlow' | translate }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>{{ 'flows.loadingFlows' | translate }}</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-button color="primary" (click)="loadFlows()">{{ 'common.tryAgain' | translate }}</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && !error && flows.length === 0" class="empty-state">
        <mat-icon>account_tree</mat-icon>
        <h3>{{ 'flows.noFlowsYet' | translate }}</h3>
        <p>{{ 'flows.createFirstFlowDescription' | translate }}</p>
        <button mat-raised-button color="primary" (click)="createNewFlow()">
          <mat-icon>add</mat-icon>
          {{ 'flows.createFirstFlow' | translate }}
        </button>
      </div>

      <!-- Flows Grid -->
      <div *ngIf="!isLoading && !error && flows.length > 0" class="flows-grid">
        <div *ngFor="let flow of flows" class="flow-card" [class.default-flow]="flow.is_default">
          <mat-card>
            <mat-card-header>
              <div mat-card-avatar class="flow-avatar">
                <mat-icon>{{ getFlowIcon(flow) }}</mat-icon>
              </div>
              <mat-card-title>{{ flow.name }}</mat-card-title>
              <mat-card-subtitle>
                {{ flow.description || ('common.noDescription' | translate) }}
              </mat-card-subtitle>

              <!-- Menu Button -->
              <button mat-icon-button [matMenuTriggerFor]="flowMenu" class="menu-button">
                <mat-icon>more_vert</mat-icon>
              </button>

              <!-- Flow Menu -->
              <mat-menu #flowMenu="matMenu">
                <button mat-menu-item (click)="editFlow(flow)">
                  <mat-icon>edit</mat-icon>
                  <span>{{ 'flows.editFlow' | translate }}</span>
                </button>
                <button mat-menu-item (click)="duplicateFlow(flow)">
                  <mat-icon>content_copy</mat-icon>
                  <span>{{ 'flows.duplicate' | translate }}</span>
                </button>
                <button mat-menu-item (click)="toggleFlowActive(flow)">
                  <mat-icon>{{ flow.is_active ? 'pause' : 'play_arrow' }}</mat-icon>
                  <span>{{ flow.is_active ? ('common.deactivate' | translate) : ('common.activate' | translate) }}</span>
                </button>
                <button mat-menu-item (click)="setAsDefault(flow)" *ngIf="!flow.is_default">
                  <mat-icon>star</mat-icon>
                  <span>{{ 'flows.setAsDefault' | translate }}</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="deleteFlow(flow)" class="delete-option">
                  <mat-icon>delete</mat-icon>
                  <span>{{ 'flows.deleteFlow' | translate }}</span>
                </button>
              </mat-menu>
            </mat-card-header>

            <mat-card-content>
              <!-- Flow Status -->
              <div class="flow-status">
                <mat-chip-set>
                  <mat-chip [class]="flow.is_active ? 'status-active' : 'status-inactive'">
                    <mat-icon matChipAvatar>{{ flow.is_active ? 'radio_button_checked' : 'radio_button_unchecked' }}</mat-icon>
                    {{ flow.is_active ? ('common.active' | translate) : ('common.inactive' | translate) }}
                  </mat-chip>
                  <mat-chip *ngIf="flow.is_default" class="status-default">
                    <mat-icon matChipAvatar>star</mat-icon>
                    {{ 'flows.default' | translate }}
                  </mat-chip>
                </mat-chip-set>
              </div>

              <!-- Flow Stats -->
              <div class="flow-stats">
                <div class="stat">
                  <span class="stat-label">{{ 'flows.nodes' | translate }}:</span>
                  <span class="stat-value">{{ (flow.nodes || []).length }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">{{ 'flows.connections' | translate }}:</span>
                  <span class="stat-value">{{ (flow.edges || []).length }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">{{ 'common.created' | translate }}:</span>
                  <span class="stat-value">{{ formatDate(flow.created_at) }}</span>
                </div>
              </div>

              <!-- Flow Preview -->
              <div class="flow-preview" *ngIf="(flow.nodes || []).length > 0">
                <h4>{{ 'flows.flowPreview' | translate }}</h4>
                <div class="preview-nodes">
                  <div *ngFor="let node of (flow.nodes || []).slice(0, 3)" class="preview-node">
                    <mat-icon>{{ getNodeIcon(node) }}</mat-icon>
                    <span>{{ node.label || ('flows.unnamedNode' | translate) }}</span>
                  </div>
                  <div *ngIf="(flow.nodes || []).length > 3" class="preview-more">
                    +{{ (flow.nodes || []).length - 3 }} {{ 'common.more' | translate }}
                  </div>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="editFlow(flow)" color="primary">
                <mat-icon>edit</mat-icon>
                {{ 'flows.edit' | translate }}
              </button>
              <button mat-button (click)="toggleFlowActive(flow)" [color]="flow.is_active ? 'warn' : 'primary'">
                <mat-icon>{{ flow.is_active ? 'pause' : 'play_arrow' }}</mat-icon>
                {{ flow.is_active ? ('common.deactivate' | translate) : ('common.activate' | translate) }}
              </button>
              <button mat-button (click)="setAsDefault(flow)" *ngIf="!flow.is_default" color="accent">
                <mat-icon>star</mat-icon>
                {{ 'flows.setDefault' | translate }}
              </button>
              <button mat-button (click)="testFlow(flow)" [disabled]="!flow.is_active">
                <mat-icon>play_arrow</mat-icon>
                {{ 'flows.test' | translate }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Default Flow Info -->
      <div *ngIf="defaultFlow" class="default-flow-info">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon color="primary">star</mat-icon>
              {{ 'flows.defaultFlow' | translate }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>{{ defaultFlow.name }}</strong> {{ 'flows.defaultFlowDescription' | translate }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .flow-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 20px;
    }

    .header-content h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .header-content p {
      margin: 0;
      color: #666;
    }

    .loading-container, .error-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #999;
    }

    .flows-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .flow-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .flow-card:hover {
      transform: translateY(-2px);
    }

    .flow-card.default-flow mat-card {
      border: 2px solid #ffd700;
      background: linear-gradient(135deg, #fff9c4 0%, #ffffff 100%);
    }

    .flow-avatar {
      background: #1976d2;
      color: white;
    }

    .menu-button {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .flow-status {
      margin: 16px 0;
    }

    .status-active {
      background: #4caf50 !important;
      color: white !important;
    }

    .status-inactive {
      background: #f44336 !important;
      color: white !important;
    }

    .status-default {
      background: #ff9800 !important;
      color: white !important;
    }

    .flow-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 16px 0;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      display: block;
      font-weight: 600;
      color: #333;
    }

    .flow-preview {
      margin: 16px 0;
    }

    .flow-preview h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
    }

    .preview-nodes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .preview-node {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #e3f2fd;
      border-radius: 12px;
      font-size: 12px;
    }

    .preview-node mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #1976d2;
    }

    .preview-more {
      padding: 4px 8px;
      background: #f0f0f0;
      border-radius: 12px;
      font-size: 12px;
      color: #666;
    }

    .default-flow-info {
      margin-top: 24px;
    }

    .default-flow-info mat-card {
      background: #fff3e0;
      border: 1px solid #ffcc02;
    }

    .delete-option {
      color: #f44336 !important;
    }

    mat-card-actions {
      padding: 8px 16px 16px 16px;
    }

    mat-card-actions button {
      margin-right: 8px;
    }
  `]
})
export class FlowListComponent implements OnInit {
  botId!: number;
  
  flows: Flow[] = [];
  defaultFlow: Flow | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private botService: BotService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.botId = parseInt(this.route.snapshot.params['botId']);
    this.loadFlows();
  }

  loadFlows() {
    this.isLoading = true;
    this.error = null;

    this.botService.getBotFlows(this.botId).subscribe({
      next: (flows) => {
        this.flows = flows;
        this.defaultFlow = flows.find(f => f.is_default) || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load flows. Please try again.';
        this.isLoading = false;
      }
    });
  }

  createNewFlow() {
    this.router.navigate(['/bots', this.botId, 'flows', 'new']);
  }

  editFlow(flow: Flow) {
    this.router.navigate(['/bots', this.botId, 'flows', flow.id]);
  }

  duplicateFlow(flow: Flow) {
    const duplicatedFlow = {
      ...flow,
      name: `${flow.name} (Copy)`,
      is_default: false,
      id: undefined
    };

    this.botService.createFlow(this.botId, duplicatedFlow).subscribe({
      next: (newFlow) => {
        this.snackBar.open('Flow duplicated successfully', 'Close', { duration: 3000 });
        this.loadFlows();
      },
      error: (error) => {
        this.snackBar.open('Failed to duplicate flow', 'Close', { duration: 3000 });
      }
    });
  }

  toggleFlowActive(flow: Flow) {
    const updateData = { is_active: !flow.is_active };
    
    this.botService.updateFlow(this.botId, flow.id, updateData).subscribe({
      next: (updatedFlow) => {
        this.snackBar.open(
          `Flow ${updatedFlow.is_active ? 'activated' : 'deactivated'} successfully`, 
          'Close', 
          { duration: 3000 }
        );
        this.loadFlows();
      },
      error: (error) => {
        this.snackBar.open('Failed to update flow status', 'Close', { duration: 3000 });
      }
    });
  }

  setAsDefault(flow: Flow) {
    this.botService.setFlowAsDefault(this.botId, flow.id).subscribe({
      next: (result) => {
        this.snackBar.open('Default flow set successfully', 'Close', { duration: 3000 });
        this.loadFlows();
      },
      error: (error) => {
        this.snackBar.open('Failed to set default flow', 'Close', { duration: 3000 });
      }
    });
  }

  deleteFlow(flow: Flow) {
    if (confirm(`Are you sure you want to delete the flow "${flow.name}"?`)) {
      this.botService.deleteFlow(this.botId, flow.id).subscribe({
        next: () => {
          this.snackBar.open('Flow deleted successfully', 'Close', { duration: 3000 });
          this.loadFlows();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete flow', 'Close', { duration: 3000 });
        }
      });
    }
  }

  testFlow(flow: Flow) {
    const testMessage = prompt('Enter a test message:', 'Hello');
    if (!testMessage) return;

    this.botService.executeFlow(this.botId, flow.id, testMessage, 'test_user').subscribe({
      next: (result) => {
        this.snackBar.open('Flow test completed', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to test flow', 'Close', { duration: 3000 });
      }
    });
  }

  getFlowIcon(flow: Flow): string {
    if (flow.is_default) return 'star';
    if (flow.is_active) return 'play_arrow';
    return 'pause';
  }

  getNodeIcon(node: any): string {
    const iconMap: { [key: string]: string } = {
      start: 'play_arrow',
      message: 'chat',
      condition: 'call_split',
      action: 'settings',
      webhook: 'webhook',
      input: 'input',
      end: 'stop',
      default: 'radio_button_unchecked'
    };

    return iconMap[node.data?.type || 'default'] || iconMap['default'];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
} 