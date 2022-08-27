import { GenericResponse, SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";

export interface TxtMsgTemplate {
  txtMsgTemplateID: number;
  cLPCompanyID: number;
  cLPUserid: number;
  templateName: string;
  messageText: string;
  shareable: boolean;
  dtModified: Date;
  dtCreated: Date;
  mediaURL: string;
  userName: string;
}

export interface TxtMsgTemplateResponse extends GenericResponse {
  filterUser: keyValue[];
  txtMsgTemplateList: TxtMsgTemplate[];
}
