import { Byte } from "@angular/compiler/src/util";

export interface Mailing {
  mailingID: number
  cLPUserID: number
  cLPCompanyID: number
  mailingTypeCode: number
  fromType: Byte
  toType: Byte
  mailingStartTime: Date
  subject: string
  salutation: Byte
  body: string
  documentList: string
  emailTemplateID: number
  mailMergeTemplateID: number
  signature: string
  category: Byte
  customSearchID: number
  status: Byte
  dtCompleted: Date
  score: number
  campaignEventID: number
  runID: number
  cLPServiceRunID: number
  dtCreated: Date
}
