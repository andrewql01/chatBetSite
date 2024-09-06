import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://127.0.0.1:8000/api/token/'; // Your API endpoint

  constructor(private http: HttpClient,
              private authService: AuthService,
              private userService: UserService,) { }

  // Sign in method
  signIn(username: string, password: string): Observable<any> {
    const payload = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.apiUrl, payload, { headers })
      .pipe(
        tap((response: any) => {
          // Assuming the response contains the tokens
          const { access, refresh } = response; // Adjust according to your API response
          this.authService.setToken(access);  // Store the access token
          localStorage.setItem('refreshToken', refresh);  // Store the refresh token
        })
      );
  }

  // Refresh the token using the refresh token
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.apiUrl + 'refresh/', { refresh: refreshToken }, { headers }); // Ensure refresh is in payload
  }

  signInCallBack(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.refreshToken().subscribe({
        next: (response: any) => {
          const { access } = response; // Ensure access token key matches your backend response
          this.authService.setToken(access);  // Update the access token
          resolve(true);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}
