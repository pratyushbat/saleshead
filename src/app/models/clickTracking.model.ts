import { SimpleResponse } from "./genericResponse.model";

export interface ClickTrackingResponse extends SimpleResponse {
  click: Click
  clickTemplate: ClickTemplate[]
  filterUser: filterUser[]
}
export interface Click {
  clickID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  cTAction: number;
  cTCampaignTemplateID: number;
  cTCLPUserID: number;
  destinationURL: string;
  clickURL: string;
  score: number;
  dtCreated: string;
}
export interface ClickModelView extends SimpleResponse {
  clickID: number;
  clpCompanyID: number;
  clpUserID: number;
  cTAction: number;
  cTCampaignTemplateID: number;
  cTCLPUserID: number;
  destinationURL: string;
  score: number;
  campaignTemplateName: string;
  userName: string;
  dtCreated: string;
  clickDisplay: string;
  clickURL: string;
  sfaSettings: string;
  sfaSort: string;

}
export interface ClickTemplate {
  campaignTemplateID: number;
  campaignTemplateName: string;
}

export interface filterUser {
  key: number
  value: string
}


