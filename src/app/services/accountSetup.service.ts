import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AccountSetupListResponse, CLPLogListResponse, CLPLogParameters, CLPUserPref, CLPUserPrefList, UsersListsResponse, APIKey, APIKeyLoadResponse, GenerateKeyResponse, CLPUserDetails, CompanyModuleResponse } from '../models/accountInformation.model';
import { CLPOutlookUser, CLPOutlookUserResponse } from '../models/clpOutlookUser';
import { CLPTxn } from '../models/clpTxn.model';
import { SFAResponse, UserResourcesUsed } from '../models/clpuser.model';
import { AddUser_StepsResponse, ClpCompany, CompanyDisplaySettingResponse, CompanyFields, CompanyFieldsResponse, CompanyResponse, ddFieldRespone, UploadCompanyBulkAction, UserCompanyBulkAction, VMAddUser_MainviewResponse } from '../models/company.model';
import { CLPEmailDropbox, EmailDropboxSettingsResponse } from '../models/emailDropbox.model';
import { eClassCodes, eCompanySettings, eTicketCategory, eTicketStatus } from '../models/enum.model';
import { GenericRequest } from '../models/genericRequest.model';
import { GenericResponse, SimpleResponse } from '../models/genericResponse.model';
import { CLPSMTP, CLPSMTPResponse } from '../models/smtp.model';
import { DocumentStorage, DocumentStorageResponse } from '../models/storage.model';
import { Ticket, TicketListResponse } from '../models/ticket.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class AccountSetupService {

  private baseUrl: string;
  private baseUrlAccount: string;
  private api: string = "api/Company";
  private apiAccount: string = "api/Account";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
    this.baseUrlAccount = _baseUrl + this.apiAccount;
  }
  async getBillingSetup_MainView(encryptedUser: string, clpCompanyId: number, clpUserId: number): Promise<VMAddUser_MainviewResponse | void> {
    const http$ = await this.httpClient
      .get<VMAddUser_MainviewResponse>(`${this.baseUrlAccount}/AddUser_MainView_Get/${clpCompanyId}/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "getBillingSetup_MainView") });

    return http$;
  }

  async addUserBillingAddStep(encryptedUser: string, clpCompanyId: number): Promise<VMAddUser_MainviewResponse | void> {
    const http$ = await this.httpClient
      .get<AddUser_StepsResponse>(`${this.baseUrlAccount}/AddUser_Add_Step/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "addUserBillingAddStep") });

    return http$;
  }

  async addUserBillingContinueStep(encryptedUser: string, userCount: number, clpCompanyId: number): Promise<VMAddUser_MainviewResponse | void> {
    const http$ = await this.httpClient
      .get<AddUser_StepsResponse>(`${this.baseUrlAccount}/AddUser_Continue_Step/${userCount}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "addUserBillingAddStep") });

    return http$;
  }
  async placeOrderBilling(encryptedUser: string, clpCompanyId: number, userId: number, userCount: number): Promise<VMAddUser_MainviewResponse | void> {
    const http$ = await this.httpClient
      .get<AddUser_StepsResponse>(`${this.baseUrlAccount}/ProcessNewUsers/${clpCompanyId}/${userId}/${userCount}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "," + "userId - " + userId + "," + "userCount - " + userCount, "AccountSetupService", "placeOrderBilling") });

    return http$;
  }

  async getClpCompany(encryptedUser: string, clpCompanyId: number): Promise<CompanyResponse | void> {
    const http$ = await this.httpClient
      .get<CompanyResponse>(`${this.baseUrl}/ClpCompany_Get/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "getAccountInformation") });

    return http$;
  }

  async CLPCompany_Update(encryptedUser: string, clpCompany: ClpCompany): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/CLPCompany_Update`, clpCompany, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompany - " + clpCompany, "AccountSetupService", "CLPCompany_Update"); });
    return a;
  }

  async companyFields_GetConfiguration(encryptedUser: string, clpCompanyId: number, userId: number): Promise<CompanyFieldsResponse | void> {
    const http$ = await this.httpClient
      .get<CompanyFieldsResponse>(`${this.baseUrl}/CompanyFields_Get_Configuration/${clpCompanyId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "userId - " + userId, "AccountSetupService", "companyFields_GetConfiguration") });

    return http$;
  }
  async companyFields_Get(encryptedUser: string, companyId: number, clpCompanyId: number, userId: number): Promise<CompanyFieldsResponse | void> {
    const http$ = await this.httpClient
      .get<CompanyFieldsResponse>(`${this.baseUrl}/CompanyFields_Get/${companyId}/${userId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "companyId - " + clpCompanyId + "clpCompanyId - " + clpCompanyId + "userId - " + userId, "AccountSetupService", "companyFields_Get") });

    return http$;
  }

  async companyFields_Update(encryptedUser: string, companyFields: CompanyFields, clpCompanyId: number, clpuserID: number, isTransferConfirm: boolean = false): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/CompanyFields_Update/${clpCompanyId}/${clpuserID}/${isTransferConfirm}`, companyFields, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "," + "clpuserID - " + clpuserID + "," + "isTransferConfirm - " + isTransferConfirm, "AccountSetupService", "companyFields_Update") });

    return http$;
  }

  async companyFields_UpdateConfiguration(encryptedUser: string, displaySettingResponse: CompanyDisplaySettingResponse, clpCompanyId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/CompanyFields_UpdateConfiguration/${clpCompanyId}`, displaySettingResponse, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "companyFields_GetConfiguration") });

    return http$;
  }

  async companyBulkUpdateDDFieldsGet(encryptedUser: string, clpCompanyID: number): Promise<ddFieldRespone | void> {
    const a = await this.httpClient.get<ddFieldRespone>(`${this.baseUrl}/CompanyBulkupdate_ddFields_Get/${clpCompanyID}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpCompanyID - " + clpCompanyID + "userId - ", "AccountSetupService", "companyBulkUpdateDDFieldsGet") });
    return a;

  }

  async uploadCompanyEditBulk(encryptedUser: string,clpuserID: number, uploadCompanyBulkAction: UploadCompanyBulkAction): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/UploadCompany_Edit_Bulk/${clpuserID}`, uploadCompanyBulkAction, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + "clpuserID - " + clpuserID, "AccountSetupService", "uploadCompanyEditBulk") });

    return http$;
  }

  async companyBulkActionTransfer(encryptedUser: string,clpuserID: number, userCompanyBulkAction: UserCompanyBulkAction): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Company_BulkAction_Transfer/${clpuserID}`, userCompanyBulkAction, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + "clpuserID - " + clpuserID, "AccountSetupService", "companyBulkActionTransfer") });

    return http$;
  }

  async companyBulkDeleteByIds(encryptedUser: string,clpuserID: number, userCompanyBulkAction: UserCompanyBulkAction): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Company_Bulk_Delete_By_Ids/${clpuserID}`, userCompanyBulkAction, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + "clpuserID - " + clpuserID, "AccountSetupService", "companyBulkDeleteByIds") });

    return http$;
  }

  //For Account Controller
  async getAccountList(encryptedUser: string, genericRequest: GenericRequest): Promise<AccountSetupListResponse | void> {
    const http$ = await this.httpClient
      .post<AccountSetupListResponse>(`${this.baseUrlAccount}/Account_GetList`, genericRequest, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "genericRequest - " + genericRequest, "AccountSetupService", "getAccountList") });

    return http$;
  }

  async deleteAccount(encryptedUser: string, clpCompanyId: number, clpUserId: number): Promise<AccountSetupListResponse | void> {
    const http$ = await this.httpClient
      .get<AccountSetupListResponse>(`${this.baseUrlAccount}/Account_Delete/${clpCompanyId}/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + " clpUserId - " + clpUserId, "AccountSetupService", "deleteAccount") });

    return http$;
  }
  async iphoneUserGetList(encryptedUser: string, clpCompanyId: number): Promise<UsersListsResponse | void> {
    const http$ = await this.httpClient
      .get<UsersListsResponse>(`${this.baseUrlAccount}/IphoneUserList_Get/clpCompanyId?clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "iphoneUserGetList") });
    return http$;
  }

  async iphoneUserSaveList(encryptedUser: string, cLPUserList: CLPUserDetails[]): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/CLPUser_Bulk_Update/`, cLPUserList, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser, "AccountSetupService", "iphoneUserSaveList") });

    return http$;
  }

  async iphoneUserSave(encryptedUser: string, cLPUserID: number, enableiPhone: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/CLPUser_EnableiPhone_Update/${cLPUserID}/${enableiPhone}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser, "AccountSetupService", "iphoneUserSaveList") });

    return http$;
  }

  async getUserPreferenceList(encryptedUser: string, genericRequest: GenericRequest, cLPCompanyID: number, intOfficeCode: number, intTeamCode: number, ePermissions: number, useAnd: boolean): Promise<CLPUserPrefList[] | void> {
    const http$ = await this.httpClient
      .post<CLPUserPrefList[]>(`${this.baseUrlAccount}/CLPUserPrefs_GetList/${cLPCompanyID}/${intOfficeCode}/${intTeamCode}/${ePermissions}/${useAnd}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + cLPCompanyID, "AccountSetupService", "getUserPreferenceList") });

    return http$;
  }

  //for Apply account transaction
  async saveCLPTxn(encryptedUser: string, clpTxn: CLPTxn, clpCompanyId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/CLPTxn_Save/${clpCompanyId}`, clpTxn, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "clpTxn - " + clpTxn, "AccountSetupService", "CLPTxn_Save") });

    return http$;
  }
  //for Apply account transaction

  async updateUserPreferenceList(encryptedUser: string, cLPUserPref: CLPUserPref): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrlAccount}/CLPUserPref_Update`, cLPUserPref, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "cLPUserPref - " + cLPUserPref, "AccountSetupService", "updateUserPreferenceList"); });
    return a;
  }

  //For Ticket
  async updateCreateTicket(encryptedUser: string, ticket: Ticket, currentUserId: number, sendEmail: number, clpCompanyId: number): Promise<TicketListResponse | void> {
    const http$ = await this.httpClient
      .post<TicketListResponse>(`${this.baseUrlAccount}/Ticket_Update/${currentUserId}/${sendEmail}/${clpCompanyId}`, ticket, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "currentUserId - " + currentUserId + "ticket - " + ticket, "AccountSetupService", "updateCreateTicket") });

    return http$;
  }

  async getTickets(encryptedUser: string, clpCompanyId: number, currentUserId: number): Promise<TicketListResponse | void> {
    const http$ = await this.httpClient
      .get<TicketListResponse>(`${this.baseUrlAccount}/Ticket_GetList/${clpCompanyId}/${currentUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "currentUserId - " + currentUserId, "AccountSetupService", "getTickets") });

    return http$;
  }

  async filterTickets(encryptedUser: string, clpCompanyId: number, ecat: any, eStatus: any): Promise<TicketListResponse | void> {
    const http$ = await this.httpClient
      .get<TicketListResponse>(`${this.baseUrlAccount}/Ticket_Filter/${clpCompanyId}/${ecat}/${eStatus}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "eCat - " + ecat + " eStatus - " + eStatus, "AccountSetupService", "getTickets") });

    return http$;
  }

  async deleteTicket(encryptedUser: string, ticketId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrlAccount}/Ticket_Delete/${ticketId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "ticketId - " + ticketId, "AccountSetupService", "deleteTicket") });

    return http$;
  }
  //For Ticket

  //For Outlook addin
  async getCLPOutlookUser(encryptedUser: string, clpCompanyId: number): Promise<CLPOutlookUserResponse | void> {
    const http$ = await this.httpClient
      .get<CLPOutlookUserResponse>(`${this.baseUrlAccount}/CLPOutlookUser_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "getCLPOutlookUser") });

    return http$;
  }

  async updateCLPOutlookUser(encryptedUser: string, cLPOutlookUser: CLPOutlookUser): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/CLPOutlookUser_Update`, cLPOutlookUser, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "cLPOutlookUser - " + cLPOutlookUser, "AccountSetupService", "updateCLPOutlookUser") });

    return http$;
  }
  //For Outlook addin

  //For Document Storage
  async getDocumentStorage(encryptedUser: string, clpCompanyId: number): Promise<DocumentStorageResponse | void> {
    const http$ = await this.httpClient
      .get<DocumentStorageResponse>(`${this.baseUrlAccount}/CLPCompany_DocStorage_Get/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "getDocumentStorage") });

    return http$;
  }

  async updateDocumentStorage(encryptedUser: string, cLPCompanyID: number, companyStorageLimit: number, userStorageLimit: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/CLPCompany_DocStorage_Update/${cLPCompanyID}/${companyStorageLimit}/${userStorageLimit}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + " cLPCompanyID - " + cLPCompanyID + " companyStorageLimit - " + companyStorageLimit, "AccountSetupService", "updateDocumentStorage") });

    return http$;
  }
  //For Document Storage

  //For Company Module
  async getCompany_SearchCountMsg(encryptedUser: string, clpCompanyId: number): Promise<CompanyModuleResponse | void> {
    const http$ = await this.httpClient
      .get<CompanyModuleResponse>(`${this.baseUrlAccount}/Company_SearchCount_LoadMsg/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpCompanyId - " + clpCompanyId, "AccountSetupService", "getCompany_SearchCountMsg") });

    return http$;
  }

  async updateCompanyModule(encryptedUser: string, cLPCompanyID: number, flag: number): Promise<CompanyModuleResponse | void> {
    const http$ = await this.httpClient
      .post<CompanyModuleResponse>(`${this.baseUrlAccount}/CompanyModule_Update/${cLPCompanyID}/${flag}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + " cLPCompanyID - " + cLPCompanyID + " flag - " + flag, "AccountSetupService", "updateCompanyModule") });

    return http$;
  }
  //For Company Module

  async getActivityLog(encryptedUser: string, reqParameters: CLPLogParameters): Promise<CLPLogListResponse | void> {
    const http$ = await this.httpClient
      .post<CLPLogListResponse>(`${this.baseUrlAccount}/ActivityLog_Getlist`, reqParameters, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "reqParameters - " + reqParameters, "AccountSetupService", "getActivityLog") });

    return http$;
  }

  async getApiSetting(encryptedUser: string, clpcompanyid: number): Promise<APIKeyLoadResponse | void> {
    const http$ = await this.httpClient
      .get<APIKeyLoadResponse>(`${this.baseUrlAccount}/APIKey_Load/${clpcompanyid}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpcompanyid - " + clpcompanyid, "AccountSetupService", "getApiSetting") });

    return http$;
  }

  async generateApiKey(encryptedUser: string): Promise<GenerateKeyResponse | void> {
    const http$ = await this.httpClient
      .get<GenerateKeyResponse>(`${this.baseUrlAccount}/Generate_Key`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser, "AccountSetupService", "generateApiKey") });

    return http$;
  }

  async deleteApiKey(encryptedUser: string, clpcompanyid: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrlAccount}/APIKey_Delete/${clpcompanyid}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpcompanyid - " + clpcompanyid, "AccountSetupService", "deleteApiKey") });

    return http$;
  }

  async updateApiSetting(encryptedUser: string, aPIKey: APIKey): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/APIKey_Update`, aPIKey, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "aPIKey - " + aPIKey, "AccountSetupService", "updateApiSetting") });

    return http$;
  }

  async getEmailDropboxList(encryptedUser: string, cLPCompanyID: number): Promise<EmailDropboxSettingsResponse | void> {
    const http$ = await this.httpClient
      .get<EmailDropboxSettingsResponse>(`${this.baseUrlAccount}/CLPEmailDropBox_GetList/${cLPCompanyID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpcompanyid - " + cLPCompanyID, "AccountSetupService", "getEmailDropboxList") });

    return http$;
  }

  async getEmailDropboxListByUser(encryptedUser: string, cLPUserID: number): Promise<EmailDropboxSettingsResponse | void> {
    const http$ = await this.httpClient
      .get<EmailDropboxSettingsResponse>(`${this.baseUrlAccount}/CLPEmailDropBox_LoadByCLPUser/${cLPUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "cLPUserID - " + cLPUserID, "AccountSetupService", "getEmailDropboxListByUser") });

    return http$;
  }

  async updateEmailDropbox(encryptedUser: string, cLPEmailDropbox: CLPEmailDropbox): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/CLPEmailDropBox_Update`, cLPEmailDropbox, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser, "AccountSetupService", "updateEmailDropbox") });

    return http$;
  }

  async deleteEmailDropboxList(encryptedUser: string, cLPEmailDropBoxID: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrlAccount}/CLPEmailDropBox_Delete/${cLPEmailDropBoxID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "cLPEmailDropBoxID - " + cLPEmailDropBoxID, "AccountSetupService", "deleteEmailDropboxList") });

    return http$;
  }

  //smtp
  async getClpSMTPList(encryptedUser: string, cLPCompanyID: number, cLPUserID: number): Promise<CLPSMTPResponse | void> {
    const http$ = await this.httpClient
      .get<CLPSMTPResponse>(`${this.baseUrlAccount}/CLPSMTP_GetList/${cLPCompanyID}/${cLPUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "cLPCompanyID - " + cLPCompanyID + "cLPUserID - " + cLPUserID, "AccountSetupService", "get_clpSMTPtList") });

    return http$;
  }

  async deleteClpSMTP(encryptedUser: string, clpSMPTPId: number, cLPUserID: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrlAccount}/CLPSMTP_Delete/${cLPUserID}/${cLPUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpSMPTPId - " + clpSMPTPId + "cLPUserID - " + cLPUserID, "AccountSetupService", "deleteClpSMTP") });

    return http$;
  }

  async updateClpSMTP(encryptedUser: string, cLPSMTP: CLPSMTP): Promise<CLPSMTP | void> {
    const http$ = await this.httpClient
      .post<CLPSMTP>(`${this.baseUrlAccount}/CLPEmailDropBox_Update`, cLPSMTP, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser, "AccountSetupService", "updateClpSMTP") });

    return http$;
  }
  //smtp
  async loadUsers(encryptedUser: string, clpcompnayId: number): Promise<SFAResponse | void> {
    const http$ = await this.httpClient
      .get<SFAResponse>(`${this.baseUrlAccount}/SFAUserList_Load/${clpcompnayId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpcompnayId - " + clpcompnayId, "AccountSetupService", "getUserListByCompanyID") });

    return http$;
  }

  async getUserResources(encryptedUser: string, clpUserId: number, clpCompanyId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrlAccount}/Admin_UserResourcesUsed_Get/clpUserId/clpCompanyId?clpUserId=${clpUserId}&clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpcompnayId - " + clpCompanyId + "clpUserId - " + clpUserId, "AccountSetupService", "getUserTransferData") });

    return http$;
  }

  async resetUser(encryptedUser: string, clpUserId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/Admin_UserReset/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpUserId - " + clpUserId, "AccountSetupService", "deleteUserTransferData") });

    return http$;
  }

  async transferUser(encryptedUser: string, clpCompanyId: number, clpUserId: number, newClpUserId: number, markText: string): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/Admin_UserTransfer/${clpCompanyId}/${clpUserId}/${newClpUserId}/${markText}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpCompanyId - " + clpCompanyId + "clpUserId - " + clpUserId + "newClpUserId - " + newClpUserId + "markText - " + markText, "AccountSetupService", "transferUserData") });

    return http$;
  }

  //Billing Info
  async upgradeStartStep(encryptedUser: string, clpCompanyId: number, userId: number): Promise<AddUser_StepsResponse | void> {
    const http$ = await this.httpClient
      .get<AddUser_StepsResponse>(`${this.baseUrlAccount}/UpgradeStart_Step/${clpCompanyId}/${userId}/`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "," + "userId - " + userId, "AccountSetupService", "upgradeStartStep") });

    return http$;
  }
  async upgradeConfirmStep(encryptedUser: string, clpCompanyId: number, userId: number): Promise<VMAddUser_MainviewResponse | void> {
    const http$ = await this.httpClient
      .get<AddUser_StepsResponse>(`${this.baseUrlAccount}/UpgradeConfirm_Continue_Step/${clpCompanyId}/${userId}/`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "," + "userId - " + userId, "AccountSetupService", "upgradeStartStep") });

    return http$;
  }

  async update_ImportSfa(newClpUserId: number, clpCompanyId: number, fromUserId: number, stitch: boolean, sfa: boolean, webform: boolean, html: boolean): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrlAccount}/Sfa_Update/${newClpUserId}/${clpCompanyId}/${fromUserId}/${stitch}/${sfa}/${webform}/${html}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + "newClpUserId - " + newClpUserId + "clpCompanyId - " + clpCompanyId + "fromUserId - " + fromUserId + "stitch - " + stitch + "sfa - " + sfa + "webform - " + webform + "html - " + html, "AccountSetupService", "update_ImportSfa") });

    return http$;
  }

  async companyFieldTitleUpdate(encryptedUser: string, clpCompanyID: number, classCodeTile: string, eCompanySettingCode: eCompanySettings): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SimpleResponse>(`${this.baseUrl}/CompanyField_ClassCodeTitle_Update/${clpCompanyID}/${classCodeTile}/${eCompanySettingCode}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpCompanyID - " + clpCompanyID + "classCodeTile - " + classCodeTile + "eCompanySettingCode - " + eCompanySettingCode, "AccountSetupService", "companyFieldTitleUpdate") });
    return a;

  }
}
