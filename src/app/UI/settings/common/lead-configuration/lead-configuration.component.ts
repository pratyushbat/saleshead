import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { sectionDiplaySetting } from '../../../../models/contact.model';
import { eFeatures, eSectionLead } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { LeadDisplaySettingResponse, LeadFieldsResponse } from '../../../../models/lead.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { CompanySettingService } from '../../../../services/companySetting.service';
import { LeadSettingService } from '../../../../services/leadSetting.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-lead-configuration',
    templateUrl: './lead-configuration.component.html',
    styleUrls: ['./lead-configuration.component.css']
})
/** lead-configuration component*/
export class LeadConfigurationComponent {
  /** lead-configuration ctor */
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  leadFieldsResponse: LeadFieldsResponse;

  eventUpdateCounter = 0;
  isInit: boolean = false;
  isChange: boolean = false;
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  currentUrl: string = '';

  arrAllControls: any[] = [];
  arrSortedBySection: any[] = [];

  arrGenCtrl: any[] = [];
  arrCustomDateCtrl: any[] = [];
  arrCustomTextCtrl: any[] = [];
  arrAdditionalMultilineTextCtrl: any[];
  arrRevenueRelatedCtrl: any[];
  arrCustomMoneyCtrl: any[];
  arrCustomClassificationDropDownCtrl: any[];
  arrCustomClassificationCheckboxCtrl: any[];

  /* dragaable changes between section*/
  checkValeForSelectedItem: any;
  oldSection: any;
  newSection: any;
  newIndex: any;
  oldIndex: any;
  checkValueForSelectedInput: string;
  /* dragaable changes between section*/

