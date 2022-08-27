import { Data } from "@angular/router"

export interface ContactHistory {
  type: eContactHistoryType;
  dtToSort: Date;  //sort
  //Appointment Fields
  app_strDay: string;
  app_strTime: string;
  app_ApptID: number;
  app_ApptStartTime: Date;  //sort
  app_ApptEndTime: Date;
  app_ContactID: number;
  app_LeadID: number;
  app_Category: string;
  app_Status: string;
  app_ReminderEmail: boolean;
  app_ReminderCLP: boolean;
  app_Check2: boolean;
  app_ContactTypeCode: number;
  app_Location: string;
  app_Subject: string;
  app_Notes: string;
  app_TypeCodeDisplay: string;
  app_UserFullName: string;
  app_ContactFullName: string;
  app_CompanyID: number;
  app_CompanyName: string;
  //Task Fields
  t_TaskID: number;
  t_dtDue: Date;   //sort
  t_strDay: string;
  t_Category: string;
  t_OwnerID: number;
  t_Status: number;
  t_Priority: number;
  t_TaskDesc: string;
  t_UserFullName: string;
  t_ContactFullName: string;
  t_CompanyID: number;
  t_CompanyName: string;
  //Mailing Fields
  m_MailingID: number;
  m_Result: number;
  m_FromAddress: string;
  m_Category: number;
  m_MailingStartTime: Date;   //sort
  m_strDay: string;
  m_Status: number;
  m_Subject: string;
  m_Body: string;
  m_MailingTypeCode: number;
  m_EmailTemplateID: number
  m_MailMergeTemplateID: number;
  m_MailingTypeDisplay: string;
  m_EmailTemplateName: string;
  m_MailMergeTemplateName: string;
  m_UserFullName: string;
  m_ContactFullName: string;
  m_CompanyID: number;
  m_CompanyName: string;
  // Text Message Fields
  txtMsg_TxtMsgID: number;
  txtMsg_strDay: string;
  txtMsg_CLPUserID: number;
  txtMsg_ToCLPUserID: number;
  txtMsg_dtSend: Data;  //sort
  txtMsg_MediaURL: string;
  txtMsg_isToUser: boolean;
  txtMsg_Status: number;
  txtMsg_RequestComment: string;
  txtMsg_MobileNumber: string;
  txtMsg_Msg: string;
  txtMsg_UserTxtMsgLongCode: string;
  txtMsg_UserFullName: string;
  txtMsg_ContactFullName: string;
  txtMsg_ToUserFullName: string;
  //InBound Text Message Fields
  iBTxtMsg_TxtMsgIBID: number;
  iBTxtMsg_strDay: string;
  iBTxtMsg_dtCreated: Date;    //Sort
  iBTxtMsg_KEYWORD: string;
  iBTxtMsg_CONTENTS: string;
  iBTxtMsg_RECIPIENT: string;
  iBTxtMsg_Media: string;
  iBTxtMsg_ToName: string;
  iBTxtMsg_FromName: string;
  iBTxtMsg_MobileNumber: string;
  //Voice drop
  vDrop_VoiceDropID: number;
  vDrop_strDay: string;
  vDrop_dtSend: Date;  // Sort
  vDrop_Status: number;
  vDrop_VoiceRecordingTypeID: number;
  vDrop_RequestComment: string;
  vDrop_MobileNumber: string;
  vDrop_VoiceRecordingTypeDisplay: string;
  //Voice Call
  vCall_VoiceDropID: number;
  vCall_strDay: string;
  vCall_dtStart: Date;    //sort
  vCall_PreCallScript: string;
  vCall_RequestComment: string;
  vCall_Status: number;
  vCall_Direction: boolean;
  vCall_FromNumber: string;
  vCall_ToNumber: string;
  vCall_isRecorded: boolean;
  vCall_Duration: number;
  vCall_CallNotes: string;
  vCall_UserFullName: string;
  vCall_ContactFullName: string;
  //Vip Session
  vip_SessionID: number;
  vip_strDay: string;
  vip_VIPID: number;
  vip_CLPUserID: number;
  vip_ContactID: number;
  vip_isSelfGuided: boolean;
  vip_dtModified: Date;   ///sort

  vIPTitle: string;
  vIPID: number;
  vip_Status: number;
  vIPSessionLog_list: VIPSessionLog[];
  vIPSessionContact_list: VIPSessionContact[];
  //Note
  note_NoteID: number;
  note_strDay: string;
  note_CLPUserID: number;
  note_OwnerID: number;
  note_OwnerType: number;
  note_ToChoice: string;
  note_NoteTypeCode: number;
  note_EmailTemplateID: number;
  note_MailMergeTemplateID: number;
  note_NoteSubject: string;
  note_NoteDesc: string;
  note_ToField: string;
  note_CCField: string;
  note_BCCField: string;
  note_EmailResult: string;
  note_Status: number;
  note_EmailStatus: number;
  note_DocumentList: string;
  note_dtSent: Date; //sort
  note_dtCreated: Date;
  note_NoteTypeDisplay: string;
  note_EmailTemplateName: string;
  note_MailMergeTemplateName: string;
  note_UserFullName: string;
  note_ContactFullName: string;
  note_CompanyID: number;
  note_CompanyName: string;
  //Email
  email_EmailID: number;
  Email_strDay: string;
  email_CLPCompanyID: number;
  email_OwnerID: number;
  email_OwnerType: number;
  email_ToChoice: number;
  email_Direction: number;
  email_Source: string;
  email_FromField: string;
  email_ToField: string;
  email_CCField: string;
  email_BCCField: string;
  email_EmailSubject: string;
  email_EmailBody: string;
  email_EmailTemplateID: number;
  email_MailMergeTemplateID: number;
  email_DocumentList: string;
  email_dtSent: Date; //Sort
  email_EmailResult: string;
  email_EmailResultDisplay: string;
  email_CampaignID: number;
  email_CampaignEventID: number;
  email_RunID: number;
  email_CLPServiceRunID: number;
  email_Status: number;
  email_ResultStatus: number;
  email_dtModified: Date;
  email_dtCreated: Date;  //sort
  //Skype Call Fields
  skype_SkypeCallID: number;
  skype_strTime: string;
  skype_strDay: string;
  skype_CLPCompanyID: number
  skype_CLPUserID: number;
  skype_ContactID: number;
  skype_Notes: number;
  skype_dtCreated: Date;  //sort
}

export interface VIPSessionLog {
  vIPLogID: number;
  vIPSessionID: number;
  vIPSlideID: number;
  dtCreated: Date;
  secondsOnSlide: number;
  contentType: number;
  slideContent: string;
  slideTitle: string;
  imageBankID: number;

}

export interface VIPSessionContact {
  vIPSessionID: number;
  contactID: number;
  contactFullName: string;
}

export interface ContactHistoryListResponse {
  contactHistory: ContactHistory[];
}

export enum eContactHistoryType {
  All = 0,
  Notes = 1,
  Appointments = 2,
  Tasks = 3,
  Mailings = 4,
  SkypeCalls = 5,
  Emails = 6,
  Clicks = 7,
  TxtMsgs = 8,
  TxtMsgIBs = 9,
  VoiceDrop = 10,
  VoiceCall = 11,
  VIPSession = 12
}
