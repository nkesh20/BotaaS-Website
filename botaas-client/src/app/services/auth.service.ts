import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { TokenStorageService } from './token-storage.service';

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
    private tokenStorage: TokenStorageService,
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
          this.tokenStorage.setToken(response.access_token);
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
    const token = this.tokenStorage.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  logout(): void {
    this.tokenStorage.removeToken();
    this.currentUserSubject.next(null);
  }

  private loadUserFromToken(): void {
    if (this.isLoggedIn()) {
      this.loadUserInfo().subscribe();
    }
  }
}