import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../chat_services/chat.service';
import { Message } from '../../classes/message';
import { ImportsModule } from '../../imports';
import { Subscription } from 'rxjs';
import { UserService } from '../../auth_services/user.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: (Message & { isCurrentUser: boolean })[] = [];
  roomId: string = '';
  private routeSub: Subscription = new Subscription();
  private chatSub: Subscription = new Subscription();
  private userSub: Subscription = new Subscription();
  private currentUserId!: number; // Ensure you handle initialization properly
  newMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Subscribe to user service to get the current user ID
    this.userSub = this.userService.getUser().subscribe({
      next: (response) => {
        this.currentUserId = response.id;
        this.initializeChat(); // Initialize chat after getting current user ID
      },
      error: (err) => {
        console.error('Error fetching user ID:', err);
      }
    });

    // Subscribe to route parameter changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      const newRoomId = params.get('roomId')!;
      if (this.roomId !== newRoomId) {
        this.roomId = newRoomId;
        if (this.currentUserId) { // Check if currentUserId is set
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

    // Disconnect previous WebSocket connection
    this.chatService.disconnect();

    // Fetch initial messages
    this.chatService.fetchInitialMessages(this.roomId).subscribe({
      next: (messages) => {
        this.messages = messages.map(message => ({
          ...message,
          isCurrentUser: message.user.id === this.currentUserId
        }));
      },
      error: (err) => {
        console.error('Error fetching initial messages:', err);
      }
    });

    // Connect to new WebSocket room
    this.chatService.connect(this.roomId);

    // Subscribe to WebSocket messages
    this.chatSub = this.chatService.getMessages().subscribe(messages => {
      console.log(messages);
      const processedMessages = messages.map(message => ({
        ...message,
        isCurrentUser: message.user.id === this.currentUserId
      }));
      this.messages.push(...processedMessages);
    });
  }

  onSendMessage(messageText: string): void {
    if (messageText.trim()) { // Check if the message is not empty
      this.chatService.sendMessage(messageText);
      this.newMessage = ''; // Clear the input field
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.routeSub.unsubscribe();
    this.chatSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
