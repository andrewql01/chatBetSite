import {Component, OnInit} from '@angular/core';
import {ImportsModule} from "../../imports";
import {ProfileHeaderInfoComponent} from "../profile-header-info/profile-header-info.component";
import {SafeUrl} from "@angular/platform-browser";
import {UserService} from "../../user_services/user.service";
import {User} from "../../classes/user";

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ImportsModule, ProfileHeaderInfoComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  logoSource: string | SafeUrl | undefined;

  constructor(private userService: UserService) {
    this.logoSource = '/assets/images/logo.png';
  }

}
