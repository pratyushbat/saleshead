import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostBinding, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';

import { CLPUser } from '../../../../models/clpuser.model';
import { ContactFields, ContactFieldsResponse } from '../../../../models/contact.model';
import { EmailDropDownsResponse, EmailSnippet, EmailSnippetResponse, EmailTemplate, MailMergeTemplate } from '../../../../models/emailTemplate.model';
import { DocumentResponse, Document } from '../../../../models/document';
import { ConfigDetails } from '../../../../models/appConfig.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';

import { OutBoundEmailService } from '../../../../services/outBoundEmail.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { AppconfigService } from '../../../../services/shared/appconfig.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';

import { pageAnimations, filterAnimation } from '../../../../animations/page.animation';

import { SortDescriptor } from '@progress/kendo-data-query';
import { Note, NoteResponse } from '../../../../models/note.model';
import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { ContactService } from '../../../../services/contact.service';

declare var $: any;

@Component({
    selector: 'app-contact-email',
    templateUrl: './contact-email.component.html',
  styleUrls: ['./contact-email.component.css'],
  animations: [pageAnimations, filterAnimation]
})
/** contact-email component*/
export class ContactEmailComponent implements OnInit {
  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  //Animation
  /** contact-email ctor */
  @ViewChild('scrollIdTarget') scrollIdTarget: ElementRef;
  private encryptedUser: string = '';
  selectedType: string = 'contact';

  emailForm: FormGroup;

  showAttachedDiv: boolean = false;
  showFileUploader: boolean = false;
  showDatePicker: boolean = false;
  isMailMergeError: boolean = false;
  forMessageBoolValue: boolean;
  users: any;
  toUsersArr: any;

  @Input() loggedUser: CLPUser;
  @Input() contactId: number = 0;

  emailDropDownsResponse: EmailDropDownsResponse;
  emailSnippets: EmailSnippet[] = [];
  emailTemplates: EmailTemplate[] = [];
  mailMergeTemplates: MailMergeTemplate[] = [];
  documentRecentResponse: DocumentResponse;
  documentContactResponse: DocumentResponse;
  documentSearchResponse: DocumentResponse;
  documents: Document[] = [];
  contactFields: ContactFields;

  pageSize: number = 5;
  public skip = 0;

  attachedFiles: any[] = [];
  afuConfig: any;
  uploadedFileResponse: SimpleResponse;
  site: string = "";
  helpSite: string = "";
  soUrl: any;
  resetUpload: boolean;

  documentGridTitle: string = 'Recent';
  searchValue: any;

  selectedEmailSnippet = '';
  submitBtnTxt: string = 'Send Email';

  public attachFileSort: SortDescriptor[] = [{ field: "dtCreated", dir: "desc" }];

  //for datetime picker
  public datePickerValue: Date;
  public datePickerformat = "yyyy-MM-dd HH:mm a";

  emailSnippetResponse: EmailSnippetResponse;
  note: any;
  noteResponse: NoteResponse;
  noteResult: Note;
  emailBind;
  baseUrl: string;

