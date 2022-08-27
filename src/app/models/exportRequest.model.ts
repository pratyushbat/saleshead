import { SimpleResponse } from "./genericResponse.model";

export interface ContactExportRequest {

  requestTime: string;
  typeDisplay: number;
  statusDisplay: number;
  downloadNavURL: string;

}
export interface ContactExportRequestResponse extends SimpleResponse {

  contactExportRequests: ContactExportRequest[];
}

export interface ExportRequestResponse extends SimpleResponse {
  exportRequests: ExportRequest[];
}

export interface ExportRequest {
  exportRequestID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  customSearchID: number;
  fileName: string;
  objectType: number;
  whereClause: string;
  orderBy: string;
  document: string;
  documentType: number;
  documentLength: number;
  status: number;
  dtModified: string;
  dtCreated: string;
  includeMetrics: boolean;
  havingScore: string;
}
