import { Byte } from "@angular/compiler/src/util";
import { Data } from "@angular/router";
import { GenericResponse } from "./genericResponse.model";

export interface Document {
  documentId: number;
  bytes: any;
  document: string;
  documentName: string;
  documentTypeIcon: string;
  documentType: number;

  //[JsonProperty(PropertyName ="document" )]
  //      public string Document { get; set; }

  ownerID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  documentCategory: number;
  documentLength: number;
  isShared: boolean;
  dtCreated: Date;
}

export interface DocumentResponse extends GenericResponse {
  documents: Document[];
  fileSizeLimit: number;
  maxFiles: number;
}
