import { MAX_ITEMS_IN_PAGE } from "./const"
import { HsnTotal, Item } from "./types"

export const calculateTotal = (items: Item[]) => {
    let sum = 0
    let gst12 = 0
    let gst18 = 0
    let gst28 = 0
    let total12 = 0
    let total18 = 0
    let total28 = 0
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemTotal = item.quantity * item.rate
        const itemTax = itemTotal * (item.gst / 100)
        sum += itemTotal
        switch (item.gst) {
            case 12:
                gst12 += itemTax
                total12 += itemTotal
                break
            case 18:
                gst18 += itemTax
                total18 += itemTotal
                break
            case 28:
                gst28 += itemTax
                total28 += itemTotal
                break
        }
    }
    return {
        sum,
        gst12,
        gst18,
        gst28,
        total12,
        total18,
        total28,
    }
}

export const calculateTotalsByHsn = (items: Item[]) =>
    items.reduce<Record<string, HsnTotal>>((acc, item) => {
        let hsnTotal = acc[item.hsn]
        if (hsnTotal === undefined) {
            hsnTotal = { rate: 0, quantity: 0, gst: item.gst }
            acc[item.hsn] = hsnTotal
        }
        hsnTotal.rate += item.rate * item.quantity
        hsnTotal.quantity += item.quantity
        return acc
    }, {})

export const calculatePages = (
    items: Item[],
): {
    totalPages: number
    hsnLines: number
} => {
    const pages = Math.ceil(items.length / MAX_ITEMS_IN_PAGE)
    // +1 for hsn table header
    const hsnLines = Object.entries(calculateTotalsByHsn(items)).length + 1

    const linesInLastPage = items.length % MAX_ITEMS_IN_PAGE
    const emptyLinesInLastPage = MAX_ITEMS_IN_PAGE - linesInLastPage
    // add extra page if hsn table cannot fit in last page
    const totalPages = emptyLinesInLastPage >= hsnLines ? pages : pages + 1

    return {
        totalPages,
        hsnLines,
    }
}

/** Convert date to desired string format */
export const dateToString = (date: Date) => {
    const monthAbbrs = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]
    const month = monthAbbrs[date.getMonth()]
    return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`
}
