import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'en' | 'ka';

export interface TranslationData {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  private translationsSubject = new BehaviorSubject<TranslationData>({});
  
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  public translations$ = this.translationsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ka')) {
        this.setLanguage(savedLanguage);
      } else {
        this.setLanguage('en');
      }
    } else {
      // Default to English for SSR
      this.setLanguage('en');
    }
  }

  public setLanguage(language: Language): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', language);
    }
    this.currentLanguageSubject.next(language);
    this.loadTranslations(language);
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  private async loadTranslations(language: Language): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      // For SSR, we'll load translations synchronously or use a default
      // For now, we'll just set empty translations and let the client handle it
      this.translationsSubject.next({});
      return;
    }

    try {
      const response = await fetch(`/assets/i18n/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${language}`);
      }
      const translations = await response.json();
      this.translationsSubject.next(translations);
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
      // Fallback to English if translation file fails to load
      if (language !== 'en') {
        this.setLanguage('en');
      }
    }
  }

  public translate(key: string): string {
    const translations = this.translationsSubject.value;
    
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  }

  public getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ka', name: 'Georgian', nativeName: 'ქართული' }
    ];
  }
} 