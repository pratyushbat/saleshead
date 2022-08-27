import { SimpleResponse } from "./genericResponse.model";

export interface CLPOutlookUser {
  cLPUserID: number;
  cLPCompanyID: number;
  primaryAddMap: number;
  otherAddMap: number;
  allowSyncContact: boolean;
  allowSyncAppt: boolean;
  allowSyncEmail: boolean;
  allowSyncTask: boolean;
  outlookPluginVersion: string;
  outlookVersion: number;
  status: number;
  adminStatus: number;
  dtCreated: Date;
  lastFirst: string;
  userCode: string;
  userRole: number;
}

export interface CLPOutlookUserResponse extends SimpleResponse
{
  cLPOutlookUser: CLPOutlookUser[];
}
