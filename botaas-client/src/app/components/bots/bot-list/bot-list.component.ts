import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TelegramBotService } from '../../../services/telegram-bot.service';
import { TelegramBot } from '../../../models/telegram-bot.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, NgIf } from '@angular/common';
import { BotStatusComponent } from '../../../features/bots/pages/bot-detail/bot-status.component';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';


@Component({
    selector: 'app-bot-list',
    templateUrl: './bot-list.component.html',
    styleUrls: ['./bot-list.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatMenuModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTabsModule,
        MatDividerModule,
        NgFor,
        NgIf,
        BotStatusComponent,
        TranslatePipe
    ]
})
export class BotListComponent implements OnInit {
    bots: TelegramBot[] = [];
    loading = true;
    error: string | null = null;

    constructor(
        private telegramBotService: TelegramBotService,
        private router: Router,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadBots();
    }

    loadBots(): void {
        this.loading = true;
        this.error = null;

        this.telegramBotService.getBots().subscribe({
            next: (response) => {
                this.bots = response.bots;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading bots:', error);
                this.error = 'Failed to load bots. Please try again.';
                this.loading = false;
                this.showSnackBar('Failed to load bots', 'error');
            }
        });
    }

    addNewBot(): void {
        this.router.navigate(['/bots/add']);
    }

    toggleBotStatus(bot: TelegramBot): void {
        this.telegramBotService.toggleBotStatus(bot.id).subscribe({
            next: (updatedBot) => {
                const index = this.bots.findIndex(b => b.id === bot.id);
                if (index !== -1) {
                    this.bots[index] = updatedBot;
                }
                this.showSnackBar(
                    `Bot ${updatedBot.is_active ? 'activated' : 'deactivated'} successfully`,
                    'success'
                );
            },
            error: (error) => {
                console.error('Error toggling bot status:', error);
                this.showSnackBar('Failed to update bot status', 'error');
            }
        });
    }

    refreshBotInfo(bot: TelegramBot): void {
        this.telegramBotService.refreshBotInfo(bot.id).subscribe({
            next: (updatedBot) => {
                const index = this.bots.findIndex(b => b.id === bot.id);
                if (index !== -1) {
                    this.bots[index] = updatedBot;
                }
                this.showSnackBar('Bot information refreshed successfully', 'success');
            },
            error: (error) => {
                console.error('Error refreshing bot info:', error);
                this.showSnackBar('Failed to refresh bot information', 'error');
            }
        });
    }

    editBot(bot: TelegramBot): void {
        this.router.navigate(['/bots', bot.id, 'edit']);
    }

    manageFlows(bot: TelegramBot): void {
        this.router.navigate(['/bots', bot.id, 'flows']);
    }

    viewBotDetails(bot: TelegramBot): void {
        this.router.navigate(['/bots', bot.id]);
    }

    deleteBot(bot: TelegramBot): void {
        if (confirm(`Are you sure you want to delete bot "@${bot.username}"? This action cannot be undone.`)) {
            this.telegramBotService.deleteBot(bot.id).subscribe({
                next: () => {
                    this.bots = this.bots.filter(b => b.id !== bot.id);
                    this.showSnackBar('Bot deleted successfully', 'success');
                },
                error: (error) => {
                    console.error('Error deleting bot:', error);
                    this.showSnackBar('Failed to delete bot', 'error');
                }
            });
        }
    }

    private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar'
        });
    }

    onBotImageError(event: Event): void {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
        const avatar = target.closest('.bot-avatar');
        if (avatar) {
            const icon = avatar.querySelector('mat-icon') as HTMLElement;
            if (icon) {
                icon.style.display = 'block';
            }
        }
    }

    onAnalytics(bot: any): void {
        this.router.navigate(['/bots', bot.id, 'analytics']);
    }
}