import { KeyValue } from "@angular/common";
import { keyValue } from "./search.model";

export interface CLPSMTPResponse {
  cLPSMTP: CLPSMTP[];
  filterUser: KeyValue<number,string>[];
}
export interface CLPSMTP {
  cLPSMTPID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  sMTPServer: string;
  sMTPPort: string;
  sMTPAuthenticate: string;
  username: string;
  password: string;
  useSSL: boolean;
  name: string;
  email: string;
  enableCLPSMTP: boolean;

}