  constructor(private _router: Router,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _leadSettingService: LeadSettingService,
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

  ngOnInit(): void {

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.showSpinner = true;
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.showSpinner = false;
          this.getLeadFieldsConfiguration();
        }
        else {
          this.showSpinner = false;
          this._router.navigate(['/unauthorized']);
        }
      })
    }
    else {
      this.showSpinner = false;
      this._router.navigate(['/unauthorized']);
    }
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, this.currentUrl == 'appt-settings' ? eFeatures.AppointmentNoteandMailingSettings : this.currentUrl == 'company-settings' ? eFeatures.CompanyModuleSettings : this.currentUrl == 'contact-settings' ? eFeatures.ContactModuleSettings : this.currentUrl == 'lead-settings' ? eFeatures.LeadModuleSettings : eFeatures.AppointmentNoteandMailingSettings)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse) ) {
            this.user = this.userResponse.user;
            if (this.user?.userRole <= 3) {
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }
          }
          else
            this._router.navigate(['/unauthorized']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getLeadFieldsConfiguration() {
    this.showSpinner = false;
    await this._leadSettingService.getLeadFieldsConfiguration(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: LeadFieldsResponse) => {
        if (result) {
          this.showSpinner = false;
          var result = UtilityService.clone(result);
          this.leadFieldsResponse = UtilityService.clone(result);
          this.arrAllControls = [];
          var keys = Object.keys(this.leadFieldsResponse.leadFields).filter(i => i.indexOf("contactMoreFields") == -1 && i.indexOf("displaySetting") == -1);
          for (var i = 0; i < keys.length; i++) {
            if (!!this.leadFieldsResponse.leadFields[keys[i]])
              this.arrAllControls.push(this.leadFieldsResponse.leadFields[keys[i]]);
          }

          this.arrGenCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.General);
          this.arrCustomDateCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomDateFields);
          this.arrCustomTextCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomTextFields);
          this.arrAdditionalMultilineTextCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.AdditionalMultilineTextFields);
          this.arrRevenueRelatedCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.RevenueRelatedFields);
          this.arrCustomMoneyCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomMoneyFields);
          this.arrCustomClassificationDropDownCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomClassificationDropDownFields);
          this.arrCustomClassificationCheckboxCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomClassificationCheckboxFields);

          this.arrGenCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCustomDateCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCustomTextCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrAdditionalMultilineTextCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrRevenueRelatedCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCustomMoneyCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCustomClassificationDropDownCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCustomClassificationCheckboxCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          
          if (!isNullOrUndefined(this.leadFieldsResponse.leadFields) && !isNullOrUndefined(this.leadFieldsResponse.leadFields.displaySetting) && !isNullOrUndefined(this.leadFieldsResponse.leadFields.displaySetting.fieldDiplaySettings.length > 0)) {
            this.arrSortedBySection = [];
            let sectionDiplaySettings: sectionDiplaySetting[] = this.leadFieldsResponse.leadFields.displaySetting.sectionDiplaySettings;
            sectionDiplaySettings.sort((a, b) => (a.sectionDisplayOrder > b.sectionDisplayOrder) ? 1 : -1);
            for (var i = 0; i < sectionDiplaySettings.length; i++) {
              switch (eSectionLead[sectionDiplaySettings[i].sectionId]) {
                case eSectionLead[eSectionLead.General]: this.arrSortedBySection.push({ sectionName: 'General', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrGenCtrl }); break;
                case eSectionLead[eSectionLead.CustomDateFields]: this.arrSortedBySection.push({ sectionName: 'Custom Date Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomDateCtrl }); break;
                case eSectionLead[eSectionLead.CustomTextFields]: this.arrSortedBySection.push({ sectionName: 'Custom Text Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomTextCtrl }); break;
                case eSectionLead[eSectionLead.AdditionalMultilineTextFields]: this.arrSortedBySection.push({ sectionName: 'Additional Multiline Text Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAdditionalMultilineTextCtrl }); break;
                case eSectionLead[eSectionLead.RevenueRelatedFields]: this.arrSortedBySection.push({ sectionName: 'Revenue Related Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrRevenueRelatedCtrl }); break;
                case eSectionLead[eSectionLead.CustomMoneyFields]: this.arrSortedBySection.push({ sectionName: 'Custom Money Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomMoneyCtrl }); break;
                case eSectionLead[eSectionLead.CustomClassificationDropDownFields]: this.arrSortedBySection.push({ sectionName: 'Custom Classification DropDown Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomClassificationDropDownCtrl }); break;
                case eSectionLead[eSectionLead.CustomClassificationCheckboxFields]: this.arrSortedBySection.push({ sectionName: 'Custom Classification Checkbox Fields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomClassificationCheckboxCtrl }); break;
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

  getSectionNameById(sectionId): string {
    return eSectionLead[sectionId].toString();
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

    for (var i = 0; i < this.arrCustomDateCtrl.length; i++) {
      if (this.arrCustomDateCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomDate_id = "radioCustomDate" + i;
        $('input:radio[name=' + radioCustomDate_id + '][value=' + this.arrCustomDateCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCustomDate_id = "cbCustomDate" + i;
        $("#" + cbCustomDate_id).prop("checked", this.arrCustomDateCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrCustomTextCtrl.length; i++) {
      if (this.arrCustomTextCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomText_id = "radioCustomText" + i;
        $('input:radio[name=' + radioCustomText_id + '][value=' + this.arrCustomTextCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCustomText_id = "cbCustomText" + i;
        $("#" + cbCustomText_id).prop("checked", this.arrCustomTextCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrAdditionalMultilineTextCtrl.length; i++) {
      if (this.arrAdditionalMultilineTextCtrl[i].inputConfigFiled == 'radio') {
        var radioAMText_id = "radioAMText" + i;
        $('input:radio[name=' + radioAMText_id + '][value=' + this.arrAdditionalMultilineTextCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbAMText_id = "cbAMText" + i;
        $("#" + cbAMText_id).prop("checked", this.arrAdditionalMultilineTextCtrl[i].isShow == 1 ? true : false);
        $("#spanAMText" + i).text(this.arrAdditionalMultilineTextCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrRevenueRelatedCtrl.length; i++) {
      if (this.arrRevenueRelatedCtrl[i].inputConfigFiled == 'radio') {
        var radioRevenueRelated_id = "radioRevenueRelated" + i;
        $('input:radio[name=' + radioRevenueRelated_id + '][value=' + this.arrRevenueRelatedCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbRevenueRelated_id = "cbRevenueRelated" + i;
        $("#" + cbRevenueRelated_id).prop("checked", this.arrRevenueRelatedCtrl[i].isShow == 1 ? true : false);
        $("#spanRevenueRelated" + i).text(this.arrRevenueRelatedCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCustomMoneyCtrl.length; i++) {
      if (this.arrCustomMoneyCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomMoney_id = "radioCustomMoney" + i;
        $('input:radio[name=' + radioCustomMoney_id + '][value=' + this.arrCustomMoneyCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCustomMoney_id = "cbCustomMoney" + i;
        $("#" + cbCustomMoney_id).prop("checked", this.arrCustomMoneyCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrCustomClassificationDropDownCtrl.length; i++) {
      if (this.arrCustomClassificationDropDownCtrl[i].inputConfigFiled == 'radio') {
        var radioDD_id = "radioDD" + i;
        $('input:radio[name=' + radioDD_id + '][value=' + this.arrCustomClassificationDropDownCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbDD_id = "cbDD" + i;
        $("#" + cbDD_id).prop("checked", this.arrCustomClassificationDropDownCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrCustomClassificationCheckboxCtrl.length; i++) {
      if (this.arrCustomClassificationCheckboxCtrl[i].inputConfigFiled == 'radio') {
        var radioCB_id = "radioCB" + i;
        $('input:radio[name=' + radioCB_id + '][value=' + this.arrCustomClassificationCheckboxCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCB_id = "cbCB" + i;
        $("#" + cbCB_id).prop("checked", this.arrCustomClassificationCheckboxCtrl[i].isShow == 1 ? true : false);
        $("#spanCB" + i).text(this.arrCustomClassificationCheckboxCtrl[i].isShow == 0 ? "Show" : "Hide");
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

    for (var i = 0; i < this.arrCustomDateCtrl.length; i++) {
      if (this.arrCustomDateCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomDate_id = "radioCustomDate" + i;
        $('input:radio[name=' + radioCustomDate_id + '][value=' + this.arrCustomDateCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCustomDate_id = "cbCustomDate" + i;
        $("#" + cbCustomDate_id).prop("checked", this.arrCustomDateCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrCustomTextCtrl.length; i++) {
      if (this.arrCustomTextCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomText_id = "radioCustomText" + i;
        $('input:radio[name=' + radioCustomText_id + '][value=' + this.arrCustomTextCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCustomText_id = "cbCustomText" + i;
        $("#" + cbCustomText_id).prop("checked", this.arrCustomTextCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrAdditionalMultilineTextCtrl.length; i++) {
      if (this.arrAdditionalMultilineTextCtrl[i].inputConfigFiled == 'radio') {
        var radioAMText_id = "radioAMText" + i;
        $('input:radio[name=' + radioAMText_id + '][value=' + this.arrAdditionalMultilineTextCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbAMText_id = "cbAMText" + i;
        $("#" + cbAMText_id).prop("checked", this.arrAdditionalMultilineTextCtrl[i].isShow == 1 ? true : false);
        $("#spanAMText" + i).text(this.arrAdditionalMultilineTextCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrRevenueRelatedCtrl.length; i++) {
      if (this.arrRevenueRelatedCtrl[i].inputConfigFiled == 'radio') {
        var radioRevenueRelated_id = "radioRevenueRelated" + i;
        $('input:radio[name=' + radioRevenueRelated_id + '][value=' + this.arrRevenueRelatedCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbRevenueRelated_id = "cbRevenueRelated" + i;
        $("#" + cbRevenueRelated_id).prop("checked", this.arrRevenueRelatedCtrl[i].isShow == 1 ? true : false);
        $("#spanRevenueRelated" + i).text(this.arrRevenueRelatedCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCustomMoneyCtrl.length; i++) {
      if (this.arrCustomMoneyCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomMoney_id = "radioCustomMoney" + i;
        $('input:radio[name=' + radioCustomMoney_id + '][value=' + this.arrCustomMoneyCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCustomMoney_id = "cbCustomMoney" + i;
        $("#" + cbCustomMoney_id).prop("checked", this.arrCustomMoneyCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrCustomClassificationDropDownCtrl.length; i++) {
      if (this.arrCustomClassificationDropDownCtrl[i].inputConfigFiled == 'radio') {
        var radioDD_id = "radioDD" + i;
        $('input:radio[name=' + radioDD_id + '][value=' + this.arrCustomClassificationDropDownCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbDD_id = "cbDD" + i;
        $("#" + cbDD_id).prop("checked", this.arrCustomClassificationDropDownCtrl[i].isShow == 1 ? true : false);
      }
    }

    for (var i = 0; i < this.arrCustomClassificationCheckboxCtrl.length; i++) {
      if (this.arrCustomClassificationCheckboxCtrl[i].inputConfigFiled == 'radio') {
        var radioCB_id = "radioCB" + i;
        $('input:radio[name=' + radioCB_id + '][value=' + this.arrCustomClassificationCheckboxCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCB_id = "cbCB" + i;
        $("#" + cbCB_id).prop("checked", this.arrCustomClassificationCheckboxCtrl[i].isShow == 1 ? true : false);
        $("#spanCB" + i).text(this.arrCustomClassificationCheckboxCtrl[i].isShow == 0 ? "Show" : "Hide");
      }
    }

  }

  checkValue(e: any, id: string) {
    this.newSection = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.newIndex = Number(id[id.length - 1]);
    if (this.newIndex != undefined && this.newSection == 'Custom Classification Checkbox Fields') {
      if (this.newSection == 'Custom Classification Checkbox Fields') {
        var checkedBoolean = e.target.checked ? 0 : 2;
        this.checkValeForSelectedItem = checkedBoolean;
        this.updateArray();
        $("#" + id).text(e.target.checked ? "Show" : "Hide");
      }
      else {
        var checkedBoolean = e.target.checked ? 1 : 0;
        this.checkValeForSelectedItem = checkedBoolean;
        this.updateArray();
        $("#" + id).text(e.target.checked ? "Show Mandatory" : "Show");
      }
    }
    else {
      console.log('index or section not found');
    }
  }

  cancel() {
    this.loadConfiguration();
  }
  async onreset() {
    await this.getLeadFieldsConfiguration();
    this.notifyService.showSuccess("Lead Configuration reset successfully", "", 3000);
  }

  startEe(evt) {
    var sectionSelFrom = evt.item?.offsetParent.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.oldSection = sectionSelFrom;
    if (evt.item.getElementsByTagName('input').item(0).type == "checkbox" || evt.item.getElementsByTagName('input').item(0).type == "check")
      this.checkValeForSelectedItem = evt.item?.getElementsByTagName('input').item(0).checked;
    else {
      if (evt.item.getElementsByTagName('input').item(0).type == "text")
        this.checkValueForSelectedInput = evt.item.getElementsByTagName('input').item(0).value;

      if (evt.item.getElementsByTagName('input')[1]) {
        var selectedRadioId = evt.item.getElementsByTagName('input')[1].name;
        if (selectedRadioId == '') {
          var selectedRadioId = evt.item.getElementsByTagName('input')[1].id;
          this.checkValeForSelectedItem = $('input[id=' + selectedRadioId + ']:checked').val() == 'on' ? 1 : 0;
        }
        else {
          var selectedRadioValue = $('input[name=' + selectedRadioId + ']:checked').val();
          this.checkValeForSelectedItem = Number(selectedRadioValue);
        }
      }
    }
  }

  endEv(evt) {
    this.newSection = evt.item.offsetParent.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.newIndex = evt.newIndex;
    this.isChange = true;
      this.updateArray();
    
  }


  updateArray() {

    if (this.newSection == "General") {
      if (this.arrGenCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrGenCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrGenCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrGenCtrl[this.newIndex].fieldTitle;
    }


    else if (this.newSection == "Custom Date Fields") {
      if (this.arrCustomDateCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrCustomDateCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCustomDateCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCustomDateCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Custom Text Fields") {
      if (this.arrCustomTextCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrCustomTextCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCustomTextCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCustomTextCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Additional Multiline Text Fields") {
      if (this.arrAdditionalMultilineTextCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrAdditionalMultilineTextCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrAdditionalMultilineTextCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrAdditionalMultilineTextCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Revenue Related Fields") {
      if (this.arrRevenueRelatedCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrRevenueRelatedCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrRevenueRelatedCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrRevenueRelatedCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Custom Money Fields") {
      if (this.arrCustomMoneyCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrCustomMoneyCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCustomMoneyCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCustomMoneyCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Custom Classification DropDown Fields") {
      if (this.arrCustomClassificationDropDownCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrCustomClassificationDropDownCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCustomClassificationDropDownCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCustomClassificationDropDownCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Custom Classification Checkbox Fields") {
      if (this.arrCustomClassificationCheckboxCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrCustomClassificationCheckboxCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCustomClassificationCheckboxCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCustomClassificationCheckboxCtrl[this.newIndex].fieldTitle;
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

  async saveConfiguration() {

    this.showSpinner = true;

    let _displaySettingResponse: LeadDisplaySettingResponse = { leadFields: [], displaySetting : { fieldDiplaySettings: [], sectionDiplaySettings: [] } };

    for (var i = 0; i < this.arrSortedBySection.length; i++) {
      let _setionDiplaySetting: sectionDiplaySetting = { sectionId: this.arrSortedBySection[i].sectionId, sectionName: this.arrSortedBySection[i].sectionName, sectionDisplayOrder: i }
      _displaySettingResponse.displaySetting.sectionDiplaySettings.push(_setionDiplaySetting);
    }

    if (!isNullOrUndefined(this.leadFieldsResponse) && !isNullOrUndefined(this.leadFieldsResponse.leadFields)) {
      var contactFields = this.leadFieldsResponse.leadFields;
      var arrFinal = [];

      let arrGeneral: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.General)[0])?.items;

      if (!isNullOrUndefined(arrGeneral) && arrGeneral.length > 0) {

        for (var i = 0; i < arrGeneral.length; i++) {
          arrGeneral[i].sectionLead = eSectionLead.General;
          arrGeneral[i].displayOrder = (i + 1);

          if (arrGeneral[i].inputConfigFiled == 'radio') {
            var radioGen_id = "radioGen" + i;
            arrGeneral[i].isShow = $('input[name=' + radioGen_id + ']:checked').val() ? $('input[name=' + radioGen_id + ']:checked').val() : arrGeneral[i].isShow;
          }
          else {
            var cbGen_id = "cbGen" + i;
            arrGeneral[i].isShow = $('#' + cbGen_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(this.arrGenCtrl[i]);
        }
      }

      let arrCustomDate: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.CustomDateFields)[0]).items;

      if (!isNullOrUndefined(arrCustomDate) && arrCustomDate.length > 0) {
        for (var i = 0; i < arrCustomDate.length; i++) {
          arrCustomDate[i].sectionLead = eSectionLead.CustomDateFields;
          arrCustomDate[i].displayOrder = (i + 1);
          arrCustomDate[i].fieldTitle = $("#tbCustomDateFldTitle" + i).val();

          if (arrCustomDate[i].inputConfigFiled == 'radio') {
            var radioCustomDate_id = "radioCustomDate" + i;
            arrCustomDate[i].isShow = $('input[name=' + radioCustomDate_id + ']:checked').val() ? $('input[name=' + radioCustomDate_id + ']:checked').val() : arrCustomDate[i].isShow;
            arrCustomDate[i].isShow = +arrCustomDate[i].isShow;
          }
          else {
            var cbCustomDate_id = "cbCustomDate" + i;
            arrCustomDate[i].isShow = $('#' + cbCustomDate_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrCustomDate[i]);
        }
      }

      let arrCustomText: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.CustomTextFields)[0]).items;

      if (!isNullOrUndefined(arrCustomText) && arrCustomText.length > 0) {
        for (var i = 0; i < arrCustomText.length; i++) {
          arrCustomText[i].sectionLead = eSectionLead.CustomTextFields;
          arrCustomText[i].displayOrder = (i + 1);
          arrCustomText[i].fieldTitle = $("#tbCustomTextFldTitle" + i).val();

          if (arrCustomText[i].inputConfigFiled == 'radio') {
            var radioCustomText_id = "radioCustomText" + i;
            arrCustomText[i].isShow = $('input[name=' + radioCustomText_id + ']:checked').val() ? $('input[name=' + radioCustomText_id + ']:checked').val() : arrCustomText[i].isShow;
            arrCustomText[i].isShow = +arrCustomText[i].isShow;
          }
          else {
            var cbCustomText_id = "cbCustomText" + i;
            arrCustomText[i].isShow = $('#' + cbCustomText_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrCustomText[i]);
        }
      }

      let arrAdditionalMultilineText: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.AdditionalMultilineTextFields)[0]).items;

      if (!isNullOrUndefined(arrAdditionalMultilineText) && arrAdditionalMultilineText.length > 0) {
        for (var i = 0; i < arrAdditionalMultilineText.length; i++) {
          arrAdditionalMultilineText[i].sectionLead = eSectionLead.AdditionalMultilineTextFields;
          arrAdditionalMultilineText[i].displayOrder = (i + 1);
        
          if (arrAdditionalMultilineText[i].inputConfigFiled == 'radio') {
            var radioAMText_id = "radioAMText" + i;
            arrAdditionalMultilineText[i].isShow = $('input[name=' + radioAMText_id + ']:checked').val() ? $('input[name=' + radioAMText_id + ']:checked').val() : arrAdditionalMultilineText[i].isShow;
          }
          else {
            var cbAMText_id = "cbAMText" + i;
            arrAdditionalMultilineText[i].isShow = $('#' + cbAMText_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrAdditionalMultilineText[i]);
        }
      }

      let arrRevenueRelated: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.RevenueRelatedFields)[0]).items;

      if (!isNullOrUndefined(arrRevenueRelated) && arrRevenueRelated.length > 0) {
        for (var i = 0; i < arrRevenueRelated.length; i++) {
          arrRevenueRelated[i].sectionLead = eSectionLead.RevenueRelatedFields;
          arrRevenueRelated[i].displayOrder = (i + 1);

          if (arrRevenueRelated[i].inputConfigFiled == 'radio') {
            var radioRevenueRelated_id = "radioRevenueRelated" + i;
            arrRevenueRelated[i].isShow = $('input[name=' + radioRevenueRelated_id + ']:checked').val() ? $('input[name=' + radioRevenueRelated_id + ']:checked').val() : arrRevenueRelated[i].isShow;
          }
          else {
            var cbRevenueRelated_id = "cbRevenueRelated" + i;
            arrRevenueRelated[i].isShow = $('#' + cbRevenueRelated_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrRevenueRelated[i]);
        }
      }

      let arrCustomMoney: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.CustomMoneyFields)[0]).items;

      if (!isNullOrUndefined(arrCustomMoney) && arrCustomMoney.length > 0) {
        for (var i = 0; i < arrCustomMoney.length; i++) {
          arrCustomMoney[i].sectionLead = eSectionLead.CustomMoneyFields;
          arrCustomMoney[i].displayOrder = (i + 1);
          arrCustomMoney[i].fieldTitle = $("#tbCustomMoneyFldTitle" + i).val();

          if (arrCustomMoney[i].inputConfigFiled == 'radio') {
            var radioCustomMoney_id = "radioCustomMoney" + i;
            arrCustomMoney[i].isShow = $('input[name=' + radioCustomMoney_id + ']:checked').val() ? $('input[name=' + radioCustomMoney_id + ']:checked').val() : arrCustomMoney[i].isShow;
            arrCustomMoney[i].isShow = +arrCustomMoney[i].isShow;
          }
          else {
            var cbCustomMoney_id = "cbCustomMoney" + i;
            arrCustomMoney[i].isShow = $('#' + cbCustomMoney_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrCustomMoney[i]);
        }
      }

      let arrClassificationDropDow: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.CustomClassificationDropDownFields)[0]).items;

      if (!isNullOrUndefined(arrClassificationDropDow) && arrClassificationDropDow.length > 0) {
        for (var i = 0; i < arrClassificationDropDow.length; i++) {
          arrClassificationDropDow[i].sectionLead = eSectionLead.CustomClassificationDropDownFields;
          arrClassificationDropDow[i].displayOrder = (i + 1);
          arrClassificationDropDow[i].fieldTitle = $("#tbDDTitle" + i).val();

          if (arrClassificationDropDow[i].inputConfigFiled == 'radio') {
            var radioDD_id = "radioDD" + i;
            arrClassificationDropDow[i].isShow = $('input[name=' + radioDD_id + ']:checked').val() ? $('input[name=' + radioDD_id + ']:checked').val() : arrClassificationDropDow[i].isShow;
            arrClassificationDropDow[i].isShow = +arrClassificationDropDow[i].isShow;
          }
          else {
            var cbDD_id = "cbDD" + i;
            arrClassificationDropDow[i].isShow = $('#' + cbDD_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrClassificationDropDow[i]);
        }
      }

      let arrClassificationCb: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionLead.CustomClassificationCheckboxFields)[0]).items;

      if (!isNullOrUndefined(arrClassificationCb) && arrClassificationCb.length > 0) {
        for (var i = 0; i < arrClassificationCb.length; i++) {
          arrClassificationCb[i].sectionLead = eSectionLead.CustomClassificationCheckboxFields;
          arrClassificationCb[i].displayOrder = (i + 1);
          arrClassificationCb[i].fieldTitle = $("#tbCBTitle" + i).val();

          if (arrClassificationCb[i].inputConfigFiled == 'radio') {
            var radioCB_id = "radioCB" + i;
            arrClassificationCb[i].isShow = $('input[name=' + radioCB_id + ']:checked').val() ? $('input[name=' + radioCB_id + ']:checked').val() : arrClassificationCb[i].isShow;
            arrClassificationCb[i].isShow = +arrClassificationCb[i].isShow;
          }
          else {
            var cbCB_id = "cbCB" + i;
            arrClassificationCb[i].isShow = $('#' + cbCB_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrClassificationCb[i]);
        }
      }

      _displaySettingResponse.leadFields = arrFinal;
      _displaySettingResponse.displaySetting.fieldDiplaySettings.push({ displayOrder: 0, fieldName: '', inputConfigFiled: '', sectionId: 0 });
      await this._leadSettingService.updateLeadFieldsConfiguration(this.encryptedUser, this.user.cLPCompanyID, _displaySettingResponse)
        .then(async (result: SimpleResponse) => {
          if (result) {
            var res = UtilityService.clone(result);
            this.showSpinner = false;
            this.notifyService.showSuccess("Lead Configuration updated successfully", "", 3000);
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
  }

}
