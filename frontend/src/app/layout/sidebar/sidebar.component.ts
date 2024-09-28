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
            command: () => this.router.navigate(['main/dashboard']),
          },
          {
            label: 'Manage Friends',
            icon: 'pi pi-user-plus',
            command: () => this.router.navigate(['main/friend-manager'])
          },
          {
            label: 'Chats',
            icon: 'pi pi-inbox',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
          }
        ]
      }
    ];
  }
}
