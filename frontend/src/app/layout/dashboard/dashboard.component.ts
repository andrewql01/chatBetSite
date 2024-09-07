import { Component } from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../auth_services/user.service";
import {ImportsModule} from "../../imports";

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
    ImportsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  chatCreateForm: FormGroup;

  constructor(private userService: UserService) {
          this.chatCreateForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      })
  }

  onSubmit() {
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
}
