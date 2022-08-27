import { transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectAllCheckboxState } from '@progress/kendo-angular-grid';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { ContactList, ContactListResponse } from '../../models/contact.model';
import { MailTypeResponse } from '../../models/emailTemplate.model';
import { eFeatures } from '../../models/enum.model';
import { Mailing } from '../../models/mailing.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { SearchQueryResponse } from '../../models/search.model';
import { ContactService } from '../../services/contact.service';
import { CustomActionService } from '../../services/custom-action.service';
import { EmailBlastService } from '../../services/email-blast.service';
import { ContactCommonSearchService } from '../../services/shared/contact-common-search.service';
import { ContactSearchService } from '../../services/shared/contact-search.service';
import { GridConfigurationService } from '../../services/shared/gridConfiguration.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
declare var $: any;

@Component({
    selector: 'app-email-blast',
    templateUrl: './email-blast.component.html',
  styleUrls: ['./email-blast.component.css'],
  providers: [GridConfigurationService, ContactCommonSearchService]
})
export class EmailBlastComponent {

  emailMailingData: ContactList[] = [];
  initEmailMailingData: ContactList[] = [];
  movedEmailMailingData: ContactList[] = [];
  emailTypeList: MailTypeResponse;
  queryDataLoaded: SearchQueryResponse;
  contactListResponse: ContactListResponse;
  mailingData = <Mailing>{};
  showMovedData: boolean = false;
  public mySelection: number[] = [];
  public step: number = 1;
  contactDocConfig;

  baseUrl: string;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  gridHeight;
  soUrl: any;
  sendMailInfo: any = { isShow: false, contactId: 0 };

