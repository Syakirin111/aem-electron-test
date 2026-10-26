
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LocalAuthService } from '../../../core/services/local-auth.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private localAuthService: LocalAuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.loading) {
      form.control.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.sessionService.setMode('api');
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: async error => {
        console.error('API login failed:', error);

        try {
          const validLocalUser =
            await this.localAuthService.validateCredentials(
              this.username,
              this.password
            );
            console.log('PouchDB fallback username:', this.username);
            console.log('PouchDB validation result:', validLocalUser);

          if (validLocalUser) {
          console.log('Local login valid. Navigating to offline dashboard.');
          
            this.authService.logout();
            this.sessionService.setMode('offline');
            this.loading = false;
            this.router.navigate(['/dashboard']);
            return;
          }

          this.errorMessage =
            'Sign in failed. Please check your credentials or API connection.';
        } catch (localError) {
          console.error('Local login validation failed:', localError);
          this.errorMessage =
            'Sign in failed. Please check your credentials or API connection.';
        } finally {
          this.loading = false;
        }
      }
    });
  }
}
