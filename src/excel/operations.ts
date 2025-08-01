import { type Worksheet, type Style } from "exceljs"
import {
    DETAIL_CENTER_FMT,
    DETAIL_FMT,
    DETAIL_RIGHT_FMT,
    HEAD_FMT,
    HSN_ROW_CENTER_FMT,
    HSN_ROW_RIGHT_FMT,
    MONO_BILL_DETAIL_FMT,
    PH_FMT,
    SMALL_DETAIL_FMT,
    SUBTITLE_ADDR_FMT,
    SUBTITLE_FMT,
    TABLE_HEADER_FMT,
    THIN_BORDER,
    THIN_BORDER_TOP,
    TIN_FMT,
    TITLE_FMT,
    TNC_FMT,
} from "./styles"
import {
    BANK_LINE_1,
    BANK_LINE_2,
    BANK_LINE_3,
    BANK_LINE_4,
    BILL_TITLE_DATA,
    getBillDetails,
    getCopyName,
    getPartyTin,
    GSTIN_DATA,
    PH_DATA,
    SIGNATORY_DATA,
    SUBTITLE_ADDRESS_DATA,
    SUBTITLE_DATA,
    TITLE_DATA,
    TNC_DATA,
    TNC_HEADER_DATA,
} from "./data"
import { Bill, Gst, Item, Party, Total } from "../types"

export const applyBaseLayout = (
    sheet: Worksheet,
    page: number,
    pagesCount: number,
) => {
    // Worksheet settings
    sheet.pageSetup.fitToPage = true
    sheet.pageSetup.fitToWidth = 1
    sheet.pageSetup.fitToHeight = 1
    sheet.pageSetup.horizontalCentered = true
    sheet.pageSetup.verticalCentered = true
    sheet.pageSetup.margins = {
        left: 0.2,
        right: 0.2,
        top: 0.2,
        bottom: 0.2,
        header: 0.1,
        footer: 0.1,
    }

    // Set column widths
    sheet.getColumn(1).width = 6 // Column A (sl. no.)
    sheet.getColumn(11).width = 8 // Column K (amount)
    sheet.getColumn(12).width = 7 // Column L (amount)

    // Owner name, details
    sheet.mergeCells("A1:C1")
    sheet.getCell("A1").value = GSTIN_DATA
    sheet.getCell("A1").style = TIN_FMT

    sheet.mergeCells("K1:L2")
    sheet.getCell("K1").value = PH_DATA
    sheet.getCell("K1").style = PH_FMT

    sheet.mergeCells("C2:J4")
    sheet.getCell("C2").value = TITLE_DATA
    sheet.getCell("C2").style = TITLE_FMT

    sheet.mergeCells("B5:K5")
    sheet.getCell("B5").value = SUBTITLE_DATA
    sheet.getCell("B5").style = SUBTITLE_FMT

    sheet.mergeCells("B6:K6")
    sheet.getCell("B6").value = SUBTITLE_ADDRESS_DATA
    sheet.getCell("B6").style = SUBTITLE_ADDR_FMT

    // Static bill info at top
    sheet.mergeCells("F1:G1")
    sheet.getCell("F1").value = BILL_TITLE_DATA
    sheet.getCell("F1").style = HEAD_FMT

    sheet.mergeCells("I1:J1")
    sheet.getCell("I1").value = getCopyName(1)

    // Party name, details
    sheet.getCell("A7").value = "M/s"
    sheet.getCell("A7").style = MONO_BILL_DETAIL_FMT

    // Table header
    sheet.getCell("A13").value = "Sl No."
    sheet.getCell("A13").style = TABLE_HEADER_FMT

    sheet.mergeCells("B13:E13")
    sheet.getCell("B13").value = "Particulars"
    sheet.getCell("B13").style = TABLE_HEADER_FMT

    sheet.getCell("F13").value = "HSN Code"
    sheet.getCell("F13").style = TABLE_HEADER_FMT

    sheet.getCell("G13").value = "Quantity"
    sheet.getCell("G13").style = TABLE_HEADER_FMT

    sheet.getCell("H13").value = "Unit"
    sheet.getCell("H13").style = TABLE_HEADER_FMT

    sheet.getCell("I13").value = "Rate"
    sheet.getCell("I13").style = TABLE_HEADER_FMT

    sheet.getCell("J13").value = "GST"
    sheet.getCell("J13").style = TABLE_HEADER_FMT

    sheet.mergeCells("K13:L13")
    sheet.getCell("K13").value = "Amount"
    sheet.getCell("K13").style = TABLE_HEADER_FMT

    // page divider
    sheet.mergeCells(39, 1, 39, 12)
    sheet.getCell(39, 1).border = THIN_BORDER_TOP

    // Static bill info at bottom
    // Bank
    sheet.mergeCells("A45:F45")
    sheet.getCell("A45").value = BANK_LINE_1
    sheet.getCell("A45").style = DETAIL_FMT

    sheet.mergeCells("A46:F46")
    sheet.getCell("A46").value = BANK_LINE_2
    sheet.getCell("A46").style = DETAIL_FMT

    sheet.mergeCells("A47:F47")
    sheet.getCell("A47").value = BANK_LINE_3
    sheet.getCell("A47").style = DETAIL_FMT

    sheet.mergeCells("A48:F48")
    sheet.getCell("A48").value = BANK_LINE_4
    sheet.getCell("A48").style = DETAIL_FMT

    // T & C
    sheet.mergeCells(50, 1, 54, 6)
    sheet.getCell(50, 1).value = ""
    sheet.getCell(50, 1).style = DETAIL_FMT

    // Rich text for terms and conditions
    const termsCell = sheet.getCell(50, 1)
    termsCell.value = {
        richText: [
            {
                font: { name: "Calibri", size: 8, bold: true },
                text: TNC_HEADER_DATA,
            },
            {
                font: { name: "Calibri", size: 8 },
                text: TNC_DATA,
            },
        ],
    }
    termsCell.style = TNC_FMT

    // Signature
    sheet.mergeCells("J50:L54")
    sheet.getCell("J50").value = SIGNATORY_DATA
    sheet.getCell("J50").style = SMALL_DETAIL_FMT

    // page number
    sheet.mergeCells(55, 6, 55, 7)
    sheet.getCell(55, 6).value = `Page ${page + 1} of ${pagesCount}`
}

