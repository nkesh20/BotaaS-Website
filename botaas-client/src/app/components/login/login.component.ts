import { Component, AfterViewInit, ViewChild, ElementRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [MatCardModule, NgIf]
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('telegramLoginWidget') telegramLoginWidget!: ElementRef;

  errorMessage: string = '';

  private readonly botName = environment.telegramBotName;

  constructor(
    private authService: AuthService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngAfterViewInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.loadTelegramWidget();
    }
  }

  private loadTelegramWidget(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Create script element for Telegram widget
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?21';
    script.setAttribute('data-telegram-login', this.botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '4');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-lang', 'en');

    // Add domain configuration
    if (environment.production) {
      script.setAttribute('data-domain', 'production-domain.com');
    } else {
      script.setAttribute('data-domain', environment.domain);
    }

    // Create global callback function
    // @ts-ignore
    window.onTelegramAuth = (user: any) => {
      this.zone.run(() => {
        this.handleTelegramResponse(user);
      });
    };

    // Append script to the container
    this.telegramLoginWidget.nativeElement.appendChild(script);
  }

  private handleTelegramResponse(user: any): void {
    this.errorMessage = '';

    this.authService.telegramLogin(user).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Authentication failed. Please try again.';
      }
    });
  }
}