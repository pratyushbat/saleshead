import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MailTypeResponse } from '../models/emailTemplate.model';
import { Mailing } from '../models/mailing.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class EmailBlastService {
  private baseUrl: string;
  private api: string = "api/EmailWizard";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async moveRightList(encryptedUser: string, clpCompanyId: number, cLPUserId: number, tempListID: number, contactId : number[]): Promise<boolean | void> {
    const a = await this.httpClient
      .get<boolean>(`${this.baseUrl}/MoveRight/${tempListID}/${clpCompanyId}/${cLPUserId}/${contactId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "EmailBlastService", "moveRightList"); });
    return a;
  }

  async saveEmailWizard(encryptedUser: string, objMail: Mailing): Promise<number | void> {
    const a = await this.httpClient
      .post<number>(`${this.baseUrl}/SaveEmailWizard`, objMail, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailBlastService", "saveEmailWizard"); });
    return a;
  }

  async getEmailTypeList(encryptedUser: string, clpCompanyId: number): Promise<MailTypeResponse | void> {
    const a = await this.httpClient
      .get<MailTypeResponse>(`${this.baseUrl}/GetEmailType/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "EmailBlastService", "getEmailTypeList"); });
    return a;
  }

}
