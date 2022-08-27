import { Contact, DisplaySetting, Field } from "./contact.model";
import { EmailTemplate, MailMergeTemplate } from "./emailTemplate.model";
import { SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";

export interface Lead {
  leadID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  contactID: number;
  leadDesc: string;
  revenue: number;
  volume: number;
  customMoney1: number;
  customMoney2: number;
  customMoney3: number;
  customMoney4: number;
  winProbability: number;
  leadStatusCode: number;
  locationOfficeCode: number;
  importOfficeCode: number;
  leadClass1Code: number;
  leadClass2Code: number;
  leadClass3Code: number;
  leadClass4Code: number;
  leadClass5Code: number;
  leadClass6Code: number;
  leadClass7Code: number;
  leadClass8Code: number;
  leadClass9Code: number;
  scope: string;
  comments: string;
  dtStart: Date;
  dtEnd: Date;
  dtRevenue: Date;
  dtCustom1: Date;
  dtCustom2: Date;
  dtCustom3: Date;
  customText1: string;
  customText2: string;
  customText3: string;
  customText4: string;
  customText5: string;
  customText6: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  check5: boolean;
  check6: boolean;
  dtCreated: Date;
  dtModified: Date;
  companyName: string;
  lastFirst: string;
  ufirstName: string;
  ulastName: string;
}

export interface LeadFields {
  contact: Field<Contact>;
  cLPCompanyID: Field<number>;
  clpuserID: Field<number>;
  leadNumber: Field<number>;
  leadID: Field<number>;
  leadDesc: Field<string>;
  revenue: Field<number>;
  volume: Field<number>;
  customMoney1: Field<number>;
  customMoney2: Field<number>;
  customMoney3: Field<number>;
  customMoney4: Field<number>;
  winProbability: Field<number>;
  leadStatusCode: Field<number>;
  locationOfficeCode: Field<number>;
  importOfficeCode: Field<number>;
  leadClass1Code: Field<number>;
  leadClass2Code: Field<number>;
  leadClass3Code: Field<number>;
  leadClass4Code: Field<number>;
  leadClass5Code: Field<number>;
  leadClass6Code: Field<number>;
  leadClass7Code: Field<number>;
  leadClass8Code: Field<number>;
  leadClass9Code: Field<number>;
  leadMulti1Code: Field<number>;
  leadMulti2Code: Field<number>;
  leadMulti3Code: Field<number>;
  leadMulti4Code: Field<number>;
  scope: Field<string>;
  comments: Field<string>;
  dtStart: Field<string>;
  dtEnd: Field<string>;
  dtRevenue: Field<string>;
  dtCustom1: Field<string>;
  dtCustom2: Field<string>;
  dtCustom3: Field<string>;
  CustomText1: Field<string>;
  CustomText2: Field<string>;
  CustomText3: Field<string>;
  CustomText4: Field<string>;
  CustomText5: Field<string>;
  CustomText6: Field<string>;
  Check1: Field<boolean>;
  Check2: Field<boolean>;
  Check3: Field<boolean>;
  Check4: Field<boolean>;
  Check5: Field<boolean>;
  Check6: Field<boolean>;
  leadClass1CodeTitle: Field<string>;
  leadClass2CodeTitle: Field<string>;
  leadClass3CodeTitle: Field<string>;
  leadClass4CodeTitle: Field<string>;
  leadClass5CodeTitle: Field<string>;
  leadClass6CodeTitle: Field<string>;
  leadClass7CodeTitle: Field<string>;
  leadClass8CodeTitle: Field<string>;
  leadClass9CodeTitle: Field<string>;
  leadMulti1CodeTitle: Field<string>;
  leadMulti2CodeTitle: Field<string>;
  leadMulti3CodeTitle: Field<string>;
  leadMulti4CodeTitle: Field<string>;
  customText1Title: Field<string>;
  customText2Title: Field<string>;
  customText3Title: Field<string>;
  customText4Title: Field<string>;
  customText5Title: Field<string>;
  customText6Title: Field<string>;
  check1Title: Field<string>;
  check2Title: Field<string>;
  check3Title: Field<string>;
  check4Title: Field<string>;
  check5Title: Field<string>;
  check6Title: Field<string>;
  customMoney1Title: Field<string>;
  customMoney2Title: Field<string>;
  customMoney3Title: Field<string>;
  customMoney4Title: Field<string>;
  dtCustom1Title: Field<string>;
  dtCustom2Title: Field<string>;
  dtCustom3Title: Field<string>;
  isInvoiceModule: Field<boolean>;
  displaySetting: DisplaySetting;
  dtCreated: Field<Date>;
  dtModified: Field<Date>;
}
export interface LeadFieldsResponse extends SimpleResponse
{
  leadFields: LeadFields;
  filterUsers: keyValue;
}

export interface LeadListResponse extends SimpleResponse
{
  leads: Lead[];
}

export interface LeadDisplaySettingResponse {
  displaySetting: DisplaySetting;
  leadFields: Field<string>[];
}

export interface LeadHistoryListResponse {

  appts: LeadAppt[];
  tasks: LeadTask[];
  notes: LeadNote[];
  noteEmailTemplates: EmailTemplate[];
  noteMailMergeTemplates: MailMergeTemplate[];
    }

export interface LeadAppt {
  strTime: string;
  userFullName: string;
  contactFullName: string;
  leadDesc: string;
  leadStatusCodeDisplay: string;
  typeCodeDisplay: string;
  strDay: string;
  contactCompanyName: string;
  contactCompanyID: number;
  apptID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  category: number;
  generalTypeCode: number;
  contactTypeCode: number;
  leadTypeCode: number;
  proposalTypeCode: number;
  projectTypeCode: number;
  typeID: number;
  apptStartTime: string;
  apptEndTime: string;
  isAllDay: boolean;
  isPhoneCall: boolean;
  isPrivate: boolean;
  subject: string;
  location: string;
  notes: string;
  leadID: number;
  contactID: number;
  projectID: number;
  proposalID: number;
  reminderCLP: boolean;
  reminderEmail: boolean;
  reminderTime: string;
  reminderEmails: string;
  reminderSent: boolean;
  reminderNote: string;
  reminderEmailTemplateID: number;
  showNoteInUserReminder: boolean;
  inApptTemplateID: number;
  documentList: string;
  rApptID: number;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  class1: number;
  status: number;
  campaignID: number;
  campaignEventID: number;
  runID: number;
  dtCreated: string;
  isTxtMsgReminder: boolean;
  isTxtMsgUserReminder: boolean;
  reminderTxtMsgTemplateID: number;
}

export interface LeadTask {
  leadStatusCodeDisplay: string;
  strDay: string;
  taskID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  ownerID: number;
  taskDesc: string;
  category: number;
  priority: number;
  dtDue: string | null;
  hours: number;
  cost: number;
  isPrivate: boolean;
  reminderCLP: boolean;
  reminderEmail: boolean;
  reminderTime: string;
  reminderSent: boolean;
  status: number;
  campaignID: number;
  campaignEventID: number;
  runID: number;
  dtCreated: string;
  userLastFirst: string;
  ownerName: string;
  contactName: string;
  PriorityDisplay: string;
  TaskDescHTML: string;
  DisplayName: string;
  DisplayToolTip: string;
  DisplayURL: string;
  CategoryDisplay: string;
  CategoryURL: string;
  UserName: string;
  UserNameSort: string;
  DueDateDisplay: string;
  StatusDisplay: string;
  StatusImg: string;
  TaskDocURL: string;
  TaskDocURLEdit: string;
  ReminderDisplay: string;
  isShowAttached: boolean;
  getTaskDesc: string;
}

export interface LeadNote {
  Doc: Doc[];
  linkName: string;
  leadStatusCodeDisplay: string;
  typeCodeDisplay: string;
  ownerName: string;
  uFirstName: string;
  contactName: string;
  userLastFirst: string;
  strDay: string;
  noteID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  ownerID: number;
  ownerType: number;
  noteTypeCode: number;
  toChoice: number;
  toField: string;
  cCField: string;
  bCCField: string;
  noteSubject: string;
  noteDesc: string;
  emailTemplateID: number;
  mailMergeTemplateID: number;
  documentList: string;
  dtSent: string | null;
  emailSnippetID: number;
  fromCLPUserID: number;
  scheduledTime: string;
  emailpreviewLink: string;
  campaignID: number;
  campaignEventID: number;
  runID: number;
  status: number;
  emailStatus: number;
  emailResult: string;
  cLPServiceRunID: number;
  dtModified: string;
  dtCreated: string;
}

export interface Doc {
  documentID: number;
  DocumentName: string;
}

export interface LeadApptFilters {
  appointmentLeadTypeCode: AppointmentLeadTypeCode[];
    }

export interface AppointmentLeadTypeCode {
  apptLeadTypeCode: number
  cLPCompanyID: number;
  display: string;
colorCode: string
  sOrder: number;
	 }
