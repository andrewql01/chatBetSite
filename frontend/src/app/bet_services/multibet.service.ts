import { Injectable } from '@angular/core';
import { WebSocketService } from '../web_socket_services/web-socket.service';
import { HttpClient } from '@angular/common/http';

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
      bet_id: this.multiBetUuid
    });
  }

  disconnect(): void {
    this.wsService.disconnect();
  }

  addBetToMultibet(betId: number): void {
    console.log(this.multiBetUuid)
    if (this.multiBetUuid) {
      this.wsService.sendMessage({
        action: 'multibet_update',
        bet_id: betId,
        multibet_uuid: this.multiBetUuid
      });
    // } else {
    //   this.initMultibet().subscribe({
    //     next: data => {
    //       this.multiBetUuid = data.uuid;
    //       this.connectToMultibet(this.multiBetUuid);
    //       this.addBetToMultibet(betId);
    //     },
    //     error: error => {
    //       console.error('Failed to initialize multibet:', error);
    //     }
    //   });
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
