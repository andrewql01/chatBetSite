import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Message } from '../classes/message';
import { User } from '../classes/user'; // Import the User interface
import { AuthService } from '../auth_services/auth.service';

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

    const token = this.authService.getToken();
    if (!token) {
      console.error('No JWT token available');
      return;
    }

    this.url = `ws://localhost:8000/ws/chat/${roomUuid}/?token=${token}`;
    this.socket$ = new WebSocketSubject(this.url);
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.unsubscribe();
    }
  }

  sendMessage(message: any): void {
    if (this.socket$) {
      this.socket$.next({ message: message });
    }
  }

  sendTypingStatus(isTyping: boolean): void {
    if (this.socket$) {
      this.socket$.next({ typing: isTyping });
    }
  }

  getMessages(): Observable<Message> {
    return this.socket$.asObservable().pipe(
      map(data => {
        if (data.message){
          return data.message;
        }
        return null;
      })
    )
  }

  getTypingStatus(): Observable<{ user: User, typing: boolean }> {
    return this.socket$.asObservable().pipe(
      map(data => {
        return data;
      })
    );
  }

  fetchInitialMessages(roomUuid: string): Observable<Message[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('chat_uuid', roomUuid);
    return this.http.get<Message[]>(`/api/chats/messages/`, { params, headers })
      .pipe(
        catchError(error => {
          console.error('Error response:', error);
          return throwError(error);
        })
      );
  }
}
