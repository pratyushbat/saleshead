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
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';
import { ZipCodeResponse } from '../models/zip.model';

@Injectable({
  providedIn: 'root'
})
export class ZipService {

  private baseUrl: string;
  private api: string = "api/Zip";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async zip_Get(encryptedUser: string, zip: any): Promise<ZipCodeResponse | void> {
    const a = await this.httpClient
      .get<ZipCodeResponse>(`${this.baseUrl}/Zip_Get/${zip}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "zip - " + zip, "ZipService", "zip_Get"); });
    return a;
  }

}
