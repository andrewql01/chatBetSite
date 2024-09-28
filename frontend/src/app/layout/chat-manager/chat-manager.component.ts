import { Component, OnInit } from '@angular/core';
import { ChatCommunicationService } from '../../chat_services/chat-communication.service';
import { ChatService } from '../../chat_services/chat.service';
import { AsyncPipe, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { Chat } from '../../classes/chat';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-chat-manager',
  templateUrl: './chat-manager.component.html',
  standalone: true,
  imports: [
    KeyValuePipe,
    ChatComponent,
    NgForOf,
    NgIf,
    AsyncPipe,
  ],
  styleUrls: ['./chat-manager.component.css'],
})
export class ChatManagerComponent implements OnInit {
  activeChats$: Observable<{ key: string; value: Chat }[]>; // Correctly typed as an array of objects
  activeChats = new Map<string, Chat>();

  constructor(
    private chatService: ChatService,
    private chatCommunicationService: ChatCommunicationService // Inject the service
  ) {
    // Transform the BehaviorSubject emission into an array of key-value pairs
    this.activeChats$ = this.chatService.getActiveChats().pipe(
      map((chats) => Array.from(chats.entries()).map(([key, value]) => ({ key, value }))) // Convert to array of objects
    );
  }

  ngOnInit(): void {
    // Subscribe to the activeChats$ observable to keep the activeChats map up to date
    this.activeChats$.subscribe((response) => {
      this.activeChats = new Map(response.map(chat => [chat.key, chat.value]));
    });

    // Handle opening and closing chats
    this.chatCommunicationService.openChat$.subscribe((roomId) => {
      this.openChat(roomId);
    });
    this.chatCommunicationService.closeChat$.subscribe((roomId) => {
      this.closeChat(roomId);
    });
  }

  openChat(roomId: string): void {
    this.chatService.joinChat(roomId); // Join the chat
  }

  closeChat(roomId: string): void {
    this.chatService.leaveChat(roomId); // Leave chat via the service
  }

  isChatActive(roomId: string): boolean {
    return this.activeChats.has(roomId);
  }

  trackByRoomId(index: number, chat: { key: string; value: Chat }): string {
    return chat.key; // Use the room's unique ID (roomId.key) to track
  }
}
