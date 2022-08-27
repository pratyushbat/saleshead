import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PasswordPolicy, PasswordPolicyListResponse, PasswordPolicyResponse } from '../models/passwordPolicy.model';
import { CLPUser, UserResponse, UserListResponse } from '../models/clpuser.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordPolicyService {
  private baseUrl: string;
  private api: string = "api/PasswordPolicy";


  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getPasswordPolicies(encryptedUser: string): Promise<PasswordPolicyListResponse | void> {
    const a = await this.httpClient
      .get<PasswordPolicyListResponse>(`${this.baseUrl}/GetPasswordPolicies/`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser + ":PP"
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "PasswordPolicyService", "GetPasswordPolicies"); }); //toPromise();
    return a;
  }

  async passWordPolicy_Update(encryptedUser: string, passwordPolicy: PasswordPolicy): Promise<PasswordPolicyResponse | void> {
    const a = await this.httpClient.post<PasswordPolicy>(`${this.baseUrl}/PasswordPolicy_Update/`, passwordPolicy, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser + ":PP"
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, passwordPolicy, "", "PasswordPolicyService", "PasswordPolicy_Update"); });
    return a;
  }

  async getClpUsers(encryptedUser: string): Promise<UserListResponse | void> {
    const a = await this.httpClient
      .get<UserListResponse>(`${this.baseUrl}/GetClpUsers_PasswordAdmin/`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser + ":PP"
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "PasswordPolicyService", "getClpUsers"); }); //toPromise();
    return a;
  }

  async clpUser_Update_PA(encryptedUser: string, user: CLPUser): Promise<UserResponse | void> {
    const a = await this.httpClient.post<CLPUser>(`${this.baseUrl}/CLPUser_Update_PasswordAdmin/`, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser + ":PP"
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, user, "", "PasswordPolicyService", "CLPUser_Update_PA"); });
    return a;
  }
}
