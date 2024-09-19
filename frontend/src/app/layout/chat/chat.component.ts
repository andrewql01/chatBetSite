import {ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Message } from '../../classes/message';
import { Subscription } from 'rxjs';
import { ChatService } from '../../chat_services/chat.service';
import { ImportsModule } from '../../imports';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ChatCommunicationService } from "../../chat_services/chat-communication.service";
import { User } from "../../classes/user";

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
  isMinimized: boolean = false;
  loadingMoreMessages: boolean = false;

  private chatSub: Subscription = new Subscription();
  private typingStatusSub: Subscription = new Subscription();
  private typingTimeout: any;

  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;

  constructor(private chatService: ChatService,
              private communicationService: ChatCommunicationService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.chatService.joinChat(this.roomId);
    // Fetch initial messages
    this.chatService.fetchInitialMessages(this.roomId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error fetching initial messages:', err);
      }
    });


    // Subscribe to message updates
    this.chatSub = this.chatService.getMessagesForRoom(this.roomId).subscribe({
      next: (newMessages) => {
        this.messages.push(...newMessages); // Append new messages
        this.scrollToBottom();  // Scroll to the bottom when new messages arrive
      },
      error: (err) => console.error('Error receiving new messages:', err)
    });

    // Subscribe to typing status updates
    this.typingStatusSub = this.chatService.getTypingStatus(this.roomId).subscribe({
      next: status => {
        this.otherUserTyping = status.typing && status.user.id !== this.chatService.currentUserId;
        this.scrollToBottom()
      },
      error: (err) => console.error('Error receiving typing status:', err)
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
    this.cdr.detectChanges();
    setTimeout(() => {
      try {
        const container = document.getElementById('messagesContainer' + this.roomId);
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }, 0);
  }

  onScroll(): void {
    const container = document.getElementById('messagesContainer' + this.roomId);
    if (container && container.scrollTop === 0 && !this.loadingMoreMessages) {
      this.loadMoreMessages();
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

  minimizeChat() {
    this.isMinimized = !this.isMinimized;
  }

  loadMoreMessages(): void {
    this.loadingMoreMessages = true;
    const oldestMessageId = this.messages[0]?.id; // Assuming you have an id or timestamp to identify the oldest message


    this.chatService.fetchMoreMessages(this.roomId, oldestMessageId).subscribe({
      next: (newMessages) => {
        setTimeout(() => {
          this.messages = [...newMessages, ...this.messages]; // Prepend new messages
          this.loadingMoreMessages = false;
        }, 2000); // Delay for 2 second
      },
      error: (err) => {
        console.error('Error fetching more messages:', err);
        this.loadingMoreMessages = false;
      }
    });
  }
}
