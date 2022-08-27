import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';

@Component({
    selector: 'app-admin-password-form',
    templateUrl: './admin-password-form.component.html',
    styleUrls: ['./admin-password-form.component.css']
})
/** admin-password-form component*/
export class AdminPasswordFormComponent implements OnInit {
  /** admin-password-form ctor */
  adminForm = new FormGroup({});
  
  constructor(private fb: FormBuilder,
    public _localService: LocalService,
    public _notifyService: NotificationService,
  ) {

  }

  ngOnInit() {
    this.adminForm = this.prepareAdminForm();
    this.adminForm.reset();
  }

  prepareAdminForm() {
    return this.fb.group({
      password: [{ value: '' }, [Validators.required]],
    });
  }

  adminFormSubmit() {
    this._localService.validateAllFormFields(this.adminForm);
    this._localService.isAdminPassFrmValid = false;
    this._localService.isShowAdminTabs = false;
    if (this.adminForm.valid) {
      this.adminForm.markAsPristine();
      var password = this.adminForm?.controls.password?.value;
      if (password == '43flint')
        this._localService.isAdminPassFrmValid = true;
      else { this.adminForm.reset(); this._notifyService.showError("Credentials not match. Please try again.", "", 3000); }  /* this.adminForm.controls['password'].setValue('');*/
    }
    else
      this.adminForm.reset();
  }



}
