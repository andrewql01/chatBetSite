import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService{
  private socket: WebSocket | undefined;
  private url = 'ws://127.0.0.1:8000/ws/app/';
  private token: string | null = null;
  private messageSubject = new Subject<any>();

  constructor(private authService: AuthService) {
    this.connect();
  }

  private connect(): void {
    this.token = this.authService.getToken();
    if (!this.token) {
      console.error('No JWT token available');
      return;
    }

    if (this.socket) {
      return; // Already connected
    }

    const queryString = new URLSearchParams({ token: this.token }).toString();
    const wsUrl = `${this.url}?${queryString}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.socket.onclose = () => {
      this.socket = undefined; // Ensure socket is cleared on close
      console.log('WebSocket closed, reconnecting...');
      setTimeout(() => this.connect(), 1000); // Reconnect after a delay
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected or not open');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}
