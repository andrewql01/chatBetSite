import {Component, OnInit} from '@angular/core';
import {User} from "../../classes/user";
import {FriendshipService} from "../../user_services/friendship.service";
import {MessageService} from "primeng/api";
import {ImportsModule} from "../../imports";
import {FriendComponent} from "../friend/friend.component";

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [ImportsModule, FriendComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  providers: [MessageService]
})
export class FriendsComponent implements OnInit {
  public friends: User[] = [];

  constructor(private friendshipService: FriendshipService,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.friendshipService.getFriends().subscribe({
      next: (response) => {
        this.friends = response;
      }
    })
  }

  onDeleteFriend(username: string) {
      this.friendshipService.deleteFriend(username).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Friend Removed',
            detail: `${username} has been removed from your friends list.`
          });
        }
      })

  }
}
