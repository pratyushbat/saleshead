import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { VoiceRecordingType } from '../../../../models/clpuser.model';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
/** pagination component*/
export class PaginationComponent {
  @Input() data: any;
  @Input() originalData: any;
  @Input() total: any;
  @Output() newData: EventEmitter<{ data: any, size: number, skipSize: number }> = new EventEmitter<any>();
  @Output() serialIndex: EventEmitter<any> = new EventEmitter<any>();
  @Input() dataOffice: any;
  @Input() originalDataOffice: any;
  @Input() totalOffice: any;
  @Output() newDataOffice: EventEmitter<{ dataOffice: any, sizeOffice: number, skipOfficeSize: number }> = new EventEmitter<any>();
  public pageSizes = [10, 50, 100, 200];
  public pageSize = 10;
  public skip = 0;
  @Input() teamOffice: string = "";
  public pageSizesOffice = [10, 50, 100, 200];
  public pageSizeOffice = 10;
  public skipOffice = 0;
    constructor() {
      
  }

  ngOnInit(): void {
    this.pageData();
  }

  public onPageChange(e: PageChangeEvent): void {
    switch (this.teamOffice) {
      case ("team"):{
        this.skip = e.skip;
        this.pageSize = e.take;
        this.pageData();
        break;
      }
      case ("office"): {
        this.skipOffice = e.skip;
        this.pageSizeOffice = e.take;
        this.pageData();
        break;
      }
      default: {
        this.skip = e.skip;
        this.pageSize = e.take;
        this.pageData();
        break;
      }
    }
  
  }

  public pageData() {
    switch (this.teamOffice) {
      case ("team"): {
        this.data = this.originalData
        this.newData.emit({ data: this.data, size: this.pageSize, skipSize: this.skip });
        break;
      }
      case ("office"): {
        this.dataOffice = this.originalDataOffice;
        this.newDataOffice.emit({ dataOffice: this.dataOffice, sizeOffice: this.pageSizeOffice, skipOfficeSize: this.skipOffice });
        break;
      }
      default: {
        this.data = this.originalData
        this.newData.emit({ data: this.data, size: this.pageSize, skipSize: this.skip });
        break;
      }
    }
    
  }
  
}
