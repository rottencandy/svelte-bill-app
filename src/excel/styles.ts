import type { Style } from "exceljs"

export const HEAD_FMT: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: { bold: true, size: 12, underline: "single" },
}

export const TITLE_FMT: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: {
        bold: true,
        name: "Arial",
        italic: true,
        size: 26,
        color: { argb: "FF000000" },
    },
}

export const SUBTITLE_FMT: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: { bold: true, name: "Calibri", italic: true },
}

export const TABLE_HEADER_FMT: Partial<Style> = {
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

export const SUBTITLE_ADDR_FMT: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle" },
    font: { bold: true, name: "Times New Roman", size: 12 },
}

export const DETAIL_FMT: Partial<Style> = {
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    font: { bold: true, name: "Courier New", size: 12 },
}

export const SMALL_DETAIL_FMT: Partial<Style> = {
    ...DETAIL_FMT,
    font: { ...DETAIL_FMT.font, size: 10 },
}

export const MONO_BILL_DETAIL_FMT: Partial<Style> = {
    ...DETAIL_FMT,
    font: { ...DETAIL_FMT.font, size: 13 },
}

export const DETAIL_RIGHT_FMT: Partial<Style> = {
    alignment: { horizontal: "right", vertical: "middle", wrapText: true },
    font: { ...DETAIL_FMT.font, size: 14 },
}

export const DETAIL_CENTER_FMT: Partial<Style> = {
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    font: { ...DETAIL_FMT.font, size: 14 },
}

export const TNC_FMT: Partial<Style> = {
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    font: { name: "Calibri", size: 8 },
}

export const PH_FMT: Partial<Style> = {
    alignment: { horizontal: "right", vertical: "middle", wrapText: true },
    font: { bold: true },
}

export const TIN_FMT: Partial<Style> = {
    alignment: { horizontal: "left" },
    font: { bold: true },
}

export const THIN_BORDER: Partial<Style["border"]> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
}
