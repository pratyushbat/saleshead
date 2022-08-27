import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';

import { CLPUser } from '../../../../models/clpuser.model';
import { ContactFields, ContactFieldsResponse } from '../../../../models/contact.model';
import { TextMsgFilters, TextMsgFiltersResponse } from '../../../../models/textMsgFilters.model';

import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { OutBoundTextMsgService } from '../../../../services/outBoundTextMsg.service';
import { NotificationService } from '../../../../services/notification.service';
import { TxtMsg, TxtMsgResponse } from '../../../../models/txtMsg.model';
import { ContactService } from '../../../../services/contact.service';
import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-contact-sms',
    templateUrl: './contact-sms.component.html',
    styleUrls: ['./contact-sms.component.css'],
    animations: [pageAnimations, filterAnimation]
})
/** contact-sms component*/
export class ContactSmsComponent implements OnInit {
  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  //Animation
  /** contact-sms ctor */
  @Input() loggedUser: CLPUser;
  @Input() contactId: number = 0;

  public min: Date = new Date();

  contactFields: ContactFields;
  textMsgFiltersResponse: TextMsgFiltersResponse;
  txtMsgFilters: TextMsgFilters;
  txtMsg: TxtMsg;
  private encryptedUser: string = '';
  public hasError: boolean = false;
  toChoiceDropDown: any[] = [];
  templateFilter: any[] = [];
  imageFilter: any[] = [];
  smsForm: FormGroup;
  showDatePicker: boolean = false;
  public datePickerformat = "yyyy-MM-dd HH:mm a";

