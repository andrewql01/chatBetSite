import { Component } from '@angular/core';
import {ImportsModule} from "../../imports";

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {

}
