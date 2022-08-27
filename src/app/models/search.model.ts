import { WorkbookSheetRowCellBorderLeft } from "@progress/kendo-angular-excel-export";
import { SimpleResponse } from "./genericResponse.model";

export interface Search {
  searchValue: string;
  searchText: string;
}

export interface SearchListResponse {
  searchList: Search[]
}

export interface ItemProperty {
  propertyName: string;
  PropertyValue: string;
}

export interface Item {
  value: number;
  display: string;
  cLPCompanyID: number;
  sOrder: number;
  type: string;
  controlType: string;
  tableName: string;
  columnName: string;
  itemProperties: ItemProperty[];
}

export interface SearchItem {
  value: string;
  displayValue: string;
  controlType: string;
  multiSelect: boolean;
  itemData: Item[];
  tableName: string;
  columnName: string;
  searchOperators: SearchOperatorsMap[];
}

export interface SearchOperatorsMap {
  operator: string;
  value: string;
  isDropDown: boolean;
  isMultiDropdown: boolean;
  isTextBox: boolean;
  col: string;
  isRange: boolean;
  isDate: boolean;
}

export interface SearchItemListResponse {
  searchItems: SearchItem[];
  savedQueries: keyValue[];
}

export interface GroupRows {
  groupId: number;
  groupRows: string;
}

export interface SearchQuery {
  rowId: number;
  cLPUserID: number;
  searchItem: string;
  operator: string;
  searchItemValue: string;
  groupBy: string;
  mainOperator: string;
  tableName: string;
  controlType: string;
  dtStart: Date;
  dtEnd: Date;
  strDtStart: string;
  strDtEnd: string;
}

export interface SearchQueryResponse {
  searchQueryList: SearchQuery[],
  group: Group[]
}



export interface keyValue extends SimpleResponse {
  key: number;
  value: string;
  isSelected: boolean;
}


export interface Group {
  items: number[];
  colSpan: number;
}
