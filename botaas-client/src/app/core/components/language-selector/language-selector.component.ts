import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { TranslationService, Language } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    TranslatePipe
  ],
  template: `
    <mat-form-field appearance="outline" class="language-selector">
      <mat-select 
        [value]="currentLanguage" 
        (selectionChange)="onLanguageChange($event.value)"
        class="language-select">
        <mat-option 
          *ngFor="let lang of availableLanguages" 
          [value]="lang.code"
          class="language-option">
          <span class="language-native">{{ lang.nativeName }}</span>
          <span class="language-english">({{ lang.name }})</span>
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .language-selector {
      width: 100%;
      margin: 0;
    }

    .language-select {
      font-size: 14px;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .language-native {
      font-weight: 500;
    }

    .language-english {
      color: #666;
      font-size: 12px;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: Language = 'en';
  availableLanguages: { code: Language; name: string; nativeName: string }[] = [];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.availableLanguages = this.translationService.getAvailableLanguages();
  }

  onLanguageChange(language: Language): void {
    this.translationService.setLanguage(language);
    this.currentLanguage = language;
  }
} 