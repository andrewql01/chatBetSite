import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FriendRequest} from "../../classes/friend-request";
import {ImportsModule} from "../../imports";

@Component({
  selector: 'app-friend-request',
  standalone: true,
  imports: [
    ImportsModule
  ],
  templateUrl: './friend-request.component.html',
  styleUrl: './friend-request.component.css'
})
export class FriendRequestComponent {
  @Input() friendRequest!: FriendRequest;
  @Output() onAccept = new EventEmitter<void>();
  @Output() onReject = new EventEmitter<void>();

  acceptRequest() {
    this.onAccept.emit();
  }

  rejectRequest() {
    this.onReject.emit();
  }
}
