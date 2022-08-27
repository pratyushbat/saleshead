import { SimpleResponse } from "./genericResponse.model";
import { SearchQueryResponse } from "./search.model";

export interface BulkActionResponse extends SimpleResponse {
  field: [];
  eEditTypeName: [];
}

export interface BulckAction {
  bulkRequestID: number[];
  syncCode: string
  cmValue: string;
  processAll: boolean;
  contact: eBulkRequestObjectType;
  append: eBulkRequestObjectType;
  ddField: string;
  textValue: string;
  ddValue: string;
  cbValue: string;
  txtDateValue: string;
  txtNoteValue: string;
  contactID: number;
  cbAction: boolean;
  chkValue: boolean;
  selectedDate: Date;
  noteValue: string;
  searchQuery: SearchQueryResponse;
  cbAllRelatedData: boolean;
  trContracts: boolean;
  cbContracts: boolean;
  trTransferSFA: boolean;
  cbTransferSFA: boolean;
  editType: number;
}
export enum eBulkRequestObjectType {
  Unknown = 0,
  Company = 1,
  Contact = 2,
  Lead = 3
}
