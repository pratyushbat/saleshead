import { SimpleResponse } from "./genericResponse.model";


export interface StorageSummary extends SimpleResponse {
  spaceUsed: number;
  cLPUserID: number;
  lastName: string;
  firstName: string;

}

export interface StorageSummaryResponse extends SimpleResponse {
  companySpaceUsed: number;
  totalStorageCapacity: number;
  storageSummary:  StorageSummary[];
}

export interface DocumentStorage {
  companyStorageLimit: number;
  userStorageLimit: number;
}

export interface DocumentStorageResponse {
  documentStorage: DocumentStorage;
}

