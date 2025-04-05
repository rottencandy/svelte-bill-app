import { Workbook, type Worksheet, type Style } from "exceljs"
import path from "path"
import fs from "fs"
import type { Bill, Item, Party, Total } from "./types"
import { BASEPATH, MAX_ITEMS_IN_PAGE } from "./const"
import { spawn } from "child_process"
import { calculatePages, calculateTotalsByHsn } from "./util"

const ITEM_TABLE_START_OFFSET = 14
const BILLS_PATH = path.join(BASEPATH, "saved_bills")
const TEMPORARY_FILE_PATH = path.join(BILLS_PATH, "unformatted.xlsx")

// Create formats (styles)
const headFormat: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: { bold: true, size: 12, underline: "single" },
}

const titleFormat: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: {
        bold: true,
        name: "Arial",
        italic: true,
        size: 26,
        color: { argb: "FF000000" },
    },
}

const subtitleFormat: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: { bold: true, name: "Calibri", italic: true },
}

const tableHeaderFormat: Partial<Style> = {
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
}

const subtitleAddrFormat: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: { bold: true, name: "Times New Roman", size: 12 },
}

const detFormat: Partial<Style> = {
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    font: { bold: true, name: "Courier New", size: 12 },
}

// Adjust font size for detFormat
const smallDetFormat: Partial<Style> = {
    ...detFormat,
    font: { ...detFormat.font, size: 10 },
}

const monoBillDetailsFmt: Partial<Style> = {
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    font: { bold: true, name: "Courier New", size: 13 },
}

const detailRightFormat: Partial<Style> = {
    alignment: { horizontal: "right", vertical: "middle", wrapText: true },
    font: { bold: true, name: "Courier New", size: 14 },
}

const detailCenterFormat: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    font: { bold: true, name: "Courier New", size: 14 },
}

//const tncTitleFormat: Partial<Style> = {
//    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
//    font: { bold: true, name: "Calibri", size: 8 },
//}

const tncFormat: Partial<Style> = {
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    font: { name: "Calibri", size: 8 },
}

const phFormat: Partial<Style> = {
    alignment: { horizontal: "right", vertical: "middle", wrapText: true },
    font: { bold: true },
}

const tinFormat: Partial<Style> = {
    alignment: { horizontal: "left" },
    font: { bold: true },
}

const thinBorder: Partial<Style["border"]> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
}

