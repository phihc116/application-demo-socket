export class AuthService {
  private static TOKEN_KEY = 'access_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeader(): string {
    const token = this.getToken();
    return token ? `Bearer ${token}` : '';
  }
}
