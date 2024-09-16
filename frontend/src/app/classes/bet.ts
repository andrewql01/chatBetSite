import {SportEvent} from "./event";

export interface Bet {
  id: number;
  description: string;
  subject: string;
  odds: number;
  event: SportEvent;
}