/** Fill and save all data to a temporary `unformatted.xlsx` workbook */
export const fillDataToTempFile = async (
    partyDetails: Party,
    billDetails: Bill,
    items: Item[],
    igst: boolean,
    total: Total,
    finalTotal: number,
    other: number,
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
    const hsnTotals = Object.entries(calculateTotalsByHsn(items))

    // Create a new workbook
    const workbook = new Workbook()

    const partyNameAddr = partyDetails.name + "\n" + partyDetails.address
    const nameAddrFmt: Partial<Style> = {
        alignment: { horizontal: "left", vertical: "middle", wrapText: true },
        font: {
            bold: true,
            name: "Courier New",
            // set size depending on address height
            size: partyNameAddr.split("\n").length > 3 ? 10 : 12,
        },
    }

    const partyTin = "GSTIN : " + partyDetails.tin
    const details =
        "Invoice No.   :" +
        billDetails.invoice +
        "\nDate          :" +
        billDetails.date +
        "\nTransport     :" +
        billDetails.transport +
        "\nPayment Terms :" +
        billDetails.paymentTerms +
        "\nESUGAM No.    :" +
        billDetails.esugam

    const totalItemsPerPage = calculatePages(items)
    const totalPages = Math.ceil(items.length / totalItemsPerPage)
    let itemIndex = 0

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
        worksheet.getCell("A1").value = "GSTIN: 29AKRPB0864E1Z4"
        worksheet.getCell("A1").style = tinFormat

        worksheet.mergeCells("K1:L2")
        worksheet.getCell("K1").value = "Ph: 41140838\nMob: 9886258876"
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
        for (let pageRow = 0; pageRow < totalItemsPerPage; pageRow++) {
            const item = items[itemIndex]
            if (item === undefined) break

            const particular = item.size + " " + item.particulars
            const row = pageRow + ITEM_TABLE_START_OFFSET

            worksheet.getCell(`A${row}`).value = `${itemIndex + 1}.`
            worksheet.getCell(`A${row}`).style = detailRightFormat

            worksheet.mergeCells(`B${row}:E${row}`)
            worksheet.getCell(`B${row}`).value = particular
            worksheet.getCell(`B${row}`).style = detFormat

            worksheet.getCell(`F${row}`).value = item.hsn
            worksheet.getCell(`F${row}`).style = detailCenterFormat

            worksheet.getCell(`G${row}`).value = item.quantity
            worksheet.getCell(`G${row}`).style = detailCenterFormat

            worksheet.getCell(`H${row}`).value = item.unit
            worksheet.getCell(`H${row}`).style = detailCenterFormat

            worksheet.getCell(`I${row}`).value = item.rate
            worksheet.getCell(`I${row}`).style = detailCenterFormat

            worksheet.getCell(`J${row}`).value = item.gst
            worksheet.getCell(`J${row}`).style = detailCenterFormat

            const amount = item.quantity * item.rate
            worksheet.mergeCells(`K${row}:L${row}`)
            worksheet.getCell(`K${row}`).value = amount.toFixed(2)
            worksheet.getCell(`K${row}`).style = detailRightFormat

            itemIndex++
        }

        // hsn table
        {
            const hsnStartRow =
                ITEM_TABLE_START_OFFSET +
                (MAX_ITEMS_IN_PAGE - (hsnTotals.length + 1))
            // header
            worksheet.mergeCells(hsnStartRow, 2, hsnStartRow, 3)
            worksheet.getCell(hsnStartRow, 2).value = "HSN Code"
            worksheet.getCell(hsnStartRow, 2).style = tableHeaderFormat

            worksheet.getCell(hsnStartRow, 4).value = "GST"
            worksheet.getCell(hsnStartRow, 4).style = tableHeaderFormat

            worksheet.mergeCells(hsnStartRow, 5, hsnStartRow, 6)
            worksheet.getCell(hsnStartRow, 5).value = "Taxable Value"
            worksheet.getCell(hsnStartRow, 5).style = tableHeaderFormat

            worksheet.mergeCells(hsnStartRow, 7, hsnStartRow, 8)
            worksheet.getCell(hsnStartRow, 7).value = "Total Tax"
            worksheet.getCell(hsnStartRow, 7).style = tableHeaderFormat

            // rows
            for (let i = 0; i < hsnTotals.length; i++) {
                const [hsn, { gst, rate }] = hsnTotals[i]
                // + 1 for title
                const row = hsnStartRow + 1 + i

                worksheet.mergeCells(row, 2, row, 3)
                worksheet.getCell(row, 2).value = hsn
                worksheet.getCell(row, 2).style = detailCenterFormat

                worksheet.getCell(row, 4).value = `${gst}%`
                worksheet.getCell(row, 4).style = detailCenterFormat

                worksheet.mergeCells(row, 5, row, 6)
                worksheet.getCell(row, 5).value = rate.toFixed(2)
                worksheet.getCell(row, 5).style = detailRightFormat

                worksheet.mergeCells(row, 7, row, 8)
                worksheet.getCell(row, 7).value = (rate * (gst / 100)).toFixed(
                    2,
                )
                worksheet.getCell(row, 7).style = detailRightFormat
            }
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

            const roundedTotal = parseFloat(finalTotal.toFixed(0))
            const roundoff = Math.abs(finalTotal - roundedTotal)

            worksheet.mergeCells("K38:L38")
            worksheet.getCell("K38").value = subtotal.toFixed(2)
            worksheet.getCell("K38").style = detailRightFormat

            worksheet.mergeCells("K45:L45")
            worksheet.getCell("K45").value = other.toFixed(2)
            worksheet.getCell("K45").style = detailRightFormat

            worksheet.mergeCells("K46:L46")
            worksheet.getCell("K46").value = roundoff.toFixed(2)
            worksheet.getCell("K46").style = detailRightFormat

            worksheet.mergeCells("K47:L47")
            worksheet.getCell("K47").value = roundedTotal.toFixed(2)
            worksheet.getCell("K47").style = detailRightFormat

            if (igst) {
                // IGST uses only 1 row per Tax %
                if (gst28 !== 0) {
                    worksheet.mergeCells("G39:H39")
                    worksheet.getCell("G39").value = total28.toFixed(2)
                    worksheet.getCell("G39").style = detailRightFormat

                    worksheet.mergeCells("I39:J39")
                    worksheet.getCell("I39").value = " 28%  IGST"
                    worksheet.getCell("I39").style = detFormat

                    worksheet.mergeCells("K39:L39")
                    worksheet.getCell("K39").value = gst28.toFixed(2)
                    worksheet.getCell("K39").style = detailRightFormat
                }

                if (gst18 !== 0) {
                    worksheet.mergeCells("G40:H40")
                    worksheet.getCell("G40").value = total18.toFixed(2)
                    worksheet.getCell("G40").style = detailRightFormat

                    worksheet.mergeCells("I40:J40")
                    worksheet.getCell("I40").value = " 18%  IGST"
                    worksheet.getCell("I40").style = detFormat

                    worksheet.mergeCells("K40:L40")
                    worksheet.getCell("K40").value = gst18.toFixed(2)
                    worksheet.getCell("K40").style = detailRightFormat
                }

                if (gst12 !== 0) {
                    worksheet.mergeCells("G41:H41")
                    worksheet.getCell("G41").value = total12.toFixed(2)
                    worksheet.getCell("G41").style = detailRightFormat

                    worksheet.mergeCells("I41:J41")
                    worksheet.getCell("I41").value = " 12%  IGST"
                    worksheet.getCell("I41").style = detFormat

                    worksheet.mergeCells("K41:L41")
                    worksheet.getCell("K41").value = gst12.toFixed(2)
                    worksheet.getCell("K41").style = detailRightFormat
                }
            } else {
                // Non IGST uses normal 2 rows per tax %
                if (gst28 !== 0) {
                    const t14 = total28 / 2
                    const st = gst28 / 2

                    worksheet.mergeCells("G43:H43")
                    worksheet.getCell("G43").value = t14.toFixed(2)
                    worksheet.getCell("G43").style = detailRightFormat

                    worksheet.mergeCells("G44:H44")
                    worksheet.getCell("G44").value = t14.toFixed(2)
                    worksheet.getCell("G44").style = detailRightFormat

                    worksheet.mergeCells("I43:J43")
                    worksheet.getCell("I43").value = " 14%  CGST"
                    worksheet.getCell("I43").style = detFormat

                    worksheet.mergeCells("I44:J44")
                    worksheet.getCell("I44").value = " 14%  SGST"
                    worksheet.getCell("I44").style = detFormat

                    worksheet.mergeCells("K43:L43")
                    worksheet.getCell("K43").value = st.toFixed(2)
                    worksheet.getCell("K43").style = detailRightFormat

                    worksheet.mergeCells("K44:L44")
                    worksheet.getCell("K44").value = st.toFixed(2)
                    worksheet.getCell("K44").style = detailRightFormat
                }

                if (gst18 !== 0) {
                    const t9 = total18 / 2
                    const t = gst18 / 2

                    worksheet.mergeCells("G39:H39")
                    worksheet.getCell("G39").value = t9.toFixed(2)
                    worksheet.getCell("G39").style = detailRightFormat

                    worksheet.mergeCells("G40:H40")
                    worksheet.getCell("G40").value = t9.toFixed(2)
                    worksheet.getCell("G40").style = detailRightFormat

                    worksheet.mergeCells("I39:J39")
                    worksheet.getCell("I39").value = " 9%  CGST"
                    worksheet.getCell("I39").style = detFormat

                    worksheet.mergeCells("I40:J40")
                    worksheet.getCell("I40").value = " 9%  SGST"
                    worksheet.getCell("I40").style = detFormat

                    worksheet.mergeCells("K39:L39")
                    worksheet.getCell("K39").value = t.toFixed(2)
                    worksheet.getCell("K39").style = detailRightFormat

                    worksheet.mergeCells("K40:L40")
                    worksheet.getCell("K40").value = t.toFixed(2)
                    worksheet.getCell("K40").style = detailRightFormat
                }

                if (gst12 !== 0) {
                    const t6 = total12 / 2
                    const t = gst12 / 2

                    worksheet.mergeCells("G41:H41")
                    worksheet.getCell("G41").value = t6.toFixed(2)
                    worksheet.getCell("G41").style = detailRightFormat

                    worksheet.mergeCells("G42:H42")
                    worksheet.getCell("G42").value = t6.toFixed(2)
                    worksheet.getCell("G42").style = detailRightFormat

                    worksheet.mergeCells("I41:J41")
                    worksheet.getCell("I41").value = " 6%  CGST"
                    worksheet.getCell("I41").style = detFormat

                    worksheet.mergeCells("I42:J42")
                    worksheet.getCell("I42").value = " 6%  SGST"
                    worksheet.getCell("I42").style = detFormat

                    worksheet.mergeCells("K41:L41")
                    worksheet.getCell("K41").value = t.toFixed(2)
                    worksheet.getCell("K41").style = detailRightFormat

                    worksheet.mergeCells("K42:L42")
                    worksheet.getCell("K42").value = t.toFixed(2)
                    worksheet.getCell("K42").style = detailRightFormat
                }
            }
        }
    }

    const buffer = (await workbook.xlsx.writeBuffer()) as Buffer
    fs.writeFileSync(TEMPORARY_FILE_PATH, bufferToArrayBuffer(buffer))
    console.log("Temporary file saved successfully")
    return workbook
}