export const fillPartyAndBillDetails = (
    sheet: Worksheet,
    partyDetails: Party,
    billDetails: Bill,
) => {
    const partyTin = getPartyTin(partyDetails)
    const details = getBillDetails(billDetails)

    const partyNameAddr = partyDetails.name + "\n" + partyDetails.address
    const nameAddrFmt: Partial<Style> = {
        ...DETAIL_FMT,
        font: {
            ...DETAIL_FMT.font,
            // set size depending on address height
            size: partyNameAddr.split("\n").length > 3 ? 10 : 12,
        },
    }

    sheet.mergeCells("H7:L12")
    sheet.getCell("H7").value = details
    sheet.getCell("H7").style = MONO_BILL_DETAIL_FMT

    sheet.mergeCells("B7:F11")
    sheet.getCell("B7").value = partyNameAddr
    sheet.getCell("B7").style = nameAddrFmt

    sheet.mergeCells("B12:E12")
    sheet.getCell("B12").value = partyTin
    sheet.getCell("B12").style = MONO_BILL_DETAIL_FMT
}

export const fillItemRow = (
    sheet: Worksheet,
    item: Item,
    row: number,
    slNo: number,
) => {
    sheet.getCell(`A${row}`).value = `${slNo}.`
    sheet.getCell(`A${row}`).style = DETAIL_RIGHT_FMT

    const particular = item.size + " " + item.particulars
    sheet.mergeCells(`B${row}:E${row}`)
    sheet.getCell(`B${row}`).value = particular
    sheet.getCell(`B${row}`).style = DETAIL_FMT

    sheet.getCell(`F${row}`).value = item.hsn
    sheet.getCell(`F${row}`).style = DETAIL_CENTER_FMT

    sheet.getCell(`G${row}`).value = item.quantity
    sheet.getCell(`G${row}`).style = DETAIL_CENTER_FMT

    sheet.getCell(`H${row}`).value = item.unit
    sheet.getCell(`H${row}`).style = DETAIL_CENTER_FMT

    sheet.getCell(`I${row}`).value = item.rate
    sheet.getCell(`I${row}`).style = DETAIL_CENTER_FMT

    sheet.getCell(`J${row}`).value = item.gst
    sheet.getCell(`J${row}`).style = DETAIL_CENTER_FMT

    const amount = item.quantity * item.rate
    sheet.mergeCells(`K${row}:L${row}`)
    sheet.getCell(`K${row}`).value = amount.toFixed(2)
    sheet.getCell(`K${row}`).style = DETAIL_RIGHT_FMT
}

