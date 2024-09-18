import { Component, OnInit } from '@angular/core';
import { ChatCommunicationService } from '../../chat_services/chat-communication.service';  // Import the service
import { ChatService } from '../../chat_services/chat.service';
import {KeyValuePipe, NgForOf, NgIf} from "@angular/common";
import {ChatComponent} from "../chat/chat.component";

@Component({
  selector: 'app-chat-manager',
  templateUrl: './chat-manager.component.html',
  standalone: true,
  imports: [
    KeyValuePipe,
    ChatComponent,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./chat-manager.component.css']
})
export class ChatManagerComponent implements OnInit {
  activeChats: Map<string, boolean> = new Map();

  constructor(
    private chatService: ChatService,
    private chatCommunicationService: ChatCommunicationService  // Inject the service
  ) {}

  ngOnInit(): void {
    this.chatCommunicationService.openChat$.subscribe(roomId => {
      this.openChat(roomId);
    });
    this.chatCommunicationService.closeChat$.subscribe(roomId => {
      this.closeChat(roomId);
    })
  }

  openChat(roomId: string): void {
    if (!this.activeChats.has(roomId)) {
      this.activeChats.set(roomId, true);
      this.chatService.joinChat(roomId);
    } else {
      this.activeChats.set(roomId, true);
    }
  }

  closeChat(roomId: string): void {
    this.activeChats.set(roomId, false);
    this.chatService.leaveChat(roomId);
  }

  isChatActive(roomId: string): boolean {
    return this.activeChats.get(roomId) ?? false;
  }

}
