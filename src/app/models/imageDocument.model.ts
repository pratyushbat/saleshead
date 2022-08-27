import { Byte } from "@angular/compiler/src/util";
import { SimpleResponse } from "./genericResponse.model";

export interface SOImageDocument {
  documentId: number;
  folderID: number;
  link: string;
  documentName: string;
  documentType: Byte;
  document: string;
  cLPUserID: number;
  documentLength: number;
  dtCreated: Date;
  repository: Byte;
  documentTitle: string;
  sOrder: number;
  imagePath: string;
}

export interface ImageDocument {
  documentId: number;
  folderID: number;
  link: string;
  documentName: string;
  documentType: Byte;
  document: string;
  cLPUserID: number;
  documentLength: number;
  dtCreated: Date;
  repository: Byte;
  documentTitle: string;
  sOrder: number;
  imagePath: string;
  imageTag: string;
  imagePreview: string;
  imageURL: string;
  imageDim: string;
}

export interface SOImageDocumentListResponse extends SimpleResponse {
  sOImageDocument: SOImageDocument[];
}
