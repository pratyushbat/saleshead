import { keyValue } from "./search.model";

export interface AutomationProcessDD {
  campaignTemplateID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  campaignTemplateName: string;
  templateName: string;
}

export interface CustomActionScreenDD {
  customActionScreenId: number;
  cLPCompanyID: number;
  cLPUserID: number;
  formName: string;
}

export interface RddEmailTemplateDD {
  teamCode: number;
  display: string;
  emailTemplateId: number;
  templateName: string;
  isUseBee: string;
}

export interface LoadCustomActionButton {
  automationProcessDD: AutomationProcessDD[];
  filterUser: keyValue[];
  customActionScreenDd: CustomActionScreenDD[];
  rddEmailTemplateDd: RddEmailTemplateDD[];
}

export interface LoadAutomationProcessDD {
  automationProcessDD: AutomationProcessDD[];
  searchText: string;
}
