import { Data } from "@angular/router"
import { keyValue } from "./search.model";
import { GenericResponse } from "./genericResponse.model";

export interface EmailTemplate {
  emailTemplateID: number;
  cLPCompanyID: number;
  cLPUserid: number;
  templateName: string;
  shareable: boolean;
  dtModified: Date;
  dtCreated: Date;
  isUseBee: string;
  userLastFirst: string;
  htmlText: string;
  fBCETID: number;
  class5CodeID: number;
  isActive: boolean;
  jSONText: string;
}

export interface EmailTemplateLoad {
  emailTemplateID: number;
  cLPCompanyID: number;
  cLPUserid: number;
  templateName: string;
  shareable: boolean;
  dtModified: Date;
  dtCreated: Date;
  isUseBee: boolean;
  userLastFirst: string;
  htmlText: string;
  fBCETID: number;
  class5CodeID: number;
  isActive: boolean;
  jSONText: string;
}

export interface MailMergeTemplate {
  mailMergeTemplateID: number;
  cLPCompanyID: number;
  cLPUserid: number;
  templateName: string;
  shareable: boolean;
  dtModified: Date;
  dtCreated: Date;
  isUseBee: string;
  userLastFirst: string;
  teamCode: number;
  display: string;
  hTMLText: string;
  jSONText: string;
}

export interface FBCEmailTemplate {
  fBCETID: number;
  class5CodeID: number;
  emailTemplateID: number;
  cLPUserID: number;
  isActive: boolean;
  dtModified: Date;
  templateName: string;
  locationFBCETID: number;
  locationisActive: boolean
  htmlText: string;
  /*--Extra Field--*/
  stDisplay: string;
  btn: string;

}
export interface EmailSnippet {
  emailSnippetID: number;
  cLPUserID: number;
  snippetTitle: string;
  snippetText: string;
}

export interface EmailDropDownsResponse extends GenericResponse {
  emailTemplates: EmailTemplate[];
  mailMergeTemplates: MailMergeTemplate[];
  emailSnippets: EmailSnippet[];
  userToList: keyValue;
  isMultipleFromAddress: boolean; // On client if true then show from dropdown with multiple users.
}
export interface EmailTemplateResponse {
  emailTemplates: EmailTemplate[];
  filterUser: keyValue[];
}

export interface EmailSnippetResponse {
  emailSnippet: EmailSnippet;
}

export interface FBCEmailTemplateResponse {
  fBCEmailTemplate: FBCEmailTemplate[];
}

export interface ITeamOfficeCode{
  key: number;
  value: string;
}

export interface EmailTemplateBaseDropdownResponse {
  usage: EmailTemplateBaseUsage[];
  industries: EmailTemplateBaseIndustries[];
  seasonal: EmailTemplateBaseSeasonal[];
}

export interface EmailTemplateBaseUsage {
  usage: string;
}

export interface EmailTemplateBaseIndustries {
  industries: string;
}

export interface EmailTemplateBaseSeasonal {
  seasonal: string;
}

export interface EmailTemplateBase {
  emailTemplateBaseID: number;
  templateName: string;
  hTMLText: any;
  thumbnailURL: string;
  dtCreated: Date;
  jSONText: string;
  isUseBee: boolean;
  tags: string;
  usage: string;
  industries: string;
  isMailMergeTemplate: boolean;
  seasonal: string;
}

export interface EmailTemplateBaseUsageResponse {
  usage: EmailTemplateBaseUsage[];
}

export interface EmailTemplateBaseIndustriesResponse {
  industries: EmailTemplateBaseIndustries[];
}

export interface EmailTemplateBaseSeasonalResponse {
  seasonal: EmailTemplateBaseSeasonal[];
}

export interface c1443_FBCET {
  fBCETID: number;
  class5CodeID: number;
  emailTemplateID: number;
  hTMLText: string;
cLPUserID: number;
isActive: boolean;
dtModified: Date;
}

export interface c1443_FBCETPHItemLocation {
  fBCETPHItemID: number;
  fBCETID: number;
  pHName: string;
  pHDisplay: string;
  pHValue: string;
  valueType: number;
locationFBCETPHItemID: number;
locationPHValue: string;
}

export interface c1443_FB_CodeBlockResponse {
  codeBlock: c1443_FB_CodeBlock[];
	}
export interface c1443_FB_CodeBlock {
  fbCodeBlockId: number;
  BlockType: number;
  blockTitle: string;
  blockTest: string;
	}

export interface TagListResponse {
  tagList: string[];
	}
export interface TagList {
  tagName: string;
	}

export interface MailTypeResponse {
  mailType: MailType[];
}

export interface MailType {
  mailingTpeCode: number;
  clpCompanyID: number;
  display: string;
  sOrder: number;
}
