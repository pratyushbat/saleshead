import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPAnnounce, CLPAnnounceResponse } from '../../../../models/announcements.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AnnouncementsService } from '../../../../services/announcements.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css'],
  providers: [GridConfigurationService]
})
/** announcements component*/
export class AnnouncementsComponent {
  showSpinner: boolean = false;
  loadAnnouncements: boolean = false;
  pageSize: number = 10;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  private encryptedUser: string = '';
  user: CLPUser;

  annoucementForm = new FormGroup({});
  announcementList: CLPAnnounce[] = [];
  announcementListInit: CLPAnnounce[] = [];
  announcementState: number = 0;
  announcementData: CLPAnnounce;
  deletedAnnouncement: CLPAnnounce;

  /*dropdowns*/
  accountList = [];
  statusList: Array<any> = [{ key: 3, value: 'Disabled' }, { key: 1, value: 'Active' }, { key: 2, value: 'Work In Progress' }];
  statusListNew: Array<any> = [{ key: 0, value: 'Unknown' }, { key: 1, value: 'Active' }, { key: 2, value: 'Work In Progress' }, { key: 3, value: 'Disabled' }, { key: 4, value: 'Dismissed' }];
  /*dropdowns*/
  public datePickerformat = "MM/dd/yyyy HH:mm a";
  public defaultItemAnnouncement = -1;

  columns = [
    { field: 'announceTitle', title: 'Announcement', width: '500' },
    { field: 'dtCreated', title: 'Created', width: '40' },
    { field: 'dtExpires', title: 'Expires', width: '40' },
    { field: 'status', title: 'Status', width: '40' },
    { field: 'cLPCompanyID', title: 'Account', width: '40' }
  ];
  reorderColumnName: string = 'announceTitle,dtCreated,dtExpires,status,cLPCompanyID';
  columnWidth: string = 'announceTitle:500,dtCreated:40,dtExpires:40,status:40,cLPCompanyID:40';
  arrColumnWidth: any[] = ['announceTitle:500,dtCreated:40,dtExpires:40,status:40,cLPCompanyID:40'];

  announcementListResponse: CLPAnnounceResponse;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  mobileColumnNames: string[];

