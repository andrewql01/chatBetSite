import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import {catchError, Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Message } from '../classes/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket$!: WebSocketSubject<any>;
  private url?: string;

  constructor(private http: HttpClient) {}

  connect(roomUuid: string): void {
    if (this.socket$){
      this.disconnect();
    }
    this.url = `ws://localhost:8000/ws/chat/${roomUuid}/`;
    this.socket$ = new WebSocketSubject(this.url);
  }

    disconnect(): void {
    if (this.socket$) {
      this.socket$.unsubscribe();
    }
  }

  sendMessage(message: string): void {
    this.socket$.next({ message });
  }

  sendTypingStatus(isTyping: boolean): void {
    this.socket$.next({ typing: isTyping });
  }

  getMessages(): Observable<Message[]> {
    return this.socket$.asObservable();
  }

  fetchInitialMessages(roomUuid: string): Observable<Message[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
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
