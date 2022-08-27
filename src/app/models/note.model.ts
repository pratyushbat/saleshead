import { SimpleResponse } from "./genericResponse.model";
import { NoteTypeCodeModel } from "./noteTypeCode.model";

export interface Note extends SimpleResponse {
  noteID: number; //Avid
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
  dtSent: Date;
  emailSnippetID: number;
  fromCLPUserID: number;
  scheduledTime: string; //Only to show on UI
  emailpreviewLink: string;
  campaignID: number;
  campaignEventID: number;
  runID: number;
  status: number;
  emailStatus: number;
  emailResult: string;
  cLPServiceRunID: number;
  dtModified: Date;
  dtCreated: Date;
}

export interface NoteResponse extends SimpleResponse {
  note: Note;
}

export interface NoteFilterResponse {
  isExcelDownload: boolean;
  noteTypeCodes: NoteTypeCodeModel[];
  currenTtime: string;
}

export interface NoteListResponse {
  notes: Note[];

}
