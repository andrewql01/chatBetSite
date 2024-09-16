import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, DecimalPipe} from "@angular/common";
import {ImportsModule} from "../../imports";
import {BetService} from "../../bet_services/bet.service";
import {MultibetService} from "../../bet_services/multibet.service";
import {Subscription} from "rxjs";
import {Bet} from '../../classes/bet'


@Component({
  selector: 'app-multibet',
  standalone: true,
  imports: [
    DecimalPipe,
    CurrencyPipe,
    ImportsModule
  ],
  templateUrl: './multibet.component.html',
  styleUrl: './multibet.component.css'
})
export class MultibetComponent implements OnInit {
  protected isVisible = false;
  protected isMinimized = false;
  protected betAmount = 0;
  protected bets: Bet[] = [];
  protected total_odds: number = 0;
  protected total_winnings: number = 0;
  private multibetSub: Subscription = new Subscription();

  constructor(private betService: BetService,
              private multibetService: MultibetService) {}

  ngOnInit(): void {
    this.multibetService.initMultibet()
    this.multibetSub = this.multibetService.getMultiBetUpdates().subscribe({
      next: (response) => {
        if (response){
          this.bets = response.bets.map(bet => ({
            ...bet,
            odds: parseFloat(bet.odds)  // Convert the odds to a number
          }));
          this.total_odds = response.total_odds;
          this.total_winnings = response.total_winnings;
        }
      }
    });
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  getTotalOdds(): number {
    return this.bets.reduce((total, bet) => total * bet.odds, 1);
  }

  getPotentialWinnings(): number {
    return this.betAmount * this.getTotalOdds();
  }

  deleteBet(id: number): void {
    this.bets = this.bets.filter(bet => bet.id !== id);
  }
}
