import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatCommunicationService {
  private openChatSubject = new Subject<string>();
  private closeChatSubject = new Subject<string>();

  openChat$ = this.openChatSubject.asObservable();
  closeChat$ = this.closeChatSubject.asObservable();

  requestOpenChat(roomId: string): void {
    this.openChatSubject.next(roomId);
  }

  requestCloseChat(roomId: string): void {
    this.closeChatSubject.next(roomId);
  }
}
