import { SimpleResponse } from "./genericResponse.model";
import { UploadCompany } from "./uploadCompany.model";

export interface UploadContact {
  uploadContactID: number;
  uploadSessionID: number;
  uploadCLPUserID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  uploadCompanyID: number;
  companyID: number;
  firstName: string;
  lastName: string;
  salutation: string;
  title: string;
  companyName: string;
  add1: string;
  add2: string;
  add3: string;
  add4: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  custom1: string;
  custom2: string;
  custom3: string;
  custom4: string;
  custom5: string;
  custom6: string;
  custom7: string;
  custom8: string;
  custom9: string;
  custom10: string;
  custom11: string;
  custom12: string;
  custom13: string;
  custom14: string;
  custom15: string;
  custom16: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  check5: boolean;
  check6: boolean;
  phone: string;
  homePhone: string;
  mobile: string;
  altPhone: string;
  fax: string;
  otherFax: string;
  email: string;
  email2: string;
  email3: string;
  webSite: string;
  comments: string;
  historyNote: string;
  class1Code: number;
  class2Code: number;
  class3Code: number;
  class4Code: number;
  class5Code: number;
  class6Code: number;
  class7Code: number;
  class8Code: number;
  customDate1: Date;
  customDate2: Date;
  customDate3: Date;
  customDate1Title: string;
  customDate2Title: string;
  customDate3Title: string;
  customText1: string;
  customText2: string;
  customText3: string;
  coClass1Code: number;
  coClass2Code: number;
  coClass3Code: number;
  coClass4Code: number;
  coClass5Code: number;
  coClass6Code: number;
  coClass7Code: number;
  coClass8Code: number;
  coCustom1: string;
  coCustom2: string;
  coCustom3: string;
  coCustom4: string;
  coCustom5: string;
  coCustom6: string;
  coCustom7: string;
  coCustom8: string;
  coCheck1: boolean;
  coCheck2: boolean;
  coCheck3: boolean;
  coCheck4: boolean;
  tagID: number;
  dateModified: Date;
  dateCreated: Date;
  dupContactID: number;
  actionToTake: number;
  shareable: boolean;
  custom17: string;
  custom18: string;
  custom19: string;
  custom20: string;

}

export interface UploadContactVM extends SimpleResponse {
  uploadContactID: number;
  uploadSessionID: number;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  mobile: string;
  fax: string;
  email: string;
  classification: string[];
  clpUserId: string;
  clpUserDisplay: string;
  /* enum*/
  actionToTake: number;
}

export interface UploadContactResponse {
  uploadContacts: UploadContact[];
}

export interface UploadContactVMResponse {
  uploadContacts: UploadContactVM[];
}

export interface UploadContactBulkAction {
  uploadSessionID: number;
  isProcessAll: boolean;
  uploadContactIdsToProcess: number[];
  /*enum eEditType*/
  eEdit: number;
  fieldName: string;
  fieldvalue: string;
}

export interface UploadContactBulkActionResponse extends SimpleResponse {
  uploadContacts: UploadContact[];
}
export interface UploadComppanyBulkActionResponse extends SimpleResponse {
  uploadCompanies: UploadCompany[];
}

