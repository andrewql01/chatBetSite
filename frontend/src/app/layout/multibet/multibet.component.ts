import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from "@angular/common";
import { ImportsModule } from "../../imports";
import { BetService } from "../../bet_services/bet.service";
import { MultibetService } from "../../bet_services/multibet.service";
import { Subscription } from "rxjs";
import { Bet } from '../../classes/bet';
import { Multibet } from "../../classes/multibet";

@Component({
  selector: 'app-multibet',
  standalone: true,
  imports: [
    DecimalPipe,
    CurrencyPipe,
    ImportsModule
  ],
  templateUrl: './multibet.component.html',
  styleUrls: ['./multibet.component.css']  // Fixed: styleUrl -> styleUrls
})
export class MultibetComponent implements OnInit, OnDestroy {
  protected isVisible = false;
  protected isMinimized = false;
  protected betAmount = 0;
  protected bets: Bet[] = [];
  protected total_odds: number = 0;
  protected total_winnings: number = 0;
  protected multibet: Multibet | null = null;
  private multibetSub: Subscription = new Subscription();

  constructor(private betService: BetService,
              private multibetService: MultibetService) {}

  ngOnInit(): void {
    // Initialize multibet
    this.loadMultibet();

    // Subscribe to WebSocket updates
    this.multibetSub = this.multibetService.getMultiBetUpdates().subscribe({
      next: (response) => {
        if (response.action === 'multibet_update' && response.multibet) {
          this.updateMultibetData(response.multibet);
        }
        else if (response.action === 'multibet_submit') {
          // @ts-ignore
          console.log(response.multibet.state)
          this.loadMultibet();  // Reuse the method here
        }
      },
      error: (err) => {
        console.error('Failed to update multibet', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.multibetSub.unsubscribe();
  }

  // Method to load the initial multibet and update the view
  private loadMultibet(): void {
    this.multibetService.initMultibet().subscribe({
      next: (response) => {
        this.multibetService.joinMultibetGroup(response.uuid);
        this.updateMultibetData(response);
      },
      error: (err) => {
        console.error('Failed to initialize multibet', err);
      }
    });
  }

  // Method to update the multibet data
  private updateMultibetData(multibet: Multibet): void {
    this.bets = multibet.bets;
    this.total_odds = multibet.total_odds;
    this.total_winnings = multibet.total_winnings;
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }

  getTotalOdds(): number {
    return this.bets.reduce((total, bet) => total * bet.odds, 1);
  }

  getPotentialWinnings(): number {
    return this.betAmount * this.getTotalOdds();
  }

  deleteBet(id: number): void {
    this.multibetService.removeBetFromMultibet(id);
  }

  submitMultibet(): void {
    this.multibetService.submitMultibet();
  }
}
