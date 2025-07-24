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
    NgFor
  ]
})
export class BroadcastComponent implements OnInit {
  broadcastForm: FormGroup;
  bots: TelegramBot[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private botService: BotService,
    private broadcastService: BroadcastService,
    private snackBar: MatSnackBar
  ) {
    this.broadcastForm = this.fb.group({
      bot_id: [null, Validators.required],
      text: ['', [Validators.required, Validators.maxLength(4096)]],
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
    this.broadcastService.broadcast(this.broadcastForm.value).subscribe({
      next: res => {
        this.snackBar.open('Broadcast scheduled successfully!', 'Close', { duration: 3000 });
        this.broadcastForm.reset({ parse_mode: 'Markdown' });
        this.loading = false;
      },
      error: err => {
        this.snackBar.open('Failed to schedule broadcast: ' + (err.error?.detail || err.message), 'Close', { duration: 5000 });
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