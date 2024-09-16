import {Message} from "./message";

export interface Chat {
  uuid: string;
  name: string;
  messages: Message[];
}
