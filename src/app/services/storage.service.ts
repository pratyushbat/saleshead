import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { CLPUser, CLPUserProfile, UserResponse, UserSetupResponse } from '../models/clpUser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { CLPUserLock, CLPUserLockListResponse, CLPUserLockResponse } from '../models/clpUserLock.model';
import { AuditLog } from '../models/auditlog.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { StorageSummaryResponse } from '../models/storage.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  private baseUrl: string;
  private api: string = "api/StorageSummary";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }


  async getStorageList(encryptedUser: string, clpCompanyId: number): Promise<StorageSummaryResponse | void> {
    const http$ = await this.httpClient
      .get<StorageSummaryResponse>(`${this.baseUrl}/Rpt_DocumentSpaceUsedByManager?clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + "," + "clpUser - " + "StorageService", "getStorageList") });

    return http$;
  }

  

}
