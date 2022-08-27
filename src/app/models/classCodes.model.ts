export interface ClassCodes {
  tableName: string;
  code: number;
  clpCompanyId: number;
  display: string;
  sOrder: number;
  classCodeTitle: string;
  key: string
}

/*this model is replaced */
export interface ClassCodesListResponse {
  classCodes: ClassCodes[];
}
/*this model is replaced */


export interface ClassCodesDictionaryResponse {
  classCodes: Map<string, ClassCodes[]>;
}
