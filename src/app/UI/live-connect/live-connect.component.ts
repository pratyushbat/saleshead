import { Component } from '@angular/core';
import { LocalService } from '../../services/shared/local.service';

@Component({
    selector: 'app-live-connect',
    templateUrl: './live-connect.component.html',
    styleUrls: ['./live-connect.component.css']
})
/** live-connect component*/
export class LiveConnectComponent {
  /** live-connect ctor */
  constructor(public _localService: LocalService) {
      this._localService.isMenu = true;
    }
}
