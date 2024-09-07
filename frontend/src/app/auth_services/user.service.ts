// user.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../classes/user';
import {Chat} from "../classes/chat";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/users/';  // URL to web API

  constructor(private http: HttpClient) { }

  getUser(): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<User>(`${this.apiUrl}current/`, { headers });
  }

  getUserChats(): Observable<Chat[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Chat[]>(`${this.apiUrl}chats/`, { headers });
  }

  createChat(name: string): Observable<Chat> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = { name }
    return this.http.post<Chat>(`${this.apiUrl}create-chat/`, payload, { headers });
  }
}
