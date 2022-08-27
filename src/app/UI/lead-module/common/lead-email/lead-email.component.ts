import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostBinding, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { DocumentResponse, Document } from '../../../../models/document';
import { ConfigDetails } from '../../../../models/appConfig.model';
import { DropDownItem, SimpleResponse } from '../../../../models/genericResponse.model';
import { OutBoundEmailService } from '../../../../services/outBoundEmail.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { AppconfigService } from '../../../../services/shared/appconfig.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { pageAnimations, filterAnimation } from '../../../../animations/page.animation';
import { SortDescriptor } from '@progress/kendo-data-query';
import { Note, NoteResponse } from '../../../../models/note.model';
import { LinkGroupService } from '../../../../services/link-group.service';
import { LinkContactExtended, LinkContactExtendedListResponse } from '../../../../models/link-contact.model';
import { LinkEmailFilterResponse } from '../../../../models/link-group.model';
import { eNoteEmailToChoice, eNoteOwnerType, eNoteStatus } from '../../../../models/enum.model';
declare var $: any;
@Component({
    selector: 'lead-email',
    templateUrl: './lead-email.component.html',
  styleUrls: ['./lead-email.component.css'],
  animations: [pageAnimations, filterAnimation]
})
/** lead-email component*/
export class LeadEmailComponent {

  @Output() closeEmailComponent = new EventEmitter<boolean>();
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  @ViewChild('scrollIdTarget') scrollIdTarget: ElementRef;
  private encryptedUser: string = '';
  emailForm: FormGroup;
  showAttachedDiv: boolean = false;
  showFileUploader: boolean = false;
  @Input() leadId: number = 0;
  @Input() loggedUser: CLPUser;
  @Input() linkId: number = 0;
  @Input() linkName: string = '';
  @Input() filterLinks: DropDownItem[];
  documentRecentResponse: DocumentResponse;
  documentContactResponse: DocumentResponse;
  documentSearchResponse: DocumentResponse;
  documents: Document[] = [];
  pageSize: number = 5;
  public skip = 0;
  attachedFiles: any[] = [];
  afuConfig: any;
  uploadedFileResponse: SimpleResponse;
  documentGridTitle: string = 'Recent';
  searchValue: any;
  public attachFileSort: SortDescriptor[] = [{ field: "dtCreated", dir: "desc" }];
  note: any;
  noteResult: Note;
  baseUrl: string;
  linkEmailFilterResponse: LinkEmailFilterResponse;
  linkContactList: LinkContactExtended[];
  toEmailId: string = '';
  soUrl: any;
  constructor(private fb: FormBuilder, private _router: Router,
    private _outBoundEmailService: OutBoundEmailService,
    public _linkGroupSrvc: LinkGroupService,
    private _appConfigService: AppconfigService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    public _localService: LocalService,
    @Inject('BASE_URL') _baseUrl: string
  ) {
    this.baseUrl = _baseUrl;
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
  }
  ngOnInit() {
    this.emailForm = this.prepareEmailForm();
    this.emailForm.reset();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      if (this.loggedUser) {
        this.loadInitData();
        this.getEmailDropDowns().subscribe((value) => this.getRecentDocumentsListByClpUser());
        if (!isNullOrUndefined(this.linkId)) {
          this.getLinkContactList(this.linkId);
        }
       
      }
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  loadInitData() {
    this.loadAfuConfig();
    if ($(window).width() < 768)
      this.afuConfig.theme = '';
  }

  loadAfuConfig() {
    this.afuConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 3,
      uploadAPI: {
        url: this.baseUrl + 'api/OutBoundEmail/Document_Post/' + this.loggedUser?.cLPCompanyID + '/' + this.leadId + '/' + this.loggedUser.cLPUserID,
        headers: {},
      },
      formatsAllowed: '.jpg,.png,.pdf,.docx, .txt,.gif,.jpeg,.xlsx,.pptx,.bmp,.tiff',
      multiple: true,
      replaceTexts: {
        selectFileBtn: 'Select File',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        dragNDropBox: 'Drag and Drop your file here',
        attachPinBtn: 'Attach Files...',
        afterUploadMsg_success: 'Successfully Uploaded!',
        afterUploadMsg_error: 'Upload Failed!',
      }
    };
  }

