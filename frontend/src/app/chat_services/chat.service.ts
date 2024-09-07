import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Message } from '../classes/message';
import { AuthService } from '../auth_services/auth.service'; // Ensure you have an AuthService to provide the token

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket$!: WebSocketSubject<any>;
  private url?: string;

  constructor(private http: HttpClient, private authService: AuthService) {}

  connect(roomUuid: string): void {
    if (this.socket$) {
      this.disconnect();
    }

    // Get the JWT token from the AuthService
    const token = this.authService.getToken(); // Implement getToken() method in AuthService
    if (!token) {
      console.error('No JWT token available');
      return;
    }

    // Include the token as a query parameter in the WebSocket URL
    this.url = `ws://localhost:8000/ws/chat/${roomUuid}/?token=${token}`;
    this.socket$ = new WebSocketSubject(this.url);
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.unsubscribe();
    }
  }

  sendMessage(message: string): void {
    if (this.socket$) {
      this.socket$.next({ message });
    }
  }

  sendTypingStatus(isTyping: boolean): void {
    if (this.socket$) {
      this.socket$.next({ typing: isTyping });
    }
  }

  getMessages(): Observable<Message[]> {
    return this.socket$.asObservable().pipe(
      map(data => Array.isArray(data) ? data : [data]),
    )
  }

  fetchInitialMessages(roomUuid: string): Observable<Message[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('chat_uuid', roomUuid);
    return this.http.get<Message[]>(`/api/chats/messages/`, { params, headers })
      .pipe(
        catchError(error => {
          console.error('Error response:', error); // Log the error
          return throwError(error);
        })
      );
  }
}
