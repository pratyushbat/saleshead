import { Data } from "@angular/router";
import { SimpleResponse } from "./genericResponse.model";
import { ContactHistory } from "./contactHistory.model";
import { eFieldType, eFieldStatus, eSectionLead, eSectionCompany } from "./enum.model";
import { SearchQueryResponse } from "./search.model";
import { MatTableDataSource } from "@angular/material/table";

export interface ContactList {
  recentContactID: number;
  contactID: number;
  name: string;
  email: string;
  companyName: string;
  phone: string;
  dtModified: Date;
  dtCreated: Data;
  dtModifiedDisplay: Date;
  dtCreatedDisplay: Date;
  userName: string;
  clpUserId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  emailAddress: string;
  class1Code: number;
}

export interface ContactListResponse extends SimpleResponse {
  contactList: ContactList[];
}

export interface ContactMore {
  ContactID: number;
  customDate1Title: string;
  customDate2Title: string;
  customDate3Title: string;
  customDate1: Date;
  customDate2: Date;
  customDate3: Date;
  customText1: string;
  customText2: string;
  customText3: string;
}

export interface ContactFilters {
  FilterName: string;
  value: number;
  display: string;
  cLPCompanyID: number;
  sOrder: number
  strValue: string;
}

export interface Field<T> {
  fieldName: string;
  fieldValue: T;
  fieldTitle: string;
  fieldType: eFieldType;
  isShow: eFieldStatus;
  items: ContactFilters[];
  isEditable: boolean;
  link: string;
  section: number;
  displayOrder: number;
  inputConfigFiled: string;
  sectionCompany: eSectionCompany;
  sectionLead: eSectionLead;
}

export interface ContactFields {
  contactID: Field<number>;
  referralID: Field<number>;
  cLPUserID: Field<number>;
  cLPCompanyID: Field<number>;
  companyID: Field<number>;
  firstName: Field<string>;
  lastName: Field<string>;
  salutation: Field<string>;
  title: Field<string>;
  companyName: Field<string>;
  add1: Field<string>;
  add2: Field<string>;
  add3: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zip: Field<string>;
  country: Field<string>;
  custom1: Field<string>;
  custom2: Field<string>;
  custom3: Field<string>;
  custom4: Field<string>;
  custom5: Field<string>;
  custom6: Field<string>;
  custom7: Field<string>;
  custom8: Field<string>;
  custom9: Field<string>;
  custom10: Field<string>;
  custom11: Field<string>;
  custom12: Field<string>;
  custom13: Field<string>;
  custom14: Field<string>;
  custom15: Field<string>;
  custom16: Field<string>;
  check1: Field<boolean>;
  check2: Field<boolean>;
  check3: Field<boolean>;
  check4: Field<boolean>;
  check5: Field<boolean>;
  check6: Field<boolean>;
  phone: Field<string>;
  homePhone: Field<string>;
  mobile: Field<string>;
  altPhone: Field<string>;
  fax: Field<string>;
  otherFax: Field<string>;
  eBlastAddress: Field<number>;
  email: Field<string>;
  email2: Field<string>;
  email3: Field<string>;
  webSite: Field<string>;
  class1Code: Field<number>;
  class2Code: Field<number>;
  class3Code: Field<number>;
  class4Code: Field<number>;
  class5Code: Field<number>;
  class6Code: Field<number>;
  class7Code: Field<number>;
  class8Code: Field<number>;
  comments: Field<string>;
  shareable: Field<boolean>;
  hasBeenEdited: Field<boolean>;
  outlookSync: Field<boolean>;
  dtModified: Field<Date>;
  dtCreated: Field<Data>;
  eVID: Field<number>;
  isOptOutTxtMsg: Field<number>;
  isOptOutEmail: Field<boolean>;
  custom17: Field<string>;
  custom18: Field<string>;
  custom19: Field<string>;
  custom20: Field<string>;

  //Contact More - Only show when Company.ShowMoreFields==true
  contactMoreFields: ContactMoreFields;
  displaySetting: DisplaySetting;
}

export interface ContactMoreFields {
  customDate1: Field<string>;
  customDate2: Field<string>;
  customDate3: Field<string>;
  customText1: Field<string>;
  customText2: Field<string>;
  customText3: Field<string>;
}

