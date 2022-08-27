import { GenericResponse, SimpleResponse } from "./genericResponse.model";
import { SearchQueryResponse } from "./search.model";

export interface c1443_Location {
  locationID: number;
  location: string;
  address: string;
  city: string;
  sT: string;
  zip: number;
  empIDSales: number
  empIDOwner: number;
  empIDMemExec: number;
  empIDReserv: number;
  empIDAccount: number;
  empIDDocMan: number;
  empIDPrimCap: number;
  empIDSecCap: number;
  class5Code: number;
  teamCode: number;
}

export interface c1443_LocationResponse extends GenericResponse {
  c1443_Location: c1443_Location[];
}
