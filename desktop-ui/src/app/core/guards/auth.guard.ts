
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const sessionMode = this.sessionService.getMode();

    if (
      sessionMode === 'api' &&
      this.authService.isAuthenticated()
    ) {
      return true;
    }

    if (sessionMode === 'offline') {
      return true;
    }

    this.authService.logout();
    this.sessionService.clear();

    return this.router.createUrlTree(['/login']);
  }
}
