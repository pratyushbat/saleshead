import { KeyValue } from "@angular/common";
import { ClassCodes } from "./classCodes.model";
import { CLPUser } from "./clpuser.model";
import { Permission } from "./contact.model";
import { eBillingViewMode, eColor, eEditType, eFieldStatus, eFieldType } from "./enum.model";
import { SimpleResponse } from "./genericResponse.model";
import { SearchQueryResponse } from "./search.model";

export interface ClpCompany {
  companyId: number;
  companyCode: string;
  companyName: string;
  role: number;
  useImage: boolean;
  useCompanyModule: number;
  secOutlook: number;
  secMarketingTool: number;
  isSFAIncluded: number;
  isHTMLEmailIncluded: number;
  BlnLogSkypeCalls: number;

  cLPCompanyID: number;
  companyDesc: string;
  companyAddress: string;
  companyURL: string;
  cLPRole: number;
  status: number;
  maxContacts: number;
  maxEblast: number;
  shareContacts: boolean;
  editOtherContacts: boolean;
  secExcel: boolean;
  showOfficeDD: boolean;
  showTeamDD: boolean;
  companyStorageLimit: number;
  userStorageLimit: number;
  fileSizeLimit: number;
  attachmentSizeLimit: number;
  showCat1DD: boolean;
  showCat2DD: boolean;
  showSICDD: boolean;
  showLocationOfficeDD: boolean;
  showImportOfficeDD: boolean;
  showCompanyRoleDD: boolean;
  showLeadCat1DD: boolean;
  blnLogSkypeCalls: boolean;
  blnMailingFromType: boolean;
  blnEnableiPhone: boolean;
  showJobCat1DD: boolean;
  logoURL: string;
  productDDTitle: string;
  serviceDDTitle: string;
  bizLineDDTitle: string;
  cat1DDTitle: string;
  cat2DDTitle: string;
  customText1Display: string;
  customText2Display: string;
  customText3Display: string;
  companyRoleDDTitle: string;
  leadCat1DDTitle: string;
  projectCat1DDTitle: string;
  projectCat2DDTitle: string;
  projectCat3DDTitle: string;
  jobCat1DDTitle: string;
  customVersion: number;
  isBrandingIncluded: boolean;
  isMobileIncluded: boolean;
  isOutlookIncluded: boolean;
  isProjectModuleInstalled: boolean;
  isMultipleFromAddresses: boolean;
  companyMaxDD: number;
  companyMaxTXT: number;
  companyMaxCB: number;
  companyMaxMD: number;
  contactMaxDD: number;
  contactMaxTXT: number;
  contactMaxCB: number;
  contactMaxMD: number;
  leadMaxDD: number;
  leadMaxTXT: number;
  leadMaxCB: number;
  leadMaxMD: number;
  leadMaxRV: number;
  leadMaxDT: number;
  enableMoreFields: boolean;
  enableCLPSS: boolean;
  dtCreate: Date;
  dtExpire: Date;
  isEmailValidation: boolean;

}

export interface CompanyResponse extends SimpleResponse {
  company: ClpCompany;
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
  items: ContactFilters[]; //change pending
  isEditable: boolean;
  link: string;
  section: number,
  displayOrder: number,
  inputConfigFiled: string
}

export interface FieldDiplaySetting {
  fieldName: string;
  displayOrder: number;
  sectionId: number;
  inputConfigFiled: string;
}
export interface SectionDiplaySetting {
  sectionId: number;
  sectionName: string;
  sectionDisplayOrder: number;

}

export interface DisplaySetting {
  fieldDiplaySettings: FieldDiplaySetting[];
  sectionDiplaySettings: SectionDiplaySetting[];
}

export interface CompanyDisplaySettingResponse {
  compDisplaySetting: DisplaySetting;
  companyFields: Field<string>[];
}