  constructor(private fb: FormBuilder, private _route: ActivatedRoute, private _router: Router,
    private _outBoundEmailService: OutBoundEmailService,
    private _utilityService: UtilityService,
    private _appConfigService: AppconfigService,
    private notifyService: NotificationService,
    public _localService: LocalService,
    public _contactService: ContactService,
    public _contactSearchService: ContactSearchService,
    @Inject('BASE_URL') _baseUrl: string
  ) {
    this.baseUrl = _baseUrl;
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySO_Site")
      .then(async (result: ConfigDetails) => {
       /* this.site = result.configValue;*/
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySo_Help")
      .then(async (result: ConfigDetails) => {
        this.helpSite = result.configValue;
      })
  }
  ngOnInit() {
    this._localService.getEmail().subscribe(msg => {
      this.emailBind = msg;
    });
    
    this.emailForm = this.prepareEmailForm();
    this.emailForm.reset();

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      if (this.loggedUser) {
        //this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID);
        if (!isNullOrUndefined(this._localService.contactFields) && (this._localService.contactFields.contactID.fieldValue == this.contactId))
          this.loadInitData();
        else
          this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID);
        this.getEmailDropDowns().subscribe((value) => this.getRecentDocumentsListByClpUser());

        this._localService.getContactsId().subscribe(msg => {
          this.contactId = msg;      
          this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID);
          this.getEmailDropDowns().subscribe((value) => this.getRecentDocumentsListByClpUser());
        });
        this._contactSearchService.showSpinner = false;
      }
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  getContactFields(contactId, companyID, userId) {

    this._localService.getContactFields(this.encryptedUser, contactId, companyID, userId, true)
      .subscribe((value) =>
        this.loadInitData()
    );

  }

  loadInitData() {
    this.contactFields = this._localService.contactFields;
    this.loadEmailForm();
    this.loadAfuConfig();
    if ($(window).width() < 768)
      this.afuConfig.theme = '';
  }

  loadEmailForm() {
    this.emailForm.patchValue({
      to: this.contactFields.email.fieldValue,
      from: this.loggedUser.cLPUserID,
      type: 'contact'
    });
  }

  loadAfuConfig() {
    this.afuConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 3,
      uploadAPI: {
        url: this.baseUrl + 'api/OutBoundEmail/Document_Post/' + this.loggedUser.cLPCompanyID + '/' + this.contactFields.contactID.fieldValue + '/' + this.loggedUser.cLPUserID,
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
      type: [{ value: '' }],
      to: [{ value: '' }, [Validators.required]],
      from: [{ value: '' }],
      cc: [{ value: '' }, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      bcc: [{ value: '' }, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      subject: [{ value: '' }],
      mailMergeTemplateID: [{ value: '' }],
      emailTemplateID: [{ value: '' }],
      emailSnippetID: [{ value: '' }],
      regardingLink: [{ value: false }],
      body: [{ value: '' }],
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
  onCloseEmail() {
    this.emailForm.reset();
    this._localService.hideCommonComponentEmit('email');
    this._localService.showCommonComp = '';
  }

  getEmailDropDowns() {
    return new Observable(observer => {
      this._outBoundEmailService.getEmailDropDowns(this.encryptedUser, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID, this.loggedUser.teamCode)
        .then(async (result: EmailDropDownsResponse) => {
          if (result) {
            this.emailDropDownsResponse = UtilityService.clone(result);
            this.users = this.emailDropDownsResponse.userToList;
            if (this.users && this.users.length > 0) {
              this.users.map(function (e) {
                var splitU = e.value.split(":", 3);
                e.value = splitU.length == 3 ? splitU[1] + ', ' + splitU[0] + ' (' + splitU[2] + ')' : splitU.length == 2 ? splitU[1] + ', ' + splitU[0] : splitU.length == 1 ? splitU[0] : e.value;
              })
            }
            this.emailFormPatchValueByField('from');
            this.emailSnippets = this.emailDropDownsResponse.emailSnippets;
            this.emailTemplates = this.emailDropDownsResponse.emailTemplates;
            this.mailMergeTemplates = this.emailDropDownsResponse.mailMergeTemplates;
            let filterArr = [];
            if (this.loggedUser.userRole == 1 && this.emailTemplates)
              filterArr = this.emailTemplates.filter(s => s.templateName == '2018 - PROSPECT (HTB) Info with Pitch and Price - LIVE');
            if (filterArr.length > 0)
              this.emailForm.patchValue({ emailTemplateID: filterArr[0].emailTemplateID });
            else
              this.emailForm.patchValue({ emailTemplateID: 0 });
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

  getContactDocumentsListByOwner() {
    this._outBoundEmailService.getDocumentsListByOwner(this.encryptedUser, this.contactFields.contactID.fieldValue)
      .then(async (result: DocumentResponse) => {
        if (result) {
          this.documentGridTitle = 'Contact Files';
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
      item.documentTypeIcon = splitValue.length > 0 ? splitValue[2] + '.png' : item.documentTypeIcon;
    })
  }

  changeToType(e) {
    if (e) {
      this.emailForm.patchValue({ regardingLink: false });
      this.selectedType = e.target.value;
      if (this.selectedType == 'other') {
        this.emailForm.get('to').setValue('');
        this.emailForm.patchValue({ regardingLink: true });
      }
      if (this.selectedType == 'contact')
        this.emailForm.get('to').setValue(this.contactFields.email.fieldValue);
      if (this.selectedType == 'user' && this.users?.length > 0) {
        var usersArray = this.users.map(x => Object.assign({}, x));
        var manipulatedArr = [];
        usersArray.map(function (e) {
          var splittedArr = e.value.split(/[:(]/, 2);
          e.value = splittedArr.length == 2 ? splittedArr[1] + ', ' + splittedArr[0] : splittedArr.length == 1 ? splittedArr[0] : e.value;
          manipulatedArr.push(e);
        })
        this.toUsersArr = manipulatedArr;
        this.emailForm.patchValue({ regardingLink: true });
        this.emailFormPatchValueByField('to');
      }
    }
  }

  emailFormPatchValueByField(field) {

    if (field) {
      switch (field) {
        case "from":
          if (this.users && this.users.length > 0 && this.emailDropDownsResponse.isMultipleFromAddress) {
            var user = this.users.find(x => x.key === this.loggedUser.cLPUserID);
            this.emailForm.patchValue({ from: user.key });
          }
          break;
        case "to":
          if (this.users && this.users.length > 0) {
            var user = this.users.find(x => x.key === this.loggedUser.cLPUserID);
            this.emailForm.patchValue({ to: user.key });
          }
          break;
      }
    }

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

  changeEmailSnippet(e) {
    if (this.emailForm.controls.emailSnippetID.value) {

      this._outBoundEmailService.loadEmailSnippet(this.encryptedUser, this.emailForm.controls.emailSnippetID.value)
        .then(async (result: EmailSnippetResponse) => {
          if (result) {
            this.emailSnippetResponse = UtilityService.clone(result);
            this.selectedEmailSnippet = this.emailSnippetResponse.emailSnippet ? this.emailSnippetResponse.emailSnippet.snippetText : '';
          }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });

    }
  }

  changeValueKendoEditor(value: any): void {
    this.selectedEmailSnippet = value;
  }

  emailFormSubmit() {
    this.showDatePicker = false;
    this.isMailMergeError = false;

    if ((this.emailForm.controls.emailSnippetID.value > 0) && ((!this.emailForm.controls.emailTemplateID.value) || (this.emailForm.controls.emailTemplateID.value <= 0) )) {
      this.notifyService.showSuccess("Please select an Email Template since you are using an Email Snippet.", "", 5000);
      return;
    }

    this.validateAllFormFields(this.emailForm);
    if (this.emailForm.valid) {
      this.emailForm.markAsPristine();
      this.scheduleEmail();
    }
  }

  scheduleEmail() {
    this._contactSearchService.showSpinner = true;
    this.isMailMergeError = false;
    this.copyDataObjectToNoteAPIObject();
    this._outBoundEmailService.scheduleEmailOrSend(this.encryptedUser, this.note)
      .then(async (result: NoteResponse) => {
      if (result) {
        this.noteResponse = UtilityService.clone(result);
        this.noteResult = this.noteResponse.note;
        this.noteResult.messageBool = this.forMessageBoolValue;
        if (this.noteResult.messageBool && this.noteResult.messageString) {
          this.showDatePicker = true;
          this.isMailMergeError = true;
          this.datePickerValue = new Date(this.noteResult.dtSent);
          this.submitBtnTxt = 'Schedule Email';
          this._localService.scrollTop(this.scrollIdTarget.nativeElement);
          this._contactSearchService.showSpinner = false;
          return;
        }
        if (this.noteResult.mailMergeTemplateID > 0) {
          this._localService.handledEventEmit(true);
          this.notifyService.showSuccess(this.noteResult.scheduledTime ? this.noteResult.scheduledTime : 'Email has been scheduled successfully.', "", 5000);
          this.resetEmailForm();
          this._contactSearchService.showSpinner = false;
        }
        else
          this.sendEmail();
      }
    })
    .catch((err: HttpErrorResponse) => {
      console.log(err);
      this._utilityService.handleErrorResponse(err);
    });
  }

  sendEmail() {
    this._outBoundEmailService.sendOutboundMail(this.encryptedUser, this.noteResult)
      .then(async (result: NoteResponse) => {
        if (result) {
          this._localService.handledEventEmit(true);
          this._contactSearchService.showSpinner = false;
          var response = UtilityService.clone(result);
          this.notifyService.showSuccess(response.messageString ? response.messageString : 'Email has been sent successfully.', "", 5000);
          this.resetEmailForm();
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
    var toChoice = this.emailForm.controls.type.value ? this.emailForm.controls.type.value == 'contact' ? 1 : this.emailForm.controls.type.value == 'user' ? 2 : this.emailForm.controls.type.value == 'other' ? 3 : this.emailForm.controls.type.value == 'contactAllEmails' ? 6 : 4 : 0;
    this.note = {
      noteID: 0,
      cLPCompanyID: this.loggedUser.cLPCompanyID,
      cLPUserID: this.loggedUser.cLPUserID,
      ownerID: this.contactFields.contactID.fieldValue,
      ownerType: 0,
      noteTypeCode: 0,
      toChoice: toChoice,
      toField: this.emailForm.controls.type.value == 'other' ? this.emailForm.controls.to.value : '',
      cCField: this.emailForm.controls.cc.value ? this.emailForm.controls.cc.value : '',
      bCCField: this.emailForm.controls.bcc.value ? this.emailForm.controls.bcc.value : '',
      noteSubject: this.emailForm.controls.subject.value ? this.emailForm.controls.subject.value : '',
      mailMergeTemplateID: this.emailForm.controls.mailMergeTemplateID.value ? this.emailForm.controls.mailMergeTemplateID.value : 0,
      emailTemplateID: this.emailForm.controls.emailTemplateID.value ? this.emailForm.controls.emailTemplateID.value : 0,
      emailSnippetID: this.emailForm.controls.emailSnippetID.value ? this.emailForm.controls.emailSnippetID.value : 0,
      documentList: documents, //
      dtSent: this.datePickerValue ? this.datePickerValue : new Date(),
      noteDesc: this.emailForm.controls.body.value ? this.emailForm.controls.body.value : '',
      fromCLPUserID: this.emailForm.controls.from.value ? this.emailForm.controls.from.value :  this.loggedUser.cLPUserID,
      scheduledTime: '',
      emailpreviewLink: '',
      campaignID: 0,
      campaignEventID: 0,
      runID: 0,
      status: 0,
      emailStatus: 0,
      emailResult: '',
      cLPServiceRunID: 0,
      messageBool: this.noteResult && this.noteResult.messageBool ? this.noteResult.messageBool : false,
    }
  }

  changeMailMerge(e) {
/*    this.noteResult.messageBool = false;*/
    this.forMessageBoolValue = false;
    this.submitBtnTxt = this.emailForm.controls.mailMergeTemplateID.value > 0 ? 'Next' : 'Send Email';
  }

  goToLink(type, id?) {
    if (type) {
      switch (type) {
        case "help": {
          var helpUrl = this.helpSite + 'help/page.aspx?hpid=69';
          window.open(helpUrl, '_blank');
          break;
        }
        case "mailPlaceholderList": {
          var helpUrl = 'https://www.salesoptima.com/support/email-placeholder-list';
          window.open(helpUrl, '_blank');
          break;
        }
      }
    }
  }

  get getCurrentDate(): Date {
    var currentDate = new Date();
    return currentDate;
  }
  hideSendMail() {
    this.onCloseEmail();
    $('#sendEmailModal').modal('hide');
  }
  getUserEmail(fromUser) {
    var user = this.users?.find(x => x.key === fromUser);
    return user?.value;
  }
}

