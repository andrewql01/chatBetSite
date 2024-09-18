import {Team} from "./team";
import {League} from "./league";

export interface SportEvent {
  uuid: string;
  name: string;
  home_team: Team;
  guest_team: Team;
  grouped_bets: any;
  date: string;
  location: string;
  league: League;
  score: string;
  isLive: boolean;
}
