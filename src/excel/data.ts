import type { Bill, Party } from "src/types"
import { dateToString } from "src/util"

export const TITLE_DATA = "POPULAR ENTERPRISE"
export const SUBTITLE_DATA =
    "Dealers in : PVC Agricultural Pipes, PVC Hose Pipes, Pipe Fittings, Hardware Materials & Greases"

export const SUBTITLE_ADDRESS_DATA =
    "176/2, SADAR PATRAPPA ROAD, BANGALORE-560 002"
export const GSTIN_DATA = "GSTIN: 29AKRPB0864E1Z4"

export const PH_DATA = "Ph: 41140838\nMob: 9886258876"

export const BILL_TITLE_DATA = "TAX INVOICE"

export const TNC_HEADER_DATA = "TERMS AND CONDITIONS\n"

export const TNC_DATA = `1. We are not responsible for loss or damage in transit.
2. All disputes subject to Bangalore Jurisdiction only.
3. Our responsibility ceases as soon as the goods leave our premises.
4. Goods once sold cannot be taken back or exchanged.`

export const SIGNATORY_DATA = `POPULAR ENTERPRISE



Authorised Signatory`

export const BANK_LINE_1 = "Bank Name   : Canara Bank"
export const BANK_LINE_2 = "Bank Branch : NR Road branch, Bangalore"
export const BANK_LINE_3 = "A/C No.     : 04381010008246"
export const BANK_LINE_4 = "IFSC Code   : CNRB0000410"

export const getPartyTin = (partyDetails: Party) =>
    "GSTIN : " + partyDetails.tin

export const getBillDetails = (bill: Bill) =>
    `Invoice No.   :${bill.invoice}
Date          :${dateToString(new Date(bill.date))}
Transport     :${bill.transport}
Payment Terms :${bill.paymentTerms}
ESUGAM No.    :${bill.esugam}`

export const getCopyName = (copy: 1 | 2 | 3) => {
    switch (copy) {
        case 1:
            return "Original Copy"
        case 2:
            return "Duplicate Copy"
        case 3:
            return "Triplicate Copy"
    }
}
