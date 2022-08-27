import { ClassCodes } from "./classCodes.model";
import { SimpleResponse } from "./genericResponse.model";

export interface Map_Filter_Item {
  value: number;
  text: string;
  isselected: boolean;
}

export interface LookUp {
  lookup: ClassCodes[];
  title: string;
}
export interface LookUpItem {
  lookupName: string;
  value: string;
  text: string;
}

export interface Field_Upd {
  fieldName: string;
  fieldValue: string;
  fieldTitle: string;
  items: Map_Filter_Item[];
  isShow: number;
  section: number;
  fieldType: number;
}

export interface ContactUploadFieldMapping {
  mappingName: string;
  splitFirstName: boolean;
  cbContactID: Field_Upd;
  mapComments: Field_Upd;
  mapHistoryNotes: Field_Upd;
  mapFirstName: Field_Upd;
  mapLastName: Field_Upd;
  mapSalutation: Field_Upd;
  mapTitle: Field_Upd;
  mapCompany: Field_Upd;
  mapAdd1: Field_Upd;
  mapAdd2: Field_Upd;
  mapAdd3: Field_Upd;
  mapCity: Field_Upd;
  mapState: Field_Upd;
  mapZip: Field_Upd;
  mapCountry: Field_Upd;
  phone: Field_Upd;
  mapHomePhone: Field_Upd;
  mapMobile: Field_Upd;
  mapAltPhone: Field_Upd;
  mapFax: Field_Upd;
  mapOtherFax: Field_Upd;
  mapEmail: Field_Upd;
  mapEmail2: Field_Upd;
  mapEmail3: Field_Upd;
  mapWebSite: Field_Upd;
  mapShare: Field_Upd;
  mapUserCode: Field_Upd;
  mapdtLastModified: Field_Upd;
  mapdtCreated: Field_Upd;
  mapNotes: Field_Upd;
  mapHistory: Field_Upd;
  mapClass1Code: Field_Upd;
  mapClass2Code: Field_Upd;
  mapClass3Code: Field_Upd;
  mapClass4Code: Field_Upd;
  mapClass5Code: Field_Upd;
  mapClass6Code: Field_Upd;
  mapClass7Code: Field_Upd;
  mapClass8Code: Field_Upd;
  mapCustomDate1Title: Field_Upd;
  mapCustomDate2Title: Field_Upd;
  mapCustomDate3Title: Field_Upd;
  mapCustomDate1: Field_Upd;
  mapCustomDate2: Field_Upd;
  mapCustomDate3: Field_Upd;
  mapCustomText1: Field_Upd;
  mapCustomText2: Field_Upd;
  mapCustomText3: Field_Upd;
  mapcustom1: Field_Upd;
  mapcustom2: Field_Upd;
  mapcustom3: Field_Upd;
  mapcustom4: Field_Upd;
  mapcustom5: Field_Upd;
  mapcustom6: Field_Upd;
  mapcustom7: Field_Upd;
  mapcustom8: Field_Upd;
  mapcustom9: Field_Upd;
  mapcustom10: Field_Upd;
  mapcustom11: Field_Upd;
  mapcustom12: Field_Upd;
  mapcustom13: Field_Upd;
  mapcustom14: Field_Upd;
  mapcustom15: Field_Upd;
  mapcustom16: Field_Upd;
  mapcustom17: Field_Upd;
  mapcustom18: Field_Upd;
  mapcustom19: Field_Upd;
  mapcustom20: Field_Upd;
  check1: Field_Upd;
  check2: Field_Upd;
  check3: Field_Upd;
  check4: Field_Upd;
  check5: Field_Upd;
  check6: Field_Upd;
  mapCompanyCustom1: Field_Upd;
  mapcompanyCustom2: Field_Upd;
  mapcompanyCustom3: Field_Upd;
  mapcompanyCustom4: Field_Upd;
  mapcompanyCustom5: Field_Upd;
  mapcompanyCustom6: Field_Upd;
  mapcompanyCustom7: Field_Upd;
  mapcompanyCustom8: Field_Upd;
  mapcompanyCheck1: Field_Upd;
  mapcompanyCheck2: Field_Upd;
  mapcompanyCheck3: Field_Upd;
  mapcompanyCheck4: Field_Upd;
  mapcompanyClass1: Field_Upd;
  mapcompanyClass2: Field_Upd;
  mapcompanyClass3: Field_Upd;
  mapcompanyClass4: Field_Upd;
  mapcompanyClass5: Field_Upd;
  mapcompanyClass6: Field_Upd;
  mapcompanyClass7: Field_Upd;
  mapcompanyClass8: Field_Upd;



}

export interface ContactUploadFieldMappingResponse extends SimpleResponse {
  uploadSessionId: number;
  contactUploadFieldMappings: ContactUploadFieldMapping;
  lookup_Class1Code: LookUp;
  lookup_Class2Code: LookUp;
  lookup_Class3Code: LookUp;
  lookup_Class4Code: LookUp;
  lookup_Class5Code: LookUp;
  lookup_Class6Code: LookUp;
  lookup_Class7Code: LookUp;
  lookup_Class8Code: LookUp;
  lookUp_fields: LookUpItem[];
  lookUp_ExistingMappings: LookUpItem[];
  lookUp_NoteTypecode: Map_Filter_Item[];
  lookUpTags: LookUpItem[];
}

export interface UploadContactSummary {
  messageString: string;
  totContacts: string;
  totalContacts: string;
  totNewContacts: string;
  totExistingContacts: string;
  totDuplicateContacts: string;
  totCompanies: string;
  totNewCompanies: string;
  totDupCompanies: string;
}
export interface ProcessStep2Resonse extends SimpleResponse {
  uploadContactSummary: UploadContactSummary;
  contactUploadTime: string;
  contactDupCheckTime: string;
  companyDupCheckTime: string;
  uploadMappingID: number;
}

export interface ContactUploadMoreFilters  {
  filter_Manager: LookUpItem[];  
}
