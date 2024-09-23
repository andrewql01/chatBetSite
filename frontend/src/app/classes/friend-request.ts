import {User} from "./user";

export interface FriendRequest {
  id: number;
  from_user: User;
  to_user: User;
  created_at: string;
}
