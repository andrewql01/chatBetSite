import { Component } from '@angular/core';
import {FriendRequestComponent} from "../friend-request/friend-request.component";
import {FriendRequest} from "../../classes/friend-request";
import {ImportsModule} from "../../imports";

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [
    FriendRequestComponent,
    ImportsModule
  ],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.css'
})
export class FriendRequestsComponent {
  public friendRequests: FriendRequest[] = [
  {
    id: 1,
    from_user: {id: 1, username: 'Andrzej',},
    to_user: {id: 2, username: 'Admin'},
    created_at: '10-20-2021'
  },
  ]

  handleAccept(id: number) {

  }

  handleReject(id: number) {

  }
}
