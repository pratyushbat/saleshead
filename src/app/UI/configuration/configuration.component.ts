import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Type } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { getMatIconFailedToSanitizeLiteralError } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { anyChanged } from '@progress/kendo-angular-common';
import { isNull, isNullOrUndefined } from 'util';
import { CLPUser, FeatureAccess, UserResponse } from '../../models/clpuser.model';
import { ContactFieldsResponse, Field, sectionDiplaySetting, DisplaySettingResponse, DisplaySetting } from '../../models/contact.model';
import { eFeatures, eFieldType, eSection, eUserRole } from '../../models/enum.model';
import { SimpleResponse } from '../../models/genericResponse.model';
import { ContactService } from '../../services/contact.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { identifierModuleUrl } from '@angular/compiler';
import { strict } from 'assert';
import { NotificationService } from '../../services/notification.service';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';


declare var $: any;

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
/** configuration component*/
export class ConfigurationComponent {

  /** configuration ctor */
  user: CLPUser;
  eventUpdateCounter = 0;
  isInit: boolean = false;
  isChange: boolean = false;
  showSpinner: boolean = false;
  encryptedUser: string;

  contactFieldsResponse: ContactFieldsResponse;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  arrAllControls: any[] = [];
  arrGenCtrl: any[] = [];
  arrCommunicationCtrl: any[] = [];
  arrAddressCtrl: any[] = [];
  arrClassificationCbCtrl: any[] = [];
  arrClassificationDropDownCtrl: any[];
  arrAddtionalInformationCtrl: any[];
  arrImportantDatesCtrl: any[];
  arrMoreFieldsCtrl: any[];
  arrCommentsCtrl: any[];
  arrSortedBySection: any[] = [];

  /* dragaable changes between section*/
  checkValeForSelectedItem: any;
  checkValueForSelectedInput: string;
  oldSection: any;
  newSection: any;
  newIndex: any;
  oldIndex: any;
  /* dragaable changes between section*/

  @Input() isCommon: boolean = false;
  featureAccess: FeatureAccess;