export const fillHsnHeader = (sheet: Worksheet, row: number, igst: boolean) => {
    sheet.getCell(row, 1).value = "HSN Code"
    sheet.getCell(row, 1).style = TABLE_HEADER_FMT
    sheet.mergeCells(row, 1, row, 2)

    sheet.getCell(row, 3).value = "Taxable Value"
    sheet.getCell(row, 3).style = TABLE_HEADER_FMT
    sheet.mergeCells(row, 3, row, 4)

    sheet.getCell(row, 5).value = "Quantity"
    sheet.getCell(row, 5).style = TABLE_HEADER_FMT

    if (igst) {
        sheet.getCell(row, 6).value = "IGST"
        sheet.getCell(row, 6).style = TABLE_HEADER_FMT
        sheet.mergeCells(row, 6, row, 7)
    } else {
        sheet.getCell(row, 6).value = "CGST"
        sheet.getCell(row, 6).style = TABLE_HEADER_FMT
        sheet.mergeCells(row, 6, row, 7)

        sheet.getCell(row, 8).value = "SGST"
        sheet.getCell(row, 8).style = TABLE_HEADER_FMT
        sheet.mergeCells(row, 8, row, 9)
    }
}

export const fillHsnRow = (
    sheet: Worksheet,
    hsn: string,
    gst: Gst,
    rate: number,
    quantity: number,
    row: number,
    igst: boolean,
) => {
    const total = rate * (gst / 100)
    const halfTotal = total / 2
    const halfGst = gst / 2
    sheet.getCell(row, 1).value = hsn
    sheet.getCell(row, 1).style = HSN_ROW_CENTER_FMT
    sheet.mergeCells(row, 1, row, 2)

    sheet.getCell(row, 3).value = rate.toFixed(2)
    sheet.getCell(row, 3).style = HSN_ROW_RIGHT_FMT
    sheet.mergeCells(row, 3, row, 4)

    sheet.getCell(row, 5).value = `${quantity}`
    sheet.getCell(row, 5).style = HSN_ROW_RIGHT_FMT

    if (igst) {
        sheet.getCell(row, 6).value = `${gst}% ${total.toFixed(2)}`
        sheet.getCell(row, 6).style = HSN_ROW_RIGHT_FMT
        sheet.mergeCells(row, 6, row, 7)
    } else {
        sheet.getCell(row, 6).value = `${halfGst}% ${halfTotal.toFixed(2)}`
        sheet.getCell(row, 6).style = HSN_ROW_RIGHT_FMT
        sheet.mergeCells(row, 6, row, 7)

        sheet.getCell(row, 8).value = `${halfGst}% ${halfTotal.toFixed(2)}`
        sheet.getCell(row, 8).style = HSN_ROW_RIGHT_FMT
        sheet.mergeCells(row, 8, row, 9)
    }
}

