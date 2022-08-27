import { Contact } from "./contact.model";
import { DropDownItem, SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";

export interface CalenderResponse extends SimpleResponse {
  mailingData: MailingData[];
  apptData: ApptData[];
  phoneData: PhoneData[];
  taskData: TaskData[];
  taskCount: PhoneData[];
  taskByTeamOffice: TaskData[];
  dropDownItem: DropDownItem[];
  cnt: number;
}

export interface CalenderResponseDayView {
  apptData: ApptData[];
  taskDataByTeamOffice: TaskData[];
  callListCount: number;
}

export interface MailingData  {
  mailingId: number;
  clpUserId: number;
  clpCompanyId: number;
  mailingTypeCode: number;
  fromType: number;
  toType: number;
  mailingStartTime: Date;
  subject: string;
  salutation: number;
  body: string;
  documentList: string;
  emailTemplateId: number;
  mailMergeTemplateId: number;
  signature: string;
  category: number;
  customSearchId: number;
  status: number;
  dtCompleted: Date;
  ccore: number;
  campaignEventId: number;
  runId: number;
  clpServiceRunId: number;  
  dtCreated: Date;
  lastName: string;
  firstName: string;
}
export interface PhoneData {
  year: number;
  month: number;
  day: number;
  count: number;

}
export interface ApptData {
  apptID: number;
  clpUserID: number;
  clpCompanyID: number;
  category: number;
  generalTypeCode: number;
  contactTypeCode: number;
  leadTypeCode: number;
  proposalTypeCode: number;
  projectTypeCode: number;
  typeId: number;
  apptStartTime: Date;
  apptEndTime: Date;
  isAllDay: boolean;
  isPhoneCall: boolean;
  isPrivate: boolean;
  subject: string;
  location: string;
  notes: string;
  leadId: number;
  contactId: number;
  projectId: number;
  proposalId: number;
  reminderClp: boolean;
  reminderEmail: boolean;
  reminderTime: Date;
  reminderEmails: string;
  reminderSent: boolean;
  reminderNote: string;
  reminderEmailTemplateId: number;
  showNoteInUserReminder: boolean;
  inApptTemplateId: number;
  documentList: string;
  rApptId: number;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  class1: number;
  status: number;
  campaignId: number;
  campaignEventId: number;
  runId: number;
  dtCreated: Date;
  isTxtMsgReminder: boolean;
  isTxtMsgUserReminder: boolean;
  reminderTxtMsgTemplateId: number;
  userLastFirst: string;
  codeDisplay: string;
  ownerName: string;
  contactName: string;
  companyName: string;
  companyId: number;
  companyType: string;
  contactIsShareable: boolean;
  contactObj: Contact;
  colorCode: string;
}

export interface TaskData {
  taskId: number;
  clpUserID: number;
  clpCompanyID: number;
  ownerId: number;
  campaignId: number;
  campaignEventId: number;
  runId: number;
  firstName: string;
  lastName: string;
  taskDesc: string;
  category: number;
  priority: number;
  status: number;
  dtDue: Date;
  reminderTime: Date;
  dtCreated: Date;
  hours: number;
  cost: number;
  isPrivate: boolean;
  reminderClp: boolean;
  reminderEmail: boolean;
  reminderSent: boolean;
  taskSummary: TaskSummary[];
  contactIsShareable: boolean;
 
}
export interface LeadStatus {
  leadStatusCode: number;
  clpCompanyId: number;
  display: string;
  sorder: number;
}
export interface ApptLeadType {
  apptLeadTypeCode: number;
  clpCompanyId: number;
  display: string;
  colorCode: number;
  sorder: number;
}
export interface ApptContactType {
  apptContactTypeCode: number;
  clpCompanyId: number;
  display: string;
  colorCode: string;
  sorder: number;
}
export interface ApptGeneralType {
  apptGeneralTypeCode: number;
  clpCompanyId: number;
  display: string;
  colorCode: string;
  sorder: number;
}
export interface ApptSummary {
  FullName: string;
  ApptSubject: string;
  ApptStatus: string;
  ApptCategory: string;
  LeadId: number;
  LeadDesc: string;
  Display: string;
  ColorCode: string;
  ApptLocation: string;
  ApptNotes: string;
  CallLink: string;
  Time: string;
  Day: string;
  LeadStatusDisplay: string;
  PhoneCallDisplay: string;
  contactFullName: string;
}

export interface TaskSummary {
  FullName: string;
  LeadId: number;
  LeadDesc: string;
  CallLink: string;
  Day: string;
  LeadStatusDisplay: string;
  companyName: string;
  add1: string;
  add2: string;
  add3: string;
  city: string;
  state: string;
  Phone: string;
  Mobile: string;
  HomePhone: string;
  AltPhone: string;
  Fax: string;
  Email: string;
}

export interface CalenderFiltersResponse extends SimpleResponse {
  filterUsers: keyValue[];
  filterTeam: keyValue[];
  filterOffice: keyValue[];
}
export interface WeekViewDisplay  {
  dispDate: Date;
  taskData: TaskData[];
  apptData: ApptData[];
  phoneData: PhoneData[];
}


export interface SchedulerCal {
  id?: any;
  dataItem?: any;
  start: Date;
  startTimezone?: string;
  end: Date;
  endTimezone?: string;
  isAllDay?: boolean;
  title: string;
  description?: string;
  recurrenceRule?: string;
  recurrenceId?: any;
  recurrenceExceptions?: Date[];
  count: number;
}
