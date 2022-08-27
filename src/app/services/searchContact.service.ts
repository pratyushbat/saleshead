import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';

import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

import { ContactList, ContactListResponse } from '../models/contact.model';
import { Item, Search, SearchItem, SearchItemListResponse, SearchListResponse, SearchQuery, SearchQueryResponse } from '../models/search.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { isNullOrUndefined } from 'util';
import { CompanyListResponse } from '../models/company.model';


@Injectable({
  providedIn: 'root'
})

export class SearchContactService {

  private baseUrl: string;
  private baseUrlCompany: string;
  private baseUrlLead: string;
  private api: string = "api/Search";
  private apiComp: string = "api/SearchCompany";
  private apiLead: string = "api/LeadSetting";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
    this.baseUrlCompany = _baseUrl + this.apiComp;
    this.baseUrlLead = _baseUrl + this.apiLead;
  }


  async getSearchFields(encryptedUser: string, companyId: number): Promise<SearchItemListResponse | void> {
    const a = await this.httpClient
      .get<SearchItemListResponse>(`${this.baseUrl}/Search_Filter_GET/${companyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "getSearchFields"); });
    return a;
  }

  async getCompanySearchFields(encryptedUser: string, userId: number, companyId: number): Promise<SearchItemListResponse | void> {
    const a = await this.httpClient
      .get<SearchItemListResponse>(`${this.baseUrlCompany}/Search_Filter_GET/${companyId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "companyId" + companyId + "," + "userId" + userId , "SearchContactService", "getCompanySearchFields"); });
    return a;
  }
  async searchSaveComany(encryptedUser: string, searchQueryResponseCompany: SearchQueryResponse, userId: number): Promise<CompanyListResponse | void> {
    const a = await this.httpClient
      .post<any[]>(`${this.baseUrlCompany}/Search/${userId}`, searchQueryResponseCompany, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId" + userId, "SearchContactService", "searchSaveComany"); });
    return a;
  }

  getContactSearchAsync(encryptedUser: string, searchQuery: SearchQueryResponse, isArchive?: boolean): Observable<ContactListResponse | void> {
    var a;
    if (!isNullOrUndefined(isArchive)) {
      a = this.httpClient.post<SearchQueryResponse>(`${this.baseUrl}/ContactSearch/${isArchive}`, searchQuery, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(
        delayedRetryHttp(),
        catchError(error => this._utilityService.handleErrors(error, null, "", "SearchContactService", "getContactSearchAsync")),
      );
    }
    else {
       a = this.httpClient.post<SearchQueryResponse>(`${this.baseUrl}/ContactSearch`, searchQuery, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(
        delayedRetryHttp(),
        catchError(error => this._utilityService.handleErrors(error, null, "", "SearchContactService", "getContactSearchAsync")),
      );

    }

    return a;
    //  .pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "getContactSearchAsync"); });
    //return a;
  }

  async SavedSearchQueries_Update(encryptedUser: string, searchQuery: SearchQueryResponse, userID: number, queryId: number, savedQueryName: string): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SearchQueryResponse>(`${this.baseUrl}/SavedSearchQueries_Update/${userID}/${queryId}/${encodeURIComponent(savedQueryName)}`, searchQuery, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "SavedSearchQueries_Update"); });
    return a;
  }

  async executeSavedQuery(encryptedUser: string, queryId: number, isArchive?: boolean): Promise<ContactListResponse | void> {
    var a;
    if (!isNullOrUndefined(isArchive)) {
       a = await this.httpClient
         .get<ContactListResponse>(`${this.baseUrl}/ExecuteSavedQuery/${queryId}/${isArchive}`, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + encryptedUser
          })
         }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "executeSavedQuery"); });
    }
    else {
       a = await this.httpClient
        .get<ContactListResponse>(`${this.baseUrl}/ExecuteSavedQuery/${queryId}`, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + encryptedUser
          })
        }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "executeSavedQuery"); });
    }   
    return a;
  }

  async getSavedSearhById(encryptedUser: string, queryId: number): Promise<SearchQueryResponse | void> {
    const a = await this.httpClient
      .get<SearchQueryResponse>(`${this.baseUrl}/GetSavedSearhById/${queryId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "getSavedSearhById"); });
    return a;
  }

  async savedSearchQueries_Delete(encryptedUser: string, userID: number, queryId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SearchQueryResponse>(`${this.baseUrl}/DeleteSavedSearhById/${queryId}/${userID}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "SearchContactService", "SavedSearchQueries_Update"); });
    return a;
  }

  async getLeadSearchFields(encryptedUser: string, userId: number, companyId: number): Promise<SearchItemListResponse | void> {
    const a = await this.httpClient
      .get<SearchItemListResponse>(`${this.baseUrlLead}/LeadSearch_Filter_GET/${companyId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "companyId" + companyId + "," + "userId" + userId, "SearchContactService", "getLeadSearchFields"); });
    return a;
  }

  async getContactSearchData(encryptedUser: string, userId: number, search: Search): Promise<SearchListResponse | void> {
    const a = await this.httpClient
      .post<SearchListResponse>(`${this.baseUrl}/GetSearchData/${userId}`, search, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId" + userId, "SearchContactService", "getContactSearchData"); });
    return a;
  }
}
