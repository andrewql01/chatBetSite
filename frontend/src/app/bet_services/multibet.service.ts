import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {WebSocketSubject} from "rxjs/webSocket";
import {AuthService} from "../auth_services/auth.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MultibetService {
  private betSocket$!: WebSocketSubject<any>;
  private multiBetSocket$!: WebSocketSubject<any>;
  private currentMultiBetUuid: string | null = null;

  constructor(private authService: AuthService,
              private http: HttpClient,) { }

  connectToBets(){
    const token = this.authService.getToken();
    if (!token) {
      console.error('No JWT token available');
      return;
    }

    const betUrl = `ws://localhost:8000/ws/bet/?token=${token}`
    this.betSocket$ = new WebSocketSubject(betUrl)
  }

  initMultibet(){
    const initUrl = 'http://localhost:8000/api/bets/init-multibet/'
    return this.http.post<any>(initUrl, {});
  }

  connectToMultibet(){
    const token = this.authService.getToken();
    if (!token) {
      console.error('No JWT token available');
      return;
    }

    const multiBetUrl = `ws://localhost:8000/ws/multibet/${this.currentMultiBetUuid}/?token=${token}`;
    this.multiBetSocket$ = new WebSocketSubject(multiBetUrl)
  }

  deleteMultibet(){
    if (this.multiBetSocket$) {
      this.multiBetSocket$.next({ action: 'delete_multibet' });
    }
    this.disconnectMultibet()
  }

  addBetToMultibet(betId: number) {
    if (!this.currentMultiBetUuid) {
      this.initMultibet().subscribe({
        next: (data) => {
          this.currentMultiBetUuid = data.uuid;
          this.connectToMultibet();
          this.sendBetToMultibet(betId);
        },
        error: (error) =>
      {
        console.error('Failed to initialize multibet:', error);
      }
      });
    } else {
      this.sendBetToMultibet(betId);
    }
  }

  private sendBetToMultibet(betId: number) {
    if (this.multiBetSocket$) {
      this.multiBetSocket$.next({
        action: 'add_bet',
        bet_id: betId
      });
    }
  }

  removeBetFromMultibet(betId: number){
    if (this.multiBetSocket$) {
      this.multiBetSocket$.next({
        action: 'remove_bet_from_multibet',
        bet_id: betId
      });
    }
  }

  submitMultibet(){
    if (this.multiBetSocket$) {
      this.multiBetSocket$.next({ action: 'submit_multibet' });
    }
  }

  disconnectBet(){
    if (this.betSocket$) {
      this.betSocket$.unsubscribe();
    }
  }

  disconnectMultibet(){
    if (this.multiBetSocket$) {
      this.multiBetSocket$.unsubscribe();
    }
  }

}
