import { Component } from '@angular/core';
import {FriendRequestsComponent} from "../friend-requests/friend-requests.component";

@Component({
  selector: 'app-friend-manager',
  standalone: true,
  imports: [
    FriendRequestsComponent
  ],
  templateUrl: './friend-manager.component.html',
  styleUrl: './friend-manager.component.css'
})
export class FriendManagerComponent {

}
