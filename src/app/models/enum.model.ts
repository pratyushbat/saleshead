import { Data } from "@angular/router";

export enum eOSAddressType {
  None = 0,
  Business = 1,
  Home = 2,
  Other = 3
}

export enum eTicketCategory {
  Unknown = 0,
  Question = 1,
  Need_Help = 2,
  Report_a_problem = 3,
  Idea_for_new_feature = 4,
  Urgent = 5,
  Request_Training = 6
}

export enum eDocumentCategory {
  Unknown = 0,
  Appointment = 1,
  Contact = 2,
  Lead = 3,
  Mailing = 4,
  Personal = 5,
  Company = 6,
  Task = 9
}

export enum eNoteOwnerType {
  Unknown = 0,
  Personal = 1,
  Contact = 2,
  Lead = 3,
  Company = 4,
  Project = 5,
  LinkGroup = 6,
  Note = 7,
  Invoice = 8,
  Mailing = 11
}

export enum eNoteStatus {
  Unknown = -1,
  Completed = 0,
  Pending = 1,
  InProcessing = 2,
  Failed = 3,
  ToBeDeleted = 9
}

export enum eNoteEmailToChoice {
  None = 0,
  Contact = 1,
  User = 2,
  Other = 3,
  Link = 4,
  Fax2Mail = 5,
  ContactAllEmails = 6
}

export enum eTicketStatus {
  AllOpenOrUnread = 9,
  Unknown = 0,
  Active = 1,
  Being_Handled = 2,
  Resolved = 3,
  Under_Consideration = 4,
  User_Feedback_Required = 5
}

export enum eCLPCompanyStatus {
  DoesNotExist = 0,
  IsValid = 1,
  OnIntro = 2,
  Expired = 3,
  Disabled = 4,
  FreeAccount = 5,
}

export enum eServiceType {
  Unknown = 0,
  DailyServ = 1,
  EmailServ = 2,
  ParserServ = 3,
  DropBoxServ = 4,
  ReminderServ = 5,
  ExportServ = 6,
  GSyncServ = 7,
  TxtMsgServ = 8,
  VoiceServ = 9,
  EvolveLeadServ = 10,
  TxtMsgCampaignServ = 11,
  InventHelpLeadServ = 12
}

export enum eSectionLead {
  General = 0,
  CustomDateFields = 1,
  CustomTextFields = 2,
  AdditionalMultilineTextFields = 3,
  RevenueRelatedFields = 4,
  CustomMoneyFields = 5,
  CustomClassificationDropDownFields = 6,
  CustomClassificationCheckboxFields = 7,
  None = -1,
}

export enum eSection {
  System = 0,
  Communication = 1,
  Address = 2,
  AddtionalInformation = 3,
  ClassificationDropDown = 4,
  ClassificationCheckBox = 5,
  Comments = 6,
  ImportantDates = 7,
  MoreFields = 8,
  General = 9
}

export enum eSectionCompany {
  General = 1,
  AddtionalInformation = 2,
  Communication = 3,
  ClassificationDropDown = 4,
  ClassificationCheckBox = 5,
  Comments = 6
}

export enum eCLPRole {
  StratusExpress = 0,
  Stratus = 1,
  Cirrus = 2,
  Nimbus = 3,
  Unknown = 9
}

export enum eUserRole {
  None = 0,
  General = 1,
  Manager = 2,
  Administrator = 3,
  SuperUser = 4,
  CLPAdminUser = 5
}

export enum eReadWrite {
  None = 0,
  ViewOnly = 1,
  ViewAndEdit = 2
}
export enum eFieldStatus {
  Show = 0,
  ShowMandatory = 1,
  Hide = 2
}

export enum eOSStatus {
  Disabled = 0,
  Allowed = 1,
  Downloaded = 2,
  Activated = 3
}

export enum eUserPermissions {
  Disabled = 0,
  Active = 1,
  Unknown = 9
}

export enum eFieldType {
  Textbox = 0,
  CheckBox = 1,
  Dropdown = 2,
  None = 3,
  Combobox = 4,
  Date = 5,
  MultiLineTextbox = 6,
}

