import { Byte } from "@angular/compiler/src/util";
import { CLPUser } from "./clpuser.model";
import { SimpleResponse } from "./genericResponse.model";

export interface CustomActionScreen {
  customActionScreenID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  formName: string;
  firstName: string;
  lastName: string;
  showEditContactLink: boolean;
  showAddToComments: boolean;
  showAddToHistory: boolean;
  dtModified: Date;
  dtCreated: Date;
}

export interface CustomActionScreenResponse extends SimpleResponse {
  isUserDropdown: boolean;
  isBulkAppt: boolean;
  customActionScreen: CustomActionScreen[];
  users: CLPUser[];
}

export interface CustomActionDDResponse extends SimpleResponse {
  customActionDD: CustomActionDD[];
}

export interface CustomActionDD {
  customActionDdItemId: number;
  customActionButtonId: number;
  itemText: string;
  ctAction: Byte;
  ctCampaignTemplateId: number;
  clClpUserId: number;
  secCtAction: Byte;
  secCtCampaignTemplateId: number;
  secCtClpUserId: number;
  nextCustomActionScreenId: number;
  destinationUrl: string;
  setApptStatus: Byte;
  sorder: number;
}

export interface CustomActionButtonResponse extends SimpleResponse {
  customButton: CustomButton[];
}

export interface CustomButton {
  customActionButtonId: number;
  clpCompanyId: number;
  customActionScreenId: number;
  buttonText: string;
  instructions: string;
  foreColor: string;
  backColor: string;
  height: number;
  width: number;
  fontSize: number;
  isFontBold: boolean;
  ctAction: Byte;
  ctCampaignTemplateId: number;
  ctClpUserId: number;
  secCtAction: Byte;
  secCtCampaignTemplateId: number;
  secCtClpUserId: number;
  nextCustomActionScreenId: number;
  destinationUrl: string;
  setApptStatus: Byte;
  sorder: number;
}

export interface CustomActionUser {
  cLPCompanyID: number;
  cLPUserID: number;
  firstName: string;
  lastName: string;
}
