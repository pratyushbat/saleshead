import { GenericResponse, SimpleResponse } from "./genericResponse.model";

export interface Folder {
  folderID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  folderName: string;
  sOrder: number;
  isShared: boolean;

  userName: string;
}

export interface FolderListResponse extends SimpleResponse {
  folder: Folder[];
}
