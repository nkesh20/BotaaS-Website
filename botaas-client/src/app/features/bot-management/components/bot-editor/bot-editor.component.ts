import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TelegramBot, TelegramBotCreate, TelegramBotUpdate } from '../../../../models/telegram-bot.model';
import { BotService } from '../../services/bot.service';

@Component({
  selector: 'app-bot-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="bot-editor-container">
      <h2>{{ isEditing ? 'Edit Bot' : 'Create Bot' }}</h2>
      <form [formGroup]="botForm" (ngSubmit)="onSubmit()">
        <div class="form-group" *ngIf="!isEditing">
          <label for="token">Bot Token</label>
          <input id="token" type="password" formControlName="token" class="form-control">
          <div class="error" *ngIf="botForm.get('token')?.errors?.['required'] && botForm.get('token')?.touched">
            Bot token is required
          </div>
        </div>

        <!-- Basic Bot Information -->
        <div class="form-section" *ngIf="isEditing">
          <div class="form-group">
            <label for="firstName">Bot Name</label>
            <input id="firstName" type="text" formControlName="first_name" class="form-control" placeholder="Enter bot display name">
            <small class="help-text">This is the name that appears in Telegram</small>
          </div>
        </div>

        <!-- Descriptions -->
        <div class="form-section" *ngIf="isEditing">
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" class="form-control" rows="4" placeholder="Detailed description of your bot..."></textarea>
            <small class="help-text">Detailed description shown in bot info</small>
          </div>

          <div class="form-group">
            <label for="shortDescription">Short Description</label>
            <textarea id="shortDescription" formControlName="short_description" class="form-control" rows="2" placeholder="Brief description..."></textarea>
            <small class="help-text">Short description for bot lists</small>
          </div>
        </div>

        <!-- Bot Settings -->
        <div class="form-section" *ngIf="isEditing">
          <h3>Bot Settings</h3>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="can_join_groups">
              Can Join Groups
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="can_read_all_group_messages">
              Can Read All Group Messages
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="supports_inline_queries">
              Supports Inline Queries
            </label>
          </div>
        </div>
        
        <div class="button-group">
          <button type="submit" [disabled]="!botForm.valid" class="btn btn-primary">Save Bot</button>
          <button type="button" (click)="goBack()" class="btn btn-secondary">Cancel</button>
          <button type="button" *ngIf="isEditing" (click)="refreshBotInfo()" class="btn btn-info">Refresh Bot Info</button>
          <button type="button" *ngIf="isEditing" (click)="toggleBotActive()" class="btn" [class.btn-danger]="bot?.is_active" [class.btn-success]="!bot?.is_active">
            {{ bot?.is_active ? 'Deactivate' : 'Activate' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .bot-editor-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-info {
      background-color: #17a2b8;
      color: white;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
    }

    .form-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .form-section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }

    .help-text {
      display: block;
      margin-top: 5px;
      font-size: 0.875rem;
      color: #666;
    }

    .image-preview {
      margin-top: 10px;
      max-width: 100px;
      max-height: 100px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }

    .image-preview img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .note-warning {
      margin-top: 8px;
      padding: 8px 12px;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #856404;
    }

    .note-warning strong {
      color: #533f03;
    }

    .note-warning a {
      color: #0066cc;
      text-decoration: none;
    }

    .note-warning a:hover {
      text-decoration: underline;
    }
  `]
})
export class BotEditorComponent implements OnInit {
  botForm: FormGroup;
  isEditing = false;
  botId?: number;
  bot?: TelegramBot;

  constructor(
    private fb: FormBuilder,
    private botService: BotService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.botForm = this.fb.group({
      token: ['', [Validators.required]],
      first_name: [''],
      description: [''],
      short_description: [''],
      can_join_groups: [true],
      can_read_all_group_messages: [false],
      supports_inline_queries: [false]
    });
  }

  ngOnInit(): void {
    this.botId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.botId) {
      this.isEditing = true;
      // Remove required validator from token when editing
      this.botForm.get('token')?.clearValidators();
      this.botForm.get('token')?.updateValueAndValidity();
      this.loadBot();
    }
  }

  loadBot(): void {
    if (this.botId) {
      this.botService.getBot(this.botId).subscribe({
        next: (bot) => {
          this.bot = bot;
          this.botForm.patchValue({
            first_name: bot.first_name,
            description: bot.description,
            short_description: bot.short_description,
            can_join_groups: bot.can_join_groups,
            can_read_all_group_messages: bot.can_read_all_group_messages,
            supports_inline_queries: bot.supports_inline_queries
          });
        },
        error: (error) => {
          console.error('Error loading bot:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.botForm.valid) {
      if (this.isEditing && this.botId) {
        const updateData: TelegramBotUpdate = this.botForm.value;
        this.botService.updateBot(this.botId, updateData).subscribe({
          next: (updatedBot) => {
            console.log('Bot updated successfully:', updatedBot);
            this.router.navigate(['/bots']);
          },
          error: (error) => {
            console.error('Error updating bot:', error);
          }
        });
      } else {
        const createData: TelegramBotCreate = {
          token: this.botForm.value.token
        };
        this.botService.createBot(createData).subscribe({
          next: (createdBot) => {
            console.log('Bot created successfully:', createdBot);
            this.router.navigate(['/bots']);
          },
          error: (error) => {
            console.error('Error creating bot:', error);
          }
        });
      }
    }
  }

  refreshBotInfo(): void {
    if (this.botId) {
      this.botService.refreshBotInfo(this.botId).subscribe({
        next: (updatedBot) => {
          this.bot = updatedBot;
          this.botForm.patchValue({
            first_name: updatedBot.first_name,
            description: updatedBot.description,
            short_description: updatedBot.short_description,
            can_join_groups: updatedBot.can_join_groups,
            can_read_all_group_messages: updatedBot.can_read_all_group_messages,
            supports_inline_queries: updatedBot.supports_inline_queries
          });
        },
        error: (error) => {
          console.error('Error refreshing bot:', error);
        }
      });
    }
  }

  toggleBotActive(): void {
    if (this.botId) {
      this.botService.toggleBotActive(this.botId).subscribe({
        next: (updatedBot) => {
          this.bot = updatedBot;
        },
        error: (error) => {
          console.error('Error toggling bot status:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/bots']);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const preview = target.parentElement;
    if (preview) {
      preview.style.display = 'none';
    }
  }
} 