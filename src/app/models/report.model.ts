import { Byte } from "@angular/compiler/src/util";
import { ClassCodes } from "./classCodes.model";
import { CLPUser, OfficeCodes, TeamCodes } from "./clpuser.model";
import { DropDownItem, SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";

export interface ApptTypeSummaryResponse {
  isUserDropdown: boolean;
  isUserTitle: boolean;
  filterUserList: CLPUser[]
  appointmentDataMonth: AppointmentDataMonth
  appointmentDataYTD: AppointmentDataYTD
}

export interface AppointmentDataMonth {
  isStartDateFilter: boolean;
  isEndDateFilter: boolean;
  apptTitle: string;
  appointmentDataMonth: AppointmentData[];
}

export interface AppointmentDataYTD {
  isStartDateFilter: boolean
  isEndDateFilter: boolean
  apptTitle: string
  appointmentData: AppointmentData[]
}

export interface AppointmentData {
  display: string
  Pending: boolean
  Completed: boolean
  Cancelled: boolean
}

export interface ApptTwoDimensionResponse {
  ddRowColumns: DropDownItem[]
  ddStatus: DropDownItem[]
  ddTeam: TeamCodes[]
  ddOffice: OfficeCodes[]
  ddUser: keyValue[]
  isUserFilter: boolean
  isDdTeam: boolean
  IsDdOffice: boolean
  isDdUser: boolean
  appointmentTwoDimension: {}[];
}

export interface QualCallReportResponse {
  filterUserList: CLPUser[];
  spanTitleText: string;
  qualCallList: [];
}

export interface NoteTypeSummaryResponse {
  spanTitleText: string
  isUserDropdown: boolean
  filterUserList: CLPUser[]
  noteTypeSummaryList: [];
}

export interface CallActionScreenResponse {
  spanTitleText: string
  filterUserList: CLPUser[]
  clickReport: []
}

export interface EmailOpenRateReportResponse {
  filterUserList: CLPUser[]
  emailOpenReportList: EmailOpenReportList[]
}

export interface EmailOpenReportList {
  subject: string
  emailType: string
  sentDate: Date
  all: number
  opened: number
  openRate: number
}

export interface clpUserFilterResponse {
  isUserDd: boolean
  isTeamDd: boolean
  isOfficeDd: boolean
  isMyOffice: boolean
  isMyTeam: boolean
  userDD: keyValue[]
  myOfficeText: string
  myTeamText: string
  lblCLPUserList: string
  myOfficeChecked: boolean
  myTeamChecked: boolean
  teamDd: TeamCodes[]
  officeDd: OfficeCodes[]
}

export interface CompanyTwoDimensionResponse {
  ddRowsColumns: DropDownItem[]
  userFilterData: clpUserFilterResponse
  companyTwoDimension: {}[]
}
export interface userListResponse {
  userDD: keyValue[]
}

export interface ContactDisByManagerResponse {
  ddView: keyValue[]
  distributionByManagerList: DistributionResponse
}

export interface ContactDisByClassifictaionResponse extends SimpleResponse {
  userList: keyValue[]
  isUserDD: boolean
  classification: DropDownItem[]
  distributionByClassificationList: DistributionResponse
}

export interface DistributionResponse {
  strCHTitle: string
  message: string
  distributionList: { Contacts: number }[]
}

export interface ContactTwoDimensionResponse extends SimpleResponse {
  ddRowsColumns: DropDownItem[]
  userFilterData: clpUserFilterResponse
  contactTwoDimension: [{}]
}

export interface TxtMsgRpt {
  uFirstName: string
  uLastName: string
  referralID: number
  companyID: number
  salutation: string
  title: string
  companyName: string
  add1: string
  add2: string
  add3: string
  city: string
  state: string
  zip: string
  country: string
  custom1: string
  custom2: string
  custom3: string
  custom4: string
  custom5: string
  custom6: string
  custom7: string
  custom8: string
  custom9: string
  custom10: string
  custom11: string
  custom12: string
  custom13: string
  custom14: string
  custom15: string
  custom16: string
  check1: boolean
  check2: boolean
  check3: boolean
  check4: boolean
  check5: boolean
  check6: boolean
  phone: string
  homePhone: string
  altPhone: string
  fax: string
  otherFax: string
  eBlastAddress: Byte
  email2: string
  email3: string
  webSite: string
  class1Code: number
  class2Code: number
  class3Code: number
  class4Code: number
  class5Code: number
  class6Code: number
  class7Code: number
  class8Code: number
  comments: string
  shareable: boolean
  hasBeenEdited: boolean
  outlookSync: boolean
  dtModified: Date
  eVID: Byte
  isOptOutTxtMsg: Byte
  isOptOutEmail: boolean
  custom17: string
  custom18: string
  custom19: string
  custom20: string
  lastFirst: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  txtMsgID: number
  cLPCompanyID: number
  cLPUserID: number
  contactID: number

  countryCode: string
  mobileNumber: string
  msg: string
  status: Byte
  requestID: string
  requestComment: string
  campaignID: number
  campaignEventID: number
  runID: number
  cLPServiceRunID: number
  dtSend: Date
  dtCreated: Date
  isToUser: boolean
  isUseShortCode: boolean
  mediaURL: string
  isThrottle: boolean
  toCLPUserID: number
  bWMessageId: string
  dtSentFromBW: Date
  dtSentToBW: Date
  txtMsgLongCode: string
  timeZoneWinId: number
  standardName: string
}

export interface TxtMsgIB {
  uFirstName: string
  uLastName: string
  referralID: number
  companyID: number
  salutation: string
  title: string
  companyName: string
  add1: string
  add2: string
  add3: string
  city: string
  state: string
  zip: string
  country: string
  custom1: string
  custom2: string
  custom3: string
  custom4: string
  custom5: string
  custom6: string
  custom7: string
  custom8: string
  custom9: string
  custom10: string
  custom11: string
  custom12: string
  custom13: string
  custom14: string
  custom15: string
  custom16: string
  check1: boolean
  check2: boolean
  check3: boolean
  check4: boolean
  check5: boolean
  check6: boolean
  phone: string
  homePhone: string
  altPhone: string
  fax: string
  otherFax: string
  eBlastAddress: Byte
  email2: string
  email3: string
  webSite: string
  class1Code: number
  class2Code: number
  class3Code: number
  class4Code: number
  class5Code: number
  class6Code: number
  class7Code: number
  class8Code: number
  comments: string
  shareable: boolean
  hasBeenEdited: boolean
  outlookSync: boolean
  dtModified: Date
  eVID: Byte
  isOptOutTxtMsg: Byte
  isOptOutEmail: boolean
  custom17: string
  custom18: string
  custom19: string
  custom20: string
  lastFirst: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  txtMsgIBID: number
  cLPCompanyID: number
  cLPUserID: number
  contactID: number

  mobileNumber: string
  kEYWORD: string
  cONTENTS: string
  dATACAPTURE: string
  rAWText: string
  status: Byte
  cLPServiceRunID: number
  dtReceived: Date
  rECIPIENT: string
  media: string

}

export interface TxtMsgLogResponse {
  _txtMasgList: TxtMsgRpt[]
  _txtMasgIBList: TxtMsgIB[]
}
export interface VoiceCallRpt {
  clpUserId: number
  user: string
  teamCode: number
  team: string
  officeCode: number
  office: string
  direction: boolean
  isscheduled: boolean
  contacts: number
  calls: number
  noRing: number
  less2min: number
  bt2to5min: number
  bt5to15min: number
  bt15to30min: number
  greater30min: number
  minutes: number
}

export interface VoiceCallCancelRpt {
  clpUserId: number
  user: string
  teamCode: number
  team: string
  officeCode: number
  office: string
  action: string
  calls: number
  cnt: number
}
export interface VoiceCallRptResponse {
  _voiceCallRptList: VoiceCallRpt[]
  _voiceCallCancelRptList: VoiceCallCancelRpt[]
  _totalVoiceCallRptList: VoiceCallRpt[]
  AllUserVoiceCallRptList: VoiceCallRpt[]
}

export interface RevenueByManagerResponse {
  revenueManagerList: RevenueByManagerList[]
  ddRowColumns: DropDownItem[]
}

export interface RevenueByManagerList {
  legend: string;
  legendId: number;
  split: string;
  leads: number;
  revenue: number;
  probability: number;
  projected: number;
}

export interface RevenueByMonth {
  displayMonth: string;
  monthKey: number;
  leads: number;
  revenue: number;
  volume: number;
  probability: number;
  projected: number;

}

export interface RevenueByMonthResponse {
  revenueByMonthList: RevenueByMonth[]
}

export interface LeadTwoDimensionResponse extends SimpleResponse {
  ddRowsColumns: DropDownItem[];
  ddRows: DropDownItem[];
  ddMeasure: DropDownItem[];
  ddDateFilter: DropDownItem[];
  userFilterData: clpUserFilterResponse[];
  leadTwoDimension: [{}]
  leadSearchUserList: []
}

export interface LeadInvoiceResponse extends SimpleResponse {
  leadInvoiceList: [{ Amount: number }];
}

export interface BuzzCoreFilterResponse extends SimpleResponse {
  isUserDd: boolean;
  userDd: keyValue[];
  scoreTypeDd: DropDownItem[];
  class1CodeDd: ClassCodes;
  class1CodeHead: string;
  class4CodeDd: ClassCodes;
  class4CodeHead: string;
}

export interface BuzzScoreResponse extends SimpleResponse {
  buzzScore: BuzzScore[];
}

export interface BuzzScore {
  contactID: number;
  clpUserID: number;
  firstName: string;
  email: string;
  phone: string;
  mobile: string;
  homePhone: string;
  uLastName: string;
  uFirstName: string;
  score: number;
  events: number
}

export interface ScoreHistoryResponse extends SimpleResponse {
  scoreHistory: ScoreHistory
}

export interface ScoreHistory {
  contactID: number;
  score: number;
  type: number;
  dtCreated: Date
}
export interface BuzzScoreData {
  startDt: string;
  endDt: string;
  userFilter: number;
  scoreType: number;
  class1Code: number;
  class4Code: number;
}

export interface ReferrerReport {
  contactID: number
  firstName: string
  lastName: string
  email: string
  companyName: string
  clpUserID: number
  dtCreated: Date
  count: number
}
export interface ReferralReport {
  contactID: number
  refferalId: number
  firstName: string
  lastName: string
  email: string
  companyName: string
  clpUserID: number
  dtCreated: Date

}
export interface ReferralReportResponse extends SimpleResponse {
  referralReport: ReferralReport[]
}
export interface ReferrerReportResponse extends SimpleResponse {
  referrerReport: ReferrerReport[]
}

export interface ClickCountResponse extends SimpleResponse {
  clickCount: ClickCount[];
}
export interface ClickCount {
  clickId: number;
  destinationUrl: string;
  count: number;
}
export interface ClickTrackingData {
  startDt: string;
  endDt: string;
}

export interface CLPUserFilterResponse {
  isMyTeam: boolean
  isMyOffice: boolean
  isTeamDd: boolean
  isTeamText: boolean
  teamDd: TeamCodes[]
  teamText: string
  isOfficeDd: boolean
  isOfficeText: boolean
  officeDd: OfficeCodes[]
  officeText: string
  isUserDd: boolean
  userDD: keyValue[]
}

//This model is only for ui side
export interface SendMailInfo {
  isShow: boolean
  contactId: number
}

export interface AgreementDashboardData {
  startDt: string;
  endDt: string;
  finalized: number;
  franchise: number;
  location: number;
  contactOwner: number;
  referralSource: number;
  marketingChannel: number;
  agreementType: number;
  orderBy: number;
}

export interface ScoreCardByCode {
  code: string
  desc: string
  projectedContactsAdded: string
  contactsAdded: number
  callCount: number
  bipCreated: number
  bipScheduled: number
  bipRate: number
  bipShow: number
  bipShowRate: number
  showsPerLead: string
  bipSold: string
  subSold: string
  contracted: number
  downPayment: number

}

export interface ScorecardFilter {
  officeDd: OfficeCodes;
  class7CodeDd: ClassCodes
  class7CodeHead: string;
  class8CodeDd: ClassCodes;
  class8CodeHead: string;
}

export interface ScoreCardByKeyword {
  keyword: string;
  contactsAdded: number;
  callCount: number;
  bipCreated: number;
  bipScheduled: number;
  bipRate: number;
  bipShow: number;
  bipShowRate: number;
  showsPerLead: string;
}

export interface ScoreCardByKeywordData {
  startDate: string;
  endDate: string;
  officeCode: number;
  class7Code: number;
  class8Code: number;
}
