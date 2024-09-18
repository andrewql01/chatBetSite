import {Component, OnInit, ViewChild} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from '../../user_services/user.service';
import { ChatCommunicationService } from '../../chat_services/chat-communication.service';
import {ImportsModule} from "../../imports";
import {ButtonGroupModule} from "primeng/buttongroup";
import {Chat} from "../../classes/chat";
import {ChatManagerComponent} from "../chat-manager/chat-manager.component";  // Import the service

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [ImportsModule, ButtonGroupModule, ChatManagerComponent],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild(ChatManagerComponent) chatManager!: ChatManagerComponent;
  items: MenuItem[] = [];
  chats: Chat[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private chatCommunicationService: ChatCommunicationService  // Inject the service
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Navigate',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-chart-bar',
            command: () => this.router.navigate(['/dashboard']),
          },
          {
            label: 'Chats',
            icon: 'pi pi-inbox',
            items: [],
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
          }
        ]
      }
    ];

    this.userService.getUserChats().subscribe({
      next: (response) => {
        this.chats = response;

        // Find the "Chats" menu item and add the chat items under it
        const chatsMenuItem = this.items.find(item => item.label === 'Navigate')?.items?.find(subItem => subItem.label === 'Chats');
        if (chatsMenuItem) {
          chatsMenuItem.items = this.chats.map(chat => ({
            label: chat.name,
            icon: 'pi pi-comments',
            command: () => this.openChat(chat.uuid)
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching user chats:', err);
      }
    });
  }

  openChat(roomId: string): void {
    this.chatCommunicationService.requestOpenChat(roomId);  // Notify the service
  }
}
