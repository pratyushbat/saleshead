import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { isNullOrUndefined } from 'util';
import { ClickTrackingResponse, filterUser } from '../../models/clickTracking.model';
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../models/enum.model';
import { Folder, FolderListResponse } from '../../models/folder.model';
import { SimpleResponse } from '../../models/genericResponse.model';
import { ImageDocument, SOImageDocument } from '../../models/imageDocument.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { ClickTrackingService } from '../../services/click-tracking.service';
import { ImageBankService } from '../../services/image-bank.service';
import { NotificationService } from '../../services/notification.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
import { UserService } from '../../services/user.service';

declare var $: any;

@Component({
  selector: 'app-image-bank',
  templateUrl: './image-bank.component.html',
  styleUrls: ['./image-bank.component.css']
})
export class ImageBankComponent {
  @ViewChild('bankUpload')
  private bankUpload: AngularFileUploaderComponent;

  baseUrl: string;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;

  folderList: Folder[];
  Userlist: filterUser[];
  documentList: ImageDocument[];
  public selectedDocument: ImageDocument;
  folderUpdate: Folder;
  soImageDocument = <SOImageDocument>{};
  selectedFolderId: number;
  selectedFolder: Folder;
  selectedImagePreview: string;

  contactDocConfig;
  imageBankForm: FormGroup;
  documentForm: FormGroup;
  public isEnableEdit: boolean = false;
  public isShowDocument: boolean = false;
  public isReplaceDocument: boolean = false;
  public isShowUpdate: boolean = false;
  public isEditOrder: boolean = false;
  public isdocTitleEdit: boolean = false;
  public isShowDocList: boolean = false;
  public editFolderId: number = -1;
  public editDocumentId: number = -1;
  constructor(@Inject('BASE_URL') _baseUrl: string,
    private _notifyService: NotificationService,
    private fb: FormBuilder,
    private _imageBankService: ImageBankService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _clickTrackingService: ClickTrackingService,
    private userSvc: UserService,
    private _router: Router,) {
    this._localService.isMenu = true;
    this.baseUrl = _baseUrl;
  }

  apiResponse(event) {
    if (!isNullOrUndefined(event.body)) {
      this.getDocumentList(this.selectedFolderId);
      this._notifyService.showSuccess(event.body.messageString, "", 3000);
    }
  }
  ngOnInit(): void {
    this.documentForm = this.prepareDocumentForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getUserList();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ImageBank)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.getTextMsgConfig();
              if ($(window).width() < 768)
                this.contactDocConfig.theme = '';
              if (this.user?.userRole <= eUserRole.Administrator) {
                if (this.roleFeaturePermissions?.view == false)
                  this._router.navigate(['/unauthorized'], { state: { isMenu: true } });
              }
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

  prepareImageBankForm() {
    return this.fb.group({
      folderName: new FormControl('', [Validators.required]),
      isShared: new FormControl(false),
    });
  }

  prepareDocumentForm() {
    return this.fb.group({
      imageWidth: new FormControl(500),
      isForceResize: new FormControl(false),
    });
  }

  patchFormControlValue(dataItem) {
    var textMsgTemplateData = dataItem;
    for (let key in textMsgTemplateData) {
      let value = textMsgTemplateData[key];
      if (this.imageBankForm.get(key))
        this.imageBankForm.get(key).setValue(value);
    }
  }

