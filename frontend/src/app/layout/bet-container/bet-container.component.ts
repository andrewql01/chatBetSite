import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {BetService} from "../../bet_services/bet.service";
import {ImportsModule} from "../../imports";
import {SportEvent} from "../../classes/event";
import {MultibetService} from "../../bet_services/multibet.service";
import {ButtonGroupModule} from "primeng/buttongroup";

@Component({
  selector: 'app-bet-container',
  standalone: true,
  imports: [ImportsModule, ButtonGroupModule],
  templateUrl: './bet-container.component.html',
  styleUrl: './bet-container.component.css'
})
export class BetContainerComponent {
  protected events: SportEvent[] = [];

  constructor(private betService: BetService,
              private multibetService: MultibetService) {
    this.betService.getEvents(10).subscribe({
      next: (response) => {
        this.events = response;
      }
    })
  }

    toggleBetInMultibet(betId: number): void {
    if (this.isBetSelected(betId)) {
      // If the bet is already selected, remove it from the multibet
      this.multibetService.removeBetFromMultibet(betId);
    } else {
      // Otherwise, add it to the multibet
      this.multibetService.addBetToMultibet(betId);
    }
  }

  isBetSelected(betId: number): boolean {
    return this.multibetService.isBetSelected(betId);
  }
}
