import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { User } from '../classes/user';
import { Message } from '../classes/message';
import { WebSocketService } from '../web_socket_services/web-socket.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user_services/user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private activeRooms: Set<string> = new Set(); // Track all active rooms
  private typingStatusSubjects: Map<string, BehaviorSubject<{ user: User, typing: boolean }>> = new Map();
  private messagesSubjects: Map<string, BehaviorSubject<Message[]>> = new Map(); // Track messages for each room
  currentUserId!: number;

  constructor(
    private wsService: WebSocketService,
    private http: HttpClient,
    private userService: UserService
  ) {
    this.userService.getUser().subscribe(value => {
      this.currentUserId = value.id;
    });

    this.wsService.getMessages().subscribe(data => {
      if (data?.action === 'chat_message' && data?.room_uuid) {
        this.handleIncomingMessage(data.room_uuid, data.message);
      }
      if (data?.action === 'user_typing' && data?.room_uuid) {
        this.handleTypingStatus(data.room_uuid, data.user, data.typing);
      }
    });
  }

  joinChat(roomUuid: string): void {
    this.activeRooms.add(roomUuid); // Add room to active rooms
    this.wsService.sendMessage({ action: 'join_chat', room_uuid: roomUuid });

    // Initialize message tracking for the room
    if (!this.messagesSubjects.has(roomUuid)) {
      this.messagesSubjects.set(roomUuid, new BehaviorSubject<Message[]>([]));
    }

    // Initialize typing status tracking for the room
    if (!this.typingStatusSubjects.has(roomUuid)) {
      this.typingStatusSubjects.set(roomUuid, new BehaviorSubject<{ user: User, typing: boolean }>({ user: { id: -1, username: '' }, typing: false }));
    }
  }

  leaveChat(roomUuid: string): void {
    this.activeRooms.delete(roomUuid); // Remove room from active rooms
    this.wsService.sendMessage({ action: 'leave_chat', room_uuid: roomUuid });
    this.messagesSubjects.delete(roomUuid); // Clean up messages for the room
    this.typingStatusSubjects.delete(roomUuid); // Clean up typing status for the room
  }

  sendMessage(roomUuid: string, message: string): void {
    this.wsService.sendMessage({ action: 'chat_message', message: message, room_uuid: roomUuid });
  }

  sendTypingStatus(roomUuid: string, isTyping: boolean): void {
    this.wsService.sendMessage({ action: 'user_typing', typing: isTyping, room_uuid: roomUuid });
  }

  getMessagesForRoom(roomUuid: string): Observable<Message[]> {
    return this.messagesSubjects.get(roomUuid)?.asObservable() ?? new Observable<Message[]>(observer => observer.complete());
  }

  getTypingStatus(roomUuid: string): Observable<{ user: User, typing: boolean }> {
    return this.typingStatusSubjects.get(roomUuid)?.asObservable() ?? new Observable<{ user: User, typing: boolean }>(observer => observer.complete());
  }

  private handleIncomingMessage(roomUuid: string, message: Message): void {
    const subject = this.messagesSubjects.get(roomUuid);
    if (subject) {
      const messages = subject.value;
      messages.push(message); // Add new message to the history
      subject.next(messages); // Emit the updated message list
    }
  }

  private handleTypingStatus(roomUuid: string, user: User, typing: boolean): void {
    const subject = this.typingStatusSubjects.get(roomUuid);
    if (subject) {
      subject.next({ user, typing });
    }
  }
}
