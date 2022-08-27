import { Component } from '@angular/core';
import { LocalService } from '../../services/shared/local.service';

@Component({
    selector: 'app-automation-process',
    templateUrl: './automation-process.component.html',
    styleUrls: ['./automation-process.component.css']
})
/** automation-process component*/
export class AutomationProcessComponent {
  /** automation-process ctor */
  constructor(public _localService: LocalService) {
      this._localService.isMenu = true;
    }
}
