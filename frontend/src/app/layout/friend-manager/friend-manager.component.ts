import { Component } from '@angular/core';
import {FriendRequestsComponent} from "../friend-requests/friend-requests.component";
import {AddFriendComponent} from "../add-friend/add-friend.component";
import {FriendsComponent} from "../friends/friends.component";

@Component({
  selector: 'app-friend-manager',
  standalone: true,
  imports: [
    FriendRequestsComponent,
    AddFriendComponent,
    FriendsComponent
  ],
  templateUrl: './friend-manager.component.html',
  styleUrl: './friend-manager.component.css'
})
export class FriendManagerComponent {

}
