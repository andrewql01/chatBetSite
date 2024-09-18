import { Component } from '@angular/core';
import {ChatComponent} from "../chat/chat.component";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {TopbarComponent} from "../topbar/topbar.component";
import {RouterOutlet} from "@angular/router";
import {WebSocketService} from "../../web_socket_services/web-socket.service";
import {MultibetComponent} from "../multibet/multibet.component";
import {ChatManagerComponent} from "../chat-manager/chat-manager.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ChatComponent,
    SidebarComponent,
    TopbarComponent,
    RouterOutlet,
    MultibetComponent,
    ChatManagerComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent{
}
