import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

interface LocalUser {
  _id: string;
  username: string;
  passwordHash: string;
  type: 'local-user';
}

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private db: PouchDB.Database<LocalUser>;

  constructor() {
    this.db = new PouchDB<LocalUser>('aem-local-auth');
  }

  async registerLocalUser(
    username: string,
    password: string
  ): Promise<void> {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername || !password) {
      throw new Error('Username and password are required.');
    }

    const userId = `user:${normalizedUsername}`;

    try {
      await this.db.get(userId);
      throw new Error('A local user with this username already exists.');
    } catch (error: unknown) {
      const status =
        typeof error === 'object' &&
        error !== null &&
        'status' in error
          ? (error as { status?: number }).status
          : undefined;

      if (status !== 404) {
        throw error;
      }
    }

    await this.db.put({
      _id: userId,
      username: normalizedUsername,
      passwordHash: await this.hashPassword(password),
      type: 'local-user'
    });
  }

  async validateCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    const normalizedUsername = username.trim().toLowerCase();

    try {
      const user = await this.db.get(`user:${normalizedUsername}`);

      if (user.type !== 'local-user' || !user.passwordHash) {
        return false;
      }

      return (await this.hashPassword(password)) === user.passwordHash;
    } catch (error: unknown) {
      const status =
        typeof error === 'object' &&
        error !== null &&
        'status' in error
          ? (error as { status?: number }).status
          : undefined;

      if (status !== 404) {
        console.error('Local credential lookup failed:', error);
      }

      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hash = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}
