import { SimpleResponse } from "./genericResponse.model";

export interface CLPRights {
  cLPCompanyID: number;
  userRole: number;
  companyReadWrite: number;
  officeReadWrite: number;
  teamReadWrite: number;
}

export interface clpRightsResponse {
  clpRights: CLPRights[];
}

export interface OutlookRights {
  cLPCompanyID: number;
  userRole: number;
  companyDownloadable: boolean;
  officeDownloadable: boolean;
  teamDownloadable: boolean;
}
