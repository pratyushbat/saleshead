import { SimpleChange } from "@angular/core";
import { GenericResponse, SimpleResponse } from "./genericResponse.model";
import { PasswordPolicy } from "./passwordPolicy.model";
import { RoleFeaturePermissions } from "./roleContainer.model";
import { keyValue } from "./search.model";

export interface CLPUser {
  cLPUserID: number;
  cLPSSID: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  cLPCompanyID: number;
  userRole: number;
  teamCode: number;
  encryptedPassword: string;
  //pwd: string;
  resetPassword: ResetPassword;
  currentDeviceId: string;
  isPasswordAdmin: boolean;
  companyName: string;
  slurpyUserId: number;
  slurpyCompanyId: number;
  isShowCP: boolean;
  status: number;
  //contact-module
  fullName: string
  officeCode: number
  

  //cLPSSID: number;
  //employeeID: number;
  permissions: number;
  changePW: number;
  timeZone: number;
  timeZoneWinId: number;
  dateFormatId: number;
  password: string;
  //question: string;
  //answer: string;
  //middleInitial: string;
  //title: string;
  //add1: string;
  //add2: string;
  //add3: string;
  //city: string;
  //state: string;
  //zip: string;
  //country: string;
  //enableSkype: number;
  phone: string;
  mobile: string;
  //altPhone: string;
  //fax: string;
  //enableFax2Mail: boolean;
  //fax2EmailFrom: string;
  //otherEmail: string;
  //useBothEmail: boolean;
  //emailFormat: number;
  //defaultSignature: string;
  //hTMLSignature: string;
  //fromDisplayName: string;
  //uAlias: string;
  //emailTemplateID: number;
  //helpMode: boolean;
  //isNewUser: boolean;
  //dShareContact: boolean;
  //dOutlookSync: boolean;
  isAllowDownload: boolean;
  //facebookURL: string;
  //twitterURL: string;
  //linkedInURL: string;
  //enableCLPSMTP: boolean;
  //enableiPhone: boolean;
  //dtCreated: Date;
  //txtMsgLongCode: string;
  //dtPassword: Date;
  //failedAttempts: number;
  //pwdChangeInDay: number;
  //isLocked: number;
  //dtlocked: Date;
  //passwordHash: string;
//    countryCode: string;
  country: string;
  theme: number;

}

export interface ResetPassword {
  currentPassword: string;
  //currentPwd: string;
  newPassword: string;
  //newPwd: string;
  isForget: number;
}

export interface UserResponse extends SimpleResponse {
  user: CLPUser;
  userId: number;
  encryptedToken: string;
  exists: boolean;
  msg: string;
  isvalid: number;
  passwordPolicy: PasswordPolicy;
  roleFeaturePermissions: RoleFeaturePermissions;
}

export interface UserListResponse extends SimpleResponse {
  clpUsers: CLPUser[];
}

//contact-module
export interface SimpleUserListResponse extends GenericResponse {
  users: CLPUser[];
  clpUserId: number;
}


export interface UserSetupResponse extends GenericResponse{
  users: CLPUser[];
  newCLPUsers: CLPUser[];
  filterTeam: any;
  filterOffice: any;
  timeZoneWin: any;
  dateFormat: any;
  filterRoles: any;
}
export interface TeamCode {
  temCode: number;
  cLPCompanyID: number;
  display: string;
  sOrder: number;
}

