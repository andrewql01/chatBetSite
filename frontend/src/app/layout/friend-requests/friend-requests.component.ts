import {Component, OnInit} from '@angular/core';
import {FriendRequestComponent} from "../friend-request/friend-request.component";
import {FriendRequest} from "../../classes/friend-request";
import {ImportsModule} from "../../imports";
import {FriendshipService} from "../../user_services/friendship.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [
    FriendRequestComponent,
    ImportsModule
  ],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.css',
  providers: [MessageService]
})
export class FriendRequestsComponent implements OnInit {
  public friendRequests: FriendRequest[] = [];

  constructor(private friendshipService: FriendshipService,
              private messageService: MessageService,) {

  }

  ngOnInit() {
    this.friendshipService.getFriendRequests().subscribe({
      next: (requests) => {
        this.friendRequests = requests;
      }
    });
  }


  handleAccept(id: number) {
    this.friendshipService.acceptFriendRequest(id).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message,
        });
        this.friendRequests = this.friendRequests.filter(request => request.id !== id);
      }
    })
  }

  handleReject(id: number) {
    this.friendshipService.rejectFriendRequest(id).subscribe({
      next: (response) => {
        console.log(response);
      }
    })
  }
}
