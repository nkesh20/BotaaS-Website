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
        NgIf
    ]
})
export class AddBotComponent implements OnInit {
    addBotForm!: FormGroup;
    isSubmitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private telegramBotService: TelegramBotService,
        private router: Router,
        private snackBar: MatSnackBar
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
                    this.showSnackBar('Bot added successfully!', 'success');
                    this.router.navigate(['/bots']);
                },
                error: (error) => {
                    console.error('Error adding bot:', error);
                    this.isSubmitting = false;

                    let errorMessage = 'Failed to add bot. Please try again.';

                    if (error.error?.detail) {
                        errorMessage = error.error.detail;
                    } else if (error.status === 400) {
                        errorMessage = 'Invalid bot token or bot already exists.';
                    } else if (error.status === 401) {
                        errorMessage = 'You are not authorized. Please log in again.';
                    } else if (error.status === 408) {
                        errorMessage = 'Timeout while connecting to Telegram. Please try again.';
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
            return 'Bot token is required';
        }

        if (tokenControl?.hasError('pattern')) {
            return 'Invalid token format. Token should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
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