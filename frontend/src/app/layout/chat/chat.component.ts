import { Component } from '@angular/core';
import { ImportsModule } from '../../imports';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

}
