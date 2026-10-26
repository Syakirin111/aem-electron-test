
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl =
    'http://test-demo.aemenersol.com/api/account/login';

  private readonly tokenKey = 'aem_auth_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    return this.http.post(
      this.loginUrl,
      { username, password },
      { responseType: 'text' }
    ).pipe(
      tap(response => {
        const token = response
          .trim()
          .replace(/^Bearer\s+/i, '')
          .replace(/^["']|["']$/g, '')
          .trim();

        if (!token) {
          throw new Error('The server returned an empty token.');
        }

        localStorage.setItem(this.tokenKey, token);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
