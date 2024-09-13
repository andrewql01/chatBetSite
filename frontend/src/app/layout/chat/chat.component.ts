import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../chat_services/chat.service';
import { Message } from '../../classes/message';
import { User } from '../../classes/user';
import {map, Subscription} from 'rxjs';
import { UserService } from '../../user_services/user.service';
import {ImportsModule} from "../../imports";
import {ButtonGroupModule} from "primeng/buttongroup";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ImportsModule, ButtonGroupModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer', { static: false }) private messagesContainer!: ElementRef;
  messages: (Message & { isCurrentUser: boolean })[] = [];
  roomId: string = '';
  private routeSub: Subscription = new Subscription();
  private chatSub: Subscription = new Subscription();
  private userSub: Subscription = new Subscription();
  private typingStatusSub: Subscription = new Subscription();
  protected currentUserId!: number;
  newMessage: string = '';
  isTyping: boolean = false;
  private typingTimeout: any;
  typingUser: User | null = null;
  otherUserTyping: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSub = this.userService.getUser().subscribe({
      next: (response) => {
        this.currentUserId = response.id;
        this.initializeChat();
      },
      error: (err) => console.error('Error fetching user ID:', err)
    });

    this.routeSub = this.route.paramMap.subscribe(params => {
      const newRoomId = params.get('roomId')!;
      if (this.roomId !== newRoomId) {
        this.roomId = newRoomId;
        if (this.currentUserId) {
          this.initializeChat();
        }
      }
    });
  }

  initializeChat(): void {
    if (!this.currentUserId) {
      console.error('Current user ID is not set');
      return;
    }

    this.disconnect();// Ensure disconnection before reconnection

    this.chatService.fetchInitialMessages(this.roomId).subscribe({
      next: (messages) => {
        this.messages = messages.map(message => ({
          ...message,
          isCurrentUser: message.user.id === this.currentUserId
        }));
        this.scrollToBottom();
      },
      error: (err) => console.error('Error fetching initial messages:', err)
    });

    this.chatService.connect(this.roomId);

    this.chatSub = this.chatService.getMessages().subscribe(message => {
      if (message && (message.text ?? '').trim().length > 0) {
        const processedMessage = {
          ...message,
          isCurrentUser: message.user.id === this.currentUserId
        };
        this.messages.push(processedMessage);
        this.scrollToBottom();
      }
    });

    this.typingStatusSub = this.chatService.getTypingStatus().subscribe({
      next: message => {
        if (message.typing) {
          this.typingUser = message.user;
          this.otherUserTyping = this.typingUser.id !== this.currentUserId;
        }
        else{
          this.otherUserTyping = false;
          this.typingUser = null;
        }
      }
    });
  }

  onSendMessage(messageText: string): void {
    if (messageText.trim()) {
      this.chatService.sendMessage(messageText);
      this.newMessage = '';
      this.isTyping = false;
      this.chatService.sendTypingStatus(false);
    }
  }

  onTyping(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.isTyping = true;
    this.chatService.sendTypingStatus(true);

    // Debounce typing status
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.chatService.sendTypingStatus(false);
    }, 1000); // Adjust debounce time as needed
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom(); // Ensure we scroll to bottom after every view update
  }

  disconnect(): void {
    if (this.typingUser?.id == this.currentUserId) {
      this.chatService.sendTypingStatus(false);
    }
    this.chatService.disconnect();
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.chatSub.unsubscribe();
    this.userSub.unsubscribe();
    this.typingStatusSub.unsubscribe();
  }
}
