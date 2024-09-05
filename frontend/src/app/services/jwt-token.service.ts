import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JWTTokenService {

  private jwtToken: string = '';
  private decodedToken: { [key: string]: any } = {};

  constructor() {}

  setToken(token: string) {
    if (token) {
      this.jwtToken = token;
      this.decodeToken();
    }
  }

  private decodeToken() {
    if (this.jwtToken) {
      this.decodedToken = jwtDecode(this.jwtToken);
    }
  }

  getDecodeToken() {
    return this.decodedToken;
  }

  getUser() {
    return this.decodedToken ? this.decodedToken['username'] : null;
  }

  getEmailId() {
    return this.decodedToken ? this.decodedToken['email'] : null;
  }

  getExpiryTime() {
    return this.decodedToken ? this.decodedToken['exp'] : null;
  }

  isTokenExpired(): boolean {
    const expiryTime: number = this.getExpiryTime();
    if (expiryTime) {
      return (1000 * expiryTime) - (new Date()).getTime() < 5000;
    } else {
      return false;
    }
  }

  getJWTToken(): string {
    return this.jwtToken;
  }
}
