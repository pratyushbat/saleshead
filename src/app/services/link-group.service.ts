import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { eExportRequestObjectType, eExportRequestStatus, eNoteOwnerType } from '../models/enum.model';
import { ExportRequestResponse } from '../models/exportRequest.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { LinkContactExtendedListResponse, LinkContactWithCountExtListResponse } from '../models/link-contact.model';
import { ModelLink } from '../models/link-group.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable()
export class LinkGroupService {
  private baseUrl: string;
  private api: string = "api/Link";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async linkUpdate(encryptedUser: string, link: ModelLink): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/Link_Update`, link, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "link - " + link, "LinkGroupService", "linkUpdate") });
    return a;

  }

  async linkContactUpdate(encryptedUser: string, linkId: number, contactId: number): Promise<LinkContactExtendedListResponse | void> {
    const a = await this.httpClient.get<LinkContactExtendedListResponse>(`${this.baseUrl}/LinkContact_Update/${linkId}/${contactId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "linkId - " + linkId + "," + "contactId - " + contactId, "LinkGroupService", "linkContactUpdate") });
    return a;

  }

  async linkContactGetList(encryptedUser: string, linkId: number): Promise<LinkContactExtendedListResponse | void> {
    const a = await this.httpClient.get<LinkContactExtendedListResponse>(`${this.baseUrl}/LinkContact_GetList/${linkId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "linkId - " + linkId, "LinkGroupService", "linkContactGetList") });
    return a;

  }

  async exportRequestsGetList(encryptedUser: string, companyId: number, userId: number, estat: eExportRequestStatus, eType: eExportRequestObjectType ): Promise<ExportRequestResponse | void> {
    const a = await this.httpClient.get<ExportRequestResponse>(`${this.baseUrl}/ExportRequests_GetList/${companyId}/${userId}/${estat}/${eType}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "companyId - " + companyId + "," + "userId - " + userId, "LinkGroupService", "exportRequestsGetList") });
    return a;

  }

  async quickLinkLoad(encryptedUser: string, ownerId: number, userId: number, ownerType: eNoteOwnerType): Promise<LinkContactWithCountExtListResponse | void> {
    const a = await this.httpClient.get<LinkContactWithCountExtListResponse>(`${this.baseUrl}/QuickLink_Load/${ownerId}/${userId}/${ownerType}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "ownerId - " + ownerId + "," + "userId - " + userId, "LinkGroupService", "quickLinkLoad") });
    return a;

  }

  async quickLinkUpdate(encryptedUser: string, selectedLink: number, ownerID: number, clpUserID: number, relationShip: string, ownerType: eNoteOwnerType): Promise<LinkContactWithCountExtListResponse | void> {
    const a = await this.httpClient.get<LinkContactWithCountExtListResponse>(`${this.baseUrl}/QuickLink_Update/${selectedLink}/${ownerID}/${clpUserID}/${relationShip}/${ownerType}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "ownerID - " + ownerID, "LinkGroupService", "quickLinkUpdate") });
    return a;

  }

  async linkLoad(encryptedUser: string, linkId: number): Promise<ModelLink | void> {
    const a = await this.httpClient.get<ModelLink>(`${this.baseUrl}/Link_Load/${linkId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "linkId - " + linkId, "LinkGroupService", "linkLoad") });
    return a;

  }
}
