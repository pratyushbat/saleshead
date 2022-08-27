import { CLPUser } from "./clpuser.model";
import { SimpleResponse } from "./genericResponse.model";

export interface PasswordPolicy {
  id: number;
  companyId: number;
  companyName: string;
  minLength: number;
  specialCharCount: number;
  digitCount: number;
  capitalCount: number;
  smallAlphabetCount: number;
  dtcreated: Date;
  dtModified: Date;
  createdBy: number;
  modifiedBy: number;
  clpCompanyId: number;
  expiration: number;
  pwdReuseCount: number;
  maxFailedAttempts: number;
  maxPwdChangeInDay: number;
  lockOutDuration: number;
  isMFAEnabled: boolean;
  mfaMethod: number;
  mfaExpiration: number;
  maxMFADevicesAllowed: number;
  pwdSummary: string;
}

export interface PasswordPolicyListResponse extends SimpleResponse {
  passwordPolicies: PasswordPolicy[]
  currentUser: CLPUser

}

export interface PasswordPolicyResponse extends SimpleResponse {
  passwordPolicy: PasswordPolicy
}