export const fillTotalsSection = (
    sheet: Worksheet,
    total: Total,
    finalTotal: number,
    other: number,
    igst: boolean,
) => {
    const {
        sum: subtotal,
        gst12,
        gst18,
        gst28,
        total12,
        total18,
        total28,
    } = total

    sheet.mergeCells("I40:J40")
    sheet.getCell("I40").value = " Sub Total"
    sheet.getCell("I40").style = DETAIL_FMT

    sheet.mergeCells("H47:J47")
    sheet.getCell("H47").value = "Other Amount"
    sheet.getCell("H47").style = DETAIL_FMT

    sheet.mergeCells("H48:J48")
    sheet.getCell("H48").value = "Round Off"
    sheet.getCell("H48").style = DETAIL_FMT

    sheet.mergeCells("H49:J49")
    sheet.getCell("H49").value = "Invoice Value"
    sheet.getCell("H49").style = DETAIL_FMT

    const roundedTotal = parseFloat(finalTotal.toFixed(0))
    const roundoff = Math.abs(finalTotal - roundedTotal)

    sheet.mergeCells("K40:L40")
    sheet.getCell("K40").value = subtotal.toFixed(2)
    sheet.getCell("K40").style = DETAIL_RIGHT_FMT

    sheet.mergeCells("K47:L47")
    sheet.getCell("K47").value = other.toFixed(2)
    sheet.getCell("K47").style = DETAIL_RIGHT_FMT

    sheet.mergeCells("K48:L48")
    sheet.getCell("K48").value = roundoff.toFixed(2)
    sheet.getCell("K48").style = DETAIL_RIGHT_FMT

    sheet.mergeCells("K49:L49")
    sheet.getCell("K49").value = roundedTotal.toFixed(2)
    sheet.getCell("K49").style = DETAIL_RIGHT_FMT

    if (igst) {
        // IGST uses only 1 row per Tax %
        if (gst28 !== 0) {
            sheet.mergeCells("G41:H41")
            sheet.getCell("G41").value = total28.toFixed(2)
            sheet.getCell("G41").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("I41:J41")
            sheet.getCell("I41").value = " 28% IGST"
            sheet.getCell("I41").style = DETAIL_FMT

            sheet.mergeCells("K41:L41")
            sheet.getCell("K41").value = gst28.toFixed(2)
            sheet.getCell("K41").style = DETAIL_RIGHT_FMT
        }

        if (gst18 !== 0) {
            sheet.mergeCells("G42:H42")
            sheet.getCell("G42").value = total18.toFixed(2)
            sheet.getCell("G42").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("I42:J42")
            sheet.getCell("I42").value = " 18% IGST"
            sheet.getCell("I42").style = DETAIL_FMT

            sheet.mergeCells("K42:L42")
            sheet.getCell("K42").value = gst18.toFixed(2)
            sheet.getCell("K42").style = DETAIL_RIGHT_FMT
        }

        if (gst12 !== 0) {
            sheet.mergeCells("G43:H43")
            sheet.getCell("G43").value = total12.toFixed(2)
            sheet.getCell("G43").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("I43:J43")
            sheet.getCell("I43").value = " 12% IGST"
            sheet.getCell("I43").style = DETAIL_FMT

            sheet.mergeCells("K43:L43")
            sheet.getCell("K43").value = gst12.toFixed(2)
            sheet.getCell("K43").style = DETAIL_RIGHT_FMT
        }
    } else {
        // Non IGST uses normal 2 rows per tax %
        if (gst28 !== 0) {
            const t14 = total28 / 2
            const st = gst28 / 2

            sheet.mergeCells("G45:H45")
            sheet.getCell("G45").value = t14.toFixed(2)
            sheet.getCell("G45").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("G46:H46")
            sheet.getCell("G46").value = t14.toFixed(2)
            sheet.getCell("G46").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("I45:J45")
            sheet.getCell("I45").value = "14% CGST"
            sheet.getCell("I45").style = DETAIL_FMT

            sheet.mergeCells("I46:J46")
            sheet.getCell("I46").value = "14% SGST"
            sheet.getCell("I46").style = DETAIL_FMT

            sheet.mergeCells("K45:L45")
            sheet.getCell("K45").value = st.toFixed(2)
            sheet.getCell("K45").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("K46:L46")
            sheet.getCell("K46").value = st.toFixed(2)
            sheet.getCell("K46").style = DETAIL_RIGHT_FMT
        }

        if (gst18 !== 0) {
            const t9 = total18 / 2
            const t = gst18 / 2

            sheet.mergeCells("G41:H41")
            sheet.getCell("G41").value = t9.toFixed(2)
            sheet.getCell("G41").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("G42:H42")
            sheet.getCell("G42").value = t9.toFixed(2)
            sheet.getCell("G42").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("I41:J41")
            sheet.getCell("I41").value = " 9% CGST"
            sheet.getCell("I41").style = DETAIL_FMT

            sheet.mergeCells("I42:J42")
            sheet.getCell("I42").value = " 9% SGST"
            sheet.getCell("I42").style = DETAIL_FMT

            sheet.mergeCells("K41:L41")
            sheet.getCell("K41").value = t.toFixed(2)
            sheet.getCell("K41").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("K42:L42")
            sheet.getCell("K42").value = t.toFixed(2)
            sheet.getCell("K42").style = DETAIL_RIGHT_FMT
        }

        if (gst12 !== 0) {
            const t6 = total12 / 2
            const t = gst12 / 2

            sheet.mergeCells("G43:H43")
            sheet.getCell("G43").value = t6.toFixed(2)
            sheet.getCell("G43").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("G44:H44")
            sheet.getCell("G44").value = t6.toFixed(2)
            sheet.getCell("G44").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("I43:J43")
            sheet.getCell("I43").value = " 6% CGST"
            sheet.getCell("I43").style = DETAIL_FMT

            sheet.mergeCells("I44:J44")
            sheet.getCell("I44").value = " 6% SGST"
            sheet.getCell("I44").style = DETAIL_FMT

            sheet.mergeCells("K43:L43")
            sheet.getCell("K43").value = t.toFixed(2)
            sheet.getCell("K43").style = DETAIL_RIGHT_FMT

            sheet.mergeCells("K44:L44")
            sheet.getCell("K44").value = t.toFixed(2)
            sheet.getCell("K44").style = DETAIL_RIGHT_FMT
        }
    }
}

export const writeCopyNameToSheet = (sheet: Worksheet, copyName: string) => {
    for (let i = 3; i < 6; i++) {
        sheet.getCell(13, i).border = THIN_BORDER
    }
    for (let i = 11; i < 13; i++) {
        sheet.getCell(13, i).border = THIN_BORDER
    }
    sheet.getCell(1, 9).value = copyName
}