export interface CLPUserProfile extends SimpleResponse {
  encryptedPassword: string;
  cLPUserID: number;
  cLPCompanyID: number;
  cLPSSID: number;
  teamCode: number;
  userName: string;
  password: string;
  question: number;
  answer: string;
  officeCode: number;
  lastName: string;
  firstName: string;
  fullName: string;
  middleInitial: string;
  employeeID: string;
  permissions: number;
  changePW: number;
  timeZone: number;
  timeZoneWinId: number;
  userRole: number;
  title: string;
  add1: string;
  add2: string;
  add3: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  enableSkype: boolean;
  phone: string;
  mobile: string;
  altPhone: string;
  fax: string;
  enableFax2Mail: boolean;
  fax2EmailFrom: string;
  email: string;
  otherEmail: string;
  useBothEmail: boolean;
  emailFormat: number;
  defaultSignature: string;
  hTMLSignature: string;
  fromDisplayName: string;
  uAlias: string;
  emailTemplateID: number;
  helpMode: boolean;
  isNewUser: boolean;
  dShareContact: boolean;
  dOutlookSync: boolean;
  isAllowDownload: boolean;
  facebookURL: string;
  twitterURL: string;
  linkedInURL: string;
  enableCLPSMTP: boolean;
  enableiPhone: boolean;
  dtCreated: Date;
  txtMsgLongCode: string;
  dtPassword: Date;
  failedAttempts: number;
  pwdChangeInDay: number;
  isLocked: number;
  dtlocked: Date;
  isPasswordAdmin: boolean;
  passwordHash: string;
  slurpyUserId: number;
  companyName: string;
  status: number;
  isShowCP: boolean;
  countryCode: string;
  dateFormatId: number;
  theme: number;

}

export interface OfficeCodes {
  officeCode: number;
  cLPCompanyID: number;
  display: string;
  sOrder: number;
}

export interface OfficeCodeResponse extends GenericResponse {
  selectedValue: string;
  officeCodes: OfficeCodes[];
}


export interface OfficeCodeResponseIEnumerable extends GenericResponse {
  officeCodes: OfficeCodes[];

}
export interface TeamCodes {
  teamCode: number;
  cLPCompanyID: number;
  display: string;
  sOrder: number;
  companyName: string;
}

export interface TeamCodeResponse extends GenericResponse {
  selectedValue: string;
  teamCodes: TeamCodes[];
}
export interface TeamCodeResponseIEnumerable extends GenericResponse {
  teamCodes: TeamCodes[];
}

export interface TeamOfficeSetting {
  showTeamDD: boolean;
  showOfficeDD: boolean;
}

export interface VoiceRecordingType {
  voiceRecordingTypeID: number;
  cLPCompanyID: number;
  display: string;
  sOrder: number;
  script: string;
}

export interface VoiceRecordingResponseIEnumerable extends GenericResponse {
  voiceRecordings: VoiceRecordingType[];
}

export interface SFAResponse extends SimpleResponse {
  companyName: string;
  filterUser: keyValue[];
}

export interface UserResourcesUsed {
  output: string
}

export interface c1443_CLPUserPref {
  cLPUserID: number;
  class5Code: number;
  initialETID: number;
  vCRAlertCLPUserID: number;
  vCRAlertBCC: string;
  pH1SMSText: string;
  pH1SMSMMS: string;
  pH2SMSText: string;
  pH2SMSMMS: string;
  pH3SMSText: string;
  pH3SMSMMS: string;
  pHLCCSMS: string;
  pHLCTSMS: string;
  pH24hrptourSMS: string;
  pH24hragreementSMS: string;
  pHSPURLSMS: string;
  pHEvent1Date: Date;
  pHEvent1URL: string;
  pHEvent1Desc: string;
  pHEvent2Date: Date;
  pHEvent2URL: string;
  pHEvent2Desc: string;
  isDCRActive: boolean;
  dCRMemberCalls: string;
  dCRReciprocals: string;
  isSOCRemoteRep: boolean;
  sOCRemotePerDealFee: number;
  sSUsername: string;
  sSPassword: string;
  isGBCManaged: boolean;
  pHSendAgreementSMS: string;
  pHSendAgreementMMS: string;
  dCRMemberSMSRouting: string;
    }

export interface FeatureAccess {
  roleId: number;
  featureId: number;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  clpCompanyId: number;
}

/*mobile login*/

export interface IPLog {
  ip: string;
  page: string;
  countryCode: string;
  spam: boolean;
  tor: boolean;
  city: string;
  detail: string;
}
/*mobile login*/
