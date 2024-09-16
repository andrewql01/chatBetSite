import { Component } from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../user_services/user.service";
import {ImportsModule} from "../../imports";
import {User} from "../../classes/user";
import {Chat} from "../../classes/chat";
import {BetService} from "../../bet_services/bet.service";
import {BetContainerComponent} from "../bet-container/bet-container.component";
import {MultibetComponent} from "../multibet/multibet.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    Button,
    ButtonDirective,
    FloatLabelModule,
    InputGroupModule,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    ImportsModule,
    BetContainerComponent,
    MultibetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  chatCreateForm: FormGroup;
  addChatUserForm: FormGroup;
  user: User | undefined;
  users: User[] | undefined;
  chat: Chat | undefined;
  chats: Chat[] | undefined;

  constructor(private userService: UserService,) {

    this.chatCreateForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      });

    this.addChatUserForm =  new FormGroup({
      user: new FormControl('', [Validators.required]),
      chat: new FormControl('', [Validators.required]),
    })

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response;
      }
    });

    this.userService.getUserChats().subscribe({
      next: (response) => {
        this.chats = response;
      }
    })

  }

  createChat() {
    const { name } = this.chatCreateForm.value;
    this.userService.createChat(name).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  addUserToChat() {
    const { user, chat } = this.addChatUserForm.value;
    this.userService.addUserToChat(user.id, chat.uuid).subscribe({
      next: (response) => {
        console.log(response)
      }
    })

  }
}
