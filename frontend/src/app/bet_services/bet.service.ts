import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {AuthService} from "../auth_services/auth.service";
import { SportEvent } from '../classes/event'

@Injectable({
  providedIn: 'root'
})
export class BetService {
  private apiUrl = 'http://127.0.0.1:8000/api/bets/';

  constructor(private http: HttpClient) {
  }

  getEvents(limit: number): Observable<SportEvent[]>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('limit', limit);
    return this.http.get<SportEvent[]>(this.apiUrl + 'get-events/', { params, headers })
  }

}
