import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { HTMLEmailLogGetMonthListResponse, HTMLEmailLogUsageByMonthListResponse, HTMLEmailPricing } from '../models/htmlEmailPricing.model';

@Injectable({
  providedIn: 'root'
})
export class htmlEmailPricingService {

  private baseUrl: string;
  private api: string = "api/HTMLEmailPricing";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async htmlEmailLogGetMonthList(encryptedUser: string, cLPCompanyID: number, cLPUserID: number): Promise<HTMLEmailLogGetMonthListResponse | void> {
    const a = await this.httpClient
      .get<HTMLEmailLogGetMonthListResponse>(`${this.baseUrl}/HTMLEmailLog_GetMonthList/cLPCompanyID/cLPUserID?cLPCompanyID=${cLPCompanyID}&cLPUserID=${cLPUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID, "htmlEmailPricingService", "HTMLEmailLog_GetMonthList"); });
    return a;
  }

  async htmlEmailLogUsageByMonth(encryptedUser: string, cLPCompanyID: number, dtMonth: number, dtYear: number): Promise<HTMLEmailLogUsageByMonthListResponse | void> {
    const a = await this.httpClient
      .get<HTMLEmailLogUsageByMonthListResponse>(`${this.baseUrl}/HTMLEmailLog_UsageByMonth/cLPCompanyID/dtMonth/dtYear?cLPCompanyID=${cLPCompanyID}&dtMonth=${dtMonth}&dtYear=${dtYear}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID, "htmlEmailPricingService", "HTMLEmailLog_UsageByMonth"); });
    return a;
  }

  async clpHtmlBillingGet(encryptedUser: string, cLPCompanyID: number): Promise<HTMLEmailPricing | void> {
    const a = await this.httpClient
      .get<HTMLEmailPricing>(`${this.baseUrl}/CLPHTMLBilling_Get/cLPCompanyID?cLPCompanyID=${cLPCompanyID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID, "htmlEmailPricingService", "CLPHTMLBilling_Get"); });
    return a;
  }

  async clpHtmlBillingCreate(encryptedUser: string, htmlEmailPricing: HTMLEmailPricing): Promise<HTMLEmailPricing | void> {
    const a = await this.httpClient
      .post<HTMLEmailPricing>(`${this.baseUrl}/CLPHTMLBilling_Create`, htmlEmailPricing, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + htmlEmailPricing, "htmlEmailPricingService", "CLPHTMLBilling_Create"); });
    return a;
  }

}
