import {Bet} from "./bet";

export interface Multibet {
  uuid: string;
  bets: Bet[];
  total_amount: number;
  total_odds: number;
  total_winnings: number;
  outcome: string;
  state: string;
}
