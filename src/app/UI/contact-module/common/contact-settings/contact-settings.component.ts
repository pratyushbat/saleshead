import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { isNullOrUndefined } from 'util';
import { AppointmentSetting } from '../../../../models/appointmentSetting.model';
import { ClassCodes } from '../../../../models/classCodes.model';
import { CLPUser, TeamCodes } from '../../../../models/clpuser.model';
import { eAppointmentSettings, eClassCodes, eCompanySettings, eLeadSettings } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AppointmentSettingService } from '../../../../services/appointmentSetting.service';
import { ClassCodeService } from '../../../../services/classCode.service';
import { CompanySettingService } from '../../../../services/companySetting.service';
import { LeadSettingService } from '../../../../services/leadSetting.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-contact-settings',
  templateUrl: './contact-settings.component.html',
  styleUrls: ['./contact-settings.component.css']
})
/** contact-settings component*/
export class ContactSettingsComponent implements OnInit, AfterContentChecked {
  /** contact-settings ctor */
  @Input() dataSource: any[] = [];
  @Input() loggedUser: CLPUser;
  @Input() tableName:string = '';
  @Input() settingName: string = '';
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  appointmentSetting: AppointmentSetting[];
  classCodes: any[]= [];
  settingEdit: number = 0;
  sortSettingMode: boolean = false;
  showSpinner: boolean = false;
  skipSize: number;
  pageSize: number;
  isSorted: boolean = false;
  originalSettingFormcontrols: any;

  deleteItemIndex: any;
  settingCodeDisplay: any;
  editRowIndex: number = -1;
  currentUrl: string = '';
  settingAddData: string = "New Item 1 \nNew Item 2 \nNew Item 3";
  encryptedUser: string = "";

