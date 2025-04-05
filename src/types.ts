export type Gst = 12 | 18 | 28

export type Party = {
    name: string
    address: string
    tin: string
    privateMark: string
}

export type Item = {
    particulars: string
    size: string
    hsn: string
    quantity: number
    unit: string
    rate: number
    gst: Gst
}

export type Bill = {
    /** this needs to be in the format yyyy-mm-dd for date input to work */
    date: string
    invoice: number
    transport: string
    paymentTerms: string
    esugam: string
}

export type Total = {
    sum: number
    // amout of tax that each bracket amounts to
    gst12: number
    gst18: number
    gst28: number
    // principal amount that is taxable in each bracket
    total12: number
    total18: number
    total28: number
}
