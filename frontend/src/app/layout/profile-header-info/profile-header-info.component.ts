import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {ImportsModule} from "../../imports";
import {PopupMenuComponent} from "../popup-menu/popup-menu.component";
import {User} from "../../classes/user";
import {UserService} from "../../user_services/user.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-profile-header-info',
  templateUrl: './profile-header-info.component.html',
  standalone: true,
  imports: [
    ImportsModule,
    PopupMenuComponent
  ],
  styleUrls: ['./profile-header-info.component.css']
})
export class ProfileHeaderInfoComponent implements OnInit {
  items!: MenuItem[];
  user$!: Observable<User | null>;

  constructor(private userService: UserService) {

  }

  ngOnInit() {
    this.user$ = this.userService.user$
    this.items = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          // Handle profile action
          console.log('Profile clicked');
        }
      },
      {
        label: 'Deposit',
        icon: 'pi pi-dollar',
        command: () => {
          // Handle deposit action
          console.log('Deposit clicked');
        }
      },
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
        command: () => {
          // Handle logout action
          console.log('Logout clicked');
        }
      }
    ];
  }
}
