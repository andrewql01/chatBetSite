import { Component } from '@angular/core';
import { ImportsModule} from "../../imports";

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {

}
