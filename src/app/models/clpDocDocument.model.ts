import { Byte } from "@angular/compiler/src/util";

export interface ClpdocDocument {
  documentId: number;
  documentName: string;
  documentType: Byte;
  document: Byte;
  ownerID: number
  cLPUserID: number
  cLPCompanyID: number
  documentCategory: Byte;
  documentLength: number;
  isShared: boolean;
  dtCreated: Date;
  userName: string;
  documentTypeUrl: string;
  displayURL: string;
  display: string;
  displayToolTip: string;
}

export interface SelectedDocumentId {
  documentId: number;
}
