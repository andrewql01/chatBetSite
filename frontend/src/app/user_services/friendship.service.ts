import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {WebSocketService} from "../web_socket_services/web-socket.service";
import {Observable} from "rxjs";
import {resolveSrv} from "node:dns";
import {User} from "../classes/user";
import {FriendRequest} from "../classes/friend-request";

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {

  private apiUrl = 'http://127.0.0.1:8000/api/users/friendships';  // URL to web API

  constructor(private http: HttpClient,
              private wsService: WebSocketService) { }

  // Send friend request
  sendFriendRequest(username: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { to_user_username: username };
    return this.http.post(`${this.apiUrl}/send-request`, body, { headers });
  }

  // Accept friend request
  acceptFriendRequest(friendRequestId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { friend_request_id: friendRequestId };
    return this.http.post(`${this.apiUrl}/accept-request`, body, { headers });
  }

  // Reject friend request
  rejectFriendRequest(friendRequestId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { friend_request_id: friendRequestId };
    return this.http.post(`${this.apiUrl}/reject-request`, body, { headers });
  }

  // Get list of friends
  getFriends(): Observable<User[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<User[]>(`${this.apiUrl}/get-friends`, { headers });
  }

  // Get list of unaccepted friend requests
  getFriendRequests(): Observable<FriendRequest[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/get-friend-requests`, { headers });
  }
}