export enum eSOSCStatus {
  New = 0,
  Draft = 1,
  Pending = 2,
  Signed = 3,
  Expired = 4,
}
export enum eFeatures {
  None = 0,
  ContactCreate = 1,
  ContactList = 2,
  AutomationProcess = 3,
  Configuration = 4,
  AccountSetup = 5,
  RoleSetup = 6,
  Usersetup = 7,
  SecuritySettings = 8,
  TextMessageSettings = 9,
  CompanyModuleSettings = 10,
  ContactModuleSettings = 11,
  LeadModuleSettings = 12,
  AppointmentNoteandMailingSettings = 13,
  TagSettings = 14,
  VoiceSettings = 15,
  CompanySetup = 16,
  WebformManager = 17,
  TeamOfficeSetup = 18,
  SOAccountSetup = 19,
  SOAnnouncements = 20,
  SOServicesContract = 21,
  SOServicesStatus = 22,
  SORepSettings = 23,
  SOSecurity = 24,
  CustomsActionScreens = 25,
  ClickTracking = 26,
  MailMergeTemplates = 27,
  EmailTemplates = 28,
  FbcEmailTemplates = 29,
  TextMessageTemplates = 30,
  ImageBank = 31,
  RestoreContact = 32,
  MapContact = 33,
  ExcelUploadWizard = 34,
  BulkContactActions = 35,
  ManageDuplicates = 36,
  WebForm = 37,
  AppointmentTypeSummary = 38,
  AppointmentsbyTwoDimensions = 39,
  QualificationCallReport = 40,
  NoteTypeSummary = 41,
  CallActionButtonClickReport = 42,
  EmailOpenRateReport = 43,
  CompanyList = 44,
  LeadCreate = 49,
  MyLead = 50,
  CompanyCreate = 51,
  BulkCompaniesAction = 52,
  MyCalender = 53,
}

export enum eClassCodes {
  Class1Code = 0,
  Class2Code = 1,
  Class3Code = 2,
  Class4Code = 3,
  Class5Code = 4,
  Class6Code = 5,
  Class7Code = 6,
  Class8Code = 7
}

export enum eAppointmentSettings {
  ApptContactTypeCode = 0,
  ApptGeneralTypeCode = 1,
  ApptLeadTypeCode = 2,
  MailingtypeCode = 3,
  NotetypeCode = 4
}

export enum eLeadSettings {
  LeadClass1Code = 0,
  LeadClass2Code = 1,
  LeadClass3Code = 2,
  LeadClass4Code = 3,
  LeadClass5Code = 4,
  LeadClass6Code = 5,
  LeadClass7Code = 6,
  LeadClass8Code = 7,
  LeadClass9Code = 8,
  LeadStatusCode = 9
}
export enum webFormAction {
  Start = 1,
  Stop = 2,
  Pause = 3,
  Remove = 2,
}

export enum eCompanySettings {
  CoClass1Code = 0,
  CoClass2Code = 1,
  CoClass3Code = 2,
  CoClass4Code = 3,
  CoClass5Code = 4,
  CoClass6Code = 5,
  CoClass7Code = 6,
  CoClass8Code = 7
}

export enum eColor {
  Red = 0,
  Green = 1,
  Darkgreen = 2,
  Unknown = 3,
}
export enum eBillingViewMode {
  MainView = 0,
  UpgradeStart = 1,
  UpgradeConfirm = 2,
  UpgradeProcess = 3,
  UsersStart = 4,
  UsersConfirm = 5,
  UsersSetup = 6
}

export enum eExportRequestObjectType {
  Unknown = 0,
  Company = 1,
  Contact = 2,
  Lead = 3,
  LeadInvoice = 31,
  Mailing = 4,
  Campaign_Item = 5,
  KML_File = 9,
  Deverus_Activity_Report = 101,
  AFH_Activity_Report = 200,
  SkyRise_Activity_Report = 250,
  Harvest_Business_Lead_Report = 300,
  InventHelp_Scorecard_Report = 400,
  InventHelp_ScorecardByCode_Report = 401,
  InventHelp_ScorecardByKeyword_Report = 402,
  InventHelp_ScorecardCompare_Report = 403,
  InventHelp_ScorecardByTVCode_Report = 404,
  InventHelp_ScorecardByApptSetter_Report = 405,
  FBC_Scorecard_Report = 500
}

export enum eExportRequestStatus {
  None = 0,
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  ToBeDeleted = 4,
  Archived = 5
}

export enum CreateExportFor {
  Unknown = 0,
  ScoreCardByCode = 1,
  ScoreCardByKeyword = 2
}

/*Excel Upload Section*/
export enum eEditType {
  Replace = 0,
  AddTo = 1,
  Clear = 2,
  Remove = 3
}

export enum eUploadContactActionToTake {
  DoNotUpload = 0,
  Overwrite = 1,
  Upload = 2,
  None = 3
}

export enum eTaskCategory {
  Unknown = 0,
  Personal = 1,
  Contact = 2,
  Lead = 3,
  Proposal = 4,
  Project = 5
}

export enum eTaskPriority {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3
}

export enum eApptCategory {
  Personal = 0,
  Company = 1,
  Contact = 2,
  Lead = 3,
  None = 4,
  Proposal = 5,
  Project = 6,
  CompanyObject = 7
}

