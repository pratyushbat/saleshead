import { SimpleResponse } from "./genericResponse.model";

export interface CLPUserLock {
  clpCompanyId: number;
  clpUserId: number;
  firstName: string;
  lastName: string;
  companyName: string;
  userName: string;
  isLocked: number;
  dtlocked: Date;
}

export interface CLPUserLockListResponse {
  clpUserLocks: CLPUserLock[]

}

export interface CLPUserLockResponse extends SimpleResponse {
  clpUserLock: CLPUserLock
}