export interface CompanyFields {
  companyID: Field<number>;
  cLPUserID: Field<number>;
  cLPCompanyID: Field<number>;
  companyName: Field<string>;
  add1: Field<string>;
  add2: Field<string>;
  add3: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zip: Field<string>;
  country: Field<string>;
  phone: Field<string>;
  fax: Field<string>;
  notes: Field<string>;
  webSite: Field<string>;
  coClass1Code: Field<number>;
  coClass2Code: Field<number>;
  coClass3Code: Field<number>;
  coClass4Code: Field<number>;
  coClass5Code: Field<number>;
  coClass6Code: Field<number>;
  coClass7Code: Field<number>;
  coClass8Code: Field<number>;
  custom1: Field<string>;
  custom2: Field<string>;
  custom3: Field<string>;
  custom4: Field<string>;
  custom5: Field<string>;
  custom6: Field<string>;
  custom7: Field<string>;
  custom8: Field<string>;
  check1: Field<boolean>;
  check2: Field<boolean>;
  check3: Field<boolean>;
  check4: Field<boolean>;
  coClass1CodeTitle: Field<string>;
  coClass2CodeTitle: Field<string>;
  coClass3CodeTitle: Field<string>;
  coClass4CodeTitle: Field<string>;
  coClass5CodeTitle: Field<string>;
  coClass6CodeTitle: Field<string>;
  coClass7CodeTitle: Field<string>;
  coClass8CodeTitle: Field<string>;
  custom1Title: Field<string>;
  custom2Title: Field<string>;
  custom3Title: Field<string>;
  custom4Title: Field<string>;
  custom5Title: Field<string>;
  custom6Title: Field<string>;
  custom7Title: Field<string>;
  custom8Title: Field<string>;
  check1Title: Field<string>;
  check2Title: Field<string>;
  check3Title: Field<string>;
  check4Title: Field<string>;
  displaySetting: DisplaySetting;
}

export interface CompanyFieldsResponse extends SimpleResponse {

  companyFields: CompanyFields;
  mapURL: string;
  directionsURL: string;
 /* tags: Tag[];*/
  permissions: Permission;
 /* companySearchResults: ExportRequest[];
  contactSearchResults: ExportRequest[];*/
  quickDocuments: Document[];

}

export interface VMAddUser_MainviewResponse extends SimpleResponse {
  mainViewDetails: VMAddUser_Mainview;
  step: eBillingViewMode;
}

export interface VMAddUser_Mainview extends SimpleResponse {
  clpRoleDisplay: FieldVM<string>;
  currentUsers: FieldVM<string>;
  mobileIncluded: FieldVM<string>;
  sfaIncluded: FieldVM<string>;
  htmlEmailIncluded: FieldVM<string>;
  txtMsgMarketingActive: FieldVM<string>;
  outlookIncluded: FieldVM<string>;
  contract: FieldVM<string>;
  dtExpiration: FieldVM<string>;
  accountStatus: FieldVM<string>;
  discountUser: FieldVM<string>;
  nextCycleDate: FieldVM<string>;
  feeMonthly: FieldVM<string>;
  monthlyFeeCalc: FieldVM<string>;
  DiscountUserNote: FieldVM<string>;
  feeCompany: FieldVM<string>;
  feeAddedToContract: FieldVM<string>;
  feeAddedToContractCalc: FieldVM<string>;
  feeToday: FieldVM<string>;
  feeTodayCalc: FieldVM<string>;
  uperiod: FieldVM<string>;
  ua: FieldVM<string>;
  ub: FieldVM<string>;
  uc: FieldVM<string>;
  ud: FieldVM<string>;
  ue: FieldVM<string>;
  ucDetails: FieldVM<string>;
  feeUser: FieldVM<string>;
}
export interface FieldVM<T> extends SimpleResponse {
  fieldName: string;
  fieldText: T;
  color: eColor;
  links: KeyValue<string, string>;
  isVisible: boolean;
}

export interface AddUser_StepsResponse extends SimpleResponse {
  step: eBillingViewMode;
  mainViewDetails: VMAddUser_Mainview;
}

export interface CompanyListResponse {
  companies: Company[];
}
export interface Company {

  uploadSessionID: number;
  uploadCompanyID: number;
  uploadAction: number;
  companyID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  companyName: string;
  add1: string;
  add2: string;
  add3: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  fax: string;
  notes: string;
  webSite: string;
  coClass1Code: number;
  coClass2Code: number;
  coClass3Code: number;
  coClass4Code: number;
  coClass5Code: number;
  coClass6Code: number;
  coClass7Code: number;
  coClass8Code: number;
  custom1: string;
  custom3: string;
  custom4: string;
  custom5: string;
  custom6: string;
  custom7: string;
  custom8: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  companyType: number;
  dtModified: Date;
  dtCreated: Date;
  numContacts: number;
}


export interface UploadCompanyBulkAction extends SimpleResponse  {
  companyIdsToProcess: number[];
  isProcessAll: boolean;
  searchQuery: SearchQueryResponse;
  eEdit: eEditType;
  fieldName: string;
  fieldvalue: string;
}

export interface UserCompanyBulkAction {
  clpuserID: number;
  companyIds: number[];
  isProcessAll: boolean;
  searchQuery: SearchQueryResponse;
}

export interface ddFieldRespone extends SimpleResponse{
  ddFields: ddField[];
  filterUsers: CLPUser[];
}
export interface ddField {
  value: string;
  tilte: string;
  subItems: ClassCodes[];
}