export enum eCalCalendar {
  User = 0,
  Team = 1,
  Company = 2,
  Office = 3,
}

export enum eDDField {
  Unknown = 0,
  CoClass1Code = 1,
  CoClass2Code = 2,
  CoClass3Code = 3,
  CoClass4Code = 4,
  CoClass5Code = 5,
  CoClass6Code = 6,
  CoClass7Code = 7,
  CoClass8Code = 8,
  Class1Code = 11,
  Class2Code = 12,
  Class3Code = 13,
  Class4Code = 14,
  Class5Code = 15,
  Class6Code = 16,
  Class7Code = 17,
  Class8Code = 18,
  Multi1Code = 19,
  Multi2Code = 110,
  Multi3Code = 111,
  Multi4Code = 112,
  LeadClass1Code = 20,
  LeadClass2Code = 21,
  LeadClass3Code = 22,
  LeadClass4Code = 23,
  LeadClass5Code = 24,
  LeadClass6Code = 25,
  LeadClass7Code = 26,
  LeadClass8Code = 27,
  LeadClass9Code = 28,
  LeadMulti1Code = 210,
  LeadMulti2Code = 211,
  LeadMulti3Code = 212,
  LeadMulti4Code = 213,
  LeadStatusCode = 214,
  TeamCode = 500,
  OfficeCode = 600,
  ApptGeneralTypeCode = 700,
  ApptContactTypeCode = 701,
  ApptLeadTypeCode = 702,
  ApptProposalTypeCode = 703,
  ApptProjectTypeCode = 704,
  NoteTypeCode = 800,
  MailingTypeCode = 900
}

export enum eGoalType {
  None = 0,
  ApptGeneralType = 1,
  ApptContactType = 2,
  ApptLeadType = 3,
  ApptProposalType = 4,
  ApptProjectType = 5,
  NewLeads = 6,
  LeadRevenueGross = 7,
  LeadRevenueNet = 8,
  NewContacts = 9,
  LeadStatus = 10,
  Class1Code = 11,
  Class2Code = 12,
  Class3Code = 13,
  Class4Code = 14,
  Class5Code = 15,
  Class6Code = 16,
  Class7Code = 17,
  Class8Code = 18,
  LeadClass1Code = 20,
  LeadClass2Code = 21,
  LeadClass3Code = 22,
  LeadClass4Code = 23,
  LeadClass5Code = 24,
  LeadClass6Code = 25,
  LeadClass7Code = 26,
  LeadClass8Code = 27,
  LeadClass9Code = 28,
}
export enum eGoalTypeCategory {
  None = 0,
  ApptGeneralType = 1,
  ApptContactType = 2,
  ApptLeadType = 3,
  ApptProposalType = 4,
  ApptProjectType = 5,
  General = 6,
  LeadStatus = 10,
  Class1Code = 11,
  Class2Code = 12,
  Class3Code = 13,
  Class4Code = 14,
  Class5Code = 15,
  Class6Code = 16,
  Class7Code = 17,
  Class8Code = 18,
  LeadClass1Code = 20,
  LeadClass2Code = 21,
  LeadClass3Code = 22,
  LeadClass4Code = 23,
  LeadClass5Code = 24,
  LeadClass6Code = 25,
  LeadClass7Code = 26,
  LeadClass8Code = 27,
  LeadClass9Code = 29,
}

export enum eCalenderView {
  Month,
  Day,
  Week
}

export enum eTaskStatus {
  Pending = 0,
  Completed = 1,
  OnHold = 2,
  None = 3,
  ToBeDeleted = 9
}
export enum eMailingStatus {
  Pending = 0,
  Cancelled = 1,
  Completed = 2,
  None = 3,
  In_Process = 4,
  Awaiting_MMDoc = 5,
  Awaiting_Configuration = 6,
  Being_Configured = 7
}

export enum eApptStatus {
  Pending = 0,
  Cancelled = 1,
  Completed = 2,
  None = 3,
  Bumped = 4,
  CompleteAndCampaignStop = 5,
  ToBeDeleted = 9
}

export enum eReportFilterBy {
  All = 0,
  User = 1,
  Team = 2,
  Office = 3
}


export enum eReportTimePeriod {
  n0to3 = 1,
  n3to6 = 2,
  n6to12 = 3,
  nYTD = 4,
  nThisYear = 5,
  nLastYear = 6,
  nSpecificDates = 7
}

export enum eMeasure {
  NumLeads = 0,
  Volume = 1,
  Revenue = 2,
  CustomMoney1 = 3,
  CustomMoney2 = 4,
  CustomMoney3 = 5,
  CustomMoney4 = 6
}

export enum SearchContactBy {
  ClickTracking = 1,
  Referral = 2,
  Referrer = 3,
  TagCloud = 4,
}
