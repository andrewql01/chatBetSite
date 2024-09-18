import {User} from "./user";
import {Chat} from "./chat";

export interface Message {
  isCurrentUser: boolean;
  chat: Chat;
  user: User;
  text: string;
  parent_message: Message;
}
