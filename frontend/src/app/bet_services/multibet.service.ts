import { Injectable } from '@angular/core';
import { WebSocketService } from '../web_socket_services/web-socket.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Multibet } from '../classes/multibet';

@Injectable({
  providedIn: 'root'
})
export class MultibetService {
  private multibet?: Multibet;
  private multiBetUuid?: string;
  private selectedBetIds = new Set<number>();

  constructor(private wsService: WebSocketService, private http: HttpClient) {}

  initMultibet(): Observable<Multibet> {
    const initUrl = 'http://localhost:8000/api/bets/init-multibet/';
    return this.http.post<Multibet>(initUrl, {}).pipe(
      map((multibet) => {
        this.multibet = multibet;
        this.selectedBetIds = new Set(multibet.bets.map(bet => bet.id));
        this.joinMultibetGroup(multibet.uuid);
        return multibet;
      })
    );
  }

  joinMultibetGroup(multibetUuid: string): void {
    this.multiBetUuid = multibetUuid;
    this.wsService.sendMessage({
      action: 'join_multibet',
      multibet_uuid: this.multiBetUuid
    });
  }

  getMultiBetUpdates(): Observable<{ action: string }> {
    return this.wsService.getMessages().pipe(
      map((data: any) => {
        if (data?.action && data.action.includes('multibet')) {
          if (data.multibet) {
            this.multibet = data.multibet as Multibet;
            this.selectedBetIds = new Set(this.multibet.bets.map(bet => bet.id));
          }
          return {
            action: data.action
          };
        }
        return { action: '' };
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

  getCurrentMultibet(): Multibet | undefined {
    return this.multibet;
  }

  isBetSelected(betId: number): boolean {
    return this.selectedBetIds.has(betId);
  }
}