function bufferToArrayBuffer(buffer: Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length)
    const view = new Uint8Array(arrayBuffer)
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i]
    }
    return view
}

const duplicateSheet = (
    workbook: Workbook,
    source: Worksheet,
    name: string,
) => {
    const newWorksheet = workbook.addWorksheet(name)
    // Copy Model
    newWorksheet.model = Object.assign(
        {},
        {
            ...source.model,
            name,
            ...{ model: { name } },
        },
    )
    // Deep Copy Rows & Cells
    source.eachRow((row, rowNumber) => {
        const newRow = newWorksheet.getRow(rowNumber)
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber)
            newCell.value = cell.value
            newCell.style = Object.assign({}, cell.style)
        })
    })
    // Copy Merged Cells
    source.model.merges.forEach((merge) => {
        newWorksheet.mergeCells(merge)
    })
    return newWorksheet
}

const writeCopyNameToSheet = (sheet: Worksheet, copyName: string) => {
    for (let i = 3; i < 6; i++) {
        sheet.getCell(13, i).border = thinBorder
    }
    for (let i = 11; i < 13; i++) {
        sheet.getCell(13, i).border = thinBorder
    }
    sheet.getCell("I1").value = copyName
}

export const saveTempToFile = async (
    /** the workbook */
    workbook: Workbook,
    /** copy name to write at the top (ex. duplicate copy) */
    copyName: string,
    /** file name to save as, without extension */
    fileName: string,
) => {
    workbook.eachSheet((sheet) => writeCopyNameToSheet(sheet, copyName))

    fs.writeFileSync(
        path.join(BILLS_PATH, `${fileName}.xlsx`),
        bufferToArrayBuffer((await workbook.xlsx.writeBuffer()) as Buffer),
    )
    console.log(`${fileName}.xlsx saved successfully`)
}

