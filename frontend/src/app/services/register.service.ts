import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = 'http://127.0.0.1:8000/api/token/'; // Your API endpoint

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Sign in method
  signUp(email: string, username: string, password: string): Observable<any> {
    const payload = { email, username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.apiUrl, payload, { headers })
      .pipe(
        tap((response: any) => {
          // Assuming the response contains the tokens
          console.log(response) // Adjust according to your API response
          // this.authService.setToken(access);  // Store the access token
          // localStorage.setItem('refreshToken', refresh);  // Store the refresh token
        })
      );
  }
}
