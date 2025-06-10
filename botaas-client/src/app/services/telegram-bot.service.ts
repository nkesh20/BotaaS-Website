import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TelegramBot, TelegramBotCreate, TelegramBotUpdate, TelegramBotListResponse } from '../models/telegram-bot.model';

@Injectable({
    providedIn: 'root'
})
export class TelegramBotService {
    private readonly API_URL = 'http://localhost:8000/api/v1/telegram-bots';

    constructor(private http: HttpClient) { }

    /**
     * Create a new Telegram bot
     */
    createBot(botData: TelegramBotCreate): Observable<TelegramBot> {
        return this.http.post<TelegramBot>(this.API_URL, botData);
    }

    /**
     * Get all user's bots
     */
    getBots(skip: number = 0, limit: number = 100): Observable<TelegramBotListResponse> {
        return this.http.get<TelegramBotListResponse>(`${this.API_URL}?skip=${skip}&limit=${limit}`);
    }

    /**
     * Get a specific bot by ID
     */
    getBot(botId: number): Observable<TelegramBot> {
        return this.http.get<TelegramBot>(`${this.API_URL}/${botId}`);
    }

    /**
     * Update a bot
     */
    updateBot(botId: number, updateData: TelegramBotUpdate): Observable<TelegramBot> {
        return this.http.put<TelegramBot>(`${this.API_URL}/${botId}`, updateData);
    }

    /**
     * Toggle bot active status
     */
    toggleBotStatus(botId: number): Observable<TelegramBot> {
        return this.http.post<TelegramBot>(`${this.API_URL}/${botId}/toggle`, {});
    }

    /**
     * Refresh bot information from Telegram API
     */
    refreshBotInfo(botId: number): Observable<TelegramBot> {
        return this.http.post<TelegramBot>(`${this.API_URL}/${botId}/refresh`, {});
    }

    /**
     * Delete a bot
     */
    deleteBot(botId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.API_URL}/${botId}`);
    }
}