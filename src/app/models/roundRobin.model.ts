import { keyValue } from "./search.model";

export interface RoundRobin {
  roundRobinID: number;
  cLPCompanyID: number;
  roundRobinName: string;
  currentPositionID: number;
  roundRobinItems: RoundRobinItem[];
}

export interface RoundRobinItem {
  roundRobinListID: number;
  roundRobinID: number;
  positionID: number;
  cLPUserID: number;
  cLPUserDisplay: string;
}


export interface RoundRobinListReponse {
  roundRobins: RoundRobin[];
  filterUsers: keyValue;
}
