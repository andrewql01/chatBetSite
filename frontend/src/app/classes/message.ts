import {User} from "./user";
import {Chat} from "./chat";

export interface Message {
  isCurrentUser?: boolean;
  id: number;
  chat: Chat;
  user: User;
  text: string;
  parent_message: Message;
}
