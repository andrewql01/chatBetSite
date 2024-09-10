import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {BetService} from "../../bet_services/bet.service";
import {ImportsModule} from "../../imports";
import {SportEvent} from "../../classes/event";

@Component({
  selector: 'app-bet-container',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './bet-container.component.html',
  styleUrl: './bet-container.component.css'
})
export class BetContainerComponent {
  protected events: SportEvent[] = [];

  constructor(private betService: BetService) {
    this.betService.getEvents(10).subscribe({
      next: (response) => {
        this.events = response;
      }
    })

  }
}
