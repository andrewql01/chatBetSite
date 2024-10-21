// user.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, delay, Observable} from 'rxjs';
import { User } from '../classes/user';
import {Chat} from "../classes/chat";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users/';  // URL to web API

  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  fetchCurrentUser(): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<User>(`${this.apiUrl}current/`, { headers }).pipe(
      tap(user => {
        // After fetching the user, store it in the BehaviorSubject
        this.userSubject.next(user);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  getAllUsers(): Observable<User[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<User[]>(`${this.apiUrl}get-all-users/`, { headers });
  }

  getUserChats(): Observable<Chat[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Chat[]>(`${this.apiUrl}chats/`, { headers });
  }

  addUserToChat(userId: number, chatId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = { userId, chatId };
    return this.http.put<any>(`${this.apiUrl}add-chat-user/`, payload, { headers });
  }

  createChat(name: string): Observable<Chat> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = { name }
    return this.http.post<Chat>(`${this.apiUrl}create-chat/`, payload, { headers });
  }
}
