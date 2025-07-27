import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TelegramBot } from '../../../models/telegram-bot.model';
import { BotService } from '../services/bot.service';
import { BroadcastService } from '../services/broadcast.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-broadcast',
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgIf,
    NgFor,
    TranslatePipe
  ]
})
export class BroadcastComponent implements OnInit {
  broadcastForm: FormGroup;
  bots: TelegramBot[] = [];
  loading = false;

  availableVariables = [
    { key: 'first_name', label: 'broadcast.variables.firstName' },
    { key: 'last_name', label: 'broadcast.variables.lastName' },
    { key: 'telegram_username', label: 'broadcast.variables.telegramUsername' }
  ];

  constructor(
    private fb: FormBuilder,
    private botService: BotService,
    private broadcastService: BroadcastService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {
    this.broadcastForm = this.fb.group({
      bot_id: [null, Validators.required],
      text: ['', [Validators.required, Validators.maxLength(4096)]],
      scheduled_date: [null],
      scheduled_time: [null],
      parse_mode: ['Markdown']
    });
  }

  ngOnInit(): void {
    this.botService.getBots().subscribe(res => this.bots = res.bots);
  }

  submit() {
    if (this.broadcastForm.invalid) return;
    
    this.loading = true;
    
    // Combine date and time if both are provided
    const formData = { ...this.broadcastForm.value };
    
    if (formData.scheduled_date && formData.scheduled_time) {
      try {
        // Create datetime string in user's local timezone
        const date = formData.scheduled_date instanceof Date ? formData.scheduled_date : new Date(formData.scheduled_date);
        const [hours, minutes] = formData.scheduled_time.split(':');
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        
        // Create Date object and convert to UTC ISO string for backend
        const localDate = new Date(dateStr);
        if (isNaN(localDate.getTime())) {
          throw new Error('Invalid date/time combination');
        }
        
        formData.scheduled_time = localDate.toISOString();
      } catch (error) {
        this.loading = false;
        const errorMessage = this.translationService.translate('broadcast.dateTimeError') || 'Invalid date/time format';
        const closeText = this.translationService.translate('broadcast.close');
        this.snackBar.open(errorMessage, closeText, { duration: 5000 });
        return;
      }
    } else {
      delete formData.scheduled_time;
    }
    delete formData.scheduled_date;
    
    this.broadcastService.broadcast(formData).subscribe({
      next: res => {
        const successMessage = this.translationService.translate('broadcast.successMessage');
        const closeText = this.translationService.translate('broadcast.close');
        this.snackBar.open(successMessage, closeText, { duration: 3000 });
        this.broadcastForm.reset({ parse_mode: 'Markdown' });
        this.loading = false;
      },
      error: err => {
        const errorMessage = this.translationService.translate('broadcast.errorMessage');
        const closeText = this.translationService.translate('broadcast.close');
        this.snackBar.open(errorMessage, closeText, { duration: 5000 });
        this.loading = false;
      }
    });
  }

  insertVariable(variable: string) {
    const textarea: HTMLTextAreaElement | null = document.querySelector('textarea[formControlName="text"]');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = this.broadcastForm.get('text')?.value || '';
    const insertText = `{{${variable}}}`;
    const newValue = value.slice(0, start) + insertText + value.slice(end);
    this.broadcastForm.get('text')?.setValue(newValue);
    // Move cursor after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
    });
  }
} 