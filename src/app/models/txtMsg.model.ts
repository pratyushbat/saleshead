import { Byte } from "@angular/compiler/src/util";
import { EmailTemplate } from "./emailTemplate.model";
import { SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";

export interface TxtMsg {
  txtMsgID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  contactID: number;
  countryCode: string;
  mobileNumber: string;
  msg: string;
  status: number;
  requestID: string;
  requestComment: string;
  campaignID: number;
  campaignEventID: number;
  runID: number;
  cLPServiceRunID: number;
  dtSend: Date;
  strDtsend: string;
  dtCreated: Date;
  isToUser: boolean;
  isUseShortCode: boolean;
  mediaURL: string;
  isThrottle: boolean;
  toCLPUserID: number;
  imgID: number;
  isScheduled: boolean;
  txtMsgLongCode: string;
  bWMessageId: string;
  dtSentFromBW: Date;
  dtSentToBW: Date;
}

export interface TxtMsgResponse extends SimpleResponse {
  txtMsg: TxtMsg;
}

export interface TxtMsgSettings extends SimpleResponse {
  cLPCompanyID: number;
  cLPUserID: number;
  aPIKey: string;
  optInKeyword: string;
  status: Byte;
  isAllowFreeForm: boolean;
  isShowContactIcon: boolean;
  isEnableTxtBlast: boolean;
  optInEmailTemplateID: number;
  dtCreated: Date;
  tollFreeLongCode: string;
  bWAPIVersion: Byte;
  voiceAPIKey: string;
  orgName: string;
  supportNumber: string;
  linkTC: string;
  isEnableVoiceDropCampaign: boolean;
}
export interface TxtMsgSettingsResponse extends SimpleResponse {
  txtMsgSettings: TxtMsgSettings;
  emailTemplates: EmailTemplate[];
  filterUser: keyValue[];
}
export interface Status {
  value: Number;
  name: String;
}
