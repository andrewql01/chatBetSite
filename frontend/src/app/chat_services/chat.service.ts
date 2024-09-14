import { Injectable } from '@angular/core';
import { WebSocketService } from '../web_socket_services/web-socket.service';
import { Message } from '../classes/message';
import { User } from '../classes/user';
import {catchError, Observable, throwError} from 'rxjs';
import { map } from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  private roomUuid?: string;

  constructor(private wsService: WebSocketService,
              private http: HttpClient,) {}

  joinChat(roomUuid: string): void {
    this.roomUuid = roomUuid;
    this.wsService.sendMessage({ action: 'join_chat', room_uuid: roomUuid });
  }

  leaveChat(oldRoomId: string | null): void {
    this.wsService.sendMessage({
      action: 'leave_chat',
      room_uuid: oldRoomId,
    })
  }

  disconnect(): void {
    this.wsService.disconnect();
  }

  sendMessage(message: any): void {
    if (this.roomUuid) {
      this.wsService.sendMessage({ action: 'chat_message', message: message, room_uuid: this.roomUuid });
    }
  }

  sendTypingStatus(isTyping: boolean): void {
    if (this.roomUuid) {
      this.wsService.sendMessage({ action: 'user_typing', typing: isTyping, room_uuid: this.roomUuid });
    }
  }

  getMessages(): Observable<Message> {
    return this.wsService.getMessages().pipe(
      map(data => data?.message ?? null)
    );
  }

  getTypingStatus(): Observable<{ user: User, typing: boolean }> {
    return this.wsService.getMessages().pipe(
      map(data => {
        return data;
    })

    );
  }

  fetchInitialMessages(roomUuid: string): Observable<Message[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('chat_uuid', roomUuid);
    return this.http.get(`http://127.0.0.1:8000/api/chats/messages/`, { params, headers })
      .pipe(
      map(response => response as Message[]), // Assert the type here
      catchError(error => {
        console.error('Error response:', error);
        return throwError(error);
      })
    );
  }
}
