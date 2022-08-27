import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FeatureAccess } from '../models/clpuser.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
  })

export class FeatureAccessService {
  private baseUrl: string;
  private api: string = "api/User";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getFeatureAccess(encryptedUser: string, roleId: number, featureId: number, clpCompanyId: number): Promise<FeatureAccess | void> {
    const a = await this.httpClient
      .get<FeatureAccess>(`${this.baseUrl}/GetFeatureAccessDetails/${roleId}/${featureId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "FeatureAccessService", "getFeatureAccess"); }); //toPromise();
    return a;
  }
}
