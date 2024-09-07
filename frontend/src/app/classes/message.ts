import {User} from "./user";
import {Chat} from "./chat";

export interface Message {
  chat: Chat;
  user: User;
  text: string;
  parent_message: Message;
}
