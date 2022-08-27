import { keyValue } from "./search.model";

export interface CLPTxn {
  cLPTxnID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  cLPInvoiceID: number;
  txnMethod: number;
  txnType: number;
  txnAmount: number;
  txnDescription: string;
  responseText: string;
  rawResponse: string;
  cCTxnID: string;
  cCApprovalCode: string;
  status: number;
  isMonthlyBilling: boolean;
  dtModified: Date;
  dtCreated: Date;
  bizLine: number;
  teamCode: number;
  billingProfileID: number;
}

export interface BillingHistoryYearResponse {
  filterYear: keyValue[];
  billingHistory: CLPTxn[];
}

export interface BillingHistoryResponse {
  billingHistory: CLPTxn[];
}

export interface BillingInvoice {
  title: string;
  date: Date;
  invoiceNumber: string;
  poNumber: string;
  billTo: string;
  invoiceItems: CLPInvoiceItem[];
  totalAmount: number;
  note: string;
  rptLink: string;
  html: string;
  bizLine: number;
}

export interface CLPInvoiceItem {
  cLPInvoiceItemID: number;
  cLPInvoiceID: number;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dtModified: Date;
  dtCreated: Date;
}

export interface BillingInvoiceResponse {
  billingInvoice: BillingInvoice;
}
