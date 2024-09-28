import {Component, Input, Output, EventEmitter, WritableSignal} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { User } from "../../classes/user";
import { ImportsModule } from "../../imports";
import {ChatCommunicationService} from "../../chat_services/chat-communication.service";
import {ChatService} from "../../chat_services/chat.service";
import {Observable} from "rxjs";
import {Chat} from "../../classes/chat";
import {PopupMenuComponent} from "../popup-menu/popup-menu.component";

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss'],
  standalone: true,
  imports: [ImportsModule, PopupMenuComponent],
  providers: [ConfirmationService, MessageService]
})
export class FriendComponent {
  @Input() friend!: User;
  @Output() deleteFriend = new EventEmitter<number>();

  items: MenuItem[];
  overlayVisible: boolean | WritableSignal<boolean> = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private chatCommunicationService: ChatCommunicationService,
    private chatService: ChatService,
  ) {
    this.items = [{
      label: 'Manage user',
      items: [{
        label: 'Open Chat',
        icon: 'pi pi-send',
        command: () => this.openChat()
      },
      {
        label: 'Block User',
        icon: 'pi pi-ban',
        command: () => this.blockUser()
      },
      {
        label: 'Remove Friend',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete()
      }]
    }];
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: `Remove ${this.friend.username} from your friends list?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteFriend.emit(this.friend.id);
      }
    });
  }

  openChat() {
    this.chatService.getChatBetweenUsers(this.friend.username).subscribe({
      next: chat => {
        this.chatCommunicationService.requestOpenChat(chat.uuid)
      }
    })
  }

  blockUser() {
    this.messageService.add({
      severity: 'warn',
      summary: 'User Blocked',
      detail: `${this.friend.username} has been blocked.`
    });
  }
}
