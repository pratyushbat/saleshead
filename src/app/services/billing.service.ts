import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AccountInformation, AccountInformationRespone } from '../models/accountInformation.model';
import { CLPAddOnBilling, CLPBilling } from '../models/clpBilling.model';
import { BillingHistoryResponse, BillingHistoryYearResponse, BillingInvoiceResponse } from '../models/clpTxn.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class BilligService {

  private baseUrl: string;
  private api: string = "api/Billing";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async clpAddOnBilling_Load(encryptedUser: string, clpcompnayId: number, clpUserId: number): Promise<CLPAddOnBilling | void> {
    const a = await this.httpClient
      .get<CLPAddOnBilling>(`${this.baseUrl}/CLPAddOnBilling_Load/${clpcompnayId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpcompnayId, "BilligService", "CLPAddOnBilling_Load"); });
    return a;
  }
  async clpAddOnBilling_Update(encryptedUser: string, CLPAddOnBillingData: CLPAddOnBilling): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/CLPAddOnBilling_Update`, CLPAddOnBillingData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "CLPAddOnBillingData - " + CLPAddOnBillingData, "BilligService", "CLPAddOnBilling_Update") });
    return a;

  }
  async CLPBilling_CreditCard_Create(encryptedUser: string, cLPBilling: CLPBilling): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/CLPBilling_CreditCard_Create`, cLPBilling, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "cLPBilling - " + cLPBilling, "BilligService", "CLPBilling_CreditCard_Create"); });
    return a;
  }
  async CLPBilling_CreditCard_Get(encryptedUser: string, clpCompanyId: number): Promise<CLPBilling | void> {
    const a = await this.httpClient.get<CLPBilling>(`${this.baseUrl}/CLPBilling_CreditCard_Get/${clpCompanyId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "BilligService", "CLPBilling_CreditCard_Get"); });
    return a;
  }

  async accountInformation_Get(encryptedUser: string, clpCompanyId: number): Promise<AccountInformation | void> {
    const a = await this.httpClient.get<AccountInformation>(`${this.baseUrl}/AccountInformation_Get/${clpCompanyId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "BilligService", "accountInformation_Get"); });
    return a;
  }

  async accountInformation_Update(encryptedUser: string, accountInformation: AccountInformation): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/AccountInformation_Update`, accountInformation, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "accountInformation - " + accountInformation, "BilligService", "accountInformation_Update"); });
    return a;
  }

  async getBillingHistoryYear(encryptedUser: string, clpCompanyId: number, year: number = 0, teamCode: number = 0): Promise<BillingHistoryYearResponse | void> {
    const a = await this.httpClient.get<BillingHistoryYearResponse>(`${this.baseUrl}/BillingHistoryYear_Get/${clpCompanyId}/${year}/${teamCode}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "BilligService", "getBillingHistoryYear"); });
    return a;
  }

  async getBillingHistory(encryptedUser: string, clpCompanyId: number, year: number = 0, teamCode: number = 0): Promise<BillingHistoryResponse | void> {
    const a = await this.httpClient.get<BillingHistoryResponse>(`${this.baseUrl}/BillingHistory_Get/${clpCompanyId}/${year}/${teamCode}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "year - " + year, "BilligService", "getBillingHistory"); });
    return a;
  }

  async getBillingInvoice(encryptedUser: string, clpTxnID: number, clpCompanyId: number, clpUserId: number): Promise<BillingInvoiceResponse | void> {
    const a = await this.httpClient.get<BillingInvoiceResponse>(`${this.baseUrl}/BillingInvoice_Get/${clpTxnID}/${clpCompanyId}/${clpUserId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpTxnID - " + clpTxnID, "BilligService", "getBillingInvoice"); });
    return a;
  }

  async sendInvoiceReceiptEmail(encryptedUser: string, strToEmail: string, clpTxnID: number, clpCompanyId: number, clpUserId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SimpleResponse>(`${this.baseUrl}/SendInvoiceReceiptEmail/${strToEmail}/${clpTxnID}/${clpCompanyId}/${clpUserId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "strToEmail - " + strToEmail, "clpTxnID - " + clpTxnID + "clpCompanyId - " + clpCompanyId + "clpUserId - " + clpUserId, "BilligService", "sendInvoiceReceiptEmail"); });
    return a;
  }

}
