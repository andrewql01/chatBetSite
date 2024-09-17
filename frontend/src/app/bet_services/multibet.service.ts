import { Injectable } from '@angular/core';
import { WebSocketService } from '../web_socket_services/web-socket.service';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {Message} from "../classes/message";
import {map} from "rxjs/operators";
import {Multibet} from "../classes/multibet";

@Injectable({
  providedIn: 'root'
})
export class MultibetService {
  private multiBetUuid?: string;

  constructor(private wsService: WebSocketService,
              private http: HttpClient) {}

  initMultibet() {
    const initUrl = 'http://localhost:8000/api/bets/init-multibet/';
    return this.http.post<Multibet>(initUrl, {});
  }

  joinMultibetGroup(multibetUuid: string): void {
    this.multiBetUuid = multibetUuid;
    this.wsService.sendMessage({
      action: 'join_multibet',
      multibet_uuid: this.multiBetUuid
    });
  }

  getMultiBetUpdates(): Observable<{ action: string, multibet: Multibet | null }> {
    return this.wsService.getMessages().pipe(
      map((data: any) => {
        // Check if the action contains 'multibet'
        if (data?.action && data.action.includes('multibet')) {
          return {
            action: data.action,  // Pass the action type back to the frontend
            multibet: data.multibet as Multibet
          };
        }
        return { action: '', multibet: null };  // Return empty action and null if it doesn't match
      })
    );
  }

  addBetToMultibet(betId: number): void {
    if (this.multiBetUuid) {
      this.wsService.sendMessage({
        action: 'multibet_update',
        bet_id: betId,
        multibet_uuid: this.multiBetUuid
      });
    }
  }

  removeBetFromMultibet(betId: number): void {
    if (this.multiBetUuid) {
      this.wsService.sendMessage({
        action: 'multibet_remove_bet',
        bet_id: betId,
        multibet_uuid: this.multiBetUuid
      });
    }
  }

  submitMultibet(): void {
    if (this.multiBetUuid) {
      this.wsService.sendMessage({
        action: 'multibet_submit',
        multibet_uuid: this.multiBetUuid
      });
    }
  }
}
