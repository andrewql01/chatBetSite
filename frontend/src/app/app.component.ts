import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';

import {SidebarComponent} from "./layout/sidebar/sidebar.component";
import {ChatComponent} from "./layout/chat/chat.component";
import {TopbarComponent} from "./layout/topbar/topbar.component";
import {LoginComponent} from "./layout/login/login.component";
import {RegisterComponent} from "./layout/register/register.component";
import {WelcomeComponent} from "./layout/welcome/welcome.component";
import {WebSocketService} from "./web_socket_services/web-socket.service";
import {ChatManagerComponent} from "./layout/chat-manager/chat-manager.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    ChatComponent,
    TopbarComponent,
    LoginComponent,
    RegisterComponent,
    WelcomeComponent,
    ChatManagerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
    }
}