export interface ContactFieldsResponse extends SimpleResponse, ContactHistory {
  contactFields: ContactFields;
  permission: Permission;
  vCardURL: string;
  mapURL: string;
  directionsURL: string;
  contactHistory: ContactHistory;
}

export interface Permission extends SimpleResponse {
  canDelete: boolean;
  canView: boolean;
  canEdit: boolean;
}

export interface ContactExtended {
  cLPUserID: number;
  cLPCompanyID: number;
  referralID: number;
  firstName: string;
  lastName: string;
  salutation: string;
  title: string;
  companyID: number;
  companyName: string;
  add1: string;
  add2: string;
  add3: string;
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
  custom17: string;
  custom18: string;
  custom19: string;
  custom20: string;
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
  eBlastAddress: number;
  webSite: string;
  class1Code: number;
  class2Code: number;
  class3Code: number;
  class4Code: number;
  class5Code: number;
  class6Code: number;
  class7Code: number;
  class8Code: number;
  eVID: number;
  comments: string;
  shareable: boolean;
  hasBeenEdited: boolean;
  outlookSync: boolean;
  isOptOutTxtMsg: number;
  isOptOutEmail: boolean;
  dtModified: Date;
  dtCreated: Date;
  userCode: string;
  uFirstName: string;
  uLastName: string;
  class1: string;
  class2: string;
  class3: string;
  class4: string;
  class5: string;
  class6: string;
  class7: string;
  class8: string;
  customDate1Title: string;
  customDate2Title: string;
  customDate3Title: string;
  customDate1: Date;
  customDate2: Date;
  customDate3: Date;
  customText1: string;
  customText2: string;
  customText3: string;
}

export interface fieldDiplaySetting {
  fieldName: string,
  displayOrder: number,
  sectionId: number,
  inputConfigFiled: string
}

export interface sectionDiplaySetting {
  sectionId: number,
  sectionName: string,
  sectionDisplayOrder: number
}

export interface DisplaySetting {
  fieldDiplaySettings: fieldDiplaySetting[],
  sectionDiplaySettings: sectionDiplaySetting[]
}

export interface DisplaySettingResponse {
  displaySetting: DisplaySetting,
  contactFields: Field<string>[]
}

export interface ContactHistoryListResponse {
  contactHistory: ContactHistory[]

}

export interface ContactLimitedFields {
  contactID: number,
  firstName: string,
  lastName: string,
  companyName: string,
  email: string,
  mobile: string,
  dtCreated: Date,
  dtModified: Date,
  name:string
}

export interface ContactListResponseLtd {
  contactList: ContactLimitedFields[]
}

export interface UserEmailList {
  email: string;
}

export interface UserEmailListResponse extends SimpleResponse
{
  userEmailList: UserEmailList[];
}
export interface ContactRestore 
{
  contactsToRestore: number[];
  isRestoreAll: boolean;
  searchQuery: SearchQueryResponse;
}
export interface DuplicateContactsHeader
{
  emailORMobile: string;
  count: number;
  subItems: DuplicateContactChild[];
}
export interface DuplicateContactChild
{
  duplicateField: string;
  lastFirst: string;
  mobile: string;
  companyName: string;
  email: string;
  dtCreated: Date;
  contactID: number;
  userFullName: string;
}
export interface DuplicateContactsContainer
{
  duplicateContactsHeaders: DuplicateContactsHeader[];
  
}

/*Manage Duplicate page*/
export interface MergeDuplicateContacts {
  keepContactID: number;
  MergeContactIDs: number[]
}
/*Manage Duplicate page*/

export interface Contact {
  contactID: number;
  referralID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  companyID: number;
  firstName: string;
  lastName: string;
  salutation: string;
  title: string;
  companyName: string;
  add1: string;
  add2: string;
  add3: string;
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
  eBlastAddress: number;
  email: string;
  email2: string;
  email3: string;
  webSite: string;
  class1Code: number;
  class2Code: number;
  class3Code: number;
  class4Code: number;
  class5Code: number;
  class6Code: number;
  class7Code: number;
  class8Code: number;
  comments: string;
  shareable: boolean;
  hasBeenEdited: boolean;
  outlookSync: boolean;
  dtModified: string;
  dtCreated: string;
  eVID: number;
  isOptOutTxtMsg: number;
  isOptOutEmail: boolean;
  custom17: string;
  custom18: string;
  custom19: string;
  custom20: string;
}