  isTextSend: boolean = false;

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _utilityService: UtilityService,
    private _outBoundTextMsgService: OutBoundTextMsgService,
    public _localService: LocalService,
    public _contactService: ContactService,
    public _contactSearchService: ContactSearchService,
    public notifyService: NotificationService
  ) {

  }

  ngOnInit() {
    this.smsForm = this.prepareSmsForm();
    this.smsForm.reset();
    
    this._localService.getPristineForm().subscribe(res => {
      this._localService.genericFormValidationState(this.smsForm);
    });

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      if (this.loggedUser) {
        if (!isNullOrUndefined(this._localService.contactFields) && (this._localService.contactFields.contactID.fieldValue == this.contactId))
          this.loadInitData();
        else
          this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID);
      }
      //this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID).subscribe((value) => this.getTextMsgFilters());
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  private prepareSmsForm(): FormGroup {
    return this.fb.group({
      from: [{ value: '' }],
      to: [{ value: '' }],
      template: [{ value: '' }],
      mediaUrl: [{ value: '' }],
      image: [{ value: '' }],
      message: [{ value: '' }, [Validators.required]],
      datePickerValue: [{ value: '' }],
    });
  }

  get smsFrm() {
    return this.smsForm.controls;
  }

  getContactFields(contactId, companyID, userId) {
    this._localService.getContactFields(this.encryptedUser, contactId, companyID, userId, true)
      .subscribe((value) =>
        this.loadInitData()
      );
   
  }

  loadInitData() {
    this.contactFields = this._localService.contactFields;
    this.getTextMsgFilters();
  }
  onCloseSms() {
    this._localService.hideCommonComponentEmit('sms');
    this._localService.showCommonComp = '';
    this.smsForm.reset();
  }

  getTextMsgFilters() {
    this.hasError = false;
    var contactId = this.contactFields.contactID.fieldValue ? this.contactFields.contactID.fieldValue : 0;
    this._outBoundTextMsgService.getTextMsgFilters(this.encryptedUser, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID, contactId)
      .then(async (result: TextMsgFiltersResponse) => {
        if (result) {
          this.textMsgFiltersResponse = UtilityService.clone(result);
          this.txtMsgFilters = this.textMsgFiltersResponse.txtMsgFilters;

          if (this.txtMsgFilters && !this.txtMsgFilters.messageBool && this.txtMsgFilters.messageString) {
            this.hasError = true;
            return;
          }

          this.toChoiceDropDown = this.txtMsgFilters && this.txtMsgFilters.toChoiceDropDown ? this.txtMsgFilters.toChoiceDropDown : [];
          this.templateFilter = this.txtMsgFilters && this.txtMsgFilters.templateFilter ? this.txtMsgFilters.templateFilter : [];
          this.imageFilter = this.txtMsgFilters && this.txtMsgFilters.imageFilter ? this.txtMsgFilters.imageFilter : [];

          this.patchSmsFormValues();

        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  patchSmsFormValues() {
    if (this.toChoiceDropDown.length > 0) {
      var choiceContact = this.toChoiceDropDown.find(x => x.key === this.contactFields.contactID.fieldValue);
      this.smsForm.patchValue({ to: choiceContact.key });
    }
    this.smsForm.patchValue({ from: this.txtMsgFilters.smsLongCode });
  }

  smsFormSubmit() {      
    this._localService.validateAllFormFields(this.smsForm);
    if (this.smsForm.valid) {
      this.smsForm.markAsPristine();
      this.sendSms();
    }
  }

  async sendSms() {    
    var dateResult = this.onDateChange();
    if (dateResult) {
      this.notifyService.showError("Time should be greater than 5 min", "", 3000);
      return;
    }
    this.copySmsFormToDataObject();
    this.isTextSend = true;
    this.txtMsg.cLPUserID = this.loggedUser.cLPUserID;
    this.txtMsg.contactID = this.contactFields.contactID.fieldValue;
    
    this._outBoundTextMsgService.sendMessage(this.encryptedUser, this.txtMsg)
      .then(async (result: TxtMsgResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (!response.messageBool && response.messageString != '')
            this.notifyService.showError(response.messageString ? response.messageString : 'Error: please try again.', "", 5000);
          else {
            this.notifyService.showSuccess(response.messageString ? response.messageString : "Text Message send successfully.", "", 5000);
            this.smsForm.reset();
            this.patchSmsFormValues();
            this._localService.handledEventEmit(true);
          }
        }
        this.isTextSend = false;

      })
      .catch((err: HttpErrorResponse) => {
        this.isTextSend = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  copySmsFormToDataObject() {
    this.txtMsg = <TxtMsg>{}; 

    this.txtMsg.cLPCompanyID = this.loggedUser.cLPCompanyID;
    this.txtMsg.cLPUserID = this.loggedUser.cLPUserID;

    if ((this.smsForm.controls.to.value == 0) || (this.smsForm.controls.to.value == '') || ((this.smsForm.controls.to.value) == (this.contactFields.contactID.fieldValue))) {
      this.txtMsg.isToUser = false;
      this.txtMsg.mobileNumber = this.contactFields ? this.contactFields.mobile.fieldValue : '';
      this.txtMsg.toCLPUserID = 0;
      this.txtMsg.msg = this.smsForm.controls.message.value ? this.smsForm.controls.message.value : '';      
    }
    else {
      this.txtMsg.isToUser = true;

      var selectedToChoiceUser = this.toChoiceDropDown.find(x => x.key == this.smsForm.controls.to.value);
      var splitValue = selectedToChoiceUser ? selectedToChoiceUser.value.split(':', 4) : null;
      this.txtMsg.mobileNumber = splitValue ? splitValue[1].trim() : '';
      this.txtMsg.toCLPUserID = this.smsForm.controls.to.value ? this.smsForm.controls.to.value : 0;
      
      var msg = this.smsForm.controls.message.value ? this.smsForm.controls.message.value : '';
      msg += ' Regarding ' + this.contactFields.lastName.fieldName + ' ' + this.contactFields.firstName.fieldValue;
      msg += this.contactFields.contactID.fieldName + ' ' + this.smsForm.controls.to.value;
      this.txtMsg.msg = msg;
    }

    this.txtMsg.contactID = this.contactFields.contactID.fieldValue;
    this.txtMsg.countryCode = '1';
    this.txtMsg.isUseShortCode = false;
    this.txtMsg.mediaURL = this.smsForm.controls.mediaUrl.value ? this.smsForm.controls.mediaUrl.value : '';
    this.txtMsg.imgID = this.smsForm.controls.image.value ? this.smsForm.controls.image.value : 0;
    this.txtMsg.status = 1; //Pending

    this.txtMsg.requestID = 'default';
    this.txtMsg.requestComment = '';
    this.txtMsg.campaignID = 0;
    this.txtMsg.campaignEventID = 0;
    this.txtMsg.isThrottle = false;

    if (this.showDatePicker && this.smsForm.controls.datePickerValue.value && this.smsForm.controls.datePickerValue.value != '') {
      this.txtMsg.isScheduled = true;
      this.txtMsg.dtSend = this.smsForm.controls.datePickerValue.value ? this.smsForm.controls.datePickerValue.value : '';
    }
    else {
      this.txtMsg.isScheduled = false;
      this.txtMsg.dtSend = new Date();
    }
  }

  onImageDropChange() {
    var selectedDocId = this.smsForm.controls.image.value;
    var selectedImgObj = this.imageFilter.find(i => i.documentId == selectedDocId);
    if (!isNullOrUndefined(selectedImgObj))
      this.smsForm.patchValue({ mediaUrl: selectedImgObj.imagePath + selectedImgObj.documentName });
  }

  onTemplateChange() {
    var selectedTemplateId = this.smsForm.controls.template.value;
    var selectedTemplateObj = this.templateFilter.find(i => i.key == selectedTemplateId);
    if (!isNullOrUndefined(selectedTemplateObj))
      this.smsForm.patchValue({ message: selectedTemplateObj.messageString ? selectedTemplateObj.messageString : '' });
  }

  onDateChange() {
    var selectedDate: Date = this.smsForm.controls.datePickerValue.value;
    if ((selectedDate?.getFullYear() == new Date().getFullYear()) && (selectedDate?.getTime() < new Date().getTime() + 300000)) return true; //5 min add
    else return false;
  }

}
