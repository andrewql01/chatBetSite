import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ImportsModule } from '../../imports';
import { BetService } from '../../bet_services/bet.service';
import { MultibetService } from '../../bet_services/multibet.service';
import { Subscription } from 'rxjs';
import { Bet } from '../../classes/bet';
import {Multibet} from "../../classes/multibet";

@Component({
  selector: 'app-multibet',
  standalone: true,
  imports: [
    DecimalPipe,
    CurrencyPipe,
    ImportsModule
  ],
  templateUrl: './multibet.component.html',
  styleUrls: ['./multibet.component.css']
})
export class MultibetComponent implements OnInit, OnDestroy {
  protected isVisible = false;
  protected isMinimized = false;
  protected betAmount = 0;
  protected bets: Bet[] = [];
  protected total_odds: number = 0;
  protected total_winnings: number = 0;
  private multibetSub: Subscription = new Subscription();

  constructor(private betService: BetService, private multibetService: MultibetService) {}

  ngOnInit(): void {
    this.loadMultibet();

    this.multibetSub = this.multibetService.getMultiBetUpdates().subscribe({
      next: (response) => {
        if (response.action === 'multibet_update') {
          const currentMultibet = this.multibetService.getCurrentMultibet();
          if (currentMultibet) {
            this.updateMultibetData(currentMultibet);
          }
        } else if (response.action === 'multibet_submit') {
          this.loadMultibet();
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

  private loadMultibet(): void {
    this.multibetService.initMultibet().subscribe({
      next: (response) => {
        this.updateMultibetData(response);
      },
      error: (err) => {
        console.error('Failed to initialize multibet', err);
      }
    });
  }

  private updateMultibetData(multibet: Multibet): void {
    this.bets = multibet.bets;
    this.total_odds = multibet.total_odds;
    this.total_winnings = multibet.total_winnings;
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }

  getPotentialWinnings(): number {
    return this.betAmount * this.total_odds;
  }

  deleteBet(id: number): void {
    this.multibetService.removeBetFromMultibet(id);
  }

  submitMultibet(): void {
    this.multibetService.submitMultibet();
  }

  isReadyToSubmit(): boolean {
    return !(this.betAmount > 0 && this.bets.length > 0);
  }
}
