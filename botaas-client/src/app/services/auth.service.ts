import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

interface User {
  id: number;
  username: string;
  email: string;
  telegram_id: string;
  telegram_username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private jwtHelper = new JwtHelperService();

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromToken();
  }

  private getStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage;
    }
    return null;
  }

  telegramLogin(authData: any): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/auth/telegram-login/`, authData)
      .pipe(
        tap(response => {
          const storage = this.getStorage();
          if (storage) {
            storage.setItem('token', response.access_token);
            storage.setItem('token_type', response.token_type);
          }
          this.loadUserInfo();
        })
      );
  }

  loadUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me/`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  isLoggedIn(): boolean {
    const storage = this.getStorage();
    if (!storage) return false;
    
    const token = storage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem('token') : null;
  }

  logout(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem('token');
      storage.removeItem('token_type');
    }
    this.currentUserSubject.next(null);
  }

  private loadUserFromToken(): void {
    if (this.isLoggedIn()) {
      this.loadUserInfo().subscribe();
    }
  }
}