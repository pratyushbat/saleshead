import { Component } from '@angular/core';
import { LocalService } from '../../services/shared/local.service';

@Component({
  selector: 'template-preview',
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.css']
})
/** template-preview component*/
export class TemplatePreviewComponent {
  htmlText: any;
  /** template-preview ctor */
  constructor(public _localService: LocalService) {

  }

  ngOnInit(): void {
    this.htmlText = JSON.parse(localStorage.getItem('object'));
    localStorage.removeItem('object');
  }
}
