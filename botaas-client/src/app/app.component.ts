import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // The translation service will automatically initialize
    // and load the appropriate language from localStorage
  }
}