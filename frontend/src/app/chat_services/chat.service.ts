import {BehaviorSubject, catchError, Observable, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {User} from '../classes/user';
import {Message} from '../classes/message';
import {WebSocketService} from '../web_socket_services/web-socket.service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {UserService} from '../user_services/user.service';
import {map} from 'rxjs/operators';
import {Chat} from '../classes/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private typingStatusSubjects: Map<string, BehaviorSubject<{ user: User, typing: boolean }>> = new Map();
  private messagesSubjects: Map<string, BehaviorSubject<Message[]>> = new Map();
  private activeChatsSubject = new BehaviorSubject<Map<string, Chat>>(new Map());  // Map of active chats

  activeChats$ = this.activeChatsSubject.asObservable();
  currentUserId!: number;

  constructor(
    private wsService: WebSocketService,
    private http: HttpClient,
    private userService: UserService
  ) {
    this.userService.getUser().subscribe(value => {
      this.currentUserId = value.id;
    });

    // WebSocket handler for incoming messages and typing status
    this.wsService.getMessages().subscribe(data => {
      if (data?.action === 'chat_message' && data?.room_uuid) {
        this.handleIncomingMessage(data.room_uuid, data.message);
      }
      if (data?.action === 'user_typing' && data?.room_uuid) {
        this.handleTypingStatus(data.room_uuid, data.user, data.typing);
      }
    });
  }

  getActiveChats(): Observable<Map<string, Chat>> {
    return this.activeChats$
  }

  /**
   * Join a chat room by sending the roomUuid, and fetch the chat details from the backend.
   * @param roomUuid The room UUID to join.
   */
  joinChat(roomUuid: string): void {
    this.wsService.sendMessage({ action: 'join_chat', room_uuid: roomUuid });

    // Initialize message tracking for the room if it doesn't exist
    if (!this.messagesSubjects.has(roomUuid)) {
      this.messagesSubjects.set(roomUuid, new BehaviorSubject<Message[]>([]));
    }

    // Initialize typing status tracking for the room if it doesn't exist
    if (!this.typingStatusSubjects.has(roomUuid)) {
      this.typingStatusSubjects.set(roomUuid, new BehaviorSubject<{ user: User, typing: boolean }>({ user: { id: -1, username: '' }, typing: false }));
    }

    // Fetch the chat details from the backend
    this.fetchChatDetails(roomUuid).subscribe(chatDetails => {
      const activeChats = this.activeChatsSubject.getValue();
      activeChats.set(roomUuid, chatDetails);  // Add the fetched chat details to active chats
      this.activeChatsSubject.next(activeChats);  // Emit the updated list of active chats
    });
  }

  /**
   * Leave a chat room and remove it from the active chats list.
   * @param roomUuid The room UUID to leave.
   */
  leaveChat(roomUuid: string): void {
    this.wsService.sendMessage({ action: 'leave_chat', room_uuid: roomUuid });

    this.messagesSubjects.delete(roomUuid);  // Remove message history
    this.typingStatusSubjects.delete(roomUuid);  // Remove typing status

    const activeChats = this.activeChatsSubject.getValue();
    activeChats.delete(roomUuid);  // Remove from active chats
    this.activeChatsSubject.next(activeChats);  // Emit the updated list of active chats
  }

  /**
   * Fetch the details of a chat room from the backend.
   * @param roomUuid The room UUID to fetch details for.
   * @returns An observable containing the Chat object.
   */
  private fetchChatDetails(roomUuid: string): Observable<Chat> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('chat_uuid', roomUuid);

    return this.http.get<Chat>('http://127.0.0.1:8000/api/chats/details/', { params, headers })
      .pipe(
        map((chatDetails: Chat) => chatDetails),
        catchError(error => {
          console.error('Error fetching chat details:', error);
          return throwError(() => new Error('Failed to fetch chat details'));
        })
      );
  }

  // Send a chat message via WebSocket
  sendMessage(roomUuid: string, message: string): void {
    this.wsService.sendMessage({ action: 'chat_message', message: message, room_uuid: roomUuid });
  }

  // Send typing status via WebSocket
  sendTypingStatus(roomUuid: string, isTyping: boolean): void {
    this.wsService.sendMessage({ action: 'user_typing', typing: isTyping, room_uuid: roomUuid });
  }

  // Get the messages for a specific chat room
  getMessagesForRoom(roomUuid: string): Observable<Message[]> {
    return this.messagesSubjects.get(roomUuid)?.asObservable() ?? new Observable<Message[]>(observer => observer.complete());
  }

  // Get the typing status for a specific chat room
  getTypingStatus(roomUuid: string): Observable<{ user: User, typing: boolean }> {
    return this.typingStatusSubjects.get(roomUuid)?.asObservable() ?? new Observable<{ user: User, typing: boolean }>(observer => observer.complete());
  }

  /**
   * Handle the incoming WebSocket message and update the messages array.
   * @param roomUuid The room UUID.
   * @param message The message object.
   */
  private handleIncomingMessage(roomUuid: string, message: Message): void {
    const subject = this.messagesSubjects.get(roomUuid);
    message.isCurrentUser = this.currentUserId === message.user.id;

    if (subject) {
      const updatedMessages = [message];  // Append new message
      subject.next(updatedMessages);  // Emit the updated message list
    }
  }

  /**
   * Handle typing status updates and notify the appropriate observers.
   * @param roomUuid The room UUID.
   * @param user The user object.
   * @param typing Whether the user is typing.
   */
  private handleTypingStatus(roomUuid: string, user: User, typing: boolean): void {
    const subject = this.typingStatusSubjects.get(roomUuid);
    if (subject) {
      subject.next({ user, typing });
    }
  }

  /**
   * Fetch the entire message history for a room and update the BehaviorSubject.
   * @param roomUuid The room UUID.
   * @returns Observable of the message history.
   */
  fetchInitialMessages(roomUuid: string): Observable<Message[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('chat_uuid', roomUuid);

    return this.http.get<Message[]>('http://127.0.0.1:8000/api/chats/messages/', { params, headers })
      .pipe(
        map((messages: Message[]) => {
          const subject = this.messagesSubjects.get(roomUuid);
          messages = messages.reverse();
          messages = messages.map(message => ({
            ...message,
            isCurrentUser: message.user.id === this.currentUserId
          }));
          return messages;
        }),
        catchError(error => {
          console.error('Error fetching message history:', error);
          return throwError(() => new Error('Failed to fetch messages'));
        })
      );
  }

  /**
   * Fetch older messages for a room.
   * @param roomUuid The room UUID.
   * @param beforeMessageId The ID of the message before which to fetch older messages.
   */
  fetchMoreMessages(roomUuid: string, beforeMessageId: number): Observable<Message[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams()
      .set('chat_uuid', roomUuid)
      .set('before_message_id', beforeMessageId);

    return this.http.get<Message[]>('http://127.0.0.1:8000/api/chats/older-messages/', { params, headers })
      .pipe(
        map((messages: Message[]) => {
          messages = messages.reverse();
          messages = messages.map(message => ({
            ...message,
            isCurrentUser: message.user.id === this.currentUserId
          }));

          return messages;
        }),
        catchError(error => {
          console.error('Error fetching more messages:', error);
          return throwError(() => new Error('Failed to fetch more messages'));
        })
      );
  }

  getChatBetweenUsers(username: string): Observable<Chat> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('other_user_username', username);
    return this.http.get<Chat>('http://127.0.0.1:8000/api/chats/between-users/', { params, headers })
  }
}
