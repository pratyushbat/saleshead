import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { RoundRobin, RoundRobinListReponse } from '../models/roundRobin.model';
import { UniqueURLExistCheck, WebForm, WebFormResponse } from '../models/webForm.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root',
})
export class WebformService {

  private baseUrl: string;
  private api: string = "api/WebForm";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async getWebForm(encryptedUser: string, cLPCompanyID: number, clpUserId: number): Promise<WebFormResponse | void> {
    const a = await this.httpClient
      .get<WebFormResponse>(`${this.baseUrl}/WebForm_GetListDetails?cLPCompanyID=${cLPCompanyID}&clpUserId=${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID + "clpUserId - " + clpUserId, "WebformService", "getWebForm"); });
    return a;
  }

  async getWebFormGrid(encryptedUser: string, cLPCompanyID: number): Promise<WebFormResponse | void> {
    const a = await this.httpClient
      .get<WebFormResponse>(`${this.baseUrl}/WebForm_GetListDetails?cLPCompanyID=${cLPCompanyID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID , "WebformService", "getWebForm"); });
    return a;
  }
  async getWebFormLoad(encryptedUser: string, webFormId: number): Promise<WebForm | void> {
    const a = await this.httpClient
      .get<WebForm>(`${this.baseUrl}/WebForm_Load?webFormId=${webFormId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "webFormId - " + webFormId, "WebformService", "getWebFormLoad"); });
    return a;
  }

  async webFormDelete(encryptedUser: string, webFormId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/WebForm_Delete?webFormId=${webFormId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "webFormId - " + webFormId, "WebformService", "webFormDelete"); });
    return a;
  }

  async webFormIsUniqueURLExist(encryptedUser: string, uniqueURLExistCheck: UniqueURLExistCheck): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/WebForm_isUniqueURLExist?`, uniqueURLExistCheck, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "webFormId - " + uniqueURLExistCheck, "WebformService", "webFormIsUniqueURLExist"); });
    return a;
  }

  async saveWebForm(encryptedUser: string, webForm: WebForm): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/WebForm_Update`, webForm, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "webForm - " + webForm, "WebformService", "saveWebForm"); });
    return a;
  }

  async getRoundRobin(encryptedUser: string, cLPCompanyID: number): Promise<RoundRobinListReponse | void> {
    const a = await this.httpClient
      .get<RoundRobinListReponse>(`${this.baseUrl}/RoundRobin_GetList/${cLPCompanyID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID, "WebformService", "getRoundRobin  "); });
    return a;
  }

  async updateRoundRobinData(encryptedUser: string, roundRobin: RoundRobin): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/RoundRobinData_Update`, roundRobin, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "roundRobin - " + roundRobin, "WebformService", "updateRoundRobinData"); });
    return a;
  }

  async deleteRoundRobin(encryptedUser: string, roundRobinID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/RoundRobin_Delete/${roundRobinID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "roundRobinID - " + roundRobinID, "WebformService", "deleteRoundRobin"); });
    return a;
  }

}
