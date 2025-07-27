import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TelegramBotService } from '../../../services/telegram-bot.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'app-bot-add',
    templateUrl: './bot-add.component.html',
    styleUrls: ['./bot-add.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        NgIf,
        TranslatePipe
    ]
})
export class AddBotComponent implements OnInit {
    addBotForm!: FormGroup;
    isSubmitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private telegramBotService: TelegramBotService,
        private router: Router,
        private snackBar: MatSnackBar,
        private translationService: TranslationService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.addBotForm = this.formBuilder.group({
            token: ['', [
                Validators.required,
                Validators.pattern(/^\d+:[A-Za-z0-9_-]+$/) // Basic Telegram bot token format
            ]]
        });
    }

    onSubmit(): void {
        if (this.addBotForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;

            const formData = this.addBotForm.value;

            this.telegramBotService.createBot(formData).subscribe({
                next: (bot) => {
                    this.showSnackBar(this.translationService.translate('bots.botAddedSuccess'), 'success');
                    this.router.navigate(['/bots']);
                },
                error: (error) => {
                    console.error('Error adding bot:', error);
                    this.isSubmitting = false;

                    let errorMessage = this.translationService.translate('bots.failedToAddBot');

                    if (error.error?.detail) {
                        errorMessage = error.error.detail;
                    } else if (error.status === 400) {
                        errorMessage = this.translationService.translate('bots.invalidTokenOrExists');
                    } else if (error.status === 401) {
                        errorMessage = this.translationService.translate('bots.notAuthorized');
                    } else if (error.status === 408) {
                        errorMessage = this.translationService.translate('bots.timeoutError');
                    }

                    this.showSnackBar(errorMessage, 'error');
                }
            });
        }
    }

    onCancel(): void {
        this.router.navigate(['/bots']);
    }

    // Helper method to get form control errors
    getTokenError(): string {
        const tokenControl = this.addBotForm.get('token');

        if (tokenControl?.hasError('required')) {
            return this.translationService.translate('bots.tokenRequired');
        }

        if (tokenControl?.hasError('pattern')) {
            return this.translationService.translate('bots.invalidTokenFormat');
        }

        return '';
    }

    private showSnackBar(message: string, type: 'success' | 'error'): void {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
        });
    }
}