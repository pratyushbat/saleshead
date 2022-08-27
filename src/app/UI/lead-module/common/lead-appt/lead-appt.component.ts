import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';
import { Appt, ApptResponse } from '../../../../models/appt.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { AppointmentLeadTypeCode, LeadAppt, LeadApptFilters } from '../../../../models/lead.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { LeadSettingService } from '../../../../services/leadSetting.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;
@Component({
    selector: 'lead-appt',
    templateUrl: './lead-appt.component.html',
  styleUrls: ['./lead-appt.component.css'],
  animations: [pageAnimations, filterAnimation]
})
/** lead-appt component*/
export class LeadApptComponent {
  @Input() loggedUser: CLPUser;
  @Input() ownerId: number = 0;
  @Input() isLeadTask: boolean = false;
  @Input() contactId: number = 0;
  @Input() apptId: number = 0;
  apptForm: FormGroup;
  private encryptedUser: string = '';
  public datePickerformat = "MM/dd/yyyy HH:mm a";
  apptFilterResponse: LeadApptFilters;
  roleFeaturePermissions: RoleFeaturePermissions;
  apptTypeCodes: AppointmentLeadTypeCode[];
  userResponse: UserResponse;
  appt: Appt = <Appt>{};
  apptList: Appt[];
  isApptSubmit: boolean = false;
  showSpinner: boolean = false;
  columns = [{ field: '$', title: '', width: '40'  }
    , { field: 'subject', title: 'Subject', width: '100'  }
    , { field: 'status', title: 'Status', width: '40'  }
    , { field: 'isPhoneCall', title: 'Is Phone Call', width: '40'  }
    , { field: 'typeID', title: 'Type', width: '100'  }
    , { field: 'apptStartTime', title: 'Date/Time', width: '60' }];
  reorderColumnName: string = 'subject,status,isPhoneCall,typeID,dtCreated';
  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  showApptForm: boolean = false;
  //Animation
  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private datepipe: DatePipe,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    public _leadSettingSrvc: LeadSettingService,
    public notifyService: NotificationService
  ) {
  }

  ngOnInit() {
    this.apptForm = this.prepareApptForm();
    this.apptForm.reset();
    this._localService.getPristineForm().subscribe(res => {
      this._localService.genericFormValidationState(this.apptForm);
    });
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.loggedUser)) {
          this.getApptFilters();
          this.getApptList();
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

  private prepareApptForm(): FormGroup {
    return this.fb.group({
      apptDateTime: new FormControl(new Date(), [Validators.required]),
      isPhoneCall: new FormControl(false),
      isCompleted: new FormControl(false),
      subject: new FormControl({ value: '' }, [Validators.required]),
      apptType: new FormControl(0)
    });
  }

  get apptFrm() {
    return this.apptForm.controls;
  }

  getApptFilters() {
    this._leadSettingSrvc.leadApptFiltersGet(this.encryptedUser, this.loggedUser.cLPCompanyID)
      .then(async (result: LeadApptFilters) => {
        if (result) {
          this.apptFilterResponse = UtilityService.clone(result);
          this.apptTypeCodes = this.apptFilterResponse.appointmentLeadTypeCode;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  apptFormSubmit() {
    this._localService.validateAllFormFields(this.apptForm);
    if (this.apptForm.valid) {
      this.apptForm.markAsPristine();
        this.createAppt();
    }
  }

  createAppt() {
    this.copyDataObjectToApptObject();
    this.isApptSubmit = true;
    this._leadSettingSrvc.leadQuickApptSave(this.encryptedUser, this.loggedUser.cLPUserID, this.loggedUser.cLPCompanyID, this.ownerId, this.appt)
      .then(async (result: ApptResponse) => {
        if (result) {
          if (result.messageBool == true) {
            let msg = this.apptId > 0 ? "updated" : "created";
            this.notifyService.showSuccess("Appointment " + msg + " successfully", "", 5000);
            this.getApptList();
            this.apptId = 0;
            this.apptForm.reset();
            this.prepareApptForm();
            this.showApptForm = false;
            this._localService.handledEventEmit(true);
          } else {
            this.notifyService.showError(result.messageString, "", 5000);
          }
         
        }
        this.isApptSubmit = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.isApptSubmit = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  onCloseAppt() {
    this.apptForm.reset();
    this._localService.hideCommonComponentEmit('appt');
    this._localService.showCommonComp = '';
  }

  copyDataObjectToApptObject() {
    this.appt.apptID = this.apptId ? this.apptId : 0
    this.appt.leadTypeCode = this.apptForm.controls.apptType.value ? this.apptForm.controls.apptType.value : 0;
    this.appt.strApptStartTime = this.datepipe.transform(this.apptForm.controls.apptDateTime.value, 'MM/dd/yyyy HH:mm:ss');
    this.appt.apptEndTime = this.apptForm.controls.apptDateTime.value;
    this.appt.reminderTime = this.apptForm.controls.apptDateTime.value;
    this.appt.isPhoneCall = this.apptForm.controls.isPhoneCall.value == null ? false : this.apptForm.controls.isPhoneCall.value;
    this.appt.subject = this.apptForm.controls.subject.value;
    this.appt.status = this.apptForm.controls.isCompleted.value == true ? 1 : 0;
    if (this.apptId == 0) {
      this.appt.cLPUserID = this.loggedUser ? this.loggedUser.cLPUserID : 0;
      this.appt.cLPCompanyID = this.loggedUser ? this.loggedUser.cLPCompanyID : 0;
      this.appt.leadID = this.ownerId;
      this.appt.contactID = this.contactId;
      this.appt.reminderCLP = true;
      this.appt.reminderEmail = true;
      this.appt.category = 3;
    }
  }

  getApptList() {
    this.showSpinner = true;
    var ownerId = this.isLeadTask ? this.ownerId : 0;
    this._leadSettingSrvc.leadApptListGet(this.encryptedUser, this.loggedUser.cLPUserID, this.loggedUser.cLPCompanyID, ownerId)
      .then(async (result: ApptResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.apptList = response.appts;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getType(value) {
    return this.apptTypeCodes.filter(x => x.apptLeadTypeCode == value)[0].display;
  }

  apptGridCRUD(type, row, index) {
    if (type) {
      this.apptId = row.apptID;
      switch (type) {
        case "edit":
          this.showApptForm = true;
          this.apptForm.patchValue({
            apptDateTime: new Date(row.apptStartTime),
            isPhoneCall: row.isPhoneCall,
            isCompleted: row.status,
            subject: row.subject,
            apptType: row.typeID > 0 ? row.typeID : null,
          });
          break;
        case "delete":
          break;
      }
    }
  }

  addNewHandler() {
    this.apptId = 0;
    this.apptForm.reset();
    this.prepareApptForm();
    this.showApptForm = true;
  }

  checkDate(dt) {
    var historyDate = new Date(dt);
    var currDate = new Date();
    if (currDate > historyDate)
      return true;
    else
      return false;
  }

  onCancel() {
    this.apptForm.reset();
    this.showApptForm = false;
  }
}
