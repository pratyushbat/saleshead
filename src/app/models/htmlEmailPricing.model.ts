import { Byte } from "@angular/compiler/src/util";
import { SimpleResponse } from "./genericResponse.model";

export interface HTMLEmailLogGetMonth {
  yr: number;
  Mth: any;
  cnt: number;
}

export interface HTMLEmailLogUsageByMonth {
  cLPUserID: number;
  cnt: number;
	}

export interface HTMLEmailLogGetMonthListResponse extends SimpleResponse
{
  hTMLEmailLogGetMonths: HTMLEmailLogGetMonth[];
}

export interface HTMLEmailLogUsageByMonthListResponse extends SimpleResponse
{
  hTMLEmailLogUsageByMonths: HTMLEmailLogUsageByMonth[]

}

export interface HTMLEmailPricing {
  cLPCompanyID: number;
  emailChoice: number;
  tierUpTo100: bigint;
  tierUpTo1000: bigint;
  tierUpTo2500: bigint;
  tierUpTo5000: bigint;
  tierUpTo10000: bigint;
  tierUpTo25000: bigint;
  tierOver25000: bigint;
	}