  settingForm: FormGroup;
  settingSetupForm(): FormGroup {
    return new FormGroup({
      settingConfigs: this.fb.array([this.fb.group({
        order: ['', Validators.required],
        display: ['', Validators.required],
        code: ''
      })]),
    });
  }
  constructor(
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private _router: Router,
    private _appointmentSettingService: AppointmentSettingService,
    private _leadSettingService: LeadSettingService,
    private _companySettingService: CompanySettingService,
    private _classCodeService: ClassCodeService,
    private _notifyService: NotificationService,
    public _localService: LocalService,
  ) {
    this._localService.isMenu = true;
    _router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var url = event.url;
        var splitUrl = url?.split('/', 4);
        this.currentUrl = splitUrl.length > 0 ? splitUrl[1] : '';
      }
    });
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit() {

    this.settingForm = this.settingSetupForm();
    if (!isNullOrUndefined(localStorage.getItem("token")))
      this.encryptedUser = localStorage.getItem("token");
    this.settingFormCtls.controls = [];
    this.settingFormCtls.removeAt(0);
    this.prepareSettingFormCtrls();
  }

  prepareSettingFormCtrls() {
    this.settingFormCtls.controls = [];
    if (this.settingName && this.settingName == 'appt') {
      this.dataSource.forEach((element, index) => {
        this.settingFormCtls.push(
          this.fb.group({
            order: element.sOrder,
            display: element.display,
            code: element.code,
            colorCode: element.colorCode
          })
        );
      });
     
    }
    else {
      this.dataSource.forEach((element, index) => {
        this.settingFormCtls.push(
          this.fb.group({
            order: element.sOrder,
            display: element.display,
            code: element.code
          })
        );
      });
    }
    this.originalSettingFormcontrols = this.settingFormCtls.controls.slice();
   
  }

  get settingFormCtls() {
    return this.settingForm.get('settingConfigs') as FormArray;
  }

  editClassCodes() {
    this.editRowIndex = -1;
    this.settingEdit = 1;
  }

  addClassItems() {
    this.settingEdit = 2;
  }

  scrollToNew() {
    setTimeout(function () {
      var elem = document.getElementById("scrollId");
      elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }, 0);
  }

  cancelSettingCode() {
    this.prepareSettingFormCtrls();
    this.isSorted = false;
    this.settingEdit = 0;
    this.editRowIndex = -1;
    this.sortSettingMode = false;
  }

  settingItemtoDelete(index) {
    this.deleteItemIndex = index;
    this.settingCodeDisplay = this.settingFormCtls.controls[index].value.display;
  }

  identifySetting(index, item) {
    return item.value.code;
  }

  dropSetting(event: CdkDragDrop<string[]>) {
    if (this.settingFormCtls.controls.length > 1) {
      this.sortSettingMode = true;
      if (event.previousContainer === event.container)
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }

  async saveBulkSetting() { //Add
    this.showSpinner = true;
    let settingAddDataArray = this.settingAddData.split('\n');
    settingAddDataArray = settingAddDataArray.filter(item => item.trim().length > 0);
    settingAddDataArray = settingAddDataArray.splice(0, 25);
    if (this.settingName && this.settingName == 'appt') {
      settingAddDataArray.forEach((value, index) => {
        let lastindex = this.settingFormCtls.length;
        this.settingFormCtls.push(
          this.fb.group({
            order: lastindex,
            display: value,
            code: 0,
            colorCode: ''
          })
        )
      });
    }
    else {
      settingAddDataArray.forEach((value, index) => {
        let lastindex = this.settingFormCtls.length;
        this.settingFormCtls.push(
          this.fb.group({
            order: lastindex,
            display: value,
            code: 0
          })
        )
      });
    }
    await this.saveSettingItems();
    this.showSpinner = false;
  }

  async saveSettingItems() { //Edit all
    this.showSpinner = true;
    this.copyDataFormToObject();
    if (this.settingName && this.settingName == 'appt')
      this.submitApptSetting();
    else if (this.settingName && this.settingName == 'lead')
      this.submitLeadSetting();
    else if (this.settingName && this.settingName == 'company')
      this.submitCompanySetting();
    else
      this.submitSetting();
  }

  async submitApptSetting() {
    await this._appointmentSettingService.updateAppointment(this.encryptedUser, this.appointmentSetting)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.saveItemsResProcess();
        }
        else {
          this.sortSettingMode = false;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortSettingMode = false;
        console.log('error in saving setting code' + err);
      });
  }

  async submitLeadSetting() {
    await this._leadSettingService.updateLeadSetting(this.encryptedUser, this.classCodes)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.saveItemsResProcess();
        }
        else {
          this.sortSettingMode = false;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortSettingMode = false;
        console.log('error in saving setting code' + err);
      });
  }

  async submitCompanySetting() {
    await this._companySettingService.updateCompanySetting(this.encryptedUser, this.classCodes)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.saveItemsResProcess();
        }
        else {
          this.sortSettingMode = false;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortSettingMode = false;
        console.log('error in saving setting code' + err);
      });
  }

  async submitSetting() {
    await this._classCodeService.updateClassCodes(this.encryptedUser, this.classCodes)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.saveItemsResProcess();
        }
        else {
          this.sortSettingMode = false;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortSettingMode = false;
        console.log('error in saving setting code' + err);
      });
  }

  saveItemsResProcess() {
    this.isSorted = false;
    this._localService.handleContactSettingsEmit(this.tableName, this.settingName);
    this.settingEdit = 0;
    this.editRowIndex = -1;
    this.sortSettingMode = false;
    this.settingAddData = "New Item 1 \nNew Item 2 \nNew Item 3";
    this.showSpinner = false;
    this._notifyService.showSuccess("Setting saved successfully" , this.tableName,3000);
  }

  copyDataFormToObject() {

    if (this.settingName && this.settingName == 'appt') {
      this.appointmentSetting = [];
      this.settingFormCtls.controls.forEach((row, index) => {
        var setingCode = <AppointmentSetting>{
          tableName: this.tableName ? this.tableName : this.dataSource[0]?.tableName,
          code: row.value.code,
          display: row.value.display,
          sOrder: index + 1,
          clpCompanyId: this.loggedUser.cLPCompanyID,
          colorCode: row.value.colorCode
        }
        this.appointmentSetting.push(setingCode);
      });
    }
    else {
      this.classCodes = [];
      this.settingFormCtls.controls.forEach((row, index) => {
        var setingCode = <any>{
          tableName: this.tableName ? this.tableName : this.dataSource[0]?.tableName,
          code: row.value.code,
          display: row.value.display,
          sOrder: index + 1,
          clpCompanyId: this.loggedUser.cLPCompanyID
        }
        this.classCodes.push(setingCode);
      });
    }
  }

  sortAlphaSettingCode() {
    this.isSorted = true;
    this.settingFormCtls.controls.sort((a, b) => a.value.display.localeCompare(b.value.display));
    this.settingEdit = 1;
  }

  async deleteSettingItems() {
    var index = this.deleteItemIndex;
    this.showSpinner = true;
    var settingCodeDelete = this.settingFormCtls.controls[index].value.code;
    if (this.settingName && this.settingName == 'appt')
      this.deleteApptSetting(index, settingCodeDelete);
    else if (this.settingName && this.settingName == 'lead')
      this.deleteLeadSetting(index, settingCodeDelete);
    else if (this.settingName && this.settingName == 'company')
      this.deleteCompanySetting(index, settingCodeDelete);
    else
      this.deleteSetting(index, settingCodeDelete);
  }

  async deleteApptSetting(index?, settingCodeDelete?) {
    var eAppointmentSetting = eAppointmentSettings[this.tableName];
    await this._appointmentSettingService.deleteAppointment(this.encryptedUser, settingCodeDelete, eAppointmentSetting)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.deleteItemsResProcess(index);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('Error in deleting setting code' + err);
      });
  }

  async deleteLeadSetting(index?, settingCodeDelete?) {
    this.showSpinner = true;
    var eLeadSetting = eLeadSettings[this.tableName];
    await this._leadSettingService.deleteLeadSetting(this.encryptedUser, settingCodeDelete, eLeadSetting)
      .then((result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          this.deleteItemsResProcess(index);
     
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('Error in deleting setting code' + err);
      });
  }

  async deleteCompanySetting(index?, settingCodeDelete?) {
    var eCompanySetting = eCompanySettings[this.tableName];
    await this._companySettingService.deleteCompanySetting(this.encryptedUser, settingCodeDelete, eCompanySetting)
      .then((result: SimpleResponse) => {
        if (result) {
          this.deleteItemsResProcess(index);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('Error in deleting setting code' + err);
      });
  }

  async deleteSetting(index?, settingCodeDelete?) {
    var eClassCode = eClassCodes[this.tableName];
    await this._classCodeService.deleteClassCodes(this.encryptedUser, settingCodeDelete, eClassCode)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.deleteItemsResProcess(index);
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('Error in deleting setting code' + err);
      });
  }

  deleteItemsResProcess(index?) {
    this._localService.handleContactSettingsEmit(this.tableName, this.settingName);
    this.settingFormCtls.controls.splice(index, 1);
    this.originalSettingFormcontrols = this.settingFormCtls.controls.slice();
    this.showSpinner = false;
    this._notifyService.showSuccess("Setting deleted successfully", this.tableName, 2000);
   
  }

  showColorClm() {
    return this.settingName && this.settingName == 'appt' && (this.tableName == 'ApptContactTypeCode' || this.tableName == 'ApptGeneralTypeCode' || this.tableName == 'ApptLeadTypeCode') ? true : false;
  }
  
  emitPagination(pagedData) {
    this.settingFormCtls.controls = [];
    this.settingFormCtls.controls = pagedData.data;
    this.skipSize = pagedData.skipSize;
    this.pageSize = pagedData.size
       
  }

  settingItemtoEdit(index) {
    this.editRowIndex = index;
    this.settingEdit = 1;
  }

}
