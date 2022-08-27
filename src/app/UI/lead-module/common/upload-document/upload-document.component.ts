import { Component, HostBinding, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { Document, DocumentResponse } from '../../../../models/document'
import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';
import { HttpErrorResponse } from '@angular/common/http';
import { OutBoundEmailService } from '../../../../services/outBoundEmail.service';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';

declare var $: any;

@Component({
    selector: 'upload-document',
    templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css'],
  animations: [pageAnimations, filterAnimation]
})
/** upload-document component*/
export class UploadDocumentComponent {
  @Input() loggedUser: CLPUser;
  @Input() ownerId: number = 0;
  isDocumentUploaded: boolean = false;
  errorMsg: string = "";
  showSpinner: boolean = false;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  private encryptedUser: string = '';
  columns = [{ field: '$', title: '', width: '40' }
    , { field: 'documentName', title: 'Document Name', width: '100' }
    , { field: 'dtCreated', title: 'Created Date', width: '40' }];
  reorderColumnName: string = 'documentName,dtCreated';
  documentList: Document[];
  recentDocConfig;
  baseUrl: string;
    /** upload-document ctor */
  constructor(private _router: Router,
    @Inject('BASE_URL') _baseUrl: string,
    public _localService: LocalService,
    public _outboundEmailSrvc: OutBoundEmailService,
    private _utilityService: UtilityService,
    public notifyService: NotificationService) {
    this.baseUrl = _baseUrl;
  }
  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.loggedUser)) {
          this.getRecentDocumentsConfig();
          if ($(window).width() < 768)
            this.recentDocConfig.theme = '';
          this.getDocumentList();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.MyLead)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.loggedUser = this.userResponse.user;
              if (this.loggedUser?.userRole <= eUserRole.Administrator) {
                this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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

  onCloseUpload() {
    this._localService.hideCommonComponentEmit('upload');
    this._localService.showCommonComp = '';
  }

  public viewHandler(dataItem) {
    this.downloadDocuments(dataItem?.dataItem?.documentId);
  }

  getRecentDocumentsConfig() {
    this.recentDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 3,
      uploadAPI: {
        url: this.baseUrl + 'api/OutBoundEmail/Document_Post/' + this.loggedUser?.cLPCompanyID + '/' + this.ownerId + '/' + this.loggedUser.cLPUserID,
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

  changeFileApiResponse(event) {
    if (!isNullOrUndefined(event.body)) {
      if (isNullOrUndefined(event?.body?.errorMsg)) {
        this.errorMsg = "";
        this.getDocumentList();
      } else {
        this.errorMsg = event?.body?.errorMsg;
      }
      
    }

  }

  getDocumentList() {
    this._outboundEmailSrvc.getDocumentsListByOwner(this.encryptedUser, this.ownerId)
      .then(async (result: DocumentResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.documentList = response.documents;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  public removeHandler({ dataItem }): void {
  }

  async downloadDocuments(selectedDocumentId) {
    await this._outboundEmailSrvc.downloadDocumentsByDocId(this.encryptedUser, selectedDocumentId)
      .then(async (result: Document) => {
        if (result) {
          let response = UtilityService.clone(result);
          const byteCharacters = atob(response.document);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          var fileType = response.documentName.split('.');
          const file = new Blob([byteArray], { type: fileType[1] });
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(file);
          link.download = response.documentName;
          link.click();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }
}
