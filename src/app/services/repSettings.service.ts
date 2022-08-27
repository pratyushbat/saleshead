import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { SOSCResponse, SOSC, SOSCContractResponse, SOSCContract } from '../models/repSettings.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class RepSettingService {
  private baseUrl: string;
  private api: string = "api/SOSC";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getRepSettingList(encryptedUser: string, clpCompanyId: number, cLPUserId: number): Promise<SOSCResponse | void> {
    const a = await this.httpClient
      .get<SOSCResponse>(`${this.baseUrl}/SOSC_GetList/${clpCompanyId}?/cLPUserId=${cLPUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "RepSettingService", "SOSC_GetList"); });
    return a;
  }

  async updateRepSettings(encryptedUser: string, SOSC: SOSC): Promise<SOSCResponse | void> {
    const a = await this.httpClient.post<SOSCResponse>(`${this.baseUrl}/SOSC_Update`, SOSC, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + SOSC, "RepSettingService", "SOSC_Update") });
    return a;

  }

  async getContractList(encryptedUser: string, sOSCID: number, sOSCContractID: number, mailMergeTemplateID: number, cLPCompanyID: number, teamCode: number): Promise<SOSCContractResponse | void> {
    const a = await this.httpClient
      .get<SOSCContractResponse>(`${this.baseUrl}/SOSCContract_GetList?sOSCID=${sOSCID}&sOSCContractID=${sOSCContractID}&mailMergeTemplateID=${mailMergeTemplateID}&cLPCompanyID=${cLPCompanyID}&teamCode=${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "RepSettingService", "getContractList"); });
    return a;
  }

  async deleteContractList(encryptedUser: string, sOSCContractID: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/SOSCContract_Delete?sOSCContractID=${sOSCContractID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + ",", "RepSettingService", "deleteContractList") });

    return http$;
  }

  async updateContractList(encryptedUser: string, sOSCContract: SOSCContract, companyName: string, teamDisplay: string, userFullName: string): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/SOSCContract_Update?companyName=${companyName}&teamDisplay=${teamDisplay}&userFullName=${userFullName}`, sOSCContract, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + sOSCContract, "RepSettingService", "updateContractList") });
    return a;

  }

  async downloadContractPdf(encryptedUser: string, sOSCContractID: number, companyName: string): Promise<any | void> {
    const a = await this.httpClient
      .get<any>(`${this.baseUrl}/GenratePDF/${sOSCContractID}/${companyName}`, {
        'responseType': 'arraybuffer' as 'json',
        headers: new HttpHeaders({
          'responseType': 'arraybuffer',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, encryptedUser, "RepSettingService", "downloadContractPdf"); });

    return a;
  }

  }

