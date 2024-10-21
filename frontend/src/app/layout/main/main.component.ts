import {Component, OnInit} from '@angular/core';
import {ChatComponent} from "../chat/chat.component";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {TopbarComponent} from "../topbar/topbar.component";
import {RouterOutlet} from "@angular/router";
import {WebSocketService} from "../../web_socket_services/web-socket.service";
import {MultibetComponent} from "../multibet/multibet.component";
import {ChatManagerComponent} from "../chat-manager/chat-manager.component";
import {FriendRequestsComponent} from "../friend-requests/friend-requests.component";
import {UserService} from "../../user_services/user.service";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ChatComponent,
    SidebarComponent,
    TopbarComponent,
    RouterOutlet,
    MultibetComponent,
    ChatManagerComponent,
    FriendRequestsComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent{
}
