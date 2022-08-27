import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { ContactFields, ContactFieldsResponse, ContactLimitedFields, ContactList, ContactListResponse, ContactListResponseLtd, ContactRestore, DisplaySettingResponse, DuplicateContactsContainer, Field, MergeDuplicateContacts, UserEmailListResponse } from '../models/contact.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';
import { SimpleResponse } from '../models/genericResponse.model';
import { ContactHistoryListResponse } from '../models/contactHistory.model';
import { SearchQueryResponse } from '../models/search.model';
import { ContactExportRequestResponse } from '../models/exportRequest.model';
import { ContactUploadFieldMapping, ContactUploadFieldMappingResponse, ContactUploadMoreFilters, ProcessStep2Resonse, UploadContactSummary } from '../models/contactExcelUpload';
import { UploadCompanyRespone } from '../models/uploadCompany.model';
import { UploadComppanyBulkActionResponse, UploadContactBulkAction, UploadContactBulkActionResponse, UploadContactVMResponse } from '../models/uploadContacts.model';
import { eClassCodes, eUploadContactActionToTake } from '../models/enum.model';
import {  UploadMappingResponse } from '../models/uploadMapping.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private baseUrl: string;
  private api: string = "api/Contact";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }


  async getContacts(encryptedUser: string, userId: number): Promise<ContactListResponse | void> {
    const a = await this.httpClient
      .get<ContactListResponse>(`${this.baseUrl}/Contact_Get/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "getContacts"); }); //toPromise();
    return a;
  }

  async getRecentContacts(encryptedUser: string, userId: number): Promise<ContactListResponse | void> {
    const a = await this.httpClient
      .get<ContactListResponse>(`${this.baseUrl}/ContactRecent_Get/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "getContacts"); }); //toPromise();
    return a;
  }

  async contactFields_Get_Configuration(encryptedUser: string, companyId: number, userId: number): Promise<ContactFieldsResponse | void> {
    const a = await this.httpClient
      .get<ContactFieldsResponse>(`${this.baseUrl}/ContactFields_Get_Configuration/${companyId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "contactFields_Get_Configuration"); }); //toPromise();
    return a;
  }

  async contactFields_Get(encryptedUser: string, contactID: number, companyId: number, userId: number): Promise<ContactFieldsResponse | void> {
    const a = await this.httpClient
      .get<ContactFieldsResponse>(`${this.baseUrl}/ContactFields_Get/${contactID}/${companyId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "contactFields_Get"); }); //toPromise();
    return a;
  }

  async updateContactFields(encryptedUser: string, contactFields: ContactFields, companyId: number, contactID: number, userId: number, transferConfirm: boolean, isMoreFieldsAdded: boolean): Promise<ContactFieldsResponse | void> {
    const a = await this.httpClient.post<ContactFieldsResponse>(`${this.baseUrl}/ContactFields_Update/${companyId}/${contactID}/${userId}/${transferConfirm}/${isMoreFieldsAdded}`, contactFields, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "updateContactFields"); });
    return a;
  }

  async ContactFields_UpdateConfiguration(encryptedUser: string, _displaySettingResponse: DisplaySettingResponse, clpCompanyId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<DisplaySettingResponse>(`${this.baseUrl}/ContactFields_UpdateConfiguration/${clpCompanyId}`, _displaySettingResponse, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "ContactFields_UpdateConfiguration"); });
    return a;
  }

  async contactHistory_Get(encryptedUser: string, contactId: number, userId: number): Promise<ContactHistoryListResponse | void> {
    const a = await this.httpClient
      .get<ContactHistoryListResponse>(`${this.baseUrl}/ContactHistory_Get/${contactId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "contactHistory_Get"); }); //toPromise();
    return a;
  }


  async getContactsLtdFields(encryptedUser: string, userId: number, selectedContactId: number): Promise<ContactListResponseLtd | void> {
    const a = await this.httpClient
      .get<ContactListResponseLtd>(`${this.baseUrl}/Contacts_GetLimitedFields/${userId}/${selectedContactId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId - " + userId + "selectedContactId - " + selectedContactId, "ContactService", "getContactsLtdFields"); }); //toPromise();
    return a;
  }

  async deleteContact(encryptedUser: string, contactId: number, userId: number, slurpyId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/Contact_Delete/${contactId}/${userId}/${slurpyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "contactId - " + contactId + "userId - " + userId + "slurpyId - " + slurpyId, "ContactService", "deleteContact"); }); //toPromise();
    return a;
  }

  async getEmailList(encryptedUser: string, userId: number): Promise<UserEmailListResponse | void> {
    const a = await this.httpClient
      .get<UserEmailListResponse>(`${this.baseUrl}/GetUserEmailList/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId - " + userId, "ContactService", "getEmailList"); }); //toPromise();
    return a;
  }

  async restoreContacts(encryptedUser: string, _contactRestore: ContactRestore, clpCompanyId: number,clpUserId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<DisplaySettingResponse>(`${this.baseUrl}/RestoreContacts/${clpUserId}/${clpCompanyId}`, _contactRestore, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "restoreContacts"); });
    return a;
  }

  async getContactsMapList(encryptedUser: string, clpUserId: number, clpCompanyId: number): Promise<ContactExportRequestResponse | void> {
    const a = await this.httpClient
      .get<ContactExportRequestResponse>(`${this.baseUrl}/Contact_Map_ExportRequesList/${clpUserId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "getContactsMapList"); }); //toPromise();
    return a;
  }


  async contactMapRequest(encryptedUser: string, queryResponse: SearchQueryResponse, mapTitle: string, clpCompanyId: number, clpUserId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/Contact_Map_Request/${mapTitle}/${clpUserId}/${clpCompanyId}`, queryResponse, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "contactMapRequest"); });
    return a;
  }

  async contactUploadExcel(encryptedUser: string, clpCompanyId: number, clpUserId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Contact_Upload_Excel/${clpCompanyId}/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "ContactService", "contactUploadExcel"); });
    return a;
  }

  async contactUploadProcessStep1(encryptedUser: string, fileName: string, clpCompanyId: number, clpUserId: number, selectedWorkSheet: string,): Promise<ContactUploadFieldMappingResponse | void> {
    const a = await this.httpClient
      .get<ContactUploadFieldMappingResponse>(`${this.baseUrl}/Contact_Upload_ProcessStep1/${fileName}/${clpCompanyId}/${clpUserId}/${selectedWorkSheet}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "fileName" + fileName + "clpCompanyId," + clpCompanyId + ",clpUserId" + clpUserId + ",selectedWorkSheet" + selectedWorkSheet, "ContactService", "contactUploadProcessStep1"); });
    return a;
  }

  async contactUploadProcessStep2(encryptedUser: string, clpUserId: number, uploadSessionId: number, clpCompanyId: number, fileName: string, selectedWorkSheet: string, uploadMappingID: number, ctUploadfielMapping: ContactUploadFieldMapping): Promise<ProcessStep2Resonse | void> {
    const a = await this.httpClient
      .post<ProcessStep2Resonse>(`${this.baseUrl}/Contact_Upload_ProcessStep2/${clpUserId}/${uploadSessionId}/${clpCompanyId}/${fileName}/${selectedWorkSheet}/${uploadMappingID}`, ctUploadfielMapping, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpUserId" + clpUserId + ",uploadSessionId" + uploadSessionId + ",clpCompanyId" + clpCompanyId + ",fileName" + fileName + ",selectedWorkSheet" + selectedWorkSheet + ",uploadMappingID" + uploadMappingID, "ContactService", "contactUploadProcessStep2"); });
    return a;
  }
  async uploadMappingLoad(encryptedUser: string, uploadMappingID: number): Promise<UploadMappingResponse | void> {
    const a = await this.httpClient
      .get<UploadMappingResponse>(`${this.baseUrl}/UploadMapping_Load/${uploadMappingID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadMappingID" + uploadMappingID, "ContactService", "uploadMappingLoad"); });
    return a;
  }

  async uploadCompaniesListProcessed(encryptedUser: string, uploadSessionId: number, clpUserId: number): Promise<UploadCompanyRespone | void> {
    const a = await this.httpClient
      .get<UploadCompanyRespone>(`${this.baseUrl}/UploadCompanies_GetList_Processed/${uploadSessionId}/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId" + uploadSessionId + ",clpUserId" + clpUserId, "ContactService", "uploadCompaniesListProcessed"); });
    return a;
  }

  async uploadCompaniesDuplicateList(encryptedUser: string, uploadSessionId: number, clpUserId: number): Promise<UploadCompanyRespone | void> {
    const a = await this.httpClient
      .get<UploadCompanyRespone>(`${this.baseUrl}/UploadCompanies_GetList_Duplicate/${uploadSessionId}/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId" + uploadSessionId + ",clpUserId" + clpUserId, "ContactService", "uploadCompaniesDuplicateList"); });
    return a;
  }

  async uploadContactGetListProcessed(encryptedUser: string, uploadSessionId: number, clpcompanyId: number): Promise<UploadContactVMResponse | void> {
    const a = await this.httpClient
      .get<UploadContactVMResponse>(`${this.baseUrl}/UploadContact_GetList_Processed/${uploadSessionId}/${clpcompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId" + uploadSessionId + ",clpcompanyId" + clpcompanyId, "ContactService", "uploadContactGetListProcessed"); });
    return a;
  }

  async uploadContactGetListDuplicate(encryptedUser: string, uploadSessionId: number): Promise<UploadContactVMResponse | void> {
    const a = await this.httpClient
      .get<UploadContactVMResponse>(`${this.baseUrl}/UploadContact_GetList_Duplicate/${uploadSessionId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId" + uploadSessionId, "ContactService", "uploadContactGetListDuplicate"); });
    return a;
  }

  async runDupCheckWithUploadSummary(encryptedUser: string, clpCompanyId: number, uploadSessionId: number, clpUserId: number, duplicateScope: string): Promise<UploadContactSummary | void> {
    const a = await this.httpClient
      .get<UploadContactSummary>(`${this.baseUrl}/RunDupCheckWithUploadSummary/${clpCompanyId}/${uploadSessionId}/${clpUserId}/${duplicateScope}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId :" + clpCompanyId + " uploadSessionId :" + clpUserId + " clpUserId :" + uploadSessionId + "duplicateScope" + duplicateScope, "ContactService", "runDupCheckWithUploadSummary"); });
    return a;
  }

  async uploadContactEditBulk(encryptedUser: string, duplicateFlag: number, uploadContactBulkAction: UploadContactBulkAction): Promise<UploadContactBulkActionResponse | void> {
    const a = await this.httpClient
      .post<UploadContactBulkActionResponse>(`${this.baseUrl}/UploadContact_Edit_Bulk/${duplicateFlag}`, uploadContactBulkAction, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "duplicateFlag" + duplicateFlag, "ContactService", "uploadContactEditBulk"); });
    return a;
  }

  async contactUploadGetMoreFilters(encryptedUser: string, clpCompanyID: number): Promise<ContactUploadMoreFilters | void> {
    const a = await this.httpClient
      .get<ContactUploadMoreFilters>(`${this.baseUrl}/ContactUpload_Get_MoreFilters?clpCompanyID=${clpCompanyID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyID" + clpCompanyID, "ContactService", "contactUploadGetMoreFilters"); });
    return a;
  }

  async uploadContactTransferOwnerShip(encryptedUser: string, uploadSessionId: number, newManagerId: number, isProcessAll: boolean, duplicateFlag: number, contactIdsToTransfer: number[]): Promise<UploadContactBulkActionResponse | void> {
    const a = await this.httpClient.post<UploadContactBulkActionResponse>(`${this.baseUrl}/UploadContact_TransferOwnerShip/${uploadSessionId}/${newManagerId}/${isProcessAll}/${duplicateFlag}`, contactIdsToTransfer, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId -" + uploadSessionId + ",newManagerId -" + newManagerId + ",isProcessAll -" + isProcessAll + ",duplicateFlag" + duplicateFlag, "ContactService", "uploadContactTransferOwnerShip"); });
    return a;
  }

  async uploadContactUpdateAction(encryptedUser: string, contactIdsToTransfer: number[], isProcessAll: boolean, uploadSessionId: number, duplicateFlag: number, eUploadAction: eUploadContactActionToTake): Promise<UploadContactBulkActionResponse | void> {
    const a = await this.httpClient.post<UploadContactBulkActionResponse>(`${this.baseUrl}/UploadContact_Update_Action/${isProcessAll}/${uploadSessionId}/${duplicateFlag}/${eUploadAction}`, contactIdsToTransfer, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "isProcessAll -" + isProcessAll + ",uploadSessionId -" + uploadSessionId + ",duplicateFlag -" + duplicateFlag + ",eUploadAction" + eUploadAction, "ContactService", "uploadContactUpdateAction"); });
    return a;
  }

  async uploadCompanyUpdateAction(encryptedUser: string, CompanyIdsTo: number[], isProcessAll: boolean, uploadSessionId: number, duplicateFlag: number, eUploadAction: eUploadContactActionToTake): Promise<UploadComppanyBulkActionResponse | void> {
    const a = await this.httpClient.post<UploadComppanyBulkActionResponse>(`${this.baseUrl}/UploadCompany_Update_Action/${isProcessAll}/${uploadSessionId}/${duplicateFlag}/${eUploadAction}`, CompanyIdsTo, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "isProcessAll -" + isProcessAll + ",uploadSessionId -" + uploadSessionId + ",duplicateFlag -" + duplicateFlag + ",eUploadAction" + eUploadAction, "ContactService", "uploadCompanyUpdateAction"); });
    return a;
  }

  async uploadContactProcessStep4Load(encryptedUser: string, uploadSessionId: number, clpcompanyId: number): Promise<ProcessStep2Resonse | void> {
    const a = await this.httpClient.get<ProcessStep2Resonse>(`${this.baseUrl}/UploadContact_ProcessStep4_Load/${uploadSessionId}/${clpcompanyId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId -" + uploadSessionId + ",clpcompanyId -" + clpcompanyId, "ContactService", "uploadContactProcessStep4Load"); });
    return a;
  }

  async processStep4UploadContacts(encryptedUser: string, uploadSessionId: number, clpcompanyId: number, uploadMappingId: number, isSMSoptIn: boolean, noteTyeCode: number, clpUserID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SimpleResponse>(`${this.baseUrl}/ProcessStep4_UploadContacts/${uploadSessionId}/${clpcompanyId}/${uploadMappingId}/${isSMSoptIn}/${noteTyeCode}/${clpUserID}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "uploadSessionId -" + uploadSessionId + ",clpcompanyId -" + clpcompanyId + ",uploadMappingId -" + uploadMappingId + ",isSMSoptIn -" + isSMSoptIn + ",noteTyeCode -" + noteTyeCode + ",clpUserID -" + clpUserID, "ContactService", "processStep4UploadContacts"); });
    return a;
  }

  async duplicateContactSearch(encryptedUser: string, queryResponse: SearchQueryResponse, clpUserID: number, clpcompanyId: number): Promise<DuplicateContactsContainer | void> {
    const a = await this.httpClient.post<DuplicateContactsContainer>(`${this.baseUrl}/DuplicateContact_Search/${clpUserID}/${clpcompanyId}`, queryResponse, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, ",clpcompanyId -" + clpcompanyId + ",uploadMappingId -" + ",clpUserID -" + clpUserID, "ContactService", "duplicateContactSearch"); });
    return a;
  }

  /*Manage Duplicate Page*/

  async duplicateMergeContacts(encryptedUser: string, mergeDuplicateContacts: MergeDuplicateContacts, clpUserID: number, slurpyID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/Manage_Dups_ProcessMerge/${clpUserID}/${slurpyID}`, mergeDuplicateContacts, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, ",slurpyID -" + slurpyID + ",mergeDuplicateContacts -" + ",clpUserID -" + clpUserID, "ContactService", "duplicateMergeContacts"); });
    return a;
  }
  /*Manage Duplicate Page*/


  async contactFieldTitleUpdate(encryptedUser: string, clpCompanyID: number, classCodeTile: string, eClassCode: eClassCodes): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SimpleResponse>(`${this.baseUrl}/ContactField_ClassCodeTitle_Update/${clpCompanyID}/${classCodeTile}/${eClassCode}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser, "ContactService", "contactFieldTitleUpdate") });
    return a;

  }


}
