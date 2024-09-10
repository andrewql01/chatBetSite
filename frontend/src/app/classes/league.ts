import {Sport} from "./sport";

export interface League {
  name: string;
  sport: Sport;
  description: string;
  image_url: string;
}
