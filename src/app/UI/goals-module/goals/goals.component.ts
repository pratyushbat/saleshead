import { Component } from '@angular/core';
import { LocalService } from '../../../services/shared/local.service';

@Component({
    selector: 'goals',
    templateUrl: './goals.component.html',
    styleUrls: ['./goals.component.css']
})
/** goals component*/
export class GoalsComponent {
    /** goals ctor */
  constructor(public _localService: LocalService) {
      this._localService.isMenu = true;
    }
}
