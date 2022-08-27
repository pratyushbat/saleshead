import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { CustomActionButtonResponse, CustomActionDD, CustomActionDDResponse, CustomActionScreen, CustomActionScreenResponse, CustomButton } from '../models/customAction.model';
import { LoadAutomationProcessDD, LoadCustomActionButton } from '../models/campaignTemplate.model';

@Injectable({
  providedIn: 'root'
})
export class CustomActionService {
  private baseUrl: string;
  private api: string = "api/CustomAction";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async getCustomActionList(encryptedUser: string, clpCompanyId: number, cLPUserId: number): Promise<CustomActionScreenResponse | void> {
    const a = await this.httpClient
      .get<CustomActionScreenResponse>(`${this.baseUrl}/CustomActionScreen_Get/${encryptedUser}/${clpCompanyId}/${cLPUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "CustomActionService", "getCustomActionList"); });
    return a;
  }
  async getCustomActionLoad(encryptedUser: string, customActionScreenID: number): Promise<CustomActionScreen | void> {
    const a = await this.httpClient
      .get<CustomActionScreen>(`${this.baseUrl}/CustomActionScreen_Load/${customActionScreenID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customActionScreenID - " + customActionScreenID, "CustomActionService", "getCustomActionLoad"); });
    return a;
  }
  async saveCustomAction(encryptedUser: string, CustomActionScreen: CustomActionScreen): Promise<CustomActionScreenResponse | void> {
    const a = await this.httpClient.post<CustomActionScreenResponse>(`${this.baseUrl}/CustomActionScreen_Save`, CustomActionScreen, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + CustomActionScreen, "CustomActionService", "saveCustomAction") });
    return a;
  }
  async getCustomActionDelete(encryptedUser: string, customActionScreenID: number): Promise<CustomActionScreenResponse | void> {
    const a = await this.httpClient
      .get<CustomActionScreenResponse>(`${this.baseUrl}/CustomActionScreen_Delete/${customActionScreenID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customActionScreenID - " + customActionScreenID, "CustomActionService", "getCustomActionDelete"); });
    return a;
  }

  async getCustomActionButtonList(encryptedUser: string, customActionScreenID: number): Promise<CustomButton[] | void> {
    const a = await this.httpClient
      .get<CustomButton[]>(`${this.baseUrl}/CustomActionButton_Get/${customActionScreenID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customActionScreenID - " + customActionScreenID, "CustomActionService", "getCustomActionButtonList"); });
    return a;
  }
  async getCustomActionButtonLoad(encryptedUser: string, customButtonId: number): Promise<CustomButton | void> {
    const a = await this.httpClient
      .get<CustomButton>(`${this.baseUrl}/CustomActionButton_Load/${customButtonId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customButtonId - " + customButtonId, "CustomActionService", "getCustomActionButtonLoad"); });
    return a;
  }
  async saveCustomActionButton(encryptedUser: string, CustomButton: CustomButton): Promise<CustomActionButtonResponse | void> {
    const a = await this.httpClient.post<CustomActionButtonResponse>(`${this.baseUrl}/CustomActionButton_Save`, CustomButton, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + CustomButton, "CustomActionService", "saveCustomActionButton") });
    return a;
  }
  async getCustomActionButtonDelete(encryptedUser: string, customButtonId: number): Promise<CustomActionButtonResponse | void> {
    const a = await this.httpClient
      .get<CustomActionButtonResponse>(`${this.baseUrl}/CustomActionButton_Delete/${customButtonId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customButtonId - " + customButtonId, "CustomActionService", "getCustomActionButtonDelete"); });
    return a;
  }
  async getCustomActionDropdownItemList(encryptedUser: string, customButtonId: number): Promise<CustomActionDD[] | void> {
    const a = await this.httpClient
      .get<CustomActionDD[]>(`${this.baseUrl}/CustomActionDropdown_Get/${customButtonId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customButtonId - " + customButtonId, "CustomActionService", "getCustomActionDropdownItemList"); });
    return a;
  }
  async getCustomActionDropdownItemLoad(encryptedUser: string, customActionDdItemId: number): Promise<CustomActionDD | void> {
    const a = await this.httpClient
      .get<CustomActionDD>(`${this.baseUrl}/CustomActionDropdown_Load/${customActionDdItemId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customActionDdItemId - " + customActionDdItemId, "CustomActionService", "getCustomActionDropdownItemLoad"); });
    return a;
  }
  async saveCustomActionDdItem(encryptedUser: string, CustomDdItem: CustomActionDD): Promise<CustomActionDDResponse | void> {
    const a = await this.httpClient.post<CustomActionDDResponse>(`${this.baseUrl}/CustomActionDropdown_Save`, CustomDdItem, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "CustomDdItem - " + CustomDdItem, "CustomActionService", "saveCustomActionDdItem") });
    return a;
  }
  async getCustomActionDdItemDelete(encryptedUser: string, customActionDdItemId: number): Promise<CustomActionDDResponse | void> {
    const a = await this.httpClient
      .get<CustomActionDDResponse>(`${this.baseUrl}/CustomActionDropdown_Delete/${customActionDdItemId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "customActionDdItemId - " + customActionDdItemId, "CustomActionService", "getCustomActionDdItemDelete"); });
    return a;
  }
  async getCustomActionDropdown(encryptedUser: string, clpCompanyId: number, cLPUserId: number): Promise<LoadCustomActionButton | void> {
    const a = await this.httpClient
      .get<LoadCustomActionButton>(`${this.baseUrl}/AddBtnDDCLick_Load/${clpCompanyId}/${cLPUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "CustomActionService", "getCustomActionDropdown"); });
    return a;
  }

  async getCustomActionAutomationDropdown(encryptedUser: string, searchTitle: string, primarySecondary: string, clpCompanyId: number, cLPUserId: number): Promise<LoadAutomationProcessDD | void> {
    const a = await this.httpClient
      .get<LoadAutomationProcessDD>(`${this.baseUrl}/getAutomationProcessDDOnSearch/${searchTitle}/${primarySecondary}/${cLPUserId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "CustomActionService", "getCustomActionDropdown"); });
    return a;
  }
}
