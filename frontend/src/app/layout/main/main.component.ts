import { Component } from '@angular/core';
import {ChatComponent} from "../chat/chat.component";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {TopbarComponent} from "../topbar/topbar.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ChatComponent,
    SidebarComponent,
    TopbarComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