  async getUserList() {
    this.showSpinner = true;
    await this._clickTrackingService.getClickTrackingLoad(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, 0)
      .then(async (result: ClickTrackingResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.Userlist = response.filterUser;
          this.getImageBankFolderList();
          this.showSpinner = false;
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

  async getImageBankFolderList() {
    this.showSpinner = true;
    await this._imageBankService.getImageBankFolderList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, true)
      .then(async (result: Folder[]) => {
        if (result) {
          this.folderList = UtilityService.clone(result);
          this.folderList.forEach(x => {
            if (x.cLPUserID != this.user.cLPUserID)
              x.userName = this.Userlist.filter(item => item.key == x.cLPUserID)[0]?.value;
          })
          if (this.folderList.length <= 0)
            this.addDefaultFolder();
          this.showSpinner = false;
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

  async imageBankFolderDelete(dataItem) {
    this.showSpinner = true;
    await this._imageBankService.deleteImageBankFolder(this.encryptedUser, dataItem.folderID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.isEnableEdit = false;
          this.getImageBankFolderList();
          this.showSpinner = false;
          this._notifyService.showSuccess("Folder deleted successfully", "", 3000);
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

  async imageBankFolderUpdate(dataItem) {
    this.showSpinner = true;
    await this._imageBankService.updateImageBankFolder(this.encryptedUser, dataItem)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          await this.getImageBankFolderList();
          this.isEnableEdit = false;
          if (dataItem.folderID == 0 && dataItem.folderName != 'Default')
            this.getDocumentList(this.folderList[Object.keys(this.folderList).length - 1].folderID);
          this.showSpinner = false;
          this._notifyService.showSuccess("Folder updated successfully", "", 3000);
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

  addFolder() {
    this.folderUpdate = <Folder>{};
    this.folderUpdate.cLPCompanyID = this.user.cLPCompanyID;
    this.folderUpdate.cLPUserID = this.user.cLPUserID;
    this.folderUpdate.folderID = 0;
    this.folderUpdate.folderName = 'New Folder';
    this.folderUpdate.isShared = false;
    this.selectedFolder = this.folderUpdate;
    this.imageBankFolderUpdate(this.folderUpdate);
  }
  addDefaultFolder() {
    this.folderUpdate = <Folder>{};
    this.folderUpdate.cLPCompanyID = this.user.cLPCompanyID;
    this.folderUpdate.cLPUserID = this.user.cLPUserID;
    this.folderUpdate.folderID = 0;
    this.folderUpdate.folderName = 'Default';
    this.folderUpdate.isShared = false;
    this.selectedFolder = this.folderUpdate;
    this.imageBankFolderUpdate(this.folderUpdate);
  }
  async getDocumentList(folderID) {
    this.showSpinner = true;
    this.selectedFolderId = folderID;
    await this._imageBankService.getDocumentList(this.encryptedUser, this.selectedFolderId)
      .then(async (result: ImageDocument[]) => {
        if (result) {
          this.documentList = UtilityService.clone(result);
          this.isShowDocument = true;
          this.isReplaceDocument = false;
          this.isShowUpdate = false;
          this.isShowDocList = true;
          if (isNullOrUndefined(this.documentList) || this.documentList.length <= 0) {
            this.setDocument();
            this.isShowDocList = false;
          }
          if (this.documentList.length > 0) {
            for (let i = 1; i <= this.documentList.length; i++) {
              this.documentList[i - 1].sOrder = i;
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
        this.showSpinner = false;
      });
  }

  async documentUpdate(item) {
    this.showSpinner = true;
    await this._imageBankService.updateDocumentList(this.encryptedUser, item)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showSpinner = false;
          this.isdocTitleEdit = false;
          this.getDocumentList(item.folderID);
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

  async documentDelete(dataItem) {
    this.showSpinner = true;
    await this._imageBankService.deleteDocument(this.encryptedUser, dataItem.documentId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showSpinner = false;
          this.isdocTitleEdit = false;
          this.getDocumentList(dataItem.folderID);
          this._notifyService.showSuccess("Document deleted successfully", "", 3000);
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

  async documentOrderUpdate(item) {
    this.showSpinner = true;
    await this._imageBankService.updateDocumentOrder(this.encryptedUser, item)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showSpinner = false;
          this.isdocTitleEdit = false;
          this.isEditOrder = false;
          this.getDocumentList(this.selectedFolderId);
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

  docTitleEdit(id) {
    this.isdocTitleEdit = true;
    this.editDocumentId = id;
  }

  setDocument() {
    this.isShowUpdate = true;
    this.getTextMsgConfig();
    if ($(window).width() < 768)
      this.contactDocConfig.theme = '';
    this.contactDocConfig.uploadAPI.url = this.baseUrl + 'api/ImageBank/File_Uploaded' + '?documentId=' + 0 + '&clpcompanyId=' + this.user.cLPCompanyID + '&clpuserId=' + this.user?.cLPUserID + '&folderid=' + this.selectedFolderId + '&cbForceResize=' + this.documentForm.controls.isForceResize.value;
    this.documentForm = this.prepareDocumentForm();
  }

  setOrder() {
    this.isEditOrder = true;
    this.isShowUpdate = false;
  }

  documentReplace(item) {
    this.isShowDocument = false;
    this.isReplaceDocument = true;
    this.selectedImagePreview = item.imagePreview;
    this.getTextMsgConfig();
    if ($(window).width() < 768)
      this.contactDocConfig.theme = '';
    this.contactDocConfig.uploadAPI.url = this.baseUrl + 'api/ImageBank/File_Uploaded' + '?documentId=' + item.documentId + '&clpcompanyId=' + this.user.cLPCompanyID + '&clpuserId=' + this.user?.cLPUserID + '&folderid=' + this.selectedFolderId + '&cbForceResize=' + false;
    this.contactDocConfig.replaceTexts.uploadBtn = 'Replace';
  }

  submitImageBankFolder(dataItem) {
    if (this.imageBankForm.valid) {
      this.folderUpdate = dataItem;
      this.folderUpdate.folderName = this.imageBankForm.controls.folderName.value;
      this.folderUpdate.isShared = this.imageBankForm.controls.isShared.value;
      this.imageBankFolderUpdate(this.folderUpdate);
    }
  }

  copyInputMessage(val: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  folderEdit(item, i) {
    this.editFolderId = i;
    this.isEnableEdit = true;
    this.isShowDocument = false;
    this.isReplaceDocument = false;
    this.isEditOrder = false;
    this.isShowUpdate = false;
    this.imageBankForm = this.prepareImageBankForm();
    this.patchFormControlValue(item);
  }

  getTextMsgConfig() {
    this.contactDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 10,
      uploadAPI: {
        url: this.baseUrl + 'api/ImageBank/File_Uploaded' + '?NumUploaded=' + 1 + '&clpcompanyId=' + this.user.cLPCompanyID + '&clpuserId=' + this.user?.cLPUserID + '&folderid=' + this.selectedFolderId + '&cbForceResize=' + false,
        headers: {
        },
      },
      formatsAllowed: '.jpg, .png, .eps, .jpeg, .gif',
      multiple: true,
      replaceTexts: {
        selectFileBtn: 'Select Image',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        afterUploadMsg_success: null,
        afterUploadMsg_error: 'Upload Failed!',
      }
    }
  }
}
