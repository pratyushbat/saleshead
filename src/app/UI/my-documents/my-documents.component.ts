import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process } from '@progress/kendo-data-query';
import { empty } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { ClpdocDocument, SelectedDocumentId } from '../../models/clpDocDocument.model';
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { Document } from '../../models/document';
import { eFeatures } from '../../models/enum.model';
import { SimpleResponse } from '../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { MyDocumentService } from '../../services/my-document.service';
import { NotificationService } from '../../services/notification.service';
import { GridConfigurationService } from '../../services/shared/gridConfiguration.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-my-documents',
    templateUrl: './my-documents.component.html',
  styleUrls: ['./my-documents.component.css'],
  providers: [GridConfigurationService]
})
export class MyDocumentsComponent {

  baseUrl: string;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  gridHeight;

  documentList: ClpdocDocument[];
  initDocumentList: ClpdocDocument[];
  documentData: ClpdocDocument;
  contactDocConfig;
  selectedId: number = -1;
  responseMessage: string;
  isEditFile: boolean = false;
  isResponseMessage: boolean = false;
  isEditDocument: boolean = false;

  public mySelection: number[] = [];
  soUrl: any;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'documentType', title: 'Type', width: '40' },
    { field: 'documentName', title: '', width: '250' },
    { field: 'documentCategory', title: '', width: '70' },
    { field: 'location', title: 'Location', width: '250' },
    { field: 'documentLength', title: 'Size', width: '120' },
    { field: 'userName', title: 'User', width: '120' },
    { field: 'dtCreated', title: 'Created', width: '150' },
    { field: 'isShared', title: 'Shared', width: '90' },
    { field: 'update', title: '  ', width: '90' },
  ];
  reorderColumnName: string = 'documentType,documentName,documentCategory,location,documentLength,userName,dtCreated,isShared,update';
  columnWidth: string = 'documentType:40,documentName:250,documentCategory:70,location:250,documentLength:120,userName:120,dtCreated:150,isShared:90,update:90';
  arrColumnWidth: any[] = ['documentType:40,documentName:250,documentCategory:70,location:250,documentLength:120,userName:120,dtCreated:150,isShared:90,update:90'];
    mobileColumnNames: string[];
  constructor(@Inject('BASE_URL') _baseUrl: string,
    private _router: Router,
    private _notifyService: NotificationService,
    public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    public _myDocumentService: MyDocumentService,
    private _utilityService: UtilityService,  ) {
    this.gridHeight = this._localService.getGridHeight('499px');
    this._localService.isMenu = true;
    this.baseUrl = _baseUrl;
  }
  apiResponse(event) {
    if (!isNullOrUndefined(event.body)) {
      this.getMyDocumentList(-1);
      this.getMyDocumentsConfig();
      if ($(window).width() < 768)
        this.contactDocConfig.theme = '';
      this.isResponseMessage = false;
    }
  }

  changeFileApiResponse(event) {
    if (!isNullOrUndefined(event.body)) {
      this.getMyDocumentList(this.documentData.documentId); 
      this.getMyDocumentsConfig();
      if ($(window).width() < 768)
        this.contactDocConfig.theme = '';
      this.isEditFile = true;
      this.getMyDocumentList(-1);
    }
  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.None)
      .then(async (result: UserResponse) => {
        if (result) {
        this.userResponse = UtilityService.clone(result);
        if (!isNullOrUndefined(this.userResponse)) {
          if (!isNullOrUndefined(this.userResponse?.user)) {
            this.user = this.userResponse.user;
            this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
            this.getMyDocumentsConfig();
            if ($(window).width() < 768)
              this.contactDocConfig.theme = '';
            this.showSpinner = false;
          }
        }
        this.showSpinner = false;
      }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'my_documents_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('my_documents_grid').subscribe((value) => this.getMyDocumentList(-1)));

  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'my_documents_grid').subscribe((value) => this.getGridConfiguration());
  }

  gotoLink(columnName, dataItem) {
    var url = this.soUrl;
    if (columnName) {
      switch (columnName) {
        case "address-card":
        case "name": {
          if (this.user.timeZoneWinId != 0)
            this._router.navigate(['/contact', dataItem.cLPUserID, dataItem.contactID]);
          else {
            if (confirm("First , Please select your timezone!!!"))
              this._router.navigate(['/edit-profile', dataItem.cLPUserID]);
            else
              return;
          }
          break;
        }
        case "userName": {
          this._router.navigate(['/edit-profile', dataItem.cLPUserID]);
          break;
        }
        default: {
          break;
        }
      }
    }
  }
  onAction(name: string) {
    if (this.mySelection?.length) {
      let selectedDocumentId: SelectedDocumentId[] = this.mySelection.map(function (e) {
        return { documentId: e };
      });
      switch (name) {
        case 'Share':
          this.shareDocuments(selectedDocumentId);
          break;
        case 'Unshare':
          this.unShareDocuments(selectedDocumentId);
          break;
        case 'Delete':
          this.deleteDocuments(selectedDocumentId);
          break;
      }
    }
    else
      this._notifyService.showWarning('There were no documents checked.', "");
  }
  async getMyDocumentList(documentId) {
    this.showSpinner = true;
    await this._myDocumentService.getMyDocumentsList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, documentId)
      .then(async (result: ClpdocDocument[]) => {
        if (result) {
          if (documentId == -1)
            this.documentList = UtilityService.clone(result);
          else
            this.documentData = UtilityService.clone(result)[0];
          this.initDocumentList = this.documentList;
          this.showSpinner = false;
          this.selectedId = -1;
        }
        if (!isNullOrUndefined(this._gridCnfgService)) {
          this._gridCnfgService.iterateConfigGrid(this.documentList, "my_documents_grid");
          this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('my_documents_grid');
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async shareDocuments(selectedDocumentId) {
    this.showSpinner = true;
    await this._myDocumentService.shareDocuments(this.encryptedUser, selectedDocumentId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.responseMessage = response.messageString;
          this.isResponseMessage = true;
          this.showSpinner = false;
          this.mySelection = [];
          this.getMyDocumentList(-1);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async deleteDocuments(selectedDocumentId) {
    this.showSpinner = true;
    await this._myDocumentService.deleteDocuments(this.encryptedUser, selectedDocumentId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.responseMessage = response.messageString;
          this.isResponseMessage = true;
          this.showSpinner = false;
          this.mySelection = [];
          this.getMyDocumentList(-1);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async unShareDocuments(selectedDocumentId) {
    this.showSpinner = true;
    await this._myDocumentService.unShareDocuments(this.encryptedUser, selectedDocumentId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.responseMessage = response.messageString;
          this.isResponseMessage = true;
          this.showSpinner = false;
          this.mySelection = [];
          this.getMyDocumentList(-1);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async downloadDocuments(selectedDocumentId) {
    this.showSpinner = true;
    await this._myDocumentService.downloadDocuments(this.encryptedUser, selectedDocumentId)
      .then(async (result: Document[]) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.showSpinner = false;
          this.mySelection = [];
          var fileType = response[0].documentName.split('.');
          const file = new Blob([response[0].bytes], { type: fileType[1] });
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(file);
          link.download = response[0].documentName;
          link.click();
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  editDocument(item) {
    this.isEditDocument = true;
    this.isEditFile = false;
    this.isResponseMessage = false;
    this.documentData = item;
    this.contactDocConfig.uploadAPI.url = this.baseUrl + 'api/Document/ChangeFile/' + this.user.cLPCompanyID + '/' + this.user.cLPUserID + '/' + item.documentId
  }

  getMyDocumentsConfig() {
    this.contactDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 10,
      uploadAPI: {
        url: this.baseUrl + 'api/Document/QuickFileUpload/'+this.user.cLPCompanyID + '/' + this.user.cLPUserID ,
        headers: {
        },
      },
      formatsAllowed: '.jpg, .png, .eps, .jpeg, .gif, .pdf, .txt, .wpd, .doc, .docx, .xlsx, .csv',
      multiple: false,
      replaceTexts: {
        selectFileBtn: 'Select',
        resetBtn: 'Reset',
        uploadBtn: 'Save',
        afterUploadMsg_success: 'Successfully Uploaded!',
        afterUploadMsg_error: 'Upload Failed!',
      }
    }
  }
  getDoumentListByDropdown(e) {

  }

  onDocumentsFilter(inputValue: number): void {
    if (inputValue == -1)
      this.documentList = this.initDocumentList;
    else {
      this.documentList = process(this.initDocumentList, {
        filter: {
          logic: "or",
          filters: [
            { field: 'documentCategory', operator: 'contains', value: inputValue },
          ],
        }
      }).data;
    }
    this.dataBinding.skip = 0;
  }
}