  constructor(public notifyService: NotificationService, private fb: FormBuilder, public _contactService: ContactService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _route: ActivatedRoute,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  public end() { }

  public eventOptions = {
    onUpdate: () => this.eventUpdateCounter++,
    draggable: '.draggable',
    group: 'shared',
    onStart: (/**Event*/evt) => {
      this.startEe(evt);

    },
    onEnd: (/**Event*/evt) => {
      this.endEv(evt);
    }
  };

  public eventOptionsSection = {
    onUpdate: () => this.eventUpdateCounter++,
    draggable: '.draggable',
  };

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))//&& this.user.userRole >= eUserRole.Administrator && this.user.isShowCP) {
        {
          this.showSpinner = true;
          this.getContactFieldsConfiguration();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  ngAfterViewChecked() {
    if (this.isInit) {
      this.isInit = false;
      this.loadConfiguration();
    }
    if (this.isChange) {
      this.isChange = false;
      this.updateConfiguration();
    }
  }

  loadConfiguration() {
    for (var i = 0; i < this.arrGenCtrl.length; i++) {
      if (this.arrGenCtrl[i].inputConfigFiled == 'radio') {
        var radioGen_id = "radioGen" + i;
        $('input:radio[name=' + radioGen_id + '][value=' + this.arrGenCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbGen_id = "cbGen" + i;
        $("#" + cbGen_id).prop("checked", this.arrGenCtrl[i].isShow == 1 ? true : false);
        $("#spanGen" + i).text(this.arrGenCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommunicationCtrl.length; i++) {
      if (this.arrCommunicationCtrl[i].inputConfigFiled == 'radio') {
        var radioComm_id = "radioComm" + i;
        $('input:radio[name=' + radioComm_id + '][value=' + this.arrCommunicationCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbComm_id = "cbComm" + i;
        $("#" + cbComm_id).prop("checked", this.arrCommunicationCtrl[i].isShow == 1 ? true : false);
        $("#spanComm" + i).text(this.arrCommunicationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrAddressCtrl.length; i++) {
      if (this.arrAddressCtrl[i].inputConfigFiled == 'radio') {
        var radioCBAdd_id = "radioCBAdd" + i;
        $('input:radio[name=' + radioCBAdd_id + '][value=' + this.arrAddressCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbAdd_id = "cbAdd" + i;
        $("#" + cbAdd_id).prop("checked", this.arrAddressCtrl[i].isShow == 1 ? true : false);
        $("#spanAdd" + i).text(this.arrAddressCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrAddtionalInformationCtrl.length; i++) {
      if (this.arrAddtionalInformationCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomText_id = "radioCustomText" + i;
        $('input:radio[name=' + radioCustomText_id + '][value=' + this.arrAddtionalInformationCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCustomText_id = "cbCustomText" + i;
        $("#" + cbCustomText_id).prop("checked", this.arrAddtionalInformationCtrl[i].isShow == 1 ? true : false);
        $("#spanCustomText" + i).text(this.arrAddtionalInformationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrClassificationDropDownCtrl.length; i++) {
      if (this.arrClassificationDropDownCtrl[i].inputConfigFiled == 'radio') {
        var radioDD_id = "radioDD" + i;
        $('input:radio[name=' + radioDD_id + '][value=' + this.arrClassificationDropDownCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbDD_id = "cbDD" + i;
        $("#" + cbDD_id).prop("checked", this.arrClassificationDropDownCtrl[i].isShow == 1 ? true : false);
        $("#spanDD" + i).text(this.arrClassificationDropDownCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrClassificationCbCtrl.length; i++) {
      if (this.arrClassificationCbCtrl[i].inputConfigFiled == 'radio') {
        var radioCB_id = "radioCB" + i;
        $('input:radio[name=' + radioCB_id + '][value=' + this.arrClassificationCbCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCB_id = "cbCB" + i;
        $("#" + cbCB_id).prop("checked", this.arrClassificationCbCtrl[i].isShow == 1 ? true : false);
        $("#spanCB" + i).text(this.arrClassificationCbCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommentsCtrl.length; i++) {
      if (this.arrCommentsCtrl[i].inputConfigFiled == 'radio') {
        var radioCBAdd_id = "radioCBAdd" + i;
        $('input:radio[name=' + radioCBAdd_id + '][value=' + this.arrCommentsCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbComments_id = "cbComments" + i;
        $("#" + cbComments_id).prop("checked", this.arrCommentsCtrl[i].isShow == 1 ? true : false);
        $("#spanComments" + i).text(this.arrCommentsCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }
  }

  updateConfiguration() {
    for (var i = 0; i < this.arrGenCtrl.length; i++) {
      if (this.arrGenCtrl[i].inputConfigFiled == 'radio') {
        var radioGen_id = "radioGen" + i;
        $('input:radio[name=' + radioGen_id + '][value=' + this.arrGenCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbGen_id = "cbGen" + i;
        $("#" + cbGen_id).prop("checked", this.arrGenCtrl[i].isShow == 1 ? true : false);
        $("#spanGen" + i).text(this.arrGenCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommunicationCtrl.length; i++) {
      if (this.arrCommunicationCtrl[i].inputConfigFiled == 'radio') {
        var radioComm_id = "radioComm" + i;
        $('input:radio[name=' + radioComm_id + '][value=' + this.arrCommunicationCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbComm_id = "cbComm" + i;
        $("#" + cbComm_id).prop("checked", this.arrCommunicationCtrl[i].isShow == 1 ? true : false);
        $("#spanComm" + i).text(this.arrCommunicationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrAddressCtrl.length; i++) {
      if (this.arrAddressCtrl[i].inputConfigFiled == 'radio') {
        var radioCBAdd_id = "radioCBAdd" + i;
        $('input:radio[name=' + radioCBAdd_id + '][value=' + this.arrAddressCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbAdd_id = "cbAdd" + i;
        $("#" + cbAdd_id).prop("checked", this.arrAddressCtrl[i].isShow == 1 ? true : false);
        $("#spanAdd" + i).text(this.arrAddressCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrAddtionalInformationCtrl.length; i++) {
      if (this.arrAddtionalInformationCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomText_id = "radioCustomText" + i;
        $('input:radio[name=' + radioCustomText_id + '][value=' + this.arrAddtionalInformationCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCustomText_id = "cbCustomText" + i;
        $("#" + cbCustomText_id).prop("checked", this.arrAddtionalInformationCtrl[i].isShow == 1 ? true : false);
        $("#spanCustomText" + i).text(this.arrAddtionalInformationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrClassificationDropDownCtrl.length; i++) {
      if (this.arrClassificationDropDownCtrl[i].inputConfigFiled == 'radio') {
        var radioDD_id = "radioDD" + i;
        $('input:radio[name=' + radioDD_id + '][value=' + this.arrClassificationDropDownCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbDD_id = "cbDD" + i;
        $("#" + cbDD_id).prop("checked", this.arrClassificationDropDownCtrl[i].isShow == 1 ? true : false);
        $("#spanDD" + i).text(this.arrClassificationDropDownCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrClassificationCbCtrl.length; i++) {
      if (this.arrClassificationCbCtrl[i].inputConfigFiled == 'radio') {
        var radioCB_id = "radioCB" + i;
        $('input:radio[name=' + radioCB_id + '][value=' + this.arrClassificationCbCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCB_id = "cbCB" + i;
        $("#" + cbCB_id).prop("checked", this.arrClassificationCbCtrl[i].isShow == 1 ? true : false);
        $("#spanCB" + i).text(this.arrClassificationCbCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommentsCtrl.length; i++) {
      if (this.arrCommentsCtrl[i].inputConfigFiled == 'radio') {
        var radioCBAdd_id = "radioCBAdd" + i;
        $('input:radio[name=' + radioCBAdd_id + '][value=' + this.arrCommentsCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbComments_id = "cbComments" + i;
        $("#" + cbComments_id).prop("checked", this.arrCommentsCtrl[i].isShow == 1 ? true : false);
        $("#spanComments" + i).text(this.arrCommentsCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.Configuration)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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

  async getContactFieldsConfiguration() {
    this.showSpinner = true;
    if (!isNullOrUndefined(this.user)) {

      await this._contactService.contactFields_Get_Configuration(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
        .then(async (result: ContactFieldsResponse) => {
          if (result) {
            this.showSpinner = false;
            this.contactFieldsResponse = UtilityService.clone(result);
            this.arrAllControls = [];
            var keys = Object.keys(this.contactFieldsResponse.contactFields).filter(i => i.indexOf("contactMoreFields") == -1 && i.indexOf("displaySetting") == -1);
            for (var i = 0; i < keys.length; i++)
              this.arrAllControls.push(this.contactFieldsResponse.contactFields[keys[i]]);

            if (this.contactFieldsResponse.contactFields.contactMoreFields) {
              var keys_moreFields = Object.keys(this.contactFieldsResponse.contactFields.contactMoreFields);
              for (var i = 0; i < keys_moreFields.length; i++) {
                if (!isNullOrUndefined(this.contactFieldsResponse.contactFields.contactMoreFields[keys_moreFields[i]]))
                  this.arrAllControls.push(this.contactFieldsResponse.contactFields.contactMoreFields[keys_moreFields[i]]);
              }
            }

            this.arrGenCtrl = this.arrAllControls.filter(i => i.section == eSection.General);
            this.arrCommunicationCtrl = this.arrAllControls.filter(i => i.section == eSection.Communication);
            this.arrAddressCtrl = this.arrAllControls.filter(i => i.section == eSection.Address);
            this.arrClassificationCbCtrl = this.arrAllControls.filter(i => i.section == eSection.ClassificationCheckBox);
            this.arrClassificationDropDownCtrl = this.arrAllControls.filter(i => i.section == eSection.ClassificationDropDown);
            this.arrAddtionalInformationCtrl = this.arrAllControls.filter(i => i.section == eSection.AddtionalInformation);
            this.arrImportantDatesCtrl = this.arrAllControls.filter(i => i.section == eSection.ImportantDates);
            this.arrMoreFieldsCtrl = this.arrAllControls.filter(i => i.section == eSection.MoreFields);
            this.arrCommentsCtrl = this.arrAllControls.filter(i => i.section == eSection.Comments);

            this.arrGenCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrCommunicationCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrAddressCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrClassificationCbCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrClassificationDropDownCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrAddtionalInformationCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrImportantDatesCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrMoreFieldsCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
            this.arrCommentsCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);



            if (!isNullOrUndefined(this.contactFieldsResponse.contactFields) && !isNullOrUndefined(this.contactFieldsResponse.contactFields.displaySetting) && !isNullOrUndefined(this.contactFieldsResponse.contactFields.displaySetting.fieldDiplaySettings.length > 0)) {
              this.arrSortedBySection = [];
              let sectionDiplaySettings: sectionDiplaySetting[] = this.contactFieldsResponse.contactFields.displaySetting.sectionDiplaySettings;
              sectionDiplaySettings.sort((a, b) => (a.sectionDisplayOrder > b.sectionDisplayOrder) ? 1 : -1);
              for (var i = 0; i < sectionDiplaySettings.length; i++) {
                switch (eSection[sectionDiplaySettings[i].sectionId]) {
                  case eSection[eSection.Communication]: this.arrSortedBySection.push({ sectionName: 'Communication', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommunicationCtrl }); break;
                  case eSection[eSection.Address]: this.arrSortedBySection.push({ sectionName: 'Address', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddressCtrl }); break;
                  case eSection[eSection.AddtionalInformation]: this.arrSortedBySection.push({ sectionName: 'Additional Information Custom Text Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddtionalInformationCtrl }); break;
                  case eSection[eSection.ClassificationDropDown]: this.arrSortedBySection.push({ sectionName: 'Classification Drop Down Custom Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassificationDropDownCtrl }); break;
                  case eSection[eSection.ClassificationCheckBox]: this.arrSortedBySection.push({ sectionName: 'Classification Checkbox Custom Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassificationCbCtrl }); break;
                  case eSection[eSection.Comments]: this.arrSortedBySection.push({ sectionName: 'Comments', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommentsCtrl }); break;
                  case eSection[eSection.ImportantDates]: this.arrSortedBySection.push({ sectionName: 'Important Dates (Default Titles)', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrImportantDatesCtrl }); break;
                  case eSection[eSection.MoreFields]: this.arrSortedBySection.push({ sectionName: 'More Fields (Default Titles)', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrMoreFieldsCtrl }); break;
                  case eSection[eSection.General]: this.arrSortedBySection.push({ sectionName: 'General', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrGenCtrl }); break;
                }
              }
            }
            this.isInit = true;
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
  }

  getSectionNameById(sectionId): string {
    return eSection[sectionId].toString();
  }

  async saveConfiguration() {

    this.showSpinner = true;

    let _displaySettingResponse: DisplaySettingResponse = { contactFields: [], displaySetting: { fieldDiplaySettings: [], sectionDiplaySettings: [] } };

    for (var i = 0; i < this.arrSortedBySection.length; i++) {
      let _setionDiplaySetting: sectionDiplaySetting = { sectionId: this.arrSortedBySection[i].sectionId, sectionName: this.arrSortedBySection[i].sectionName, sectionDisplayOrder: i }
      _displaySettingResponse.displaySetting.sectionDiplaySettings.push(_setionDiplaySetting);
    }

    if (!isNullOrUndefined(this.contactFieldsResponse) && !isNullOrUndefined(this.contactFieldsResponse.contactFields)) {
      var contactFields = this.contactFieldsResponse.contactFields;
      var arrFinal = [];

      let arrGeneral: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.General)[0]).items;

      if (!isNullOrUndefined(arrGeneral) && arrGeneral.length > 0) {
        for (var i = 0; i < arrGeneral.length; i++) {
          arrGeneral[i].section = eSection.General;
          arrGeneral[i].displayOrder = (i + 1);
          arrGeneral[i].fieldTitle = $("#tbGenTitle" + i).val();

          if (arrGeneral[i].inputConfigFiled == 'radio') {
            var radioGen_id = "radioGen" + i;
            arrGeneral[i].isShow = $('input[name=' + radioGen_id + ']:checked').val();
            arrGeneral[i].isShow = +arrGeneral[i].isShow;
          }
          else {
            var cbGen_id = "cbGen" + i;
            arrGeneral[i].isShow = $('#' + cbGen_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(this.arrGenCtrl[i]);
        }
      }

      let arrCommunication: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.Communication)[0]).items;

      if (!isNullOrUndefined(arrCommunication) && arrCommunication.length > 0) {
        for (var i = 0; i < arrCommunication.length; i++) {
          arrCommunication[i].section = eSection.Communication;
          arrCommunication[i].displayOrder = (i + 1);
          arrCommunication[i].fieldTitle = $("#tbCommTitle" + i).val();

          if (arrCommunication.inputConfigFiled == 'radio') {
            var radioComm_id = "radioComm" + i;
            arrCommunication[i].isShow = $('input[name=' + radioComm_id + ']:checked').val();
            arrCommunication[i].isShow = +arrCommunication[i].isShow;
          }
          else {
            var cbComm_id = "cbComm" + i;
            arrCommunication[i].isShow = $('#' + cbComm_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrCommunication[i]);
        }
      }

      let arrAddress: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.Address)[0]).items;

      if (!isNullOrUndefined(arrAddress) && arrAddress.length > 0) {
        for (var i = 0; i < arrAddress.length; i++) {
          arrAddress[i].section = eSection.Address;
          arrAddress[i].displayOrder = (i + 1);
          arrAddress[i].fieldTitle = $("#tbAddTitle" + i).val();

          if (this.arrAddressCtrl[i].inputConfigFiled == 'radio') {
            var radioCBAdd_id = "radioCBAdd" + i;
            arrAddress[i].isShow = $('input[name=' + radioCBAdd_id + ']:checked').val();
            arrAddress[i].isShow = +arrAddress[i].isShow;
          }
          else {
            var cbAdd_id = "cbAdd" + i;
            arrAddress[i].isShow = $('#' + cbAdd_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrAddress[i]);
        }
      }

      let arrClassificationCb: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.ClassificationCheckBox)[0]).items;

      if (!isNullOrUndefined(arrClassificationCb) && arrClassificationCb.length > 0) {
        for (var i = 0; i < arrClassificationCb.length; i++) {
          arrClassificationCb[i].section = eSection.ClassificationCheckBox;
          arrClassificationCb[i].displayOrder = (i + 1);
          arrClassificationCb[i].fieldTitle = $("#tbCBTitle" + i).val();

          if (arrClassificationCb[i].inputConfigFiled == 'radio') {
            var radioCB_id = "radioCB" + i;
            arrClassificationCb[i].isShow = $('input[name=' + radioCB_id + ']:checked').val();
            arrClassificationCb[i].isShow = +arrClassificationCb[i].isShow;
          }
          else {
            var cbCB_id = "cbCB" + i;
            arrClassificationCb[i].isShow = $('#' + cbCB_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrClassificationCb[i]);
        }
      }

      let arrClassificationDropDow: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.ClassificationDropDown)[0]).items;

      if (!isNullOrUndefined(arrClassificationDropDow) && arrClassificationDropDow.length > 0) {
        for (var i = 0; i < arrClassificationDropDow.length; i++) {
          arrClassificationDropDow[i].section = eSection.ClassificationDropDown;
          arrClassificationDropDow[i].displayOrder = (i + 1);
          arrClassificationDropDow[i].fieldTitle = $("#tbDDTitle" + i).val();

          if (arrClassificationDropDow[i].inputConfigFiled == 'radio') {
            var radioDD_id = "radioDD" + i;
            arrClassificationDropDow[i].isShow = $('input[name=' + radioDD_id + ']:checked').val();
            arrClassificationDropDow[i].isShow = +arrClassificationDropDow[i].isShow;
          }
          else {
            var cbDD_id = "cbDD" + i;
            arrClassificationDropDow[i].isShow = $('#' + cbDD_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrClassificationDropDow[i]);
        }
      }

      let arrAddtionalInformation: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.AddtionalInformation)[0]).items;

      if (!isNullOrUndefined(arrAddtionalInformation) && arrAddtionalInformation.length > 0) {
        for (var i = 0; i < arrAddtionalInformation.length; i++) {
          arrAddtionalInformation[i].section = eSection.AddtionalInformation;
          arrAddtionalInformation[i].displayOrder = (i + 1);
          arrAddtionalInformation[i].fieldTitle = $("#tbCustomTextFldTitle" + i).val();

          if (arrAddtionalInformation[i].inputConfigFiled == 'radio') {
            var radioCustomText_id = "radioCustomText" + i;
            arrAddtionalInformation[i].isShow = $('input[name=' + radioCustomText_id + ']:checked').val();
            arrAddtionalInformation[i].isShow = +arrAddtionalInformation[i].isShow;
          }
          else {
            var cbCustomText_id = "cbCustomText" + i;
            arrAddtionalInformation[i].isShow = $('#' + cbCustomText_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrAddtionalInformation[i]);
        }
      }

      let arrImportantDates: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.ImportantDates)[0]).items;

      if (!isNullOrUndefined(arrImportantDates) && arrImportantDates.length > 0) {
        for (var i = 0; i < arrImportantDates.length; i++) {
          arrImportantDates[i].section = eSection.ImportantDates;
          arrImportantDates[i].displayOrder = (i + 1);
          arrImportantDates[i].fieldTitle = $("#tbImpDatesFldTitle" + i).val();
          arrFinal.push(arrImportantDates[i]);
        }
      }

      let arrMoreFields: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.MoreFields)[0]).items;

      if (!isNullOrUndefined(arrMoreFields) && arrMoreFields.length > 0) {
        for (var i = 0; i < arrMoreFields.length; i++) {
          arrMoreFields[i].section = eSection.MoreFields;
          arrMoreFields[i].displayOrder = (i + 1);
          arrMoreFields[i].fieldTitle = $("#tbMoreDatesFldTitle" + i).val();
          arrFinal.push(arrMoreFields[i]);
        }
      }

      let arrComments: any = (this.arrSortedBySection.filter(i => i.sectionId == eSection.Comments)[0]).items;

      if (!isNullOrUndefined(arrComments) && arrComments.length > 0) {
        for (var i = 0; i < arrComments.length; i++) {
          arrComments[i].section = eSection.Comments;
          arrComments[i].displayOrder = (i + 1);
          arrComments[i].fieldTitle = $("#tbCommentTitle" + i).val();

          if (arrComments[i].inputConfigFiled == 'radio') {
            var radioCBAdd_id = "radioCBAdd" + i;
            arrComments[i].isShow = $('input[name=' + radioCBAdd_id + ']:checked').val();
          }
          else {
            var cbComments_id = "cbComments" + i;
            arrComments[i].isShow = $('#' + cbComments_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrComments[i]);
        }
      }

      _displaySettingResponse.contactFields = arrFinal;
      _displaySettingResponse.displaySetting.fieldDiplaySettings.push({ displayOrder: 0, fieldName: '', inputConfigFiled: '', sectionId: 0 });
      await this._contactService.ContactFields_UpdateConfiguration(this.encryptedUser, _displaySettingResponse, this.user.cLPCompanyID)
        .then(async (result: SimpleResponse) => {
          if (result) {

            var res = UtilityService.clone(result);
            this.showSpinner = false;
            this.notifyService.showSuccess("Contact Configuration updated successfully", "", 3000);
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.notifyService.showError("some error occurred, Please contact Administrator.", "", 3000);
        });
      this.showSpinner = false;
    }
    this.getContactFieldsConfiguration();
  }

  checkValue(e: any, id: string) {
    this.newSection = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.newIndex = Number(id[id.length - 1]);
    if (this.newIndex != undefined && this.newSection) {
      var checkedBoolean = e.target.checked ? 1 : 0;
      this.checkValeForSelectedItem = checkedBoolean;
      this.updateArray();
      $("#" + id).text(e.target.checked ? "Show Mandatory" : "Show");
    } else {
      console.log('index or section not found');
    }
  }

  cancel() {
    this.loadConfiguration();
  }

  async onreset() {
    await this.getContactFieldsConfiguration();
    /* this.loadConfiguration();*/
    this.notifyService.showSuccess("Contact Configuration reset successfully", "", 3000);
  }

  startEe(evt) {
    var sectionSelFrom = evt.item?.offsetParent.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.oldSection = sectionSelFrom;
    if (evt.item.getElementsByTagName('input').item(0).type == "checkbox")
      this.checkValeForSelectedItem = evt.item?.getElementsByTagName('input').item(0).checked;
    else {
      if (evt.item.getElementsByTagName('input').item(0).type == "text")
        this.checkValueForSelectedInput = evt.item.getElementsByTagName('input').item(0).value;

      if (evt.item.getElementsByTagName('input')[1]) {
        var selectedRadioId = evt.item.getElementsByTagName('input')[1].name;
        var selectedRadioValue = $('input[name=' + selectedRadioId + ']:checked').val();
        this.checkValeForSelectedItem = Number(selectedRadioValue);
      }
    }
  }

  endEv(evt) {
    this.newSection = evt.item.offsetParent.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.newIndex = evt.newIndex;
    this.isChange = true;
    this.updateArray();

    /*  if (typeof this.checkValeForSelectedItem === "number") {
        this.isInit = true;
        this.updateArray();
      }
  
      else if (typeof this.checkValeForSelectedItem === "boolean") {
        this.isInit = true;
        this.updateArray();
      }*/



  }


  updateArray() {

    if (this.newSection == "General") {

      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrGenCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrGenCtrl[this.newIndex].isShow = this.arrGenCtrl[this.newIndex].isShow;
      this.arrGenCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrGenCtrl[this.newIndex].fieldTitle;
    }
    else if (this.newSection == "Address") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrAddressCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrAddressCtrl[this.newIndex].isShow = this.arrAddressCtrl[this.newIndex].isShow;
      this.arrAddressCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrAddressCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "More Fields (Default Titles)") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrMoreFieldsCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrMoreFieldsCtrl[this.newIndex].isShow = this.arrMoreFieldsCtrl[this.newIndex].isShow;
      this.arrMoreFieldsCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrMoreFieldsCtrl[this.newIndex].fieldTitle;
    }
    else if (this.newSection == "Important Dates (Default Titles)") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrImportantDatesCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrImportantDatesCtrl[this.newIndex].isShow = this.arrImportantDatesCtrl[this.newIndex].isShow;
      this.arrImportantDatesCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrImportantDatesCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Comments") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrCommentsCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrCommentsCtrl[this.newIndex].isShow = this.arrCommentsCtrl[this.newIndex].isShow;
      this.arrCommentsCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCommentsCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Classification Checkbox Custom Fields") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrClassificationCbCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrClassificationCbCtrl[this.newIndex].isShow = this.arrClassificationCbCtrl[this.newIndex].isShow;
      this.arrClassificationCbCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrClassificationCbCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Classification Drop Down Custom Fields") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrClassificationDropDownCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrClassificationDropDownCtrl[this.newIndex].isShow = this.arrClassificationDropDownCtrl[this.newIndex].isShow;
      this.arrClassificationDropDownCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrClassificationDropDownCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Additional Information Custom Text Fields") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrAddtionalInformationCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrAddtionalInformationCtrl[this.newIndex].isShow = this.arrAddtionalInformationCtrl[this.newIndex].isShow;
      this.arrAddtionalInformationCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrAddtionalInformationCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Communication") {
      if (!isNullOrUndefined(this.checkValeForSelectedItem))
        this.arrCommunicationCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      else
        this.arrCommunicationCtrl[this.newIndex].isShow = this.arrCommunicationCtrl[this.newIndex].isShow;
      this.arrCommunicationCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCommunicationCtrl[this.newIndex].fieldTitle;
    }

    this.checkValueForSelectedInput = undefined;
  }

  handleChange(evt) {
    this.newSection = evt.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.getElementsByTagName('h5')[0].innerText;
    var id = evt.currentTarget.name
    this.newIndex = Number(id[id.length - 1]);
    if (this.newIndex != undefined && this.newSection) {
      this.checkValeForSelectedItem = Number(evt.currentTarget.value);
      this.updateArray();
    } else {
      console.log('index or section not found');
    }
  }
  showSectionWiseContactConfig(section, sectionItem) {
    return ((section.sectionId == 1 || section.sectionId == 2 || section.sectionId == 3 || section.sectionId == 4 || section.sectionId == 5 || section.sectionId == 6 || section.sectionId == 7 || section.sectionId == 8 || section.sectionId == 9) && sectionItem.inputConfigFiled == 'check');
  }
}
