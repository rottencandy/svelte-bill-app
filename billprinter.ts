import ExcelJS from "exceljs"
import path from "path"

// Constants from your Python code (assuming these are defined elsewhere)
const MAX_ITEMS_IN_PAGE = 35
const CELL_OFFSET = 14
const bills_path = "./" // Adjust this path as needed

// Helper function to add border
function addBorder(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startCol: number,
    emptyBorder: ExcelJS.Style,
) {
    for (let i = startRow; i < endRow; i++) {
        worksheet.getCell(startCol, i).value = ""
        worksheet.getCell(startCol, i).style = emptyBorder
    }
}

export const fillAllData = async (
    party_details_list: any[],
    bill_details_list: any[],
    all_items_list: any[],
    igst: boolean,
    subtotal: number,
    total: number,
    tax18: number,
    tax28: number,
    tax12: number,
    other: number,
    total18: number,
    total28: number,
    total12: number,
) => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const filePath = path.join(bills_path, "unformatted.xlsx")

    // Create formats (styles)
    const headFormat = {
        alignment: { horizontal: "center", vertical: "middle" },
        font: { bold: true, size: 12, underline: "single" },
    } as const

    const titleFormat = {
        alignment: { horizontal: "center", vertical: "middle" },
        font: {
            bold: true,
            name: "Arial",
            italic: true,
            size: 26,
            color: { argb: "FF000000" },
        },
    } as const

    const subtitleFormat = {
        alignment: { horizontal: "center", vertical: "middle" },
        font: { bold: true, name: "Calibri", italic: true },
    } as const

    const tableHeaderFormat = {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { bold: true, name: "Calibri", size: 12 },
        border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        },
        fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" },
        },
    } as const

    const subtitleAddrFormat = {
        alignment: { horizontal: "center", vertical: "middle" },
        font: { bold: true, name: "Times New Roman", size: 12 },
    } as const

    const detFormat = {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { bold: true, name: "Courier New", size: 12 },
        wrapText: true,
    } as const

    const monoBillDetailsFmt = {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { bold: true, name: "Courier New", size: 13 },
        wrapText: true,
    } as const

    const det1Format = {
        alignment: { horizontal: "right", vertical: "middle" },
        font: { bold: true, name: "Courier New", size: 14 },
        wrapText: true,
    } as const

    const detcFormat = {
        alignment: { horizontal: "center", vertical: "middle" },
        font: { bold: true, name: "Courier New", size: 14 },
        wrapText: true,
    } as const

    const tncTitleFormat = {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { bold: true, name: "Calibri", size: 8 },
        wrapText: true,
    }

    const tncFormat = {
        alignment: { horizontal: "left", vertical: "middle" },
        font: { name: "Calibri", size: 8 },
        wrapText: true,
    } as const

    const phFormat = {
        alignment: { horizontal: "right", vertical: "middle" },
        font: { bold: true },
        wrapText: true,
    } as const

    const tinFormat = {
        alignment: { horizontal: "left" },
        font: { bold: true },
    } as const

    const emptyBorder = {
        border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        },
    }

    const partyNameAddr = party_details_list[0] + "\n" + party_details_list[1]
    const nameAddrFmt = {
        alignment: { horizontal: "left", vertical: "middle" },
        font: {
            bold: true,
            name: "Courier New",
            size: partyNameAddr.split("\n").length > 3 ? 10 : 12,
        },
        wrapText: true,
    } as const

    const partyTin = "GSTIN : " + party_details_list[2]
    const details =
        "Invoice No.   :" +
        bill_details_list[1] +
        "\nDate          :" +
        bill_details_list[0] +
        "\nTransport     :" +
        bill_details_list[2] +
        "\nPayment Terms :" +
        bill_details_list[3] +
        "\nESUGAM No.    :" +
        bill_details_list[4]

    const totalPages = Math.ceil(all_items_list.length / MAX_ITEMS_IN_PAGE)
    let slno = 1

    for (let page = 0; page < totalPages; page++) {
        const worksheet = workbook.addWorksheet(`Page ${page + 1}`)

        // Worksheet settings
        worksheet.pageSetup.fitToPage = true
        worksheet.pageSetup.fitToWidth = 1
        worksheet.pageSetup.fitToHeight = 1
        worksheet.pageSetup.horizontalCentered = true
        worksheet.pageSetup.verticalCentered = true

        // Set column widths
        worksheet.getColumn(1).width = 6 // Column A (sl. no.)
        worksheet.getColumn(11).width = 8 // Column K (amount)
        worksheet.getColumn(12).width = 7 // Column L (amount)

        // Owner name, details
        worksheet.mergeCells("A1:C1")
        worksheet.getCell("A1").value = "GSTIN : 29AKRPB0864E1Z4"
        worksheet.getCell("A1").style = tinFormat

        worksheet.mergeCells("K1:L2")
        worksheet.getCell("K1").value = "Ph : 41140838\nMob : 9886258876"
        worksheet.getCell("K1").style = phFormat

        worksheet.mergeCells("C2:J4")
        worksheet.getCell("C2").value = "POPULAR ENTERPRISE"
        worksheet.getCell("C2").style = titleFormat

        worksheet.mergeCells("B5:K5")
        worksheet.getCell("B5").value =
            "Dealers in : PVC Agricultural Pipes, PVC Hose Pipes, Pipe Fittings, Hardware Materials & Greases"
        worksheet.getCell("B5").style = subtitleFormat

        worksheet.mergeCells("B6:K6")
        worksheet.getCell("B6").value =
            "176/2, SADAR PATRAPPA ROAD, BANGALORE-560 002"
        worksheet.getCell("B6").style = subtitleAddrFormat

        // Static bill info at top
        worksheet.mergeCells("F1:G1")
        worksheet.getCell("F1").value = "TAX INVOICE"
        worksheet.getCell("F1").style = headFormat

        worksheet.mergeCells("I1:J1")
        worksheet.getCell("I1").value = "Original Copy"

        // Party name, details
        worksheet.getCell("A7").value = "M/s"
        worksheet.getCell("A7").style = monoBillDetailsFmt

        worksheet.mergeCells("H7:L12")
        worksheet.getCell("H7").value = details
        worksheet.getCell("H7").style = monoBillDetailsFmt

        worksheet.mergeCells("B7:F11")
        worksheet.getCell("B7").value = partyNameAddr
        worksheet.getCell("B7").style = nameAddrFmt

        worksheet.mergeCells("B12:E12")
        worksheet.getCell("B12").value = partyTin
        worksheet.getCell("B12").style = monoBillDetailsFmt

        // Table header
        worksheet.getCell("A13").value = "Sl No."
        worksheet.getCell("A13").style = tableHeaderFormat

        worksheet.mergeCells("B13:E13")
        worksheet.getCell("B13").value = "Particulars"
        worksheet.getCell("B13").style = tableHeaderFormat

        worksheet.getCell("F13").value = "HSN Code"
        worksheet.getCell("F13").style = tableHeaderFormat

        worksheet.getCell("G13").value = "Quantity"
        worksheet.getCell("G13").style = tableHeaderFormat

        worksheet.getCell("H13").value = "Unit"
        worksheet.getCell("H13").style = tableHeaderFormat

        worksheet.getCell("I13").value = "Rate"
        worksheet.getCell("I13").style = tableHeaderFormat

        worksheet.getCell("J13").value = "GST"
        worksheet.getCell("J13").style = tableHeaderFormat

        worksheet.mergeCells("K13:L13")
        worksheet.getCell("K13").value = "Amount"
        worksheet.getCell("K13").style = tableHeaderFormat

        // Static bill info at bottom
        worksheet.mergeCells("B47:F51")
        worksheet.getCell("B47").value = ""
        worksheet.getCell("B47").style = detFormat

        // Rich text for terms and conditions
        const termsCell = worksheet.getCell("B47")
        termsCell.value = {
            richText: [
                {
                    font: { name: "Calibri", size: 8, bold: true },
                    text: "TERMS AND CONDITIONS\n",
                },
                {
                    font: { name: "Calibri", size: 8 },
                    text: "1. We are not responsible for loss or damage in transit.\n2. All disputes subject to Bangalore Jurisdiction only.\n3. Our responsibility ceases as soon as the goods leave our premises.\n4. Goods once sold cannot be taken back or exchanged.",
                },
            ],
        }
        termsCell.style = {
            ...tncFormat,
            alignment: {
                horizontal: "left",
                vertical: "middle",
                wrapText: true,
            },
        }

        // Adjust font size for detFormat
        const smallDetFormat = {
            ...detFormat,
            font: { ...detFormat.font, size: 10 },
        }

        worksheet.mergeCells("J48:L52")
        worksheet.getCell("J48").value =
            "POPULAR ENTERPRISE\n\n\n\nAuthorised Signatory"
        worksheet.getCell("J48").style = smallDetFormat

        worksheet.mergeCells("B42:F42")
        worksheet.getCell("B42").value = "Bank Name   : Canara Bank"
        worksheet.getCell("B42").style = detFormat

        worksheet.mergeCells("B43:F43")
        worksheet.getCell("B43").value =
            "Bank Branch : NR Road branch, Bangalore"
        worksheet.getCell("B43").style = detFormat

        worksheet.mergeCells("B44:F44")
        worksheet.getCell("B44").value = "A/C No.     : 04381010008246"
        worksheet.getCell("B44").style = detFormat

        worksheet.mergeCells("B45:F45")
        worksheet.getCell("B45").value = "IFSC Code   : CNRB0000410"
        worksheet.getCell("B45").style = detFormat

        worksheet.mergeCells("F55:G52")
        worksheet.getCell("F55").value = `Page ${page + 1} of ${totalPages}`

        // Add items to the table
        for (let s = 0; s < MAX_ITEMS_IN_PAGE; s++) {
            if (all_items_list.length === 0) break

            const itemlist = all_items_list[0]
            const particular = itemlist[1] + " " + itemlist[0]
            const row = s + CELL_OFFSET

            worksheet.getCell(`A${row}`).value = `${slno}.`
            worksheet.getCell(`A${row}`).style = det1Format

            worksheet.mergeCells(`B${row}:E${row}`)
            worksheet.getCell(`B${row}`).value = particular
            worksheet.getCell(`B${row}`).style = detFormat

            worksheet.getCell(`F${row}`).value = itemlist[2]
            worksheet.getCell(`F${row}`).style = detcFormat

            worksheet.getCell(`G${row}`).value = itemlist[3]
            worksheet.getCell(`G${row}`).style = detcFormat

            worksheet.getCell(`H${row}`).value = itemlist[4]
            worksheet.getCell(`H${row}`).style = detcFormat

            worksheet.getCell(`I${row}`).value = itemlist[5]
            worksheet.getCell(`I${row}`).style = detcFormat

            worksheet.getCell(`J${row}`).value = itemlist[6]
            worksheet.getCell(`J${row}`).style = detcFormat

            const amount = parseFloat(itemlist[3]) * parseFloat(itemlist[5])
            worksheet.mergeCells(`K${row}:L${row}`)
            worksheet.getCell(`K${row}`).value = amount.toFixed(2)
            worksheet.getCell(`K${row}`).style = det1Format

            slno++
            all_items_list.shift()
        }

        if (page === totalPages - 1) {
            // Print totals in last page
            worksheet.mergeCells("I38:J38")
            worksheet.getCell("I38").value = " Sub Total"
            worksheet.getCell("I38").style = detFormat

            worksheet.mergeCells("G45:J45")
            worksheet.getCell("G45").value = "Other Amount"
            worksheet.getCell("G45").style = detFormat

            worksheet.mergeCells("G46:J46")
            worksheet.getCell("G46").value = "Round Off"
            worksheet.getCell("G46").style = detFormat

            worksheet.mergeCells("G47:J47")
            worksheet.getCell("G47").value = "Total"
            worksheet.getCell("G47").style = detFormat

            const totalr = parseFloat(total.toFixed(0))
            const roundoff = total - totalr

            worksheet.mergeCells("K38:L38")
            worksheet.getCell("K38").value = subtotal.toFixed(2)
            worksheet.getCell("K38").style = det1Format

            worksheet.mergeCells("K45:L45")
            worksheet.getCell("K45").value = other.toFixed(2)
            worksheet.getCell("K45").style = det1Format

            worksheet.mergeCells("K46:L46")
            worksheet.getCell("K46").value = roundoff.toFixed(2)
            worksheet.getCell("K46").style = det1Format

            worksheet.mergeCells("K47:L47")
            worksheet.getCell("K47").value = totalr.toFixed(2)
            worksheet.getCell("K47").style = det1Format

            if (igst) {
                // IGST uses only 1 row per Tax %
                if (tax28 !== 0) {
                    worksheet.mergeCells("G39:H39")
                    worksheet.getCell("G39").value = total28.toFixed(2)
                    worksheet.getCell("G39").style = det1Format

                    worksheet.mergeCells("I39:J39")
                    worksheet.getCell("I39").value = " 28%  IGST"
                    worksheet.getCell("I39").style = detFormat

                    worksheet.mergeCells("K39:L39")
                    worksheet.getCell("K39").value = tax28.toFixed(2)
                    worksheet.getCell("K39").style = det1Format
                }

                if (tax18 !== 0) {
                    worksheet.mergeCells("G40:H40")
                    worksheet.getCell("G40").value = total18.toFixed(2)
                    worksheet.getCell("G40").style = det1Format

                    worksheet.mergeCells("I40:J40")
                    worksheet.getCell("I40").value = " 18%  IGST"
                    worksheet.getCell("I40").style = detFormat

                    worksheet.mergeCells("K40:L40")
                    worksheet.getCell("K40").value = tax18.toFixed(2)
                    worksheet.getCell("K40").style = det1Format
                }

                if (tax12 !== 0) {
                    worksheet.mergeCells("G41:H41")
                    worksheet.getCell("G41").value = total12.toFixed(2)
                    worksheet.getCell("G41").style = det1Format

                    worksheet.mergeCells("I41:J41")
                    worksheet.getCell("I41").value = " 12%  IGST"
                    worksheet.getCell("I41").style = detFormat

                    worksheet.mergeCells("K41:L41")
                    worksheet.getCell("K41").value = tax12.toFixed(2)
                    worksheet.getCell("K41").style = det1Format
                }
            } else {
                // Non IGST uses normal 2 rows per tax %
                if (tax28 !== 0) {
                    const t14 = total28 / 2
                    const st = tax28 / 2

                    worksheet.mergeCells("G43:H43")
                    worksheet.getCell("G43").value = t14.toFixed(2)
                    worksheet.getCell("G43").style = det1Format

                    worksheet.mergeCells("G44:H44")
                    worksheet.getCell("G44").value = t14.toFixed(2)
                    worksheet.getCell("G44").style = det1Format

                    worksheet.mergeCells("I43:J43")
                    worksheet.getCell("I43").value = " 14%  CGST"
                    worksheet.getCell("I43").style = detFormat

                    worksheet.mergeCells("I44:J44")
                    worksheet.getCell("I44").value = " 14%  SGST"
                    worksheet.getCell("I44").style = detFormat

                    worksheet.mergeCells("K43:L43")
                    worksheet.getCell("K43").value = st.toFixed(2)
                    worksheet.getCell("K43").style = det1Format

                    worksheet.mergeCells("K44:L44")
                    worksheet.getCell("K44").value = st.toFixed(2)
                    worksheet.getCell("K44").style = det1Format
                }

                if (tax18 !== 0) {
                    const t9 = total18 / 2
                    const t = tax18 / 2

                    worksheet.mergeCells("G39:H39")
                    worksheet.getCell("G39").value = t9.toFixed(2)
                    worksheet.getCell("G39").style = det1Format

                    worksheet.mergeCells("G40:H40")
                    worksheet.getCell("G40").value = t9.toFixed(2)
                    worksheet.getCell("G40").style = det1Format

                    worksheet.mergeCells("I39:J39")
                    worksheet.getCell("I39").value = " 9%  CGST"
                    worksheet.getCell("I39").style = detFormat

                    worksheet.mergeCells("I40:J40")
                    worksheet.getCell("I40").value = " 9%  SGST"
                    worksheet.getCell("I40").style = detFormat

                    worksheet.mergeCells("K39:L39")
                    worksheet.getCell("K39").value = t.toFixed(2)
                    worksheet.getCell("K39").style = det1Format

                    worksheet.mergeCells("K40:L40")
                    worksheet.getCell("K40").value = t.toFixed(2)
                    worksheet.getCell("K40").style = det1Format
                }

                if (tax12 !== 0) {
                    const t6 = total12 / 2
                    const t = tax12 / 2

                    worksheet.mergeCells("G41:H41")
                    worksheet.getCell("G41").value = t6.toFixed(2)
                    worksheet.getCell("G41").style = det1Format

                    worksheet.mergeCells("G42:H42")
                    worksheet.getCell("G42").value = t6.toFixed(2)
                    worksheet.getCell("G42").style = det1Format

                    worksheet.mergeCells("I41:J41")
                    worksheet.getCell("I41").value = " 6%  CGST"
                    worksheet.getCell("I41").style = detFormat

                    worksheet.mergeCells("I42:J42")
                    worksheet.getCell("I42").value = " 6%  SGST"
                    worksheet.getCell("I42").style = detFormat

                    worksheet.mergeCells("K41:L41")
                    worksheet.getCell("K41").value = t.toFixed(2)
                    worksheet.getCell("K41").style = det1Format

                    worksheet.mergeCells("K42:L42")
                    worksheet.getCell("K42").value = t.toFixed(2)
                    worksheet.getCell("K42").style = det1Format
                }
            }
        }
    }

    await workbook.xlsx.writeFile(filePath)
    console.log("Excel file created successfully")
}