  private prepareEmailForm(): FormGroup {
    return this.fb.group({
      to: [{ value: '' }, [Validators.required]],
      from: [{ value: '' }],
      cc: [{ value: '' }, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      bcc: [{ value: '' }, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      subject: [{ value: '' }, [Validators.required]],
      emailTemplateID: [0],
      body: [{ value: '' }, [Validators.required]],
    });
  }

  get sendEmailFrm() {
    return this.emailForm.controls;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


  getEmailDropDowns() {
    return new Observable(observer => {
      this._outBoundEmailService.linkOutBoundEmailLoad(this.encryptedUser, this.linkId == undefined ? 0 : this.linkId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID)
        .then(async (result: LinkEmailFilterResponse) => {
          if (result) {
            this.linkEmailFilterResponse = UtilityService.clone(result);
            observer.next("success");
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    });
  }

  getRecentDocumentsListByClpUser() {
    this._outBoundEmailService.getDocumentsListByCLPUser(this.encryptedUser, this.loggedUser.cLPUserID)
      .then(async (result: DocumentResponse) => {
        if (result) {
          this.documentRecentResponse = UtilityService.clone(result);
          this.documents = this.documentRecentResponse.documents;
          this.documentImageUrl();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getLeadDocumentsListByOwner() {
    this._outBoundEmailService.getDocumentsListByOwner(this.encryptedUser, this.leadId)
      .then(async (result: DocumentResponse) => {
        if (result) {
          this.documentGridTitle = 'Lead Files';
          this.documentContactResponse = UtilityService.clone(result);
          this.documents = this.documentContactResponse.documents;
          this.documentImageUrl();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  searchDocumentsList() {
    if (!isNullOrUndefined(this.searchValue)) {
      var splitArr = this.searchValue.split(/[, ]/);
      if (splitArr.length > 0) {
        this._outBoundEmailService.documentsSearch(this.encryptedUser, splitArr, this.loggedUser.cLPUserID)
          .then(async (result: DocumentResponse) => {
            if (result) {
              this.documentGridTitle = 'Results';
              this.documentSearchResponse = UtilityService.clone(result);
              this.documents = this.documentSearchResponse.documents;
              this.documentImageUrl();
            }
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this._utilityService.handleErrorResponse(err);
          });
      }
    }
    else
      this.notifyService.showError("Please enter document name.", "", 2000);
  }

  documentImageUrl() {
    this.documents.forEach(function (item) {
      var splitValue = item.documentTypeIcon.split(/[..]/);
      item.documentTypeIcon = splitValue.length > 0 ? splitValue[2] + '.svg' : item.documentTypeIcon;
    })
  }

  fileUpload(e) {
    //get uploaded file here
    if (!isNullOrUndefined(e)) {
      if (e.body) {
        if (e.body.errorMsg == null || e.body.errorMsg == '') {
          this.uploadedFileResponse = e.body.list;
          var uploadList = e.body.list;
          var that = this;
          uploadList.forEach(function (item) {
            that.attachedFiles.push(item);
          })
        }
        else
          this.notifyService.showError(e.body.errorMsg, "", 2000);
      }
    }
  }

  attachDetachFile(type, data, index?) {
    if (type) {
      switch (type) {
        case "add":
          data.isSelected = true;
          this.attachedFiles.push(data);
          break;
        case "remove":
          data.isSelected = false;
          this.attachedFiles = this.attachedFiles.filter(({ documentId }) => documentId !== data.documentId);
          break;
      }
    }
  }

  emailFormSubmit() {
    this.emailForm.patchValue({ to: this.toEmailId });
    this.validateAllFormFields(this.emailForm);
    if (this.emailForm.valid) {
      this.emailForm.markAsPristine();
      this.sendEmail();
    }
  }

  sendEmail() {
    this.copyDataObjectToNoteAPIObject();
    this._outBoundEmailService.linkOutBoundEmailSendEmail(this.encryptedUser, this.note, this.linkId, this.loggedUser?.cLPCompanyID, this.loggedUser?.cLPUserID, this.emailForm.controls.emailTemplateID.value ? this.emailForm.controls.emailTemplateID.value : 0)
      .then(async (result: NoteResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (response.messageBool) {
            this.notifyService.showSuccess(response.messageString, "", 5000);
            this.hideSendMail();
          } else {
            this.notifyService.showError("Some Error Occured", "", 5000);
          }
           
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  resetEmailForm() {
    this.emailForm.patchValue({ cc: '', bcc: '', subject: '', body: '' });
  }

  copyDataObjectToNoteAPIObject() {
    var documentList = [];
    if (this.attachedFiles.length > 0) {
      for (var i = 0; i < this.attachedFiles.length; i++) {
        documentList.push(this.attachedFiles[i].documentId ? this.attachedFiles[i].documentId : this.attachedFiles[i].key);
      }
    }
    var documents = documentList.toString();
     this.note = {
      noteID: 0,
      cLPCompanyID: this.loggedUser.cLPCompanyID,
       cLPUserID: this.loggedUser.cLPUserID,
       ownerID: this.linkId,
       ownerType: eNoteOwnerType.LinkGroup,
      noteTypeCode: 0,
       toChoice: eNoteEmailToChoice.Link,
      toField: this.toEmailId,
      cCField: this.emailForm.controls.cc.value ? this.emailForm.controls.cc.value : '',
      bCCField: this.emailForm.controls.bcc.value ? this.emailForm.controls.bcc.value : '',
      noteSubject: this.emailForm.controls.subject.value ? this.emailForm.controls.subject.value : '',
      emailTemplateID: this.emailForm.controls.emailTemplateID.value ? this.emailForm.controls.emailTemplateID.value : 0,
      documentList: documents, //
      noteDesc: this.emailForm.controls.body.value ? this.emailForm.controls.body.value : '',
      fromCLPUserID: this.loggedUser.cLPUserID,
      campaignID: 0,
       runID: 0,
       emailResult: '',
       status: eNoteStatus.Pending,
      messageBool: this.noteResult && this.noteResult.messageBool ? this.noteResult.messageBool : false,
    }
  }

  goToLink(type, id?) {
    if (type) {
      switch (type) {
        case "mailPlaceholderList": {
          var helpUrl = 'https://www.salesoptima.com/support/email-placeholder-list';
          window.open(helpUrl, '_blank');
          break;
        }
      }
    }
  }

  hideSendMail() {
    this.emailForm.reset();
    this.closeEmailComponent.emit(false);
  }

  getLinkContactList(linkId) {
    this._linkGroupSrvc.linkContactGetList(this.encryptedUser, linkId)
      .then((result: LinkContactExtendedListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.linkContactList = response.linkContactList;
          for (var i = 0; i < this.linkContactList.length; i++) {
            this.toEmailId += (this.linkContactList[i].email + ' ' + (i < this.linkContactList.length - 1 ? ',' : '') + ' ');
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getLinkId(value) {
    this.linkId = value;
    this.getLinkContactList(value);
  }
}

