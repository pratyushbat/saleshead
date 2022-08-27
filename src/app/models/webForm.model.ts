import { CLPUser } from "./clpuser.model";

export interface WebForm {
  webFormID: number;
  cLPCompanyID: number;
  formName: string;
  link: string;
  cLPUserID: number;
  campaignID: number;
  duplicateCampaignID: number;
  useCTSettings: boolean;
  cTAction: number;
  cTCampaignTemplateID: number;
  cTCLPUserID: number;
  duplicateCTAction: number;
  duplicateCTCampaignTemplateID: number;
  duplicateCTCLPUserID: number;
  allowDuplicates: boolean;
  dupsActivateCampaign: boolean;
  hTMLText: string;
  otherPublishLink: string;
  status: number;
  alertStatus: boolean;
  roundRobinID: number;
  dtModified: Date;
  dtCreated: Date;
  blnExists: boolean;
  jSONText: string;
  isUseBee: boolean;
}

export interface WebFormResponse {
  webForm: WebForm[];
  roundRobins: RoundRobin[];
  cLPuser: CLPUser[];
  CampaignTemplates: CampaignTemplates[];
}

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

export interface CampaignTemplates {
  campaignTemplateID: number;
  CLPUserID: number;
  CLPCompanyID: number;
  campaignTemplateType: number;
  campaignTemplateName: string;
  shareable: boolean;
  cycleEvents: boolean;
  delayCycleValue: number;
  delayCycleUnit: number;
  ownerType: number;
  immunityFlag: boolean;
  isViewInCM: boolean;
  dtModified: Date;
  dtCreated: Date;
}

export interface UniqueURLExistCheck {
  uniqueURLName: string,
  webFormIDToExclude: number
}