  constructor(public _gridCnfgService: GridConfigurationService, private _announcementsService: AnnouncementsService, private fb: FormBuilder, public _localService: LocalService, private _router: Router, private _utilityService: UtilityService, private _notifyService: NotificationService) {
    this._localService.isMenu = true;
  }
  public ngOnInit(): void {

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

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'announcement_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('announcement_grid').subscribe((value) => this.getAnnouncementList()));
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SOAnnouncements)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this._gridCnfgService.user = this.user;
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
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'announcement_grid').subscribe((value) => this.getGridConfiguration());
    this.defaultItemAnnouncement = -1;
  }

  announcementDDChange() {
    if (!isNullOrUndefined(this.defaultItemAnnouncement)) {
      if (this.defaultItemAnnouncement == -1) {
        this.announcementListInit = this.announcementList;
      } else {
        this.announcementListInit = this.announcementList.filter(item => {
          return item.status == this.defaultItemAnnouncement;
        });
      }
    }
  }

  async getAnnouncementList() {
    this.loadAnnouncements = true;
    await this._announcementsService.getAnnouncements(this.encryptedUser)
      .then(async (result: CLPAnnounceResponse) => {
        if (result) {
          this.announcementListResponse = UtilityService.clone(result);
          this.announcementList = this.announcementListResponse.clpAnnounce;
          this.announcementListInit = Object.assign([], this.announcementList);
          this.accountList = this.announcementListResponse.filter_Account;
          this.annoucementForm = this.prepareAnnouncementForm();
          this.annoucementForm.reset();
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.announcementListResponse, "announcement_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('announcement_grid');
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.loadAnnouncements = false;
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });

  }

  prepareAnnouncementForm(): any {
    return this.fb.group({
      announceTitle: [{ value: '' }, [Validators.required]],
      announceDesc: [{ value: '' }, [Validators.required]],
      learnMoreLink: [{ value: '' }],
      takeMeThereLink: [{ value: '' }],
      dtExpires: [{ value: '' }],
      showDismiss: [{ value: '' }],
      account: [{ value: '' }],
      status: [{ value: '' }],
      cLPAnnounceID: [{ value: '' }],
      cLPCompanyID: [{ value: '' }],
    });
  }

  addAnnouncements() {
    this.announcementState = 1;
    var futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    this.announcementData = {
      cLPAnnounceID: 0,
      cLPCompanyID: this.user.cLPCompanyID,
      cLPUserID: this.user.cLPUserID,
      cLPRole: 0,
      userRole: 0,
      announceTitle: '',
      announceDesc: '',
      announceType: 1,
      learnMoreLink: '',
      takeMeThereLink: '',
      learnMoreLinkImgURL: '',
      takeMeThereLinkImgURL: '',
      actionBy: 0,
      showDismiss: false,
      sOrder: 0,
      status: 1,
      dtModified: new Date(),
      dtCreated: new Date(),
      dtExpires: futureDate
    };

    this.patchAnnouncementFormValue();
  }

  editAnnouncements(dataItem: CLPAnnounce) {
    this.announcementData = dataItem;
    this.announcementState = 1;
    this.patchAnnouncementFormValue();

  }

  patchAnnouncementFormValue() {
    var announceBindData = this.announcementData;
    for (let key in announceBindData) {
      let value = announceBindData[key];
      this.preparePatchFormControlValue(key, value);
    }
    var actionObj = this.accountList?.filter((data) => data.key === this.announcementData.cLPCompanyID)[0];
    !isNullOrUndefined(actionObj) ? this.annoucementForm.get('cLPCompanyID').setValue(actionObj.key) : this.annoucementForm.get('cLPCompanyID').setValue(-1);
    var statusObj = this.statusList?.filter((data) => data.key === this.announcementData.status)[0];
    !isNullOrUndefined(statusObj) ? this.annoucementForm.get('status').setValue(statusObj.key) : this.annoucementForm.get('status').setValue("");
  }

  preparePatchFormControlValue(key, value) {

    if (this.annoucementForm.get(key))
      key == 'dtExpires' ? this.annoucementForm.get(key).setValue(new Date(value)) : this.annoucementForm.get(key).setValue(value);
  }

  announcementsSubmit() {
    this._localService.validateAllFormFields(this.annoucementForm);
    if (this.annoucementForm.valid) {
      this.annoucementForm.markAsPristine();
      this.updateAnouncement();
    }
  }


  async updateAnouncement() {
    this.copyValueFromWebFormToData();

    this.showSpinner = true;
    await this._announcementsService.updateAnnouncements(this.encryptedUser, this.announcementData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this._notifyService.showSuccess("Announcement Saved Successfully", '', 3000);
          this.cancelAnnouncement();
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });

  }

  announcementFormSubmit() {
    this._localService.validateAllFormFields(this.annoucementForm);
    if (this.annoucementForm.valid) {
      this.annoucementForm.markAsPristine();
      this.updateAnouncement();
    }

  }
  copyValueFromWebFormToData() {
    this.announcementData.cLPCompanyID = this.annoucementForm.controls.cLPCompanyID.value;
    this.announcementData.cLPUserID = this.user.cLPUserID;
    this.announcementData.announceTitle = this.annoucementForm.controls.announceTitle.value;
    this.announcementData.announceDesc = this.annoucementForm.controls.announceDesc.value;
    this.announcementData.learnMoreLink = this.annoucementForm.controls.learnMoreLink.value;
    this.announcementData.takeMeThereLink = this.annoucementForm.controls.takeMeThereLink.value;
    this.announcementData.dtExpires = this.annoucementForm.controls.dtExpires.value;
    this.announcementData.showDismiss = this.annoucementForm.controls.showDismiss.value;
    this.announcementData.status = +this.annoucementForm.controls.status.value;
    this.announcementData.cLPAnnounceID = this.annoucementForm.controls.cLPAnnounceID.value;
  }

  cancelAnnouncement() {
    this.announcementState = 0;
    this.getAnnouncementList();
  }

  async deleteAccounts() {
    this.showSpinner = true;
    await this._announcementsService.deleteAnnouncements(this.encryptedUser, this.deletedAnnouncement?.cLPAnnounceID)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getAnnouncementList();
          this.showSpinner = false;
          this._notifyService.showSuccess("Announcement deleted successfully", "", 3000);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('error in delete office code' + err);
      });
  }

  deleteAccountConfirm(item) {
    this.deletedAnnouncement = item;
  }

  convertStatusToView(status) {
    let statusSelected = this.statusList.filter((data) => data.key === status)[0];
    return statusSelected ? statusSelected.value : null;

  }
  get annoucementFrm() {
    return this.annoucementForm.controls;
  }

  onAnnouncementFilter(inputValue: string): void {
    this.announcementListInit = process(this.announcementList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'announceTitle', operator: 'contains', value: inputValue },
          { field: 'dtCreated', operator: 'contains', value: inputValue },
          { field: 'dtExpires', operator: 'contains', value: inputValue },
          { field: 'status', operator: 'contains', value: inputValue },
          { field: 'cLPCompanyID', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

}