  emailBlastForm: FormGroup;
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: '$', title: '  ', width: '40' },
    { field: 'name', title: 'Name', width: '250' },
    { field: 'email', title: 'Email', width: '70' },
    { field: 'companyName', title: 'Company', width: '350' },
    { field: 'phone', title: 'Phone', width: '120' },
    { field: 'userName', title: 'User', width: '120' },
    { field: 'dtModifiedDisplay', title: 'Modified', width: '100' },
  ];
  reorderColumnName: string = 'name,email,companyName,phone,userName,dtModifiedDisplay';
  columnWidth: string = 'name:250,email:70,companyName:350,phone:120,userName:120,dtModifiedDisplay:100';
  arrColumnWidth: any[] = ['name:250,email:70,companyName:350,phone:120,userName:120,dtModifiedDisplay:100'];
    mobileColumnNames: string[];
  constructor(@Inject('BASE_URL') _baseUrl: string,
    public _contactService: ContactService,
    private _emailBlastService: EmailBlastService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private fb: FormBuilder,
    private _router: Router,
    private _contactCommonSearchService: ContactCommonSearchService,
    public _gridCnfgService: GridConfigurationService,
    public _contactSearchService: ContactSearchService,
    private _ngZone: NgZone) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
    this.subscribeToEvents();
    this.baseUrl = _baseUrl;
  }

  apiResponse(event) {
    if (!isNullOrUndefined(event.body)) {
      console.log("response" , event.body.messageString);
    }
  }

  ngOnInit() {
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
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.None)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.showSpinner = false;
            }
          }
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }
  private subscribeToEvents(): void {
    this._contactCommonSearchService.contactListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.emailMailingData = data;
        this.initEmailMailingData = this.emailMailingData.map(x => Object.assign({}, x));

      })
    });
    this._contactCommonSearchService.queryListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.queryDataLoaded = data;
      })
    });
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'email_mailing_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('email_mailing_grid').subscribe((value) => this.getArchiveContacts()));

  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'email_mailing_grid').subscribe((value) => this.getGridConfiguration());
  }
  getArchiveContacts() {
    if (!isNullOrUndefined(this._gridCnfgService)) {
    this._gridCnfgService.iterateConfigGrid(true, "email_mailing_grid");
      this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('email_mailing_grid');
    }
  }
  prepareEmailBlastForm() {
    return this.fb.group({
      subject: new FormControl('', [Validators.required]),
      mailingTypeCode: new FormControl(0),
      fromType: new FormControl(1),
      toType: new FormControl(1),
      salutation: new FormControl(0),
      mailMergeTemplateID: new FormControl(0),
      emailTemplateID: new FormControl(0),
      score: new FormControl(0),
      body: new FormControl(''),
      mailingStartTime: new FormControl(),

    })
  }

  copyEmailBlastFormValueToData() {
    this.mailingData.cLPUserID = this.user.cLPUserID;
    this.mailingData.cLPCompanyID = this.user.cLPCompanyID;
    this.mailingData.subject = this.emailBlastForm.controls.subject.value;
    this.mailingData.mailingTypeCode = this.emailBlastForm.controls.mailingTypeCode.value;
    this.mailingData.fromType = this.emailBlastForm.controls.fromType.value;
    this.mailingData.toType = this.emailBlastForm.controls.toType.value;
    this.mailingData.salutation = this.emailBlastForm.controls.salutation.value;
    this.mailingData.mailMergeTemplateID = this.emailBlastForm.controls.mailMergeTemplateID.value;
    this.mailingData.emailTemplateID = this.emailBlastForm.controls.emailTemplateID.value;
    this.mailingData.score = this.emailBlastForm.controls.score.value;
    this.mailingData.body = this.emailBlastForm.controls.body.value;
    this.mailingData.mailingStartTime = this.emailBlastForm.controls.mailingStartTime.value;
  }

  gotoLink(columnName, dataItem) {
    var url = this.soUrl;
    if (columnName) {
      switch (columnName) {
        case "address-card":
        case "name": {
          if (this.user.timeZoneWinId != 0)
            this._router.navigate(['/contact', dataItem.clpUserId, dataItem.contactID]);
          else {
            if (confirm("First , Please select your timezone!!!"))
              this._router.navigate(['/edit-profile', dataItem.clpUserId]);
            else
              return;
          }
          break;
        }
        case "userName": {
          this._router.navigate(['/edit-profile', dataItem.clpUserId]);
          break;
        }
        case "email": {
          $('#sendEmailModal').modal('show');
          this.sendMailInfo.isShow = true;
          this.sendMailInfo.contactId = dataItem?.contactID;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  async moveRight() {
    this.step = 0;
    this.mySelection.forEach((item, i) => {
      let filterData;
      filterData = this.initEmailMailingData.filter((data) => data.contactID == this.mySelection[i])[0];
      this.movedEmailMailingData.push(filterData);
    });
    for (let i = 0; i < this.emailMailingData.length; i++) {
      this.mySelection.forEach((item) => {
        if (this.emailMailingData[i]?.contactID == item) {
          this.emailMailingData.splice(i, 1);
          i--;
        }
      });
    }
    setTimeout(() => {
      this.step = 1;
    }, 10);
    await this._emailBlastService.moveRightList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID,0, this.mySelection)
      .then(async (result: boolean) => {
        if (result) {
          console.log(result)
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    this.mySelection = [];
  }

  async getEmailType() {
    this.showSpinner = true;
    await this._emailBlastService.getEmailTypeList(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: MailTypeResponse) => {
        if (result) {
          this.emailTypeList = UtilityService.clone(result);
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async saveEmailBlast() {
      this.copyEmailBlastFormValueToData()
      await this._emailBlastService.saveEmailWizard(this.encryptedUser, this.mailingData)
        .then(async (result: number) => {
          if (result) {
            console.log(result)
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
  }

  clearMovedList() {
    this.movedEmailMailingData = [];
    this.emailMailingData = this.initEmailMailingData;
  }

  goToNext(id) {
    switch (id) {
      case 1:
        this.step = 2;
        this.getEmailBlastConfig();
        if ($(window).width() < 768)
          this.contactDocConfig.theme = '';
        this.getEmailType();
        this.emailBlastForm = this.prepareEmailBlastForm();
        break;
      case 2:
        this.emailBlastForm.controls.subject.markAsTouched();
        if (this.emailBlastForm.valid) {
          this.saveEmailBlast();
        }
        this.step = 3;
        break;
      case 3:
        this.step = 4;
        break;
    }
  }

  getEmailBlastConfig() {
    this.contactDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 10,
      uploadAPI: {
        url: this.baseUrl + 'api/EmailWizard/File_UploadEmailWizard' + '/' + this.user.cLPCompanyID + '/' + this.user?.cLPUserID + '/' + 1 + '?ownerType=' + 5,
        headers: {
        },
      },
      formatsAllowed: '.jpg, .png, .eps, .jpeg, .gif, .pdf, .txt, .wpd, .doc, .docx, .xlsx, .csv',
      multiple: true,
      replaceTexts: {
        selectFileBtn: 'Select',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        afterUploadMsg_success: null,
        afterUploadMsg_error: 'Upload Failed!',
      }
    }
  }


  public selectAllState: SelectAllCheckboxState = "unchecked";
  public onSelectedKeysChange(): void {
    const len = this.mySelection.length;

    if (len === 0) {
      this.selectAllState = "unchecked";
    } else if (len > 0 && len < (this.emailMailingData.length)) {
      this.selectAllState = "indeterminate";
    } else {
      this.selectAllState = "checked";
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState): void {
    if (checkedState === "checked") {
      this.mySelection = this.emailMailingData.map((item) => item.contactID);
      this.selectAllState = "checked";
    } else {
      this.mySelection = [];
      this.selectAllState = "unchecked";
    }
  }
}

