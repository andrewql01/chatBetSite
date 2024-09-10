import {Sport} from "./sport";
import {League} from "./league";

export interface Team {
  name: string;
  sport: Sport;
  league: League;
  description: string;
  image_url: string;
}
