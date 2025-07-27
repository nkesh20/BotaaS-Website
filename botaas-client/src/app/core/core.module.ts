import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslatePipe,
    LanguageSelectorComponent
  ],
  exports: [
    TranslatePipe,
    LanguageSelectorComponent
  ]
})
export class CoreModule { }
