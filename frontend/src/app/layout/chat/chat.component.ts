import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../chat_services/chat.service';
import { Message } from '../../classes/message';
import { ImportsModule } from '../../imports';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{
  messages: Message[] = [];
  roomId: string = '';
  private routeSub: Subscription = new Subscription();
  private chatSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      const newRoomId = params.get('roomId')!;
      if (this.roomId !== newRoomId) {
        this.roomId = newRoomId;
        this.initializeChat();
      }
    });
  }

  initializeChat(): void {
    // Disconnect previous WebSocket connection
    this.chatService.disconnect();

    // Fetch initial messages
    this.chatService.fetchInitialMessages(this.roomId).subscribe({
      next: (messages) => {
        // this.messages = messages;
      },
      error: (err) => {
        console.error(err);
      }
    });

    // Connect to new WebSocket room
    this.chatService.connect(this.roomId);

    // Subscribe to WebSocket messages
    this.chatSub = this.chatService.getMessages().subscribe(messages => {
      this.messages.push(...messages);
    });
  }

  onSendMessage(messageText: string): void {
    this.chatService.sendMessage(messageText);
  }

}
