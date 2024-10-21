import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {ImportsModule} from "../../imports";
import {MatPrefix} from "@angular/material/form-field";
import {FriendshipService} from "../../user_services/friendship.service";

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  standalone: true,
  imports: [ImportsModule, MatPrefix],
  styleUrls: ['./add-friend.component.scss'],
  providers: [MessageService]
})
export class AddFriendComponent {
  addFriendForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private friendshipService: FriendshipService,
  ) {
    this.addFriendForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit() {
    if (this.addFriendForm.valid) {
      this.isSubmitting = true;
      const username = this.addFriendForm.get('username')?.value;
      this.friendshipService.sendFriendRequest(username).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Friend request sent to ${username}!`
          });
          this.addFriendForm.reset();
        },
        error: (response) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.error.message,
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a valid username.'
      });
    }
    this.isSubmitting = false;
  }
}
