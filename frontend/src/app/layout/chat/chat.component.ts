import {ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Message } from '../../classes/message';
import { Subscription } from 'rxjs';
import { ChatService } from '../../chat_services/chat.service';
import { ImportsModule } from '../../imports';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ChatCommunicationService } from "../../chat_services/chat-communication.service";
import { User } from "../../classes/user";
import {Chat} from "../../classes/chat";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [ImportsModule, ButtonGroupModule],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chat!: Chat;
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
  @ViewChild('skeleton', { static: false }) skeletonElement!: ElementRef;

  constructor(private chatService: ChatService,
              private communicationService: ChatCommunicationService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.chatService.joinChat(this.chat.uuid);
    // Fetch initial messages
    this.chatService.fetchInitialMessages(this.chat.uuid).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error fetching initial messages:', err);
      }
    });

    // Subscribe to message updates
    this.chatSub = this.chatService.getMessagesForRoom(this.chat.uuid).subscribe({
      next: (updatedMessages) => {
        this.messages.push(...updatedMessages);
        this.scrollToBottom();  // Scroll to the bottom when new messages arrive
      },
      error: (err) => console.error('Error receiving new messages:', err)
    });

    // Subscribe to typing status updates
    this.typingStatusSub = this.chatService.getTypingStatus(this.chat.uuid).subscribe({
      next: status => {
        this.otherUserTyping = status.typing && status.user.id !== this.chatService.currentUser!.id;
        this.scrollToBottom()
      },
      error: (err) => console.error('Error receiving typing status:', err)
    });
  }

  loadMoreMessages(): void {
    this.loadingMoreMessages = true;
    const oldestMessageId = this.messages[0]?.id; // Assuming you have an id or timestamp to identify the oldest message

    const container = this.messagesContainer.nativeElement;

    this.cdr.detectChanges();
    const skeleton = this.skeletonElement.nativeElement;

    const oldScrollPosition = container.scrollTop;
    const oldScrollHeight = container.scrollHeight;
    const skeletonHeight = skeleton.offsetHeight;

    this.chatService.fetchMoreMessages(this.chat.uuid, oldestMessageId).subscribe({
      next: (newMessages) => {
        setTimeout(() => {
          this.messages = [...newMessages, ...this.messages]; // Prepend new messages

          this.cdr.detectChanges();
          const scrollHeightDifference = container.scrollHeight - oldScrollHeight;
          container.scrollTop = oldScrollPosition + scrollHeightDifference - skeletonHeight;
          this.loadingMoreMessages = false;

        }, 2000); // Delay for 2 second
      },
      error: (err) => {
        console.error('Error fetching more messages:', err);
        this.loadingMoreMessages = false;
      }
    });
}

  onSendMessage(messageText: string): void {
    if (messageText.trim()) {
      this.chatService.sendMessage(this.chat.uuid, messageText);
      this.isTyping = false;
      this.chatService.sendTypingStatus(this.chat.uuid, false);
      this.newMessage = '';
    }
  }

  onTyping(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.isTyping = true;
    this.chatService.sendTypingStatus(this.chat.uuid, true);

    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.chatService.sendTypingStatus(this.chat.uuid, false);
    }, 1000);
  }

  closeChat(roomId: string) {
    this.communicationService.requestCloseChat(roomId);
  }

  minimizeChat() {
    this.isMinimized = !this.isMinimized;
  }

  scrollToBottom(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      try {
        const container = this.messagesContainer.nativeElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }, 0);
  }

  onScroll(): void {
    const container = this.messagesContainer.nativeElement;
    if (container && container.scrollTop === 0 && !this.loadingMoreMessages) {
      this.loadMoreMessages();
    }
  }

  getUsernames(): string {
    const currentUserId = this.chatService.currentUser!.id;
    return this.chat.users
      .filter(user => user.id !== currentUserId)  // Exclude the current user
      .map(user => user.username)  // Get usernames
      .join(', ');  // Join with commas
  }

  ngOnDestroy(): void {
    this.chatSub.unsubscribe();
    this.typingStatusSub.unsubscribe();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.chatService.leaveChat(this.chat.uuid);
}
}
