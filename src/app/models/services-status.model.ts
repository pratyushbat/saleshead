import { SimpleResponse } from "./genericResponse.model";

export interface ServiceStatusResponse extends SimpleResponse {
  mailingContactData: MailingContactData[];
  processersStatuData: ProcessersStatuData[];
  txtMsgTable: TxtMsgTable[];
  commonTableData: CommonTableData[];
}

export interface MailingContactData {
  tableName: string;
  mailingID: number;
  contactID: number;
  iD: number;
  account: string;
  user: string;
  mailing: string;
  cnt: number;
}

export interface ProcessersStatuData {
  tableName: string;
  emailActive: number;
  emailMax: number;
  textActive: number;
  textMax: number;
  textCampaignActive: number;
  textCampaignMax: number;
  voiceActive: number;
  voiceMax: number;
}

export interface CommonTableData {
  manualInQueue_TxtMsg: string;
  sFAInQueue_TxtMsg: string;
  wizardryInQueue_TxtMs: string;
  beingHandled_VoiceCall: string;
  manualInQueue_VoiceCall: string;
  sFAInQueue_VoiceCall: string;
  remindersInQueue_VoiceCall: string;
  beingHandled_VoiceDrop: string;
  inQueue_VoiceDrop: string;
  beingHandled_VoiceCallRecording: string;
  inQueue_VoiceCallRecording: string;
  beingHandled_VoiceRecording: string;
  inQueue_VoiceRecording: string;
}

export interface TxtMsgTable {
  tableName: string;
  type: string;
  beingHandled_TxtMsg: number;
}

export interface CLPFramework extends SimpleResponse {
  cLPEBlastNumber: number;
  runImportantDates: boolean;
  wCMTopLeft: string;
  wCMTopLeftType: number;
  clearPixel: string;
  clearPixelType: number;
  outlookPluginVersion: string;
  liveChat: boolean;
  dailyService: boolean;
  activeProcesses: number;
  maxProcesses: number;
  activeProcessesTM: number;
  maxProcessesTM: number;
  activeProcessesVC: number;
  maxProcessesVC: number;
  dtDailyServ: Date;
  dtEmailServ: Date;
  dtParserServ: Date;
  dtDropBoxServ: Date;
  dtReminderServ: Date;
  dtExportServ: Date;
  dtGSyncServ: Date;
  dtTxtMsgServ: Date;
  dtVoiceServ: Date;
  dtEvolveLeadServ: Date;
  activeProcessesTMCP: number;
  maxProcessesTMCP: number;
  dtTxtMsgCampaignServ: Date;
  dtIHLeadServ: Date;
}
