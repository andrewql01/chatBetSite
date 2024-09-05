import { Injectable } from '@angular/core';
import { JWTTokenService } from './jwt-token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private jwtTokenService: JWTTokenService) {}

  // Set the JWT token after login or refresh
  setToken(token: string): void {
    this.jwtTokenService.setToken(token);
  }

  // Get the stored JWT token
  getToken(): string | null {
    return this.jwtTokenService.getJWTToken();
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.jwtTokenService.isTokenExpired();
  }

  // Get user details from the token
  getUserDetails() {
    return this.jwtTokenService.getDecodeToken();
  }

  // Logout the user
  logout(): void {
    this.jwtTokenService.setToken(''); // Clear the token
    // Optionally, clear other storage (like refresh tokens)
    localStorage.removeItem('refreshToken');
  }
}
