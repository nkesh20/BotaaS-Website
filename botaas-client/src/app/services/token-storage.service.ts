import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private getStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage;
    }
    return null;
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem('token') : null;
  }

  setToken(token: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem('token', token);
    }
  }

  removeToken(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem('token');
    }
  }
} 