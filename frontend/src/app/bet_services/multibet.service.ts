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
    return this.http.post<any>(initUrl, {}).subscribe({
      next: (response: any) => {
        this.joinMultibetGroup(response.uuid);
      }
    })
  }

  joinMultibetGroup(multibetUuid: string): void {
    this.multiBetUuid = multibetUuid;
    this.wsService.sendMessage({
      action: 'join_multibet',
      multibet_uuid: this.multiBetUuid
    });
  }

  getMultiBetUpdates(): Observable<Multibet | null> {
    return this.wsService.getMessages().pipe(
      map(data => {
        // Check if the message type is 'multibet_update'
        if (data?.action === 'multibet_update') {
          return data.multibet as Multibet; // Assuming the actual Multibet object is under data.multibet
        }
        return null; // Return null if the type is not 'multibet_update'
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
        action: 'remove_bet_from_multibet',
        bet_id: betId,
        multibet_uuid: this.multiBetUuid
      });
    }
  }

  submitMultibet(): void {
    if (this.multiBetUuid) {
      this.wsService.sendMessage({
        action: 'submit_multibet',
        multibet_uuid: this.multiBetUuid
      });
    }
  }
}