export const saveTempFileAndSchedulePrintJob = async (
    /** the workbook */
    workbook: Workbook,
    /** number of copies (original, duplicate, triplicate) */
    copies: 1 | 2 | 3,
    /** file name to save as, without extension */
    fileName: string,
) => {
    // add extra copies as needed to temporary file
    switch (copies) {
        case 1:
            workbook.eachSheet((sheet) =>
                writeCopyNameToSheet(sheet, "Original Copy"),
            )
            break
        case 2:
            workbook.eachSheet((sheet) => {
                const dupsheet = duplicateSheet(
                    workbook,
                    sheet,
                    `${sheet.name}-dup`,
                )
                writeCopyNameToSheet(sheet, "Original Copy")
                writeCopyNameToSheet(dupsheet, "Duplicate Copy")
            })
            break
        case 3:
            workbook.eachSheet((sheet) => {
                const dupsheet = duplicateSheet(
                    workbook,
                    sheet,
                    `${sheet.name}-dup`,
                )
                const tripsheet = duplicateSheet(
                    workbook,
                    sheet,
                    `${sheet.name}-trip`,
                )
                writeCopyNameToSheet(sheet, "Original Copy")
                writeCopyNameToSheet(dupsheet, "Duplicate Copy")
                writeCopyNameToSheet(tripsheet, "Triplicate Copy")
            })
            break
    }
    const filePath = path.join(BILLS_PATH, `${fileName}.xlsx`)
    // save file
    fs.writeFileSync(
        filePath,
        bufferToArrayBuffer((await workbook.xlsx.writeBuffer()) as Buffer),
    )
    console.log(`${fileName}.xlsx saved successfully. Starting print job...`)
    // finally, schedule print job
    await sendPrintJob(filePath)
}

export const cleanupTempFiles = () => {
    fs.rm(TEMPORARY_FILE_PATH, (err) => {
        if (err) {
            console.error("unable to delete temp file: ", err)
        } else {
            console.log("successfully deleted temp file.")
        }
    })
}

const sendPrintJob = async (filePath: string) => {
    return new Promise<void>((resolve) => {
        // Spawn a new process to run the Python script
        const pythonProcess = spawn("py", ["print_bill.py", filePath])

        // Handle output from the Python script
        pythonProcess.stdout.on("data", (data: string) => {
            console.log(`Script Output: ${data}`)
        })

        // Handle errors from the Python script
        pythonProcess.stderr.on("data", (data) => {
            console.error(`Script Error: ${data}`)
        })

        // Handle process exit
        pythonProcess.on("close", (code) => {
            console.log(`Script exited with code ${code}`)
            resolve()
        })
    })
}
