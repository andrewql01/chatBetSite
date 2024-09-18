import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Message } from '../../classes/message';
import { Subscription } from 'rxjs';
import { ChatService } from '../../chat_services/chat.service';
import { ImportsModule } from '../../imports';
import { ButtonGroupModule } from 'primeng/buttongroup';
import {ChatCommunicationService} from "../../chat_services/chat-communication.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [ImportsModule, ButtonGroupModule],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() roomId!: string;
  messages: Message[] = [];
  isTyping: boolean = false;
  otherUserTyping: boolean = false;
  newMessage: string = '';

  private chatSub: Subscription = new Subscription();
  private typingStatusSub: Subscription = new Subscription();
  private typingTimeout: any;

  constructor(private chatService: ChatService,
              private communicationService: ChatCommunicationService) { }

  ngOnInit(): void {
    this.chatService.joinChat(this.roomId);

    // Subscribe to message updates
    this.chatSub = this.chatService.getMessagesForRoom(this.roomId).subscribe(messages => {
      this.messages = messages; // Replace with the updated list of messages
      this.scrollToBottom();
    });

    // Subscribe to typing status updates
    this.typingStatusSub = this.chatService.getTypingStatus(this.roomId).subscribe(status => {
      this.otherUserTyping = status.typing && status.user.id !== this.chatService.currentUserId;
    });
  }

  onSendMessage(messageText: string): void {
    if (messageText.trim()) {
      this.chatService.sendMessage(this.roomId, messageText);
      this.isTyping = false;
      this.chatService.sendTypingStatus(this.roomId, false);
      this.newMessage = '';
    }
  }

  onTyping(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.isTyping = true;
    this.chatService.sendTypingStatus(this.roomId, true);

    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.chatService.sendTypingStatus(this.roomId, false);
    }, 1000);
  }

  scrollToBottom(): void {
    try {
      const container = document.getElementById('messageContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngOnDestroy(): void {
    this.chatSub.unsubscribe();
    this.typingStatusSub.unsubscribe();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.chatService.leaveChat(this.roomId);
  }

  closeChat(roomId: string) {
    this.communicationService.requestCloseChat(roomId);
  }
}
