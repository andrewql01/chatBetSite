import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { ImportsModule } from '../../imports';
import {Chat} from "../../classes/chat";
import {UserService} from "../../auth_services/user.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  items: MenuItem[] | undefined;
  chats: Chat[] | undefined;

  constructor(private router: Router,
              private userService: UserService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
      this.items = [
          {
              label: 'Navigate',
              items: [
                  {
                      label: 'Dashboard',
                      icon: 'pi pi-chart-bar',
                      command: () => this.router.navigate(['main/dashboard']),
                  },
                  {
                      label: 'Chats',
                      icon: 'pi pi-inbox',
                      items: [],
                  },
                  {
                      label: 'Settings',
                      icon: 'pi pi-cog',
                  }
              ]
          }
      ];
      this.userService.getUserChats().subscribe({
        next: (response) => {
          this.chats = response;

          // Find the "Chats" menu item and add the chat items under it
          const chatsMenuItem = this.items?.find(item => item.label === 'Navigate')?.items?.find(subItem => subItem.label === 'Chats');
          if (chatsMenuItem) {
            chatsMenuItem.items = this.chats?.map(chat => ({
              label: chat.name,
              icon: 'pi pi-comments',  // Use an appropriate icon
              command: () => {
                this.router.navigate([`main/chat/${chat.uuid}`]);
              }
            }));
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err)
        }
      });
  }

}
