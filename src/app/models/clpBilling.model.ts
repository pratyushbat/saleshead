import { Data } from "@angular/router";

export interface CLPBilling {
  cLPCompanyID: number;
  cLPUserID: number;
  billingName: string;
  comments: string;
  useCC: boolean;
  pONumber: string;
  cCName: string;
  cCType: number;
  cCNumber: string;
  cCExMonth: number;
  cCExYear: number;
  cCCid: string;
  add1: string;
  add2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  feeSetup: number;
  feeCompany: number;
  feeUser: number;
  discountUser: number;
  feeMonthlyRider: number;
  feeSupportHour: number;
  feeAdditionalContacts: number;
  accountBalance: number;
  supportCredit: number;
  additionalContactsIncrements: number;
  cycleDay: number;
  contract: number;
  dtContractExpire: Date;
  dtNextBillDate: Date;
  dtPromoExpire: Date;
  isOnPromo: boolean;
  cLPVARID: number;
  status: number;
  dtCreated: Date;
  tmpCCName: string;
  tmpCCType: number;
  tmpCCNumber: string;
  tmpCCExMonth: number;
  tmpCCExYear: number;
  tmpCCCid: string;
  tmpAdd1: string;
  tmpAdd2: string;
  tmpCity: string;
  tmpState: string;
  tmpZip: string;
  tmpCountry: string;
  encCCNumber: number;
  tmpEncCCNumber: any;
}

export interface CLPAddOnBilling {
  id: number;
  cLPCompanyID: number;
  perShortCodeTxtMsgPrice: bigint;
  perLongCodeTxtMsgPrice: bigint;
  perVoiceDropPrice: bigint;
  perLineLongCode: bigint;
  perLineCallForwarding: bigint;
  perLIneVoiceDrop: bigint;
  perLIneClickToCall: bigint;
  perLIneKMLMapCreation: bigint;
  perLIneVCR: bigint;
  perLongCodeMMSTxtMsgPrice: bigint;
  perUserAlertTxtMsgPrice: bigint;
  perLineVIP: bigint;
  perLineVirtualPhoneNumber: bigint;
}

export interface CLPAddOnBillingShow {
  id: number;
  cLPCompanyID: number;
  perShortCodeTxtMsgPrice: string;
  perLongCodeTxtMsgPrice: string;
  perVoiceDropPrice: string;
  perLineLongCode: string;
  perLineCallForwarding: string;
  perLIneVoiceDrop: string;
  perLIneClickToCall: string;
  perLIneKMLMapCreation: string;
  perLIneVCR: string;
  perLongCodeMMSTxtMsgPrice: string;
  perUserAlertTxtMsgPrice: string;
  perLineVIP: string;
  perLineVirtualPhoneNumber: string;
}
