

export interface UploadCompany {
  uploadCompanyID: number;
  uploadSessionID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  companyID: number;
  companyName: string;
  add1: string;
  add2: string;
  add3: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  fax: string;
  notes: string;
  webSite: string;
  coClass1Code: number;
  coClass2Code: number;
  coClass3Code: number;
  coClass4Code: number;
  coClass5Code: number;
  coClass6Code: number;
  coClass7Code: number;
  coClass8Code: number;
  custom1: string;
  custom2: string;
  custom3: string;
  custom4: string;
  custom5: string;
  custom6: string;
  custom7: string;
  custom8: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  dupCompanyID: number;
  actionToTake: number;
  systemNote: string;
  addressDisplay: string;
  clpUserDisplay: string;

}

export interface UploadCompanyRespone  {
  uploadCompanies: UploadCompany[];
}
