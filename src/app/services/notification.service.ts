import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }
  showSuccess(message, title, timeout?) {
    this.toastr.success(message, title, {
      timeOut: timeout,
      closeButton: true,
      positionClass: 'toast-top-right'
    })
  }

  showError(message, title, timeout?) {
    this.toastr.error(message, title, {
      timeOut: timeout,
      positionClass: 'toast-top-right'
    })
  }

  showInfo(message, title, timeOut, easeTime, closeButton, positionClass) {
    this.toastr.info(message, title, {
      timeOut: timeOut,
      easeTime: easeTime,
      closeButton: closeButton,
      positionClass: 'toast-top-right'
    })
  }

  showWarning(message, title) {
    this.toastr.warning(message, title, {
      positionClass: 'toast-top-right'
    })
  }
}
