
import { Injectable } from '@angular/core';

export type SessionMode = 'api' | 'offline' | null;

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly sessionModeKey = 'aem_session_mode';

  setMode(mode: Exclude<SessionMode, null>): void {
    sessionStorage.setItem(this.sessionModeKey, mode);
  }

  getMode(): SessionMode {
    const mode = sessionStorage.getItem(this.sessionModeKey);

    if (mode === 'api' || mode === 'offline') {
      return mode;
    }

    return null;
  }

  isOffline(): boolean {
    return this.getMode() === 'offline';
  }

  clear(): void {
    sessionStorage.removeItem(this.sessionModeKey);
  }
}
