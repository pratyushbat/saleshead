import { SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";

export interface CLPEmailDropbox {
  cLPEmailDropBoxID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  dropBox: string;
  processor: number;
  status: number;
  name: string;
  username: string;
}

export interface EmailDropboxSettingsResponse extends SimpleResponse{
  cLPEmailDropbox: CLPEmailDropbox[];
  filterUser: keyValue[];
}
