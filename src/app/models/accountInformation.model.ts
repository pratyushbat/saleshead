import { SimpleResponse } from "./genericResponse.model";
import { LogType } from "./logType.model";
import { keyValue } from "./search.model";

export interface AccountInformation {
  clpCompanyID: number;
  companyName: string;
  add1: string;
  add2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  companyURL: string;
  logoURL: string;
  status: string;

  cLPUserID: number;
  billingName: string;
  comments: string;
  useCC: boolean;
  pONumber: string;
  cCName: string;
  cCType: number;
  cCNumber: string;
  cCExMonth: number;
  cCExYear: number;
  cCCid: string;
  feeSetup: number;
  feeCompany: number;
  feeUser: number;
  discountUser: number;
  feeMonthlyRider: number;
  feeSupportHour: number;
  feeAdditionalContacts: number;
  accountBalance: number;
  supportCredit: number;
  additionalContactsIncrements: number;
  cycleDay: number;
  contract: number;
  dtContractExpire: Date;
  dtNextBillDate: Date;
  dtPromoExpire: Date;
  isOnPromo: boolean;
  cLPVARID: number;
  dtCreated: number;
  tmpCCName: string;
  tmpCCType: number;
  tmpCCNumber: string;
  tmpCCExMonth: number;
  tmpCCExYear: number;
  tmpCCCid: string;
  tmpAdd1: string;
  tmpAdd2: string;
  tmpCity: string
  tmpState: string;
  tmpZip: string;
  tmpCountry: string;
  encCCNumber: number;
  tmpEncCCNumber: number;
  monthlyFee: number;
  userCount: number;



  isSFAIncluded: boolean;
  isMobileIncluded: boolean;
  isHTMLEmailIncluded: boolean;
  isOutlookIncluded: boolean;
  isProjectModuleInstalled: boolean
  isMultipleFromAddresses: boolean;
  isBrandingIncluded: boolean;
  enableMoreFields: boolean;
  enableCLPSS: boolean;
  isEmailValidation: boolean;
  blnMailingFromType: boolean;
  blnEnableiPhone: boolean;
  blnLogSkypeCalls: boolean;
  useCompanyModule: boolean;
  maxEblast: number;
  maxContacts: number;
  isSOCRM: boolean;
  isSODigital: boolean;
  isSOProServ: boolean;


  //add1: string;
  //add2: string;
  //city: string;
  //state: string;
  //zip: string;
  //Country: string;
}

export interface AccountInformationRespone {
  accountInformation: AccountInformation;
}

export interface AccountSetup {
  clpCompanyID: number;
  companyName: string;
  status: number;
  StatusDisplay: string;
  tickets: number;
  clpRole: number;
}

export interface AccountSetupListResponse extends SimpleResponse {
  accountSetup: AccountSetup[];
}

export interface CLPUserPrefList {
   userCode: string;
   userDisplay: string;
   txtMsgLongCode: string;
   isCallForwardingLine: boolean;
   callForwardAPID: number;
   isClickToCallLine: boolean;
   isVCREnabled: boolean;
   isVoiceDropLine: boolean;
   isKMLEnabled: boolean;
   isSOLeadGen: boolean;
   isSingleSignOn: boolean;
   isVIPEnabled: boolean;
   isSGVIPEnabled: boolean;
}

export interface CLPUserPref {
   cLPUserID: number;
   showGSCheckList: boolean;
   theme: string;
   homePage: string;
   calendarDefault: string;
   contactListColumns: string;
   contactCustomSearchID: number;
   companyListColumns: string;
   companyCustomSearchID: number;
   leadListColumns: string;
   leadCustomSearchID: number;
   isCallForwardingLine: boolean;
   isClickToCallLine: boolean;
   isVoiceDropLine: boolean;
   defaultCASID: number;
   isKMLEnabled: boolean;
   isSOLeadGen: boolean;
   callForwardAPID: number;
   sAMPin: number;
   isClickToCallEnablePreCallText: boolean;
   isClickToCallEnableInCallText: boolean;
   clickToCallPreferredLine: number;
   isSAMTCAgreed: number;
   isVCREnabled: boolean;
   isVCRIn: boolean;
   isVCROut: boolean;
   txtMsgIBAPID: number;
   txtMsgQCDNA: string;
   txtMsgQCVM: string;
   callForwardingPreferredLine: number;
   isTxtMsgIBSendEmailAlert: boolean;
   isSingleSignOn: boolean;
   defaultVIPID: number;
   defaultVIPEmailTemplateID: number;
   isVIPEnabled: boolean;
   customPH1: string;
   customPH2: string;
   customPH3: string;
   customPH4: string;
   customPH5: string;
   isVirtualVM: boolean;
   virtualVMVRID: number;
   defaultSGVIPID: number;
   vIPQRCodeURL: string;
   isSGVIPEnabled: boolean;
   isDirectToVirtualVM: boolean;
   txtMsgLongCode: string;
}

export interface CLPLogParameters {
   supportLogin: number;
   clpCompanyId: number;
   clpUserId: number;
   clpLogTypeID: number;
   dtToDate: Date;
   dtfromDate: Date;
}

export interface CLPLogListResponse extends SimpleResponse {
   activityLogs: CLPLog[]
   filterUser: keyValue[]
   filterLogType: LogType[]
}

export interface CLPLog {
   cLPLogID: number;
   cLPCompanyID: number;
   cLPUserID: number;
   cLPLogTypeID: number;
   cLPSSID: number;
   isSupportLogin: boolean;
   note: string;
   dtCreated: Date;
   userName: string;
   clpLogType: string;
}

export interface APIKeyLoadResponse {
  aPIKey: APIKey
  webFormList: WebFormList
}

export interface APIKey {
  cLPCompanyID: number;
  webFormId: number;
  clientId: string;
  clientSecret: string;
  redirectURI: string;
  dtCreated: Date;
  dtModified: Date;
}

export interface WebFormList {
  webFormID: number;
  formName: string;
}

export interface GenerateKeyResponse extends SimpleResponse{
  clientIDKey: string;
clientSecretKey: string;
}


export interface UsersListsResponse {
  iPhoneEnableUsers: CLPUserDetails[];
  iPhoneDisableUsers: CLPUserDetails[];
}
export interface CLPUserDetails {
  fullname: string;
  clpUserId: number;
  enableiPhone: boolean;
}

export interface CompanyModuleResponse extends SimpleResponse {
  companyModule: CompanyModule;
}

export interface CompanyModule {
  cnt: number;
  resultID: number;
}


