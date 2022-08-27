import { MailMergeTemplate } from "./emailTemplate.model";
import { GenericResponse, UserDD } from "./genericResponse.model";

export interface Marketing_MailMergeResponse extends GenericResponse
{
  UserList: UserDD[];
  mailMergeList: MailMergeTemplate[];
}

export interface Marketing_MailMergeLoadResponse extends GenericResponse
{
  UserList: UserDD[];
  mailMergeTemplateLoad: MailMergeTemplateLoad;
}

export interface MailMergeTemplateLoad {
  mailMergeTemplateID: number;
  cLPCompanyID: number;
  cLPUserid: number;
  templateName: string;
  shareable: boolean;
  dtModified: Date;
  dtCreated: Date;
isUseBee: boolean;
hTMLText: string;
isArchived: string;
  jsonText: string;
  userLastFirst: string;
}

export interface BEE {
  clientId: string,
  secret: string,
  html: string,
  json: string,
  image: string,
  endpoint: string
}

export interface BEEResponse extends GenericResponse {
  beeDetails: BEE;
}
