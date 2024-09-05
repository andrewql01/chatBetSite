import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { ImportsModule } from '../../imports';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  items: MenuItem[] | undefined;

  constructor(private router: Router) {}

  ngOnInit() {
        this.items = [
            {
                label: 'Navigate',
                items: [
                    {
                        label: 'Chats',
                        icon: 'pi pi-inbox',
                    },
                    {
                        label: 'Settings',
                        icon: 'pi pi-cog',
                    }
                ]
            }
        ];
    }

}
