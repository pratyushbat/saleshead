import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CLPFramework, ServiceStatusResponse } from '../models/services-status.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})

export class ServicesStatusService {

  private baseUrl: string;
  private api: string = "api/AdminServiceStatus";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }


  async getAdminServiceStatus(encryptedUser: string, currentTime: string): Promise<ServiceStatusResponse | void> {
    const a = await this.httpClient
      .get<ServiceStatusResponse>(`${this.baseUrl}/AdminServiceStatus_Get/${currentTime}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ServicesStatusService", "getAdminServiceStatus"); });
    return a;
  }

  async resetCLPFramework(encryptedUser: string, serviceType: number): Promise<CLPFramework | void> {
    const a = await this.httpClient
      .post<CLPFramework>(`${this.baseUrl}/CLPFramework_ResetFramework/${serviceType}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ServicesStatusService", "resetCLPFramework"); });
    return a;
  }

}
