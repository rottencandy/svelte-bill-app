import { Workbook, type Worksheet } from "exceljs"
import path from "path"
import fs from "fs"
import type { Bill, Item, Party, Total } from "./types"
import { BASEPATH, MAX_ITEMS_IN_PAGE } from "./const"
import { spawn } from "child_process"
import { calculatePages, calculateTotalsByHsn } from "./util"
import { getCopyName } from "./excel/data"
import {
    applyBaseLayout,
    fillHsnHeader,
    fillHsnRow,
    fillItemRow,
    fillPartyAndBillDetails,
    fillTotalsSection,
    writeCopyNameToSheet,
} from "./excel/operations"

const ITEM_TABLE_START_OFFSET = 14
const BILLS_PATH = path.join(BASEPATH, "saved_bills")
const TEMPORARY_FILE_PATH = path.join(BILLS_PATH, "unformatted.xlsx")

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
    const hsnTotals = Object.entries(calculateTotalsByHsn(items))

    // Create a new workbook
    const workbook = new Workbook()
    const { hsnLines, totalPages } = calculatePages(items)

    // sanity check
    if (hsnLines > MAX_ITEMS_IN_PAGE) {
        throw new Error("HSN Table larger than page!")
    }

    let itemIndex = 0
    for (let page = 0; page < totalPages; page++) {
        const worksheet = workbook.addWorksheet(`Page ${page + 1}`)
        applyBaseLayout(worksheet, page, totalPages)
        fillPartyAndBillDetails(worksheet, partyDetails, billDetails)

        // Add items to the table
        for (let pageRow = 0; pageRow < MAX_ITEMS_IN_PAGE; pageRow++) {
            const item = items[itemIndex]
            if (item === undefined) break
            const row = pageRow + ITEM_TABLE_START_OFFSET
            fillItemRow(worksheet, item, row, itemIndex + 1)
            itemIndex++
        }

        // this is the last page
        if (page === totalPages - 1) {
            // hsn table
            {
                const hsnStartRow =
                    ITEM_TABLE_START_OFFSET + (MAX_ITEMS_IN_PAGE - hsnLines)
                fillHsnHeader(worksheet, hsnStartRow, igst)

                // rows
                for (let i = 0; i < hsnTotals.length; i++) {
                    const [hsn, { gst, rate, quantity }] = hsnTotals[i]
                    // + 1 for title
                    const row = hsnStartRow + 1 + i
                    fillHsnRow(worksheet, hsn, gst, rate, quantity, row, igst)
                }
            }
            // Print totals in last page
            fillTotalsSection(worksheet, total, finalTotal, other, igst)
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
                writeCopyNameToSheet(sheet, getCopyName(1)),
            )
            break
        case 2:
            workbook.eachSheet((sheet) => {
                const dupsheet = duplicateSheet(
                    workbook,
                    sheet,
                    `${sheet.name}-dup`,
                )
                writeCopyNameToSheet(sheet, getCopyName(1))
                writeCopyNameToSheet(dupsheet, getCopyName(2))
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
                writeCopyNameToSheet(sheet, getCopyName(1))
                writeCopyNameToSheet(dupsheet, getCopyName(2))
                writeCopyNameToSheet(tripsheet, getCopyName(3))
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
    return new Promise<void>((resolve, reject) => {
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
            if (code) {
                reject("Failed!")
            }
            resolve()
        })
    })
}
