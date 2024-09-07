import {Message} from "./message";
import {User} from "./user";

export interface Chat {
  uuid: string;
  name: string;
  messages: Message[];
}
